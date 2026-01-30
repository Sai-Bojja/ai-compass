import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =====================================================
// AIDEAS.AI - RANKING AGENT v2.0 (EXPLAINABLE SCORING)
// =====================================================
// This agent evaluates AI tools using structured rubrics
// with per-component justifications. Every score includes:
// - Evidence (features present/missing)
// - Rationale (why this score, not higher/lower)
// - Consistency (same lens applied to all tools)
//
// Stores in SHADOW fields only - no impact on live rankings.
// =====================================================

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const AGENT_VERSION = "v2.0-explainable";

// Evaluation rubric - consistent criteria for all tools
const EVALUATION_RUBRIC = `
## SCORING RUBRIC (Apply Consistently to ALL Tools)

### Feature Completeness (0-100)
- 90-100: Industry-leading features, comprehensive coverage, advanced capabilities
- 75-89: Strong core features, good breadth, minor gaps
- 60-74: Adequate features for primary use case, notable limitations
- 40-59: Basic functionality, significant missing capabilities
- 0-39: Minimal viable features only

### Documentation Quality (0-100)
- 90-100: Excellent docs, tutorials, API reference, examples, community resources
- 75-89: Good official docs, some tutorials, clear API reference
- 60-74: Basic documentation exists, gaps in advanced topics
- 40-59: Sparse or outdated documentation
- 0-39: Poor or no documentation

### Pricing Clarity (0-100)
- 90-100: Crystal clear pricing, no hidden costs, easy comparison, free tier
- 75-89: Clear pricing page, most costs visible, reasonable structure
- 60-74: Pricing exists but confusing tiers or hidden limits
- 40-59: Vague pricing, "contact sales" for basics
- 0-39: No public pricing, opaque costs

### Use Case Coverage (0-100)
- 90-100: Addresses 5+ distinct use cases effectively
- 75-89: Strong in 3-4 use cases, good versatility
- 60-74: Focused on 1-2 use cases, limited flexibility
- 40-59: Narrow application, niche only
- 0-39: Single purpose, minimal adaptability

### Innovation (0-100)
- 90-100: Industry-defining technology, unique capabilities
- 75-89: Notable innovations, competitive differentiation
- 60-74: Solid implementation, incremental improvements
- 40-59: Follows market, no standout features
- 0-39: Outdated or derivative approach
`;

interface ComponentScore {
    score: number;
    evidence: {
        present: string[];
        missing_or_limited: string[];
    };
    rationale: string;
}

interface ToolEvaluation {
    feature_completeness: ComponentScore;
    documentation_quality: ComponentScore;
    pricing_clarity: ComponentScore;
    use_case_coverage: ComponentScore;
    innovation: ComponentScore;
    overall_score: number;
    overall_summary: string;
}

interface Tool {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    features: string[] | null;
    pricing_model: string | null;
    website_url: string | null;
    target_users: string[] | null;
}

async function evaluateTool(
    tool: Tool,
    openaiApiKey: string
): Promise<ToolEvaluation> {
    const prompt = `You are an AI tool evaluation expert. Evaluate "${tool.name}" using the rubric below.

## Tool Information
- **Name**: ${tool.name}
- **Tagline**: ${tool.tagline || "N/A"}
- **Description**: ${tool.description || "N/A"}
- **Features**: ${tool.features?.join(", ") || "N/A"}
- **Pricing Model**: ${tool.pricing_model || "N/A"}
- **Target Users**: ${tool.target_users?.join(", ") || "General users"}
- **Website**: ${tool.website_url || "N/A"}

${EVALUATION_RUBRIC}

## CRITICAL RULES
1. **Evidence-Based**: Every score MUST cite specific features present or missing
2. **Consistent**: Apply the SAME rubric standards to all tools
3. **Justified**: Explain why this score and not higher/lower
4. **No Hallucination**: Only cite features mentioned in the tool info or commonly known

## OUTPUT FORMAT (Return ONLY valid JSON)
{
  "feature_completeness": {
    "score": <0-100>,
    "evidence": {
      "present": ["feature1", "feature2"],
      "missing_or_limited": ["missing1", "missing2"]
    },
    "rationale": "Score is X because... Not higher because... Not lower because..."
  },
  "documentation_quality": {
    "score": <0-100>,
    "evidence": {
      "present": ["Official docs", "API reference"],
      "missing_or_limited": ["Interactive tutorials"]
    },
    "rationale": "..."
  },
  "pricing_clarity": {
    "score": <0-100>,
    "evidence": {
      "present": ["Public pricing page", "Free tier"],
      "missing_or_limited": ["Enterprise pricing unclear"]
    },
    "rationale": "..."
  },
  "use_case_coverage": {
    "score": <0-100>,
    "evidence": {
      "present": ["Use case 1", "Use case 2"],
      "missing_or_limited": ["Limited for X"]
    },
    "rationale": "..."
  },
  "innovation": {
    "score": <0-100>,
    "evidence": {
      "present": ["Unique capability 1"],
      "missing_or_limited": ["Follows standard approach for X"]
    },
    "rationale": "..."
  },
  "overall_score": <weighted average>,
  "overall_summary": "2-3 sentence summary of strengths and gaps"
}`;

    const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.2, // Lower for more consistent scoring
            max_tokens: 1200,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0].message.content);

    // Calculate weighted overall score for consistency
    const weights = {
        feature_completeness: 0.30,
        documentation_quality: 0.20,
        pricing_clarity: 0.20,
        use_case_coverage: 0.15,
        innovation: 0.15,
    };

    const weightedScore =
        evaluation.feature_completeness.score * weights.feature_completeness +
        evaluation.documentation_quality.score * weights.documentation_quality +
        evaluation.pricing_clarity.score * weights.pricing_clarity +
        evaluation.use_case_coverage.score * weights.use_case_coverage +
        evaluation.innovation.score * weights.innovation;

    evaluation.overall_score = Math.round(weightedScore * 10) / 10;

    return evaluation;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const startTime = Date.now();

    try {
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not configured");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Parse request options
        let options = { force: false, toolSlug: null as string | null };
        try {
            const body = await req.json();
            options = { ...options, ...body };
        } catch {
            // Use defaults
        }

        // Fetch tools to evaluate
        let query = supabase
            .from("tools")
            .select("id, name, slug, tagline, description, features, pricing_model, website_url, target_users")
            .eq("status", "verified");

        if (options.toolSlug) {
            query = query.eq("slug", options.toolSlug);
        } else if (!options.force) {
            const staleDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            query = query.or(`ai_score_last_evaluated_at.is.null,ai_score_last_evaluated_at.lt.${staleDate}`);
        }

        const { data: tools, error: fetchError } = await query;

        if (fetchError) {
            throw new Error(`Failed to fetch tools: ${fetchError.message}`);
        }

        if (!tools || tools.length === 0) {
            return new Response(
                JSON.stringify({ success: true, message: "No tools need evaluation", tools_evaluated: 0 }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`Starting explainable evaluation of ${tools.length} tools...`);

        let successCount = 0;
        let errorCount = 0;
        const results: Array<{ slug: string; score: number | null; error?: string }> = [];

        for (const tool of tools) {
            try {
                console.log(`Evaluating: ${tool.name}...`);

                const evaluation = await evaluateTool(tool, OPENAI_API_KEY);

                // Store structured evaluation in SHADOW fields
                const { error: updateError } = await supabase
                    .from("tools")
                    .update({
                        ai_score_raw: evaluation.overall_score,
                        ai_score_components: {
                            feature_completeness: evaluation.feature_completeness,
                            documentation_quality: evaluation.documentation_quality,
                            pricing_clarity: evaluation.pricing_clarity,
                            use_case_coverage: evaluation.use_case_coverage,
                            innovation: evaluation.innovation,
                            overall_summary: evaluation.overall_summary,
                        },
                        ai_score_last_evaluated_at: new Date().toISOString(),
                        ai_score_version: AGENT_VERSION,
                    })
                    .eq("id", tool.id);

                if (updateError) {
                    throw new Error(`Failed to update tool: ${updateError.message}`);
                }

                successCount++;
                results.push({ slug: tool.slug, score: evaluation.overall_score });
                console.log(`  ✓ ${tool.name}: ${evaluation.overall_score}/100`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.error(`  ✗ ${tool.name}: ${error}`);
                errorCount++;
                results.push({
                    slug: tool.slug,
                    score: null,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        const durationMs = Date.now() - startTime;

        // Log agent run
        await supabase.from("agent_runs").insert({
            agent_type: "ranking",
            tools_processed: tools.length,
            success_count: successCount,
            error_count: errorCount,
            duration_ms: durationMs,
            version: AGENT_VERSION,
            metadata: { options },
        });

        return new Response(
            JSON.stringify({
                success: true,
                tools_evaluated: successCount,
                errors: errorCount,
                duration_ms: durationMs,
                version: AGENT_VERSION,
                results,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Ranking agent error:", error);
        return new Response(
            JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
