import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-display font-bold text-xl">
          <span className="text-primary">Skill</span>ect AI
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors duration-300">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors duration-300">How It Works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors duration-300">Pricing</a>
          <Link to="/login" className="hover:text-foreground transition-colors duration-300">Login</Link>
          <Button variant="hero" size="sm" asChild>
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Button variant="hero" size="sm" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
