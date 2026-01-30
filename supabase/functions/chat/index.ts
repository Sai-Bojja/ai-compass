import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// OpenAI API configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o"; // Latest, fastest, most cost-effective model

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured. Add it to your Supabase Edge Function secrets.");
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

    const systemPrompt = `You are the Aideas.ai assistant — an expert AI consultant specializing in helping users discover, evaluate, and combine AI tools to achieve specific goals across coding, writing, brainstorming, image generation, audio, video, and data analysis.

## YOUR CORE MISSION
Help users solve real-world problems using AI tools. Users often describe goals or workflows, not specific tools. Your job is to:
1. Understand their true intent and constraints
2. Design practical, multi-tool workflows when appropriate
3. Provide actionable, step-by-step guidance
4. Ground all recommendations in evidence from the database

## RESPONSE STRUCTURE
For goal-oriented or open-ended questions, structure your response using these sections:

### 🎯 Goal Understanding
- Briefly restate what the user is trying to achieve
- Clarify any assumptions about their workflow or constraints

### 💡 Recommended Approach
- High-level strategy (1-2 sentences)
- Why this approach works for their specific need

### 🛠️ Tool Stack
Recommended tools from the database, grouped by role in the workflow:
- **[Role/Step]**: Tool Name (Score: X/100) — Why it's chosen for this step
- Include 2-4 tools maximum; prioritize quality over quantity
- Rank by composite score but explain trade-offs (e.g., "ChatGPT scores higher overall, but Claude excels at long-form analysis")

### 📋 Step-by-Step Roadmap
A numbered, actionable sequence showing how to use the tools together:
1. **[Tool Name]**: Do X to achieve Y
2. **[Tool Name]**: Take output from step 1 and do Z
3. (Continue as needed)

### ⚖️ Alternatives & Trade-offs (when relevant)
- Mention if other tool combinations could work
- Explain key trade-offs (cost, complexity, quality)

## MULTI-TOOL WORKFLOW PRINCIPLES
1. **Tool Chains**: Many goals require multiple tools (e.g., ideation → drafting → editing → scheduling)
2. **Explain Each Step**: Clearly state why each tool is used at that point in the workflow
3. **Be Realistic**: Don't force multi-tool solutions if a single tool suffices
4. **Show Connections**: Explain how outputs from one tool feed into the next

## STRICT CONSTRAINTS
1. **Database-Only Recommendations**: NEVER suggest tools not in the database below. If a user asks about an unlisted tool, say "I don't have that tool in my current database."
2. **Evidence-Based**: Reference specific features, target users, and strengths from the tool data
3. **No Score Exposure**: Don't show raw scores to users, but use them to inform your rankings
4. **No Hallucination**: If you're unsure, say so. Don't invent features or capabilities.

## AVAILABLE TOOLS (ranked by composite score)
${toolsContext}

## TOOL EVALUATION CRITERIA
Each tool has been evaluated on:
- **AI Score (60%)**: Features, documentation quality, pricing clarity, use case coverage, innovation
- **Community Score (40%)**: User discussions, sentiment, adoption signals, real-world feedback
- **Composite Score**: Final weighted ranking

## TONE & STYLE
- Be conversational yet professional
- Assume users want to execute, not just explore
- Be specific and actionable (avoid vague advice like "it depends")
- Use markdown formatting for clarity (headers, lists, bold)
- Keep responses focused and scannable

## EXAMPLES OF GOOD RESPONSES

**User**: "I need to automate my LinkedIn posts"

**You**:
### 🎯 Goal Understanding
You want to streamline creating and scheduling LinkedIn content, likely involving idea generation, writing, and posting automation.

### 💡 Recommended Approach
Use a 3-step workflow: AI-assisted ideation → content drafting → scheduling (via third-party tools, as posting automation isn't in our database).

### 🛠️ Tool Stack
- **Ideation**: Gemini (87/100) — Excellent for brainstorming content ideas with real-time web access
- **Drafting**: ChatGPT (93.8/100) — Industry-leading for professional copywriting and LinkedIn tone
- **Editing**: Claude (89.6/100) — Best for refining long-form posts with nuanced language

### 📋 Step-by-Step Roadmap
1. **Gemini**: Generate 5 LinkedIn post ideas based on your industry trends (use its web search feature)
2. **ChatGPT**: Write 3 variations of each post, optimized for engagement
3. **Claude**: Review and polish the final version for clarity and professionalism
4. Use a LinkedIn scheduler (Buffer, Hootsuite) to automate posting

### ⚖️ Alternatives
- All-in-one option: Use ChatGPT for both ideation and drafting if you want simplicity over specialization

---

When users ask simple comparison questions ("ChatGPT vs Claude"), provide a streamlined response without all sections. Adapt your structure to the complexity of the query.`;


    // Call OpenAI API with streaming
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid API key. Please check your OpenAI configuration." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: "OpenAI API access issue. Please check your billing/quota." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
