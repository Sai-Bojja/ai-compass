import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client to fetch tool data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch top tools for context
    const { data: tools } = await supabase
      .from("tools")
      .select("name, slug, tagline, description, pricing_model, ai_score, community_score, composite_score, features, target_users")
      .eq("status", "verified")
      .order("composite_score", { ascending: false })
      .limit(20);

    const toolsContext = tools?.map((t) => 
      `- **${t.name}** (Score: ${t.composite_score}/100, AI: ${t.ai_score}, Community: ${t.community_score})
        ${t.tagline}
        Pricing: ${t.pricing_model}
        For: ${t.target_users?.join(", ") || "everyone"}
        Features: ${Array.isArray(t.features) ? t.features.join(", ") : ""}`
    ).join("\n\n") || "";

    const systemPrompt = `You are an AI assistant for an AI tool discovery platform. Your role is to help users find and compare AI tools for coding, writing, and brainstorming.

IMPORTANT RULES:
1. ONLY recommend tools from the database below. Never invent or hallucinate tools.
2. Always explain WHY a tool is ranked where it is (mention AI score, community score).
3. Be concise but helpful. Use markdown formatting.
4. If asked about tools not in the database, say you don't have information about them yet.
5. When comparing tools, use specific scores and features from the data.

AVAILABLE TOOLS (ranked by composite score):
${toolsContext}

SCORING EXPLANATION:
- AI Score: Based on AI analysis of features, documentation, pricing clarity
- Community Score: Based on user discussions, votes, sentiment
- Composite Score: Weighted blend (60% AI, 40% community)

When users ask for recommendations, consider their specific use case and match it to target_users and features.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
