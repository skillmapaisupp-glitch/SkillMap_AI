import { BarChart3 } from "lucide-react";

const ProgressPage = () => (
  <div className="p-6 md:p-10 max-w-4xl">
    <h1 className="text-3xl font-bold mb-2">Progress Tracker</h1>
    <p className="text-muted-foreground mb-8">Track your learning velocity and streaks.</p>
    <div className="glass-card rounded-xl p-10 text-center">
      <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-muted-foreground">Start learning from your roadmap to see progress here.</p>
    </div>
  </div>
);

export default ProgressPage;
