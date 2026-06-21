import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-6 text-foreground">
            Every business deserves better tools. Yours is first.
          </h2>
          <p className="text-lg text-muted-foreground mb-10 font-medium">
            3-day free trial. Credit card required to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="lg" className="px-10 h-14 font-black uppercase tracking-widest text-[11px]" asChild>
              <Link to="/signup" className="flex items-center justify-center gap-2">
                Claim your workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
