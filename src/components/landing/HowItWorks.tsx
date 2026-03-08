import { motion } from "framer-motion";
import { Upload, Cpu, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Paste Your Resume",
    description: "Drop in your resume text and tell us your dream role. Any industry, any level.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analyzes & Maps",
    description: "Our AI identifies your skills, detects gaps, and builds a personalized roadmap.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Learn & Level Up",
    description: "Follow your roadmap, track progress, practice interviews, and land your target role.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="container max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-mono tracking-widest text-primary mb-4 uppercase">How it works</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Three steps to your <span className="text-gradient-primary">new career</span>
          </h2>
          <p className="text-muted-foreground text-lg">Simple. Powerful. Free to start.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center relative"
            >
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-5 relative group">
                <div className="absolute inset-0 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-500" />
                <s.icon className="w-7 h-7 text-primary relative z-10" />
              </div>
              <span className="font-mono text-xs text-primary tracking-widest">{s.step}</span>
              <h3 className="text-xl font-bold mt-2 mb-3">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
