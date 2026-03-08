import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  BarChart3,
  Target,
  Loader2,
  Sparkles,
} from "lucide-react";

const EXPERIENCE_LEVELS = [
  { value: "student", label: "Student / Fresh Grad", icon: "🎓" },
  { value: "junior", label: "Junior (0–2 yrs)", icon: "🌱" },
  { value: "mid", label: "Mid-Level (3–5 yrs)", icon: "⚡" },
  { value: "senior", label: "Senior (6+ yrs)", icon: "🚀" },
];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const OnboardingPage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [targetRole, setTargetRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [careerGoal, setCareerGoal] = useState("");

  const canAdvance = [
    targetRole.trim().length > 0,
    experienceLevel.length > 0,
    careerGoal.trim().length > 0,
  ];

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    // Deactivate any existing active roles, then insert new one
    await supabase
      .from("target_roles")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    const { error: roleError } = await supabase.from("target_roles").insert({
      user_id: user.id,
      role_title: targetRole.trim().slice(0, 100),
      industry: industry.trim().slice(0, 100) || null,
      experience_level: experienceLevel,
      is_active: true,
    });

    // Save career goal & mark onboarding complete
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        user_goal: careerGoal.trim().slice(0, 500),
        onboarding_completed: true,
      })
      .eq("id", user.id);

    setSaving(false);

    if (roleError || profileError) {
      toast.error("Something went wrong — please try again");
      return;
    }

    await refreshProfile();
    toast.success("You're all set! Welcome aboard 🎉");
    navigate("/dashboard", { replace: true });
  };

  const steps = [
    // Step 0 — Target Role
    <motion.div
      key="role"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 text-primary">
        <Briefcase className="w-6 h-6" />
        <span className="text-sm font-semibold uppercase tracking-wider">Step 1 of 3</span>
      </div>
      <h2 className="text-2xl font-bold">What role are you targeting?</h2>
      <p className="text-muted-foreground text-sm">
        Tell us the job title you're aiming for so we can tailor your experience.
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="targetRole">Target Role</Label>
          <Input
            id="targetRole"
            placeholder="e.g. Data Engineer, Product Manager"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            maxLength={100}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry (optional)</Label>
          <Input
            id="industry"
            placeholder="e.g. Fintech, Healthcare"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            maxLength={100}
          />
        </div>
      </div>
    </motion.div>,

    // Step 1 — Experience Level
    <motion.div
      key="experience"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 text-primary">
        <BarChart3 className="w-6 h-6" />
        <span className="text-sm font-semibold uppercase tracking-wider">Step 2 of 3</span>
      </div>
      <h2 className="text-2xl font-bold">What's your experience level?</h2>
      <p className="text-muted-foreground text-sm">
        This helps us calibrate the difficulty and depth of your roadmap.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {EXPERIENCE_LEVELS.map((lvl) => (
          <button
            key={lvl.value}
            onClick={() => setExperienceLevel(lvl.value)}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              experienceLevel === lvl.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <span className="text-2xl">{lvl.icon}</span>
            <p className="mt-2 text-sm font-medium">{lvl.label}</p>
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 2 — Career Goal
    <motion.div
      key="goal"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 text-primary">
        <Target className="w-6 h-6" />
        <span className="text-sm font-semibold uppercase tracking-wider">Step 3 of 3</span>
      </div>
      <h2 className="text-2xl font-bold">What's your career goal?</h2>
      <p className="text-muted-foreground text-sm">
        A short description of what you want to achieve — we'll use this to personalise your dashboard.
      </p>
      <div className="space-y-2">
        <Label htmlFor="careerGoal">Your Goal</Label>
        <Textarea
          id="careerGoal"
          placeholder="e.g. Transition from marketing to data science within 6 months"
          value={careerGoal}
          onChange={(e) => setCareerGoal(e.target.value)}
          maxLength={500}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">{careerGoal.length}/500</p>
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-muted-foreground">
            Let's personalise <span className="text-primary">Skill</span>ect AI for you
          </h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="glass-card rounded-xl p-6 min-h-[340px] flex flex-col justify-between">
          <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            {step < 2 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance[step]}
                className="gap-1"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="hero"
                size="sm"
                onClick={handleFinish}
                disabled={!canAdvance[step] || saving}
                className="gap-1"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Get Started"}
              </Button>
            )}
          </div>
        </div>

        {/* Skip */}
        <button
          onClick={async () => {
            if (!user) return;
            await supabase
              .from("profiles")
              .update({ onboarding_completed: true })
              .eq("id", user.id);
            await refreshProfile();
            navigate("/dashboard", { replace: true });
          }}
          className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;
