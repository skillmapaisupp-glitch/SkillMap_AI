import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Zap, Brain, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InterviewConfig {
  targetRole: string;
  interviewType: string;
  difficulty: string;
}

interface InterviewSetupProps {
  onStart: (config: InterviewConfig) => void;
}

const interviewTypes = [
  { value: "behavioral", label: "Behavioral", icon: Brain, desc: "STAR-method questions about past experiences" },
  { value: "technical", label: "Technical", icon: Zap, desc: "Role-specific technical knowledge and problem-solving" },
  { value: "situational", label: "Situational", icon: Briefcase, desc: "Hypothetical scenarios and how you'd handle them" },
  { value: "mixed", label: "Mixed", icon: BarChart3, desc: "A blend of behavioral and technical questions" },
];

const InterviewSetup = ({ onStart }: InterviewSetupProps) => {
  const [targetRole, setTargetRole] = useState("");
  const [interviewType, setInterviewType] = useState("behavioral");
  const [difficulty, setDifficulty] = useState("medium");

  const handleStart = () => {
    if (!targetRole.trim()) return;
    onStart({ targetRole: targetRole.trim(), interviewType, difficulty });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Role input */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <Label className="text-sm font-medium">Target Role</Label>
          <Input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Product Manager, Data Scientist..."
            className="mt-1.5"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy — Entry-level questions</SelectItem>
              <SelectItem value="medium">Medium — Mid-level questions</SelectItem>
              <SelectItem value="hard">Hard — Senior-level deep dives</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interview type cards */}
      <div className="grid grid-cols-2 gap-3">
        {interviewTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = interviewType === type.value;
          return (
            <button
              key={type.value}
              onClick={() => setInterviewType(type.value)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <p className="font-semibold text-sm">{type.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
            </button>
          );
        })}
      </div>

      <Button
        size="lg"
        onClick={handleStart}
        disabled={!targetRole.trim()}
        className="w-full"
      >
        Start Interview with Alex
      </Button>
    </motion.div>
  );
};

export default InterviewSetup;
