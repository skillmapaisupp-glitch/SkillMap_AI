import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* CTA Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[140px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to map your <span className="text-gradient-primary">future</span>?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join thousands of career changers using AI to bridge the gap between where they are and where they want to be.
          </p>
          <Button variant="hero" size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/signup">
              Start Free Today <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer links */}
      <div className="border-t border-border/50 py-12 px-4 glass-subtle">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-display font-bold text-lg mb-3">
                <span className="text-primary">Skill</span>ect AI
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bridge the gap between who you are and who you want to be.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#pricing" className="hover:text-foreground transition-colors duration-300">Pricing</a></li>
                <li><Link to="/signup" className="hover:text-foreground transition-colors duration-300">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-foreground transition-colors duration-300">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors duration-300">Resume Analysis</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors duration-300">Skill Roadmap</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors duration-300">Mock Interviews</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors duration-300">Progress Tracking</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-10 pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Skillect AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
