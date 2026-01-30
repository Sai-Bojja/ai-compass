import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =====================================================
// AIDEAS.AI - COMMUNITY SCORING ENGINE (SHADOW MODE)
// =====================================================
// This edge function analyzes community signals (questions,
// answers, mentions) and stores results in SHADOW fields
// (community_signal_raw, etc.) WITHOUT modifying live rankings.
//
// Trigger: Manual invocation or scheduled (cron)
// =====================================================

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const AGENT_VERSION = "v1.0-community";

interface Tool {
    id: string;
    name: string;
    slug: string;
}

interface MentionAnalysis {
    mentions: Array<{
        questionId: string;
        title: string;
        sentiment: number; // -1 to 1
        confidence: number; // 0 to 1
        context: string; // positive/negative/neutral/comparison
    }>;
    aggregateScore: number;
    mentionCount: number;
    avgSentiment: number;
}

async function findToolMentions(
    tool: Tool,
    supabase: ReturnType<typeof createClient>
): Promise<Array<{ id: string; title: string; body: string; answers: string[] }>> {
    // Search for questions that mention this tool
    const { data: questions } = await supabase
        .from("questions")
        .select(`
      id,
      title,
      body,
      answers (body)
    `)
        .or(`title.ilike.%${tool.name}%,body.ilike.%${tool.name}%`)
        .limit(50);

    if (!questions) return [];

    // Also check question_tool_mentions table
    const { data: mentionedQuestions } = await supabase
        .from("question_tool_mentions")
        .select(`
      question:questions (
        id,
        title,
        body,
        answers (body)
      )
    `)
        .eq("tool_id", tool.id)
        .limit(50);

    // Combine and deduplicate
    const allQuestions = [...(questions || [])];

    if (mentionedQuestions) {
        for (const m of mentionedQuestions) {
            if (m.question && !allQuestions.some(q => q.id === m.question.id)) {
                allQuestions.push(m.question);
            }
        }
    }

    return allQuestions.map(q => ({
        id: q.id,
        title: q.title,
        body: q.body || "",
        answers: q.answers?.map((a: { body: string }) => a.body) || [],
    }));
}

async function analyzeSentiment(
    texts: string[],
    toolName: string,
    openaiApiKey: string
): Promise<{ avgSentiment: number; contexts: string[] }> {
    if (texts.length === 0) {
        return { avgSentiment: 0, contexts: [] };
    }

    // Batch analyze sentiments
    const combinedText = texts.slice(0, 10).map((t, i) => `[${i + 1}] ${t.slice(0, 500)}`).join("\n\n");

    const prompt = `Analyze the sentiment towards "${toolName}" in these community discussions.

## Discussions:
${combinedText}

## Instructions:
For each numbered discussion, determine:
1. Sentiment towards ${toolName}: -1 (very negative) to +1 (very positive), 0 if neutral
2. Context: "recommendation", "complaint", "comparison", "question", "praise", or "neutral"

Return ONLY a valid JSON object:
{
  "sentiments": [
    { "index": 1, "sentiment": 0.8, "context": "recommendation" },
    { "index": 2, "sentiment": -0.3, "context": "complaint" }
  ],
  "overall_sentiment": 0.5,
  "summary": "Brief summary of community perception"
}

Be objective. Consider context - a comparison isn't negative, a question isn't negative.`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Use mini for cost efficiency
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            console.error(`OpenAI API error: ${response.status}`);
            return { avgSentiment: 0, contexts: ["error"] };
        }

        const data = await response.json();
        const analysis = JSON.parse(data.choices[0].message.content);

        return {
            avgSentiment: analysis.overall_sentiment || 0,
            contexts: analysis.sentiments?.map((s: { context: string }) => s.context) || [],
        };
    } catch (error) {
        console.error("Sentiment analysis error:", error);
        return { avgSentiment: 0, contexts: ["error"] };
    }
}

function calculateCommunityScore(
    mentionCount: number,
    avgSentiment: number
): number {
    // Base score starts at 50 (neutral)
    let score = 50;

    // Sentiment contribution: ±30 points max
    // avgSentiment ranges from -1 to +1
    score += avgSentiment * 30;

    // Mention count bonus: up to +20 points
    // More mentions = more community engagement
    // Logarithmic scale: 1 mention = +5, 10 mentions = +15, 50+ = +20
    if (mentionCount > 0) {
        const mentionBonus = Math.min(20, Math.log10(mentionCount + 1) * 12);
        score += mentionBonus;
    }

    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

serve(async (req) => {
    // Handle CORS
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
        let options = { toolSlug: null as string | null };
        try {
            const body = await req.json();
            options = { ...options, ...body };
        } catch {
            // No body - analyze all tools
        }

        // Fetch tools to analyze
        let query = supabase
            .from("tools")
            .select("id, name, slug")
            .eq("status", "verified");

        if (options.toolSlug) {
            query = query.eq("slug", options.toolSlug);
        }

        const { data: tools, error: fetchError } = await query;

        if (fetchError) {
            throw new Error(`Failed to fetch tools: ${fetchError.message}`);
        }

        if (!tools || tools.length === 0) {
            return new Response(
                JSON.stringify({ success: true, message: "No tools to analyze" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`Analyzing community signals for ${tools.length} tools...`);

        let successCount = 0;
        let errorCount = 0;
        const results: Array<{
            slug: string;
            mentions: number;
            sentiment: number;
            score: number | null;
            error?: string;
        }> = [];

        for (const tool of tools) {
            try {
                console.log(`Analyzing: ${tool.name}...`);

                // Find all mentions
                const mentions = await findToolMentions(tool, supabase);

                if (mentions.length === 0) {
                    // No mentions - store zero but not null
                    await supabase
                        .from("tools")
                        .update({
                            community_signal_raw: 50, // Neutral baseline
                            community_mentions_count: 0,
                            community_sentiment_score: 0,
                            community_last_analyzed_at: new Date().toISOString(),
                        })
                        .eq("id", tool.id);

                    results.push({ slug: tool.slug, mentions: 0, sentiment: 0, score: 50 });
                    successCount++;
                    continue;
                }

                // Combine all text for sentiment analysis
                const allTexts = mentions.flatMap(m => [
                    m.title,
                    m.body,
                    ...m.answers,
                ]).filter(t => t && t.length > 10);

                // Analyze sentiment
                const { avgSentiment, contexts } = await analyzeSentiment(
                    allTexts,
                    tool.name,
                    OPENAI_API_KEY
                );

                // Calculate community score
                const communityScore = calculateCommunityScore(mentions.length, avgSentiment);

                // Store in SHADOW fields only
                await supabase
                    .from("tools")
                    .update({
                        community_signal_raw: communityScore,
                        community_mentions_count: mentions.length,
                        community_sentiment_score: avgSentiment,
                        community_last_analyzed_at: new Date().toISOString(),
                    })
                    .eq("id", tool.id);

                results.push({
                    slug: tool.slug,
                    mentions: mentions.length,
                    sentiment: avgSentiment,
                    score: communityScore,
                });

                successCount++;
                console.log(`  ✓ ${tool.name}: ${mentions.length} mentions, sentiment ${avgSentiment.toFixed(2)}, score ${communityScore}`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (error) {
                console.error(`  ✗ ${tool.name}: ${error}`);
                errorCount++;
                results.push({
                    slug: tool.slug,
                    mentions: 0,
                    sentiment: 0,
                    score: null,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        const durationMs = Date.now() - startTime;

        // Log agent run
        await supabase.from("agent_runs").insert({
            agent_type: "community",
            tools_processed: tools.length,
            success_count: successCount,
            error_count: errorCount,
            duration_ms: durationMs,
            version: AGENT_VERSION,
            metadata: {
                options,
                total_mentions: results.reduce((sum, r) => sum + r.mentions, 0),
                avg_sentiment: results.length > 0
                    ? results.reduce((sum, r) => sum + r.sentiment, 0) / results.length
                    : 0,
            },
        });

        return new Response(
            JSON.stringify({
                success: true,
                tools_analyzed: successCount,
                errors: errorCount,
                duration_ms: durationMs,
                total_mentions_found: results.reduce((sum, r) => sum + r.mentions, 0),
                results,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Community scoring error:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
