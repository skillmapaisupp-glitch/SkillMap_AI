import { cn } from "@/lib/utils";

interface SkillChipProps {
  name: string;
  category: string;
  proficiency?: string;
}

const categoryColors: Record<string, string> = {
  technical: "border-secondary/40 bg-secondary/10 text-secondary",
  soft: "border-success/40 bg-success/10 text-success",
  domain: "border-primary/40 bg-primary/10 text-primary",
  tool: "border-pro/40 bg-pro/10 text-pro",
};

const SkillChip = ({ name, category, proficiency }: SkillChipProps) => {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium", categoryColors[category] || "border-border bg-muted text-muted-foreground")}>
      {name}
      {proficiency && (
        <span className="opacity-60 font-normal">· {proficiency}</span>
      )}
    </span>
  );
};

export default SkillChip;
