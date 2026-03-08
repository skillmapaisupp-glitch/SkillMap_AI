import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import CursorFollower from "@/components/landing/CursorFollower";
import RoleCycler from "@/components/landing/RoleCycler";
import FeatureGrid from "@/components/landing/FeatureGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingCards from "@/components/landing/PricingCards";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background cursor-none relative noise-overlay">
      <CursorFollower />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        {/* Ambient glow orbs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />
        
        <div className="container max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm text-primary mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Free for students — no credit card required
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
              Map the path from{" "}
              <br className="hidden sm:block" />
              who you are →{" "}
              <br className="hidden sm:block" />
              <RoleCycler />
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              AI-powered career intelligence. Analyze your resume, identify skill gaps, get a
              personalized roadmap, practice interviews, and track your progress — all for free.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="hero" size="lg" className="text-lg px-8 py-6 animate-pulse-glow" asChild>
                <Link to="/signup">
                  Start Free <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" className="text-lg px-8 py-6 glass" asChild>
                <a href="#pricing">View Plans</a>
              </Button>
            </motion.div>

            <p className="mt-6 text-sm text-muted-foreground">
              Works for <span className="text-foreground font-medium">every job</span>. Every industry. Every level.
            </p>
          </motion.div>
        </div>
      </section>

      <FeatureGrid />
      <HowItWorks />
      <PricingCards />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
