import { motion } from "framer-motion";
import { Zap, Clock, Maximize, Activity } from "lucide-react";

const ProductivitySection = () => {
  const stats = [
    { icon: Zap, value: "8+", label: "Tools replaced" },
    { icon: Clock, value: "3 hours", label: "Saved weekly" },
    { icon: Maximize, value: "Zero", label: "Context switching" },
    { icon: Activity, value: "100%", label: "Connected" },
  ];

  return (
    <section className="py-32 bg-primary text-primary-foreground">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-black uppercase tracking-widest text-primary-foreground/70 mb-4 block">100% productivity</span>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-6 leading-tight">
            Built for 100% productivity.<br /> Not 60%.
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Your data lives in five different places. You spend three hours a week just switching tabs. Cynda changes that by natively embedding everything into one interface.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-4xl font-black mb-2">{value}</h3>
              <p className="text-sm font-bold uppercase tracking-widest text-primary-foreground/70">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductivitySection;
