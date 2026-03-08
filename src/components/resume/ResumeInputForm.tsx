import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

interface ResumeInputFormProps {
  onSubmit: (data: { resumeText: string; targetRole: string; experienceLevel: string }) => void;
  loading: boolean;
}

const ResumeInputForm = ({ onSubmit, loading }: ResumeInputFormProps) => {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ resumeText, targetRole, experienceLevel });
  };

  const charCount = resumeText.length;
  const isValid = charCount >= 50 && charCount <= 10000 && targetRole.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="resume">Resume Text</Label>
        <Textarea
          id="resume"
          placeholder="Paste your full resume here (plain text)..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="min-h-[200px] bg-background font-mono text-sm"
          maxLength={10000}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          <span className={charCount < 50 ? "text-destructive" : "text-success"}>{charCount}</span> / 10,000 characters
          {charCount < 50 && <span className="text-destructive ml-2">(minimum 50)</span>}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetRole">Target Role</Label>
          <Input
            id="targetRole"
            placeholder="e.g. Machine Learning Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            maxLength={200}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level (0-1 years)</SelectItem>
              <SelectItem value="junior">Junior (1-3 years)</SelectItem>
              <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
              <SelectItem value="senior">Senior (5-10 years)</SelectItem>
              <SelectItem value="lead">Lead / Staff (10+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button variant="hero" size="lg" type="submit" disabled={!isValid || loading} className="w-full md:w-auto">
        {loading ? "Analyzing..." : "Analyze Resume"} <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </form>
  );
};

export default ResumeInputForm;
