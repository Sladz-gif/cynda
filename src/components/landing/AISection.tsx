import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

const AISection = () => {
  return (
    <section id="cyndi" className="py-32 bg-background text-foreground relative overflow-hidden">
      {/* Gradient orb */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" /> AI-Powered
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-6">
              Meet Cyndi  your AI business partner
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Cyndi reads your documents, maps your data, drafts your updates, and keeps your workspace running. Like having a smart EA who never sleeps and never needs orientation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10"
          >
            <button className="px-8 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[11px] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mx-auto">
              <Bot className="w-4 h-4" />
              Talk to Cyndi
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AISection;

