-- =====================================================
-- AIDEAS.AI - SHADOW SCORING SCHEMA
-- =====================================================
-- Phase 3: Intelligence Layer (Shadow Mode)
-- 
-- This migration adds shadow scoring fields for AI and community
-- evaluation WITHOUT affecting live rankings. All fields are nullable
-- and additive. Live scores (ai_score, community_score, composite_score)
-- remain unchanged.
--
-- Philosophy: Observe first, advise second, act third.
-- =====================================================

-- =====================================================
-- 1. AGENT RUNS TABLE (Tracking & Auditing)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL CHECK (agent_type IN ('ranking', 'community', 'composite')),
  run_at TIMESTAMPTZ DEFAULT now(),
  tools_processed INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  duration_ms INTEGER,
  version TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying recent runs
CREATE INDEX IF NOT EXISTS idx_agent_runs_type_date 
  ON public.agent_runs (agent_type, run_at DESC);

-- RLS: Only service role can write, public can read
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agent runs are publicly readable"
  ON public.agent_runs FOR SELECT USING (true);

CREATE POLICY "Agent runs are writable by service role"
  ON public.agent_runs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 2. USE CASE SCORES TABLE (Context-Aware Scoring)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.use_case_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  use_case TEXT NOT NULL,
  category_slug TEXT,
  target_audience TEXT,
  score_adjustment DECIMAL CHECK (score_adjustment >= -50 AND score_adjustment <= 50),
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint: one score per tool/use_case/audience combination
  UNIQUE (tool_id, use_case, target_audience)
);

-- Index for querying by use case
CREATE INDEX IF NOT EXISTS idx_use_case_scores_lookup 
  ON public.use_case_scores (use_case, category_slug);

-- RLS
ALTER TABLE public.use_case_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Use case scores are publicly readable"
  ON public.use_case_scores FOR SELECT USING (true);

CREATE POLICY "Use case scores are writable by service role"
  ON public.use_case_scores FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Use case scores are updatable by service role"
  ON public.use_case_scores FOR UPDATE
  USING (auth.role() = 'service_role');

-- =====================================================
-- 3. SHADOW SCORING COLUMNS ON TOOLS TABLE
-- =====================================================
-- These columns store AI agent evaluations WITHOUT overwriting live scores

-- AI Score Shadow Fields
ALTER TABLE public.tools 
  ADD COLUMN IF NOT EXISTS ai_score_raw DECIMAL 
    CHECK (ai_score_raw IS NULL OR (ai_score_raw >= 0 AND ai_score_raw <= 100));

ALTER TABLE public.tools 
  ADD COLUMN IF NOT EXISTS ai_score_components JSONB;

ALTER TABLE public.tools 
  ADD COLUMN IF NOT EXISTS ai_score_last_evaluated_at TIMESTAMPTZ;

ALTER TABLE public.tools 
  ADD COLUMN IF NOT EXISTS ai_score_version TEXT;

-- Community Score Shadow Fields
ALTER TABLE public.tools 
  ADD COLUMN IF NOT EXISTS community_signal_raw DECIMAL 
    CHECK (community_signal_raw IS NULL OR (community_signal_raw >= 0 AND community_signal_raw <= 100));

ALTER TABLE public.tools 
  ADD COLUMN IF NOT EXISTS community_mentions_count INTEGER DEFAULT 0;

ALTER TABLE public.tools 
  ADD COLUMN IF NOT EXISTS community_sentiment_score DECIMAL 
    CHECK (community_sentiment_score IS NULL OR (community_sentiment_score >= -1 AND community_sentiment_score <= 1));

ALTER TABLE public.tools 
  ADD COLUMN IF NOT EXISTS community_last_analyzed_at TIMESTAMPTZ;

-- Composite Score Preview (NOT used for live rankings)
ALTER TABLE public.tools 
  ADD COLUMN IF NOT EXISTS composite_score_preview DECIMAL 
    CHECK (composite_score_preview IS NULL OR (composite_score_preview >= 0 AND composite_score_preview <= 100));

ALTER TABLE public.tools 
  ADD COLUMN IF NOT EXISTS composite_score_preview_updated_at TIMESTAMPTZ;

-- =====================================================
-- 4. PREVIEW SCORING FUNCTIONS (No Triggers!)
-- =====================================================
-- These functions calculate preview scores for comparison only.
-- They do NOT auto-update any fields. Must be called explicitly.

-- Calculate composite preview score for a single tool
CREATE OR REPLACE FUNCTION calculate_composite_preview(p_tool_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  v_ai_score DECIMAL;
  v_community_score DECIMAL;
  v_result DECIMAL;
BEGIN
  SELECT ai_score_raw, community_signal_raw 
  INTO v_ai_score, v_community_score
  FROM public.tools WHERE id = p_tool_id;
  
  -- If either is null, return null (insufficient data)
  IF v_ai_score IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- If no community data, use AI score only (weighted at 100%)
  IF v_community_score IS NULL THEN
    v_result := v_ai_score;
  ELSE
    -- Standard weighting: 60% AI, 40% community
    v_result := (v_ai_score * 0.6) + (v_community_score * 0.4);
  END IF;
  
  RETURN ROUND(v_result, 1);
END;
$$;

-- Batch update preview scores (manual trigger only)
CREATE OR REPLACE FUNCTION refresh_all_preview_scores()
RETURNS TABLE (
  tool_id UUID,
  tool_name TEXT,
  old_preview DECIMAL,
  new_preview DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.tools t
  SET 
    composite_score_preview = calculate_composite_preview(t.id),
    composite_score_preview_updated_at = now()
  WHERE ai_score_raw IS NOT NULL
  RETURNING 
    t.id as tool_id,
    t.name as tool_name,
    NULL::DECIMAL as old_preview,  -- We don't track old value
    t.composite_score_preview as new_preview;
END;
$$;

-- =====================================================
-- 5. COMPARISON VIEWS (For Analysis Only)
-- =====================================================
-- View to compare live vs shadow scores
CREATE OR REPLACE VIEW public.score_comparison AS
SELECT 
  t.id,
  t.slug,
  t.name,
  -- Live scores
  t.ai_score as live_ai_score,
  t.community_score as live_community_score,
  t.composite_score as live_composite_score,
  -- Shadow scores
  t.ai_score_raw as shadow_ai_score,
  t.community_signal_raw as shadow_community_score,
  t.composite_score_preview as shadow_composite_score,
  -- Deltas
  CASE 
    WHEN t.ai_score_raw IS NOT NULL 
    THEN ROUND(t.ai_score_raw - t.ai_score, 1) 
  END as ai_score_delta,
  CASE 
    WHEN t.community_signal_raw IS NOT NULL 
    THEN ROUND(t.community_signal_raw - t.community_score, 1) 
  END as community_score_delta,
  CASE 
    WHEN t.composite_score_preview IS NOT NULL 
    THEN ROUND(t.composite_score_preview - t.composite_score, 1) 
  END as composite_score_delta,
  -- Metadata
  t.ai_score_last_evaluated_at,
  t.community_last_analyzed_at,
  t.ai_score_version
FROM public.tools t
WHERE t.status = 'verified';

-- Grant access to the view
GRANT SELECT ON public.score_comparison TO anon, authenticated;

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Get scoring summary for dashboard/debugging
CREATE OR REPLACE FUNCTION get_scoring_summary()
RETURNS TABLE (
  total_tools INTEGER,
  tools_with_shadow_ai INTEGER,
  tools_with_shadow_community INTEGER,
  tools_with_preview_composite INTEGER,
  avg_ai_delta DECIMAL,
  avg_community_delta DECIMAL,
  last_ranking_run TIMESTAMPTZ,
  last_community_run TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.tools WHERE status = 'verified'),
    (SELECT COUNT(*)::INTEGER FROM public.tools WHERE ai_score_raw IS NOT NULL),
    (SELECT COUNT(*)::INTEGER FROM public.tools WHERE community_signal_raw IS NOT NULL),
    (SELECT COUNT(*)::INTEGER FROM public.tools WHERE composite_score_preview IS NOT NULL),
    (SELECT ROUND(AVG(ai_score_raw - ai_score), 2) FROM public.tools WHERE ai_score_raw IS NOT NULL),
    (SELECT ROUND(AVG(community_signal_raw - community_score), 2) FROM public.tools WHERE community_signal_raw IS NOT NULL),
    (SELECT MAX(run_at) FROM public.agent_runs WHERE agent_type = 'ranking'),
    (SELECT MAX(run_at) FROM public.agent_runs WHERE agent_type = 'community');
END;
$$;

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 
-- ❌ NO TRIGGERS are created in this migration
-- ❌ NO automatic updates to live scores
-- ❌ NO changes to existing RLS policies on tools table
-- 
-- ✅ All new columns are nullable (safe to add)
-- ✅ All constraints use CHECK (not foreign keys)
-- ✅ Views and functions are for analysis only
-- ✅ Can be rolled back by dropping new columns
--
-- To rollback this migration:
-- DROP VIEW IF EXISTS public.score_comparison;
-- DROP FUNCTION IF EXISTS get_scoring_summary();
-- DROP FUNCTION IF EXISTS refresh_all_preview_scores();
-- DROP FUNCTION IF EXISTS calculate_composite_preview(UUID);
-- DROP TABLE IF EXISTS public.use_case_scores;
-- DROP TABLE IF EXISTS public.agent_runs;
-- ALTER TABLE public.tools DROP COLUMN IF EXISTS ai_score_raw;
-- ALTER TABLE public.tools DROP COLUMN IF EXISTS ai_score_components;
-- -- (etc for all shadow columns)
-- =====================================================
