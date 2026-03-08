import { AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillGap {
  name: string;
  importance: string;
  whyItMatters: string;
}

interface SkillGapPanelProps {
  gaps: SkillGap[];
}

const importanceBadge: Record<string, { className: string; icon: typeof AlertTriangle }> = {
  critical: { className: "text-destructive bg-destructive/10 border-destructive/30", icon: AlertTriangle },
  important: { className: "text-primary bg-primary/10 border-primary/30", icon: AlertTriangle },
  nice_to_have: { className: "text-muted-foreground bg-muted border-border", icon: Check },
};

const SkillGapPanel = ({ gaps }: SkillGapPanelProps) => {
  if (!gaps || gaps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Check className="w-8 h-8 mx-auto mb-2 text-success" />
        <p>No significant skill gaps detected!</p>
      </div>
    );
  }

  const sorted = [...gaps].sort((a, b) => {
    const order = { critical: 0, important: 1, nice_to_have: 2 };
    return (order[a.importance as keyof typeof order] ?? 2) - (order[b.importance as keyof typeof order] ?? 2);
  });

  return (
    <div className="space-y-3">
      {sorted.map((gap, i) => {
        const badge = importanceBadge[gap.importance] || importanceBadge.nice_to_have;
        const BadgeIcon = badge.icon;

        return (
          <div key={i} className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <div className={cn("shrink-0 w-7 h-7 rounded-md flex items-center justify-center border", badge.className)}>
                <BadgeIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{gap.name}</h4>
                  <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border", badge.className)}>
                    {gap.importance.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{gap.whyItMatters}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SkillGapPanel;
