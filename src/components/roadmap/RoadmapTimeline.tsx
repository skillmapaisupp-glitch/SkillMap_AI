import { motion } from "framer-motion";
import { Check, Clock, BookOpen, Wrench, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Resource {
  title: string;
  type: string;
  url?: string;
  free: boolean;
}

interface RoadmapStep {
  id?: string;
  skillName: string;
  phase: string;
  importanceLevel: string;
  estimatedWeeks: number;
  howToLearn: string;
  resources: Resource[];
  practicalTasks: string[];
  status: string;
}

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
  onToggleStep?: (index: number) => void;
}

const phaseColors: Record<string, string> = {
  foundation: "bg-secondary/20 text-secondary border-secondary/30",
  core: "bg-primary/20 text-primary border-primary/30",
  advanced: "bg-[hsl(var(--pro))]/20 text-[hsl(var(--pro))] border-[hsl(var(--pro))]/30",
  mastery: "bg-success/20 text-success border-success/30",
};

const importanceBadge: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  important: "bg-primary/15 text-primary border-primary/30",
  nice_to_have: "bg-muted text-muted-foreground border-border",
};

const resourceIcon: Record<string, typeof BookOpen> = {
  course: BookOpen,
  book: BookOpen,
  tutorial: BookOpen,
  documentation: BookOpen,
  project: Wrench,
  tool: Wrench,
};

const RoadmapTimeline = ({ steps, onToggleStep }: RoadmapTimelineProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progress = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;

  // Group steps by phase
  const phases = ["foundation", "core", "advanced", "mastery"];
  const groupedSteps = phases
    .map((phase) => ({
      phase,
      steps: steps
        .map((s, i) => ({ ...s, originalIndex: i }))
        .filter((s) => s.phase === phase),
    }))
    .filter((g) => g.steps.length > 0);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">
            Overall Progress
          </p>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{steps.length} skills · {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Phase groups */}
      {groupedSteps.map((group) => (
        <div key={group.phase} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${phaseColors[group.phase]} capitalize text-xs`}>
              {group.phase}
            </Badge>
            <div className="h-px flex-1 bg-border" />
          </div>

          {group.steps.map((step) => {
            const isExpanded = expandedIndex === step.originalIndex;
            const isCompleted = step.status === "completed";
            const ResIcon = resourceIcon;

            return (
              <motion.div
                key={step.originalIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step.originalIndex * 0.05 }}
                className={`rounded-xl border bg-card overflow-hidden transition-colors ${
                  isCompleted ? "border-success/30" : "border-border"
                }`}
              >
                {/* Header */}
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedIndex(isExpanded ? null : step.originalIndex)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{step.originalIndex + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`font-semibold text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {step.skillName}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {step.estimatedWeeks} week{step.estimatedWeeks !== 1 ? "s" : ""}
                      <Badge variant="outline" className={`${importanceBadge[step.importanceLevel]} text-[10px] px-1.5 py-0`}>
                        {step.importanceLevel.replace("_", " ")}
                      </Badge>
                    </span>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-border px-4 pb-4 pt-3 space-y-4"
                  >
                    {/* How to learn */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Learning Strategy
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">{step.howToLearn}</p>
                    </div>

                    {/* Resources */}
                    {step.resources?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Resources
                        </h4>
                        <div className="grid gap-2">
                          {step.resources.map((res, ri) => {
                            const Icon = resourceIcon[res.type] || BookOpen;
                            return (
                              <div key={ri} className="flex items-center gap-2 text-sm rounded-lg bg-muted/40 px-3 py-2">
                                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="flex-1 truncate">{res.title}</span>
                                {res.free && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/20">
                                    Free
                                  </Badge>
                                )}
                                {res.url && (
                                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Practical tasks */}
                    {step.practicalTasks?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Practice Tasks
                        </h4>
                        <ul className="space-y-1.5">
                          {step.practicalTasks.map((task, ti) => (
                            <li key={ti} className="text-sm text-foreground/70 flex items-start gap-2">
                              <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">
                                {ti + 1}
                              </span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Mark complete */}
                    {onToggleStep && (
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        onClick={() => onToggleStep(step.originalIndex)}
                        className="mt-2"
                      >
                        {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                      </Button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default RoadmapTimeline;
