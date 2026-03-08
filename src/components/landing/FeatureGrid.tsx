import { motion } from "framer-motion";
import { Brain, Target, Route, MessageSquare, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Resume Analysis",
    description: "Paste your resume. Our AI extracts skills, identifies gaps, and scores your fit for any role.",
  },
  {
    icon: Route,
    title: "Personalized Roadmap",
    description: "Get a phased learning plan with free resources, tasks, and estimated timelines tailored to you.",
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    description: "See exactly what you're missing for your dream role — from critical must-haves to nice-to-haves.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Track your learning velocity, streaks, and completion with adaptive AI coaching.",
  },
  {
    icon: MessageSquare,
    title: "Mock Interviews",
    description: "Practice with an AI interviewer. Get scored feedback, ideal answer elements, and improvement tips.",
  },
  {
    icon: Shield,
    title: "Mental Health Support",
    description: "Feeling overwhelmed? Chat with Mila, your empathetic AI companion for learning-related stress.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeatureGrid = () => {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="container max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-mono tracking-widest text-primary mb-4 uppercase">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to <span className="text-gradient-primary">level up</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From barista to neurosurgeon, junior dev to CTO — Skillect AI works for every role, every industry, every level.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group glass-card glass-card-hover rounded-xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg glass flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_hsl(38_92%_50%_/_0.15)] transition-shadow duration-500">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureGrid;
