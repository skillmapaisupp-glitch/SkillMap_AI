import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Map, Calendar, Target, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import RoadmapLoader from "@/components/roadmap/RoadmapLoader";

interface RoadmapStep {
  id?: string;
  skillName: string;
  phase: string;
  importanceLevel: string;
  estimatedWeeks: number;
  howToLearn: string;
  resources: any[];
  practicalTasks: string[];
  status: string;
}

const RoadmapPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [estimatedWeeks, setEstimatedWeeks] = useState(0);
  const [hasResume, setHasResume] = useState(false);

  // Load existing plan or check for resume
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Check for existing learning plan
    const { data: plans } = await supabase
      .from("learning_plans")
      .select("id, estimated_weeks")
      .eq("user_id", user.id)
      .eq("phase", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (plans?.length) {
      const plan = plans[0];
      setPlanId(plan.id);
      setEstimatedWeeks(plan.estimated_weeks || 0);

      const { data: planSteps } = await supabase
        .from("plan_steps")
        .select("*")
        .eq("plan_id", plan.id)
        .order("sort_order", { ascending: true });

      if (planSteps?.length) {
        setSteps(
          planSteps.map((s) => ({
            id: s.id,
            skillName: s.skill_name,
            phase: s.phase || "core",
            importanceLevel: s.importance_level || "important",
            estimatedWeeks: s.estimated_weeks || 2,
            howToLearn: s.how_to_learn || "",
            resources: (s.resources as any[]) || [],
            practicalTasks: (s.practical_tasks as string[]) || [],
            status: s.status || "not_started",
          }))
        );
      }
    }

    // Check if user has done a resume analysis
    const { data: resumes } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    setHasResume(!!resumes?.length);
    setLoading(false);
  };

  const generateRoadmap = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      // Get latest resume skill gaps
      const { data: resumes } = await supabase
        .from("resumes")
        .select("id, extracted_skills, overall_fit_score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!resumes?.length) {
        toast.error("Please complete a resume analysis first.");
        navigate("/dashboard/resume");
        return;
      }

      // Get skill gaps from DB
      const { data: targetRoles } = await supabase
        .from("target_roles")
        .select("id, role_title, experience_level")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: gaps } = await supabase
        .from("skill_gaps")
        .select("skill_name, importance_level, why_it_matters")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // If no gaps in DB, use resume weaknesses as fallback
      let skillGaps = gaps?.map((g) => ({
        name: g.skill_name,
        importance: g.importance_level || "important",
        whyItMatters: g.why_it_matters || "",
      }));

      if (!skillGaps?.length) {
        // Fallback: re-extract from the last analysis stored in localStorage or ask user
        toast.error("No skill gaps found. Please run a resume analysis first.");
        navigate("/dashboard/resume");
        return;
      }

      const role = targetRoles?.[0];

      const { data: fnData, error } = await supabase.functions.invoke("generate-roadmap", {
        body: {
          skillGaps,
          targetRole: role?.role_title || "Target Role",
          experienceLevel: role?.experience_level || "Not specified",
          resumeId: resumes[0].id,
        },
      });

      if (error) throw error;
      if (fnData?.error) {
        toast.error(fnData.error);
        setGenerating(false);
        return;
      }

      setPlanId(fnData.planId);
      setEstimatedWeeks(fnData.estimatedWeeks);
      setSteps(
        fnData.steps.map((s: any) => ({
          skillName: s.skillName,
          phase: s.phase,
          importanceLevel: s.importanceLevel,
          estimatedWeeks: s.estimatedWeeks,
          howToLearn: s.howToLearn,
          resources: s.resources || [],
          practicalTasks: s.practicalTasks || [],
          status: "not_started",
        }))
      );

      toast.success("Roadmap generated!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate roadmap.");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStep = async (index: number) => {
    const step = steps[index];
    const newStatus = step.status === "completed" ? "not_started" : "completed";
    const updatedSteps = steps.map((s, i) =>
      i === index ? { ...s, status: newStatus } : s
    );
    setSteps(updatedSteps);

    // Persist to DB
    if (step.id) {
      await supabase
        .from("plan_steps")
        .update({
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", step.id);

      // Log progress
      if (newStatus === "completed" && user) {
        await supabase.from("progress_logs").insert({
          user_id: user.id,
          step_id: step.id,
          action: "completed_step",
          notes: `Completed: ${step.skillName}`,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-5xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Map className="w-8 h-8 text-primary" />
          Skill Roadmap
        </h1>
        <p className="text-muted-foreground">
          Your personalized learning path to your target role.
        </p>
      </div>

      {generating && (
        <div className="glass-card rounded-xl">
          <RoadmapLoader />
        </div>
      )}

      {!generating && steps.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-10 text-center"
        >
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          {hasResume ? (
            <>
              <h2 className="text-lg font-semibold mb-2">Ready to Build Your Roadmap</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                We'll use your resume analysis and skill gaps to create a personalized, phased learning plan with curated resources.
              </p>
              <Button variant="default" size="lg" onClick={generateRoadmap}>
                Generate Learning Roadmap
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-2">Complete a Resume Analysis First</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                We need your skill gaps to build a personalized roadmap. Start by analyzing your resume.
              </p>
              <Button variant="default" size="lg" onClick={() => navigate("/dashboard/resume")}>
                Go to Resume Analysis
              </Button>
            </>
          )}
        </motion.div>
      )}

      {!generating && steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Summary bar */}
          <div className="glass-card rounded-xl p-5 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm">
                <strong>{estimatedWeeks}</strong> weeks estimated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm">
                <strong>{steps.length}</strong> skills to learn
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {steps.filter((s) => s.status === "completed").length} completed
              </span>
            </div>
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={generateRoadmap} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </Button>
            </div>
          </div>

          <RoadmapTimeline steps={steps} onToggleStep={handleToggleStep} />
        </motion.div>
      )}
    </div>
  );
};

export default RoadmapPage;
