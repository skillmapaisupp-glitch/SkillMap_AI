import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, FileText, MessageSquare, Map, Heart, TrendingUp, Clock, Target, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const quickActions = [
  { label: "Analyze Resume", icon: FileText, path: "/dashboard/resume", description: "Start a new resume analysis" },
  { label: "Practice Interview", icon: MessageSquare, path: "/dashboard/interview", description: "Run a mock interview session" },
  { label: "Skill Roadmap", icon: Map, path: "/dashboard/roadmap", description: "View your learning roadmap" },
  { label: "Talk to Mila", icon: Heart, path: "/dashboard/support", description: "Get mental health support" },
];

interface Stats {
  skillsCompleted: number;
  skillsInProgress: number;
  skillsRemaining: number;
  totalSkills: number;
  estimatedWeeks: number | null;
  fitScore: number | null;
  interviewsDone: number;
  avgInterviewScore: number | null;
}

interface ActivityItem {
  id: string;
  type: "resume" | "interview" | "step" | "support";
  title: string;
  detail: string;
  timestamp: string;
}

const DashboardHome = () => {
  const { user, profile, subscription } = useAuth();
  const plan = subscription?.plan || "free";
  const [stats, setStats] = useState<Stats>({
    skillsCompleted: 0, skillsInProgress: 0, skillsRemaining: 0,
    totalSkills: 0, estimatedWeeks: null, fitScore: null,
    interviewsDone: 0, avgInterviewScore: null,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    const [planStepsRes, resumesRes, interviewsRes, progressRes] = await Promise.all([
      supabase.from("plan_steps").select("status, estimated_weeks").eq("user_id", user.id),
      supabase.from("resumes").select("overall_fit_score, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("interview_sessions").select("id, target_role, overall_score, completed, completed_at, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("progress_logs").select("action, notes, logged_at").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(5),
    ]);

    const steps = planStepsRes.data || [];
    const completed = steps.filter((s) => s.status === "completed").length;
    const inProgress = steps.filter((s) => s.status === "in_progress").length;
    const remaining = steps.filter((s) => s.status === "not_started").length;
    const totalWeeks = steps.reduce((sum, s) => sum + (s.estimated_weeks || 0), 0);

    const resumes = resumesRes.data || [];
    const latestFit = resumes[0]?.overall_fit_score ?? null;

    const interviews = interviewsRes.data || [];
    const completedInterviews = interviews.filter((i) => i.completed);
    const avgScore = completedInterviews.length
      ? Math.round(completedInterviews.reduce((s, i) => s + (i.overall_score || 0), 0) / completedInterviews.length)
      : null;

    setStats({
      skillsCompleted: completed, skillsInProgress: inProgress, skillsRemaining: remaining,
      totalSkills: steps.length, estimatedWeeks: totalWeeks || null, fitScore: latestFit,
      interviewsDone: completedInterviews.length, avgInterviewScore: avgScore,
    });

    const items: ActivityItem[] = [];
    resumes.forEach((r) => {
      items.push({ id: `resume-${r.created_at}`, type: "resume", title: "Resume Analyzed", detail: `Fit score: ${r.overall_fit_score ?? "—"}%`, timestamp: r.created_at! });
    });
    interviews.forEach((i) => {
      items.push({ id: `interview-${i.id}`, type: "interview", title: `Interview: ${i.target_role || "General"}`, detail: i.completed ? `Score: ${i.overall_score ?? "—"}/10` : "In progress", timestamp: i.completed_at || i.created_at! });
    });
    (progressRes.data || []).forEach((p) => {
      items.push({ id: `progress-${p.logged_at}`, type: "step", title: p.action === "completed_step" ? "Skill Completed" : p.action, detail: p.notes || "", timestamp: p.logged_at! });
    });

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivity(items.slice(0, 8));
    setLoading(false);
  };

  const progressPercent = stats.totalSkills ? Math.round((stats.skillsCompleted / stats.totalSkills) * 100) : 0;

  const statCards = [
    { label: "Skills Mastered", value: stats.skillsCompleted.toString(), icon: CheckCircle2, color: "text-success" },
    { label: "In Progress", value: stats.skillsInProgress.toString(), icon: TrendingUp, color: "text-secondary" },
    { label: "Remaining", value: stats.skillsRemaining ? stats.skillsRemaining.toString() : "—", icon: Target, color: "text-muted-foreground" },
    { label: "Est. Weeks Left", value: stats.estimatedWeeks ? stats.estimatedWeeks.toString() : "—", icon: Clock, color: "text-primary" },
  ];

  const activityIcon: Record<string, typeof FileText> = { resume: FileText, interview: MessageSquare, step: CheckCircle2, support: Heart };
  const activityColor: Record<string, string> = {
    resume: "bg-primary/15 text-primary",
    interview: "bg-secondary/15 text-secondary",
    step: "bg-success/15 text-success",
    support: "bg-pink-400/15 text-pink-400",
  };

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.display_name || "there"} 👋
        </h1>
        <p className="text-muted-foreground">Continue your career transformation journey.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card glass-card-hover rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`text-2xl font-bold font-display ${stat.color}`}>
              {loading ? "—" : stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Overall progress bar */}
      {stats.totalSkills > 0 && (
        <div className="glass-card rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Roadmap Progress</p>
            <span className="text-sm text-muted-foreground">
              {stats.skillsCompleted}/{stats.totalSkills} skills · {progressPercent}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center gap-4 mt-3">
            {stats.fitScore !== null && (
              <span className="text-xs text-muted-foreground">
                Fit Score: <strong className="text-primary">{stats.fitScore}%</strong>
              </span>
            )}
            {stats.interviewsDone > 0 && (
              <span className="text-xs text-muted-foreground">
                Interviews: <strong className="text-secondary">{stats.interviewsDone}</strong>
                {stats.avgInterviewScore !== null && (
                  <> · Avg: <strong className="text-secondary">{stats.avgInterviewScore}/10</strong></>
                )}
              </span>
            )}
          </div>
        </div>
      )}

      {plan === "free" && (
        <div className="glass-card rounded-xl p-4 mb-6 flex items-center justify-between border-primary/20">
          <p className="text-sm">
            <span className="text-primary font-semibold">Free Plan</span> — Upgrade to Pro for unlimited interviews, PDF export, and salary insights.
          </p>
          <Link to="/pricing" className="text-sm text-primary font-semibold hover:underline whitespace-nowrap ml-4">
            Upgrade →
          </Link>
        </div>
      )}

      {/* Two-column: Quick Actions + Activity */}
      <div className="grid md:grid-cols-[1fr_1fr] gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="group glass-card glass-card-hover rounded-xl p-4"
              >
                <action.icon className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm mb-0.5">{action.label}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <BarChart3 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet. Start by analyzing your resume!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activity.map((item, i) => {
                const Icon = activityIcon[item.type] || BarChart3;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 glass-card rounded-lg px-4 py-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activityColor[item.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground/60 shrink-0">
                      {formatTime(item.timestamp)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
