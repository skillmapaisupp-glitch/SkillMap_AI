import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, GraduationCap, Briefcase, Building2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const PricingCards = () => {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      icon: GraduationCap,
      badge: "🎓 Student",
      price: "$0",
      period: "forever",
      description: "For students and self-learners",
      cta: "Get Started Free",
      ctaVariant: "hero-outline" as const,
      accent: "",
      features: [
        { text: "3 resume analyses / month", included: true },
        { text: "1 active target role", included: true },
        { text: "Full skill roadmap", included: true },
        { text: "Progress tracking", included: true },
        { text: "2 mock interviews / month", included: true },
        { text: "Behavioral interviews only", included: true },
        { text: "20 support messages / day", included: true },
        { text: "PDF export", included: false },
        { text: "Salary insights", included: false },
      ],
    },
    {
      name: "Pro",
      icon: Briefcase,
      badge: "💼 Career Switcher",
      price: annual ? "$99" : "$12",
      period: annual ? "/year" : "/month",
      description: "For professionals changing roles",
      cta: "Start 7-Day Free Trial",
      ctaVariant: "hero" as const,
      popular: true,
      accent: "gradient-border",
      features: [
        { text: "20 resume analyses / month", included: true },
        { text: "3 simultaneous target roles", included: true },
        { text: "Full roadmap + AI refresh", included: true },
        { text: "Unlimited mock interviews", included: true },
        { text: "All interview types & levels", included: true },
        { text: "PDF & Markdown export", included: true },
        { text: "Salary insights", included: true },
        { text: "LinkedIn optimization tips", included: true },
        { text: "Unlimited support chat", included: true },
      ],
    },
    {
      name: "Elite",
      icon: Building2,
      badge: "🏢 Consultancy",
      price: annual ? "$399" : "$49",
      period: annual ? "/year" : "/month",
      description: "For coaches, HR & agencies",
      cta: "Contact Sales",
      ctaVariant: "hero-outline" as const,
      accent: "",
      features: [
        { text: "Unlimited everything", included: true },
        { text: "25 client profiles", included: true },
        { text: "Bulk resume upload (10)", included: true },
        { text: "White-label PDF reports", included: true },
        { text: "Custom question banks", included: true },
        { text: "3 team member seats", included: true },
        { text: "Analytics dashboard", included: true },
        { text: "API access (beta)", included: true },
        { text: "Dedicated support", included: true },
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/3 rounded-full blur-[150px]" />
      
      <div className="container max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-mono tracking-widest text-primary mb-4 uppercase">Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Plans for every <span className="text-gradient-primary">stage</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start free. Upgrade when you need more power.
          </p>

          <div className="inline-flex items-center gap-1 rounded-full glass p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                !annual ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                annual ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual <span className="text-xs opacity-80">Save 31%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={cn(
                "relative rounded-xl glass-card glass-card-hover p-6 flex flex-col",
                plan.popular && "md:-mt-4 md:pb-10",
                plan.accent
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 shadow-lg shadow-primary/30">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <span className="text-sm">{plan.badge}</span>
                <h3 className="text-2xl font-bold mt-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold font-display">{plan.price}</span>
                <span className="text-muted-foreground text-sm">
                  {plan.period}
                </span>
              </div>

              <Button variant={plan.ctaVariant} size="lg" className="w-full mb-6">
                {plan.cta}
              </Button>

              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={cn(!f.included && "text-muted-foreground/50")}>{f.text}</span>
                  </li>
                ))}
              </ul>

              {plan.popular && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  7-day free trial · No credit card required
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingCards;
