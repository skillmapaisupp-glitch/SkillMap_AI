import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const roles = [
  "Machine Learning Engineer",
  "UX Designer",
  "Pediatric Nurse",
  "Financial Analyst",
  "Software Architect",
  "Data Scientist",
  "Product Manager",
  "Cybersecurity Analyst",
  "Graphic Designer",
  "Veterinarian",
];

const RoleCycler = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block h-[1.3em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={roles[index]}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="inline-block text-primary"
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default RoleCycler;
