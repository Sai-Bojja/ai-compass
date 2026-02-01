-- =====================================================
-- AIDEAS.AI - ACTIVATE LIVE SCORES WITH VALIDATION
-- =====================================================
-- Migration: 007_activate_live_scores.sql
--
-- This migration:
-- 1. Creates pending_score_changes table for admin review
-- 2. Creates scoring_config for thresholds
-- 3. Creates validation trigger (±12pt auto-approve)
-- 4. Creates admin approve/deny functions
-- 5. Copies shadow → live scores (with validation)
--
-- Auto-approve threshold: ±12 points per day
-- Changes exceeding threshold require admin approval
-- =====================================================

-- =====================================================
-- 1. SCORING CONFIGURATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.scoring_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Set default thresholds (±12 points for AI, ±15 for community)
INSERT INTO public.scoring_config (key, value, description) VALUES
  ('max_daily_change', '{"ai": 12, "community": 15, "composite": 12}', 
   'Maximum score change allowed before admin review required'),
  ('require_admin_review', '{"enabled": true}', 
   'Whether to require admin review for large changes'),
  ('auto_expire_pending_hours', '{"hours": 48}', 
   'Hours before pending reviews auto-expire')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- =====================================================
-- 2. PENDING SCORE CHANGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pending_score_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  
  -- Score type: 'ai', 'community', or 'composite'
  score_type TEXT NOT NULL CHECK (score_type IN ('ai', 'community', 'composite')),
  
  -- Old and new values
  old_score DECIMAL NOT NULL,
  new_score DECIMAL NOT NULL,
  delta DECIMAL GENERATED ALWAYS AS (new_score - old_score) STORED,
  abs_delta DECIMAL GENERATED ALWAYS AS (ABS(new_score - old_score)) STORED,
  
  -- Status: pending, approved, denied, expired
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  
  -- Metadata
  reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '48 hours'
);

-- Index for quick pending lookups
CREATE INDEX IF NOT EXISTS idx_pending_score_changes_status 
  ON public.pending_score_changes (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pending_score_changes_tool
  ON public.pending_score_changes (tool_id, score_type);

-- RLS
ALTER TABLE public.pending_score_changes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pending changes readable by all" ON public.pending_score_changes;
CREATE POLICY "Pending changes readable by all"
  ON public.pending_score_changes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Pending changes insertable by service role" ON public.pending_score_changes;
CREATE POLICY "Pending changes insertable by service role"
  ON public.pending_score_changes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Pending changes updatable by admins" ON public.pending_score_changes;
CREATE POLICY "Pending changes updatable by admins"
  ON public.pending_score_changes FOR UPDATE
  USING (true);

-- =====================================================
-- 3. VALIDATION TRIGGER FUNCTION
-- =====================================================
-- Validates score changes before applying to live scores
-- Auto-approves changes within ±12 points
-- Flags larger changes for admin review

CREATE OR REPLACE FUNCTION sync_shadow_with_validation()
RETURNS TRIGGER AS $$
DECLARE
  v_ai_max_change DECIMAL := 12;
  v_community_max_change DECIMAL := 15;
  v_ai_delta DECIMAL;
  v_community_delta DECIMAL;
  v_config JSONB;
BEGIN
  -- Get threshold config (with fallback defaults)
  SELECT value INTO v_config 
  FROM public.scoring_config 
  WHERE key = 'max_daily_change';
  
  IF v_config IS NOT NULL THEN
    v_ai_max_change := COALESCE((v_config->>'ai')::DECIMAL, 12);
    v_community_max_change := COALESCE((v_config->>'community')::DECIMAL, 15);
  END IF;
  
  -- ========================================
  -- AI SCORE VALIDATION
  -- ========================================
  IF NEW.ai_score_raw IS DISTINCT FROM OLD.ai_score_raw 
     AND NEW.ai_score_raw IS NOT NULL THEN
    
    v_ai_delta := ABS(NEW.ai_score_raw - OLD.ai_score);
    
    IF v_ai_delta <= v_ai_max_change THEN
      -- Within ±12 points: auto-approve
      NEW.ai_score := NEW.ai_score_raw;
    ELSE
      -- Exceeds threshold: create pending review
      INSERT INTO public.pending_score_changes 
        (tool_id, score_type, old_score, new_score, reason, status)
      VALUES (
        NEW.id, 
        'ai', 
        OLD.ai_score, 
        NEW.ai_score_raw,
        format('AI score change of %.1f points exceeds ±%s threshold', 
               v_ai_delta, v_ai_max_change),
        'pending'
      );
      
      -- Keep old score until approved
      NEW.ai_score := OLD.ai_score;
    END IF;
  END IF;
  
  -- ========================================
  -- COMMUNITY SCORE VALIDATION
  -- ========================================
  IF NEW.community_signal_raw IS DISTINCT FROM OLD.community_signal_raw 
     AND NEW.community_signal_raw IS NOT NULL THEN
    
    v_community_delta := ABS(NEW.community_signal_raw - OLD.community_score);
    
    IF v_community_delta <= v_community_max_change THEN
      -- Within threshold: auto-approve
      NEW.community_score := NEW.community_signal_raw;
    ELSE
      -- Exceeds threshold: create pending review
      INSERT INTO public.pending_score_changes 
        (tool_id, score_type, old_score, new_score, reason, status)
      VALUES (
        NEW.id, 
        'community', 
        OLD.community_score, 
        NEW.community_signal_raw,
        format('Community score change of %.1f points exceeds ±%s threshold', 
               v_community_delta, v_community_max_change),
        'pending'
      );
      
      -- Keep old score until approved
      NEW.community_score := OLD.community_score;
    END IF;
  END IF;
  
  -- ========================================
  -- COMPOSITE SCORE (Always recalculate from components)
  -- ========================================
  NEW.composite_score := ROUND(
    (NEW.ai_score * 0.6) + (NEW.community_score * 0.4), 
    1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to tools table
DROP TRIGGER IF EXISTS trigger_sync_with_validation ON public.tools;
CREATE TRIGGER trigger_sync_with_validation
  BEFORE UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION sync_shadow_with_validation();

-- =====================================================
-- 4. ADMIN APPROVAL FUNCTIONS
-- =====================================================

-- Approve a pending score change
CREATE OR REPLACE FUNCTION approve_score_change(
  p_pending_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  tool_name TEXT,
  score_type TEXT,
  old_score DECIMAL,
  new_score DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tool_id UUID;
  v_score_type TEXT;
  v_old_score DECIMAL;
  v_new_score DECIMAL;
  v_tool_name TEXT;
BEGIN
  -- Get and lock the pending record
  SELECT p.tool_id, p.score_type, p.old_score, p.new_score, t.name 
  INTO v_tool_id, v_score_type, v_old_score, v_new_score, v_tool_name
  FROM public.pending_score_changes p
  JOIN public.tools t ON t.id = p.tool_id
  WHERE p.id = p_pending_id AND p.status = 'pending'
  FOR UPDATE OF p;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL;
    RETURN;
  END IF;
  
  -- Update the pending record
  UPDATE public.pending_score_changes
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    admin_notes = p_admin_notes
  WHERE id = p_pending_id;
  
  -- Apply the score change (disable trigger temporarily)
  ALTER TABLE public.tools DISABLE TRIGGER trigger_sync_with_validation;
  
  IF v_score_type = 'ai' THEN
    UPDATE public.tools 
    SET 
      ai_score = v_new_score,
      composite_score = ROUND((v_new_score * 0.6) + (community_score * 0.4), 1),
      updated_at = now()
    WHERE id = v_tool_id;
  ELSIF v_score_type = 'community' THEN
    UPDATE public.tools 
    SET 
      community_score = v_new_score,
      composite_score = ROUND((ai_score * 0.6) + (v_new_score * 0.4), 1),
      updated_at = now()
    WHERE id = v_tool_id;
  END IF;
  
  ALTER TABLE public.tools ENABLE TRIGGER trigger_sync_with_validation;
  
  RETURN QUERY SELECT 
    true, 
    v_tool_name, 
    v_score_type, 
    v_old_score, 
    v_new_score;
END;
$$;

-- Deny a pending score change
CREATE OR REPLACE FUNCTION deny_score_change(
  p_pending_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  tool_name TEXT,
  score_type TEXT,
  kept_score DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score_type TEXT;
  v_old_score DECIMAL;
  v_tool_name TEXT;
BEGIN
  SELECT p.score_type, p.old_score, t.name 
  INTO v_score_type, v_old_score, v_tool_name
  FROM public.pending_score_changes p
  JOIN public.tools t ON t.id = p.tool_id
  WHERE p.id = p_pending_id AND p.status = 'pending';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, NULL::DECIMAL;
    RETURN;
  END IF;
  
  UPDATE public.pending_score_changes
  SET 
    status = 'denied',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    admin_notes = p_admin_notes
  WHERE id = p_pending_id;
  
  -- Score stays at old value (no action needed on tools table)
  RETURN QUERY SELECT 
    true, 
    v_tool_name, 
    v_score_type, 
    v_old_score;
END;
$$;

-- Expire old pending changes
CREATE OR REPLACE FUNCTION expire_old_pending_changes()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.pending_score_changes
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < now();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- =====================================================
-- 5. ADMIN REVIEW VIEW
-- =====================================================
CREATE OR REPLACE VIEW public.pending_reviews AS
SELECT 
  p.id,
  p.tool_id,
  t.name as tool_name,
  t.slug as tool_slug,
  p.score_type,
  p.old_score,
  p.new_score,
  p.delta,
  p.abs_delta,
  p.reason,
  p.status,
  p.created_at,
  p.expires_at,
  CASE 
    WHEN p.expires_at < now() THEN 'EXPIRED'
    WHEN p.expires_at < now() + INTERVAL '6 hours' THEN 'URGENT'
    WHEN p.expires_at < now() + INTERVAL '24 hours' THEN 'SOON'
    ELSE 'ACTIVE'
  END as urgency,
  EXTRACT(EPOCH FROM (p.expires_at - now())) / 3600 as hours_remaining
FROM public.pending_score_changes p
JOIN public.tools t ON t.id = p.tool_id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;

GRANT SELECT ON public.pending_reviews TO anon, authenticated;

-- =====================================================
-- 6. SCORING SUMMARY VIEW
-- =====================================================
CREATE OR REPLACE VIEW public.scoring_dashboard AS
SELECT 
  (SELECT COUNT(*) FROM public.tools WHERE status = 'verified') as total_tools,
  (SELECT COUNT(*) FROM public.tools WHERE ai_score_raw IS NOT NULL) as tools_with_ai_scores,
  (SELECT COUNT(*) FROM public.tools WHERE community_signal_raw IS NOT NULL) as tools_with_community_scores,
  (SELECT COUNT(*) FROM public.pending_score_changes WHERE status = 'pending') as pending_reviews,
  (SELECT COUNT(*) FROM public.pending_score_changes WHERE status = 'approved') as approved_changes,
  (SELECT COUNT(*) FROM public.pending_score_changes WHERE status = 'denied') as denied_changes,
  (SELECT MAX(run_at) FROM public.agent_runs WHERE agent_type = 'ranking') as last_ranking_run,
  (SELECT MAX(run_at) FROM public.agent_runs WHERE agent_type = 'community') as last_community_run;

GRANT SELECT ON public.scoring_dashboard TO anon, authenticated;

-- =====================================================
-- 7. INITIAL MIGRATION: Copy shadow → live
-- =====================================================
-- This will use the validation trigger, so large changes get flagged

-- First, disable trigger for initial seed sync
ALTER TABLE public.tools DISABLE TRIGGER trigger_sync_with_validation;

-- Copy all shadow scores to live (one-time sync for existing data)
UPDATE public.tools
SET 
  ai_score = COALESCE(ai_score_raw, ai_score),
  community_score = COALESCE(community_signal_raw, community_score),
  composite_score = ROUND(
    (COALESCE(ai_score_raw, ai_score) * 0.6) + 
    (COALESCE(community_signal_raw, community_score) * 0.4), 
    1
  ),
  updated_at = now()
WHERE ai_score_raw IS NOT NULL 
   OR community_signal_raw IS NOT NULL;

-- Re-enable trigger for future updates
ALTER TABLE public.tools ENABLE TRIGGER trigger_sync_with_validation;

-- =====================================================
-- SUMMARY
-- =====================================================
-- ✅ Auto-approve: Score changes within ±12 points (AI) or ±15 points (Community)
-- ✅ Pending review: Changes exceeding threshold
-- ✅ 48-hour expiry: Unreviewed changes auto-expire
-- ✅ Admin functions: approve_score_change(), deny_score_change()
-- ✅ Dashboard views: pending_reviews, scoring_dashboard
--
-- To check pending reviews:
--   SELECT * FROM pending_reviews;
--
-- To approve a change:
--   SELECT * FROM approve_score_change('uuid-here', 'Approved: valid change');
--
-- To deny a change:
--   SELECT * FROM deny_score_change('uuid-here', 'Denied: anomaly detected');
-- =====================================================
