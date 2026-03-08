import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { resumeText, targetRole, experienceLevel } = await req.json();

    if (!resumeText || !targetRole) {
      return new Response(JSON.stringify({ error: "Resume text and target role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const truncatedResume = resumeText.slice(0, 6000);

    const systemPrompt = `You are an expert career coach and recruiter with 20 years of cross-industry experience.
Analyze the resume and target role provided. Be specific to the exact role and industry. Works for any job: technical, creative, medical, legal, trades, arts, etc.`;

    const userPrompt = `Resume:
${truncatedResume}

Target Role: ${targetRole}
Experience Level: ${experienceLevel || "Not specified"}

Analyze this resume for the target role and call the report_analysis function with the results.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_analysis",
              description: "Report the structured resume analysis results",
              parameters: {
                type: "object",
                properties: {
                  extractedSkills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string", enum: ["technical", "soft", "domain", "tool"] },
                        proficiencyHint: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                      },
                      required: ["name", "category", "proficiencyHint"],
                      additionalProperties: false,
                    },
                  },
                  detectedExperienceLevel: { type: "string" },
                  detectedIndustry: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  weaknesses: { type: "array", items: { type: "string" } },
                  roleRequiredSkills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        importance: { type: "string", enum: ["critical", "important", "nice_to_have"] },
                        category: { type: "string" },
                      },
                      required: ["name", "importance", "category"],
                      additionalProperties: false,
                    },
                  },
                  skillGaps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        importance: { type: "string", enum: ["critical", "important", "nice_to_have"] },
                        whyItMatters: { type: "string" },
                      },
                      required: ["name", "importance", "whyItMatters"],
                      additionalProperties: false,
                    },
                  },
                  overallFitScore: { type: "number", description: "0-100 score" },
                  summary: { type: "string" },
                },
                required: [
                  "extractedSkills", "detectedExperienceLevel", "detectedIndustry",
                  "strengths", "weaknesses", "roleRequiredSkills", "skillGaps",
                  "overallFitScore", "summary",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_analysis" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI analysis failed. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "AI returned invalid format. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let analysis;
    try {
      analysis = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      return new Response(JSON.stringify({ error: "AI returned invalid format. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
