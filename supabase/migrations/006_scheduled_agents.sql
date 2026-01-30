-- =====================================================
-- MIGRATION: 006_scheduled_agents.sql
-- PURPOSE: Enable automated agent scheduling via pg_cron
-- =====================================================
-- This migration sets up scheduled execution of:
-- 1. Ranking Agent (daily at 02:00 UTC)
-- 2. Community Scoring Agent (every 6 hours)
--
-- IMPORTANT: These jobs call existing Edge Functions.
-- No business logic lives in this migration.
-- All scoring logic remains in the Edge Functions.
--
-- PREREQUISITES:
-- 1. pg_cron extension enabled (Supabase Pro or higher)
-- 2. pg_net extension enabled
-- 3. Set app.supabase_url and app.supabase_service_role_key
--
-- ROLLBACK: See bottom of file for unschedule commands.
-- =====================================================

-- ===========================================
-- STEP 1: Enable Required Extensions
-- ===========================================
-- Note: pg_cron requires Supabase Pro plan or self-hosted.
-- If on Free tier, these jobs can be triggered via external
-- cron services (e.g., GitHub Actions, Vercel Cron).

CREATE EXTENSION IF NOT EXISTS pg_net;

-- pg_cron is typically already enabled by Supabase on Pro plans.
-- Uncomment if needed:
-- CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- ===========================================
-- STEP 2: Agent Run Status View (Monitoring)
-- ===========================================
-- Provides a quick overview of agent health.
-- Used for debugging and future UI transparency.

DROP VIEW IF EXISTS public.agent_run_status;

CREATE VIEW public.agent_run_status AS
SELECT 
    agent_type,
    COUNT(*) AS total_runs_7d,
    SUM(success_count) AS total_successes,
    SUM(error_count) AS total_errors,
    ROUND(AVG(duration_ms)::numeric, 0) AS avg_duration_ms,
    MAX(created_at) AS last_run_at,
    -- Calculate health status
    CASE 
        WHEN MAX(created_at) < NOW() - INTERVAL '48 hours' THEN 'stale'
        WHEN SUM(error_count) > SUM(success_count) THEN 'unhealthy'
        ELSE 'healthy'
    END AS status
FROM agent_runs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY agent_type;

-- Grant read access
GRANT SELECT ON public.agent_run_status TO authenticated;
GRANT SELECT ON public.agent_run_status TO anon;

COMMENT ON VIEW public.agent_run_status IS 
'Monitoring view showing agent run health over the last 7 days. 
Check this to verify scheduled jobs are executing correctly.
Query: SELECT * FROM agent_run_status;';

-- ===========================================
-- STEP 3: Helper Function for Edge Function Calls
-- ===========================================
-- Creates a reusable function to call edge functions.
-- This keeps the cron job definitions clean.

CREATE OR REPLACE FUNCTION public.trigger_edge_function(
    function_name TEXT,
    payload JSONB DEFAULT '{}'::JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    supabase_url TEXT;
    service_key TEXT;
    request_id BIGINT;
BEGIN
    -- Get configuration from app settings
    -- These must be set in Supabase Dashboard > Project Settings > Database > Configuration
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_key := current_setting('app.settings.supabase_service_role_key', true);
    
    -- Fallback to environment if not set
    IF supabase_url IS NULL THEN
        -- Use the project's own URL (works for self-referencing)
        supabase_url := 'https://' || current_setting('request.headers')::json->>'host';
    END IF;
    
    -- Make HTTP POST request to edge function
    SELECT net.http_post(
        url := supabase_url || '/functions/v1/' || function_name,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || COALESCE(service_key, 'missing-key')
        ),
        body := payload,
        timeout_milliseconds := 300000  -- 5 minute timeout
    ) INTO request_id;
    
    RETURN request_id;
END;
$$;

COMMENT ON FUNCTION public.trigger_edge_function IS 
'Helper function to trigger Edge Functions via HTTP POST.
Used by pg_cron jobs to invoke ranking and community scoring agents.
Configure app.settings.supabase_url and app.settings.supabase_service_role_key
in Supabase Dashboard > Project Settings.';

-- ===========================================
-- STEP 4: Scheduled Job - Daily Ranking Agent
-- ===========================================
-- Schedule: Daily at 02:00 UTC
-- Why 02:00 UTC: Low traffic period, gives time before business hours
-- 
-- The ranking agent:
-- - Fetches verified tools with stale AI scores (>7 days old)
-- - Calls GPT-4o to evaluate each tool on 5 dimensions
-- - Stores results in SHADOW fields (ai_score_raw, ai_score_components)
-- - Does NOT modify live ai_score (shadow mode preserved)
-- - Logs run to agent_runs table
--
-- Idempotent: Safe to re-run. Uses ai_score_last_evaluated_at to skip
-- recently evaluated tools unless force=true is passed.

-- Note: Uncomment these lines after enabling pg_cron extension
-- and configuring app settings in Supabase Dashboard.

/*
SELECT cron.schedule(
    'daily-ranking-agent',           -- Unique job name
    '0 2 * * *',                     -- Cron expression: 02:00 UTC daily
    $$SELECT public.trigger_edge_function('ranking-agent', '{"source": "pg_cron", "scheduled": true}'::jsonb);$$
);
*/

-- ===========================================
-- STEP 5: Scheduled Job - Community Scoring Agent
-- ===========================================
-- Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
-- Why every 6 hours: Balances freshness with API costs
-- 
-- The community scoring agent:
-- - Scans questions/answers for tool mentions
-- - Analyzes sentiment using GPT-4o-mini (cost-efficient)
-- - Calculates community score based on mentions + sentiment
-- - Stores results in SHADOW fields (community_signal_raw, etc.)
-- - Does NOT modify live community_score
-- - Handles sparse data gracefully (neutral score when no mentions)

/*
SELECT cron.schedule(
    'community-scoring-6h',          -- Unique job name
    '0 */6 * * *',                   -- Cron expression: every 6 hours
    $$SELECT public.trigger_edge_function('community-scoring', '{"source": "pg_cron", "scheduled": true}'::jsonb);$$
);
*/

-- ===========================================
-- MANUAL SETUP INSTRUCTIONS
-- ===========================================
-- 
-- OPTION A: If using Supabase Pro with pg_cron enabled
-- 
-- 1. Go to Supabase Dashboard > Project Settings > Database
-- 2. Under "Database Settings", add these parameters:
--    - app.settings.supabase_url = https://YOUR-PROJECT.supabase.co
--    - app.settings.supabase_service_role_key = YOUR-SERVICE-ROLE-KEY
-- 
-- 3. Uncomment the SELECT cron.schedule() calls above and run them.
-- 
-- OPTION B: If using Supabase Free tier (no pg_cron)
-- 
-- Use external cron services to call the edge functions:
-- 
-- GitHub Actions example (.github/workflows/agents.yml):
-- ```yaml
-- name: Scheduled Agents
-- on:
--   schedule:
--     - cron: '0 2 * * *'   # Daily ranking
--     - cron: '0 */6 * * *' # Community scoring
-- jobs:
--   trigger:
--     runs-on: ubuntu-latest
--     steps:
--       - run: |
--           curl -X POST "$SUPABASE_URL/functions/v1/ranking-agent" \
--             -H "Authorization: Bearer $SUPABASE_ANON_KEY"
-- ```
--
-- ===========================================

-- ===========================================
-- VERIFICATION QUERIES (Run after setup)
-- ===========================================

-- Check if pg_cron extension is available:
-- SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- List scheduled jobs:
-- SELECT jobname, schedule, command FROM cron.job;

-- Check recent job runs:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- View agent run status:
-- SELECT * FROM agent_run_status;

-- ===========================================
-- ROLLBACK COMMANDS
-- ===========================================
-- To disable scheduled jobs, run:
--
-- SELECT cron.unschedule('daily-ranking-agent');
-- SELECT cron.unschedule('community-scoring-6h');
-- DROP FUNCTION IF EXISTS public.trigger_edge_function;
-- DROP VIEW IF EXISTS public.agent_run_status;
--
-- ===========================================
