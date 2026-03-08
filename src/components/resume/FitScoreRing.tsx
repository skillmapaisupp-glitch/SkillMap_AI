import { cn } from "@/lib/utils";

interface FitScoreRingProps {
  score: number;
}

const FitScoreRing = ({ score }: FitScoreRingProps) => {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? "text-success" : score >= 40 ? "text-primary" : "text-destructive";
  const label = score >= 70 ? "Strong Fit" : score >= 40 ? "Moderate Fit" : "Needs Work";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-1000 ease-out", color)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold font-display", color)}>{score}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <p className={cn("mt-2 text-sm font-semibold", color)}>{label}</p>
    </div>
  );
};

export default FitScoreRing;
