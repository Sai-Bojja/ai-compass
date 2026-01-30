-- =====================================================
-- AIDEAS.AI - AI SCORE BREAKDOWN VIEW
-- =====================================================
-- This view extracts the JSONB ai_score_components into
-- structured columns for easy UI display and querying.
-- =====================================================

CREATE OR REPLACE VIEW public.ai_score_breakdown AS
SELECT 
  t.id,
  t.slug,
  t.name,
  t.logo_url,
  t.tagline,
  t.pricing_model,
  
  -- Overall scores
  t.ai_score_raw as overall_score,
  t.ai_score as live_score,
  
  -- Component breakdown (extracted from JSONB)
  (t.ai_score_components->>'feature_completeness')::decimal as feature_completeness,
  (t.ai_score_components->>'documentation_quality')::decimal as documentation_quality,
  (t.ai_score_components->>'pricing_clarity')::decimal as pricing_clarity,
  (t.ai_score_components->>'use_case_coverage')::decimal as use_case_coverage,
  (t.ai_score_components->>'innovation')::decimal as innovation,
  
  -- Qualitative feedback
  t.ai_score_components->'strengths' as strengths,
  t.ai_score_components->'weaknesses' as weaknesses,
  t.ai_score_components->>'reasoning' as reasoning,
  
  -- Metadata
  t.ai_score_version,
  t.ai_score_last_evaluated_at,
  
  -- Delta from live score (for analysis)
  CASE 
    WHEN t.ai_score_raw IS NOT NULL 
    THEN ROUND(t.ai_score_raw - t.ai_score, 1) 
  END as score_delta

FROM public.tools t
WHERE t.status = 'verified'
  AND t.ai_score_raw IS NOT NULL;

-- Grant access
GRANT SELECT ON public.ai_score_breakdown TO anon, authenticated;

COMMENT ON VIEW public.ai_score_breakdown IS 
'Structured breakdown of AI evaluation scores for UI display. 
Extracts JSONB components into queryable columns.';
