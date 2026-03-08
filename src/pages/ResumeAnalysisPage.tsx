import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ResumeInputForm from "@/components/resume/ResumeInputForm";
import AnalysisLoader from "@/components/resume/AnalysisLoader";
import SkillChip from "@/components/resume/SkillChip";
import SkillGapPanel from "@/components/resume/SkillGapPanel";
import FitScoreRing from "@/components/resume/FitScoreRing";
import { Check, X, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisResult {
  extractedSkills: { name: string; category: string; proficiencyHint: string }[];
  detectedExperienceLevel: string;
  detectedIndustry: string;
  strengths: string[];
  weaknesses: string[];
  roleRequiredSkills: { name: string; importance: string; category: string }[];
  skillGaps: { name: string; importance: string; whyItMatters: string }[];
  overallFitScore: number;
  summary: string;
}

const ResumeAnalysisPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAnalyze = async (data: { resumeText: string; targetRole: string; experienceLevel: string }) => {
    setLoading(true);
    setResult(null);

    try {
      const { data: fnData, error } = await supabase.functions.invoke("analyze-resume", {
        body: {
          resumeText: data.resumeText,
          targetRole: data.targetRole,
          experienceLevel: data.experienceLevel,
        },
      });

      if (error) throw error;

      if (fnData?.error) {
        toast.error(fnData.error);
        setLoading(false);
        return;
      }

      setResult(fnData as AnalysisResult);

      if (user) {
        await supabase.from("resumes").insert({
          user_id: user.id,
          raw_text: data.resumeText,
          extracted_skills: fnData.extractedSkills,
          detected_experience_level: fnData.detectedExperienceLevel,
          detected_industry: fnData.detectedIndustry,
          strengths: fnData.strengths,
          weaknesses: fnData.weaknesses,
          overall_fit_score: fnData.overallFitScore,
        });

        const { data: roleData } = await supabase.from("target_roles").insert({
          user_id: user.id,
          role_title: data.targetRole,
          experience_level: data.experienceLevel,
          is_active: true,
        }).select("id").single();

        if (fnData.skillGaps?.length && roleData?.id) {
          const gapRows = fnData.skillGaps.map((g: any) => ({
            user_id: user.id,
            skill_name: g.name,
            importance_level: g.importance,
            why_it_matters: g.whyItMatters,
            target_role_id: roleData.id,
          }));
          await supabase.from("skill_gaps").insert(gapRows);
        }
      }

      toast.success("Resume analyzed successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resume Analysis</h1>
        <p className="text-muted-foreground">
          Paste your resume, set your target role, and let AI identify your skill gaps.
        </p>
      </div>

      {!result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <ResumeInputForm onSubmit={handleAnalyze} loading={loading} />
        </motion.div>
      )}

      {loading && (
        <div className="glass-card rounded-xl">
          <AnalysisLoader />
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Top row: Fit Score + Summary */}
          <div className="grid md:grid-cols-[240px_1fr] gap-6">
            <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center">
              <FitScoreRing score={result.overallFitScore} />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {result.detectedIndustry} · {result.detectedExperienceLevel}
              </p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Summary
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{result.summary}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-success flex items-center gap-1 mb-2">
                    <Check className="w-4 h-4" /> Strengths
                  </h3>
                  <ul className="space-y-1">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-success mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-destructive flex items-center gap-1 mb-2">
                    <X className="w-4 h-4" /> Areas to Improve
                  </h3>
                  <ul className="space-y-1">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Extracted Skills */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Your Skills</h2>
            <div className="flex flex-wrap gap-2">
              {result.extractedSkills.map((skill, i) => (
                <SkillChip key={i} name={skill.name} category={skill.category} proficiency={skill.proficiencyHint} />
              ))}
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Skill Gaps ({result.skillGaps.length})
            </h2>
            <SkillGapPanel gaps={result.skillGaps} />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="hero" onClick={() => navigate("/dashboard/roadmap")}>
              Generate Learning Roadmap
            </Button>
            <Button variant="hero-outline" onClick={handleNewAnalysis}>
              New Analysis
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeAnalysisPage;
