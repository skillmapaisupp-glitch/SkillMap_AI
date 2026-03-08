import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { skillGaps, targetRole, experienceLevel, resumeId } = await req.json();

    if (!skillGaps?.length || !targetRole) {
      return new Response(JSON.stringify({ error: "Skill gaps and target role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Target Role: ${targetRole}
Experience Level: ${experienceLevel || "Not specified"}

Skill Gaps to address:
${skillGaps.map((g: any) => `- ${g.name} (${g.importance}): ${g.whyItMatters}`).join("\n")}

Create a personalized, phased learning roadmap. Each step should teach one skill gap. Order by importance (critical first) and logical learning sequence. Provide concrete resources and practical tasks for each step.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert learning path designer. Create actionable, realistic learning roadmaps tailored to career transitions. Be specific with resources (real course names, books, tools).",
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_roadmap",
              description: "Create a structured learning roadmap with phased steps",
              parameters: {
                type: "object",
                properties: {
                  estimatedWeeks: { type: "number", description: "Total estimated weeks to complete" },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skillName: { type: "string" },
                        phase: { type: "string", enum: ["foundation", "core", "advanced", "mastery"] },
                        importanceLevel: { type: "string", enum: ["critical", "important", "nice_to_have"] },
                        estimatedWeeks: { type: "number" },
                        howToLearn: { type: "string", description: "Concise strategy for learning this skill" },
                        resources: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              type: { type: "string", enum: ["course", "book", "tutorial", "documentation", "project", "tool"] },
                              url: { type: "string" },
                              free: { type: "boolean" },
                            },
                            required: ["title", "type", "free"],
                            additionalProperties: false,
                          },
                        },
                        practicalTasks: {
                          type: "array",
                          items: { type: "string" },
                          description: "3-5 hands-on tasks to demonstrate competency",
                        },
                      },
                      required: ["skillName", "phase", "importanceLevel", "estimatedWeeks", "howToLearn", "resources", "practicalTasks"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["estimatedWeeks", "steps"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_roadmap" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI roadmap generation failed." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "AI returned invalid format." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let roadmap;
    try {
      roadmap = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse:", toolCall.function.arguments);
      return new Response(JSON.stringify({ error: "AI returned invalid format." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get or create target_role
    const { data: existingRole } = await supabase
      .from("target_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role_title", targetRole)
      .eq("is_active", true)
      .limit(1)
      .single();

    const targetRoleId = existingRole?.id || null;

    // Save learning plan
    const { data: plan, error: planError } = await supabase
      .from("learning_plans")
      .insert({
        user_id: user.id,
        estimated_weeks: roadmap.estimatedWeeks,
        total_skills: roadmap.steps.length,
        phase: "active",
        resume_id: resumeId || null,
        target_role_id: targetRoleId,
      })
      .select("id")
      .single();

    if (planError) {
      console.error("Plan insert error:", planError);
      return new Response(JSON.stringify({ error: "Failed to save learning plan." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save plan steps
    const steps = roadmap.steps.map((step: any, i: number) => ({
      plan_id: plan.id,
      user_id: user.id,
      skill_name: step.skillName,
      phase: step.phase,
      importance_level: step.importanceLevel,
      estimated_weeks: step.estimatedWeeks,
      how_to_learn: step.howToLearn,
      resources: step.resources,
      practical_tasks: step.practicalTasks,
      sort_order: i,
      status: "not_started",
    }));

    const { error: stepsError } = await supabase.from("plan_steps").insert(steps);
    if (stepsError) console.error("Steps insert error:", stepsError);

    return new Response(JSON.stringify({ planId: plan.id, ...roadmap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
