import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Is SkillMap AI really free?",
    a: "Yes! The Free plan gives you resume analysis, a full skill roadmap, progress tracking, mock interviews, and mental health support — no credit card needed. We monetize through our Pro and Elite tiers for power users.",
  },
  {
    q: "What industries does SkillMap AI support?",
    a: "Every industry. Our AI is trained to understand roles from software engineering to nursing, from graphic design to financial analysis, from trades to consulting. If it's a real job, we can map it.",
  },
  {
    q: "How does the AI analyze my resume?",
    a: "You paste your resume text, tell us your target role, and our AI extracts your skills, detects your experience level, identifies gaps against the target role, and generates a personalized learning roadmap with free resources.",
  },
  {
    q: "Is my resume data safe?",
    a: "Absolutely. Your data is encrypted at rest and in transit. We never share, sell, or use your resume data for training. You can delete all your data at any time from Settings.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, cancel with one click. You'll keep your Pro/Elite features until the end of your billing period, then gracefully downgrade to Free. Your data is always preserved.",
  },
  {
    q: "What's the Pro trial like?",
    a: "7 days of full Pro access — no credit card required. You'll experience unlimited interviews, all types, PDF export, salary insights, and more. After the trial, you can upgrade or continue on Free.",
  },
];

const FAQ = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/3 rounded-full blur-[120px]" />
      
      <div className="container max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-mono tracking-widest text-primary mb-4 uppercase">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently asked <span className="text-gradient-primary">questions</span>
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <AccordionItem
                value={`faq-${i}`}
                className="glass-card rounded-xl px-6 data-[state=open]:shadow-[0_0_30px_hsl(38_92%_50%_/_0.05)] transition-shadow duration-500"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
