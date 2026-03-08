import { motion } from "framer-motion";

const messages = [
  "Reading your resume...",
  "Extracting skills and experience...",
  "Analyzing target role requirements...",
  "Identifying skill gaps...",
  "Calculating fit score...",
  "Generating recommendations...",
];

const AnalysisLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full border-2 border-secondary/30 border-b-transparent animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
      </div>
      <div className="h-6 overflow-hidden">
        <motion.div
          animate={{ y: [0, -24, -48, -72, -96, -120, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          {messages.map((msg, i) => (
            <p key={i} className="h-6 text-sm text-muted-foreground text-center">{msg}</p>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisLoader;
