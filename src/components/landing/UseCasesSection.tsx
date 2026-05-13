import { motion } from "framer-motion";
import { User, Building2, Building, Globe } from "lucide-react";

const stats = [
  { value: "8+", label: "SaaS subscriptions a business averages today" },
  { value: "$400+", label: "wasted monthly on overlapping tool features" },
  { value: "3 hrs", label: "lost every week context switching" },
];

const UseCasesSection = () => {
  return (
    <section id="problem" className="py-32 bg-muted/20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-destructive mb-4 block">
              The problem
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-6">
              You're paying for five tools that don't talk to each other.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              A CRM for sales. A PM tool for tasks. An invoicing app for finance. Another app for team chat. Your data is scattered, your team is confused, and you are paying a premium for the friction.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 flex items-center gap-6"
              >
                <div className="w-24 h-24 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-black text-destructive">{value}</span>
                </div>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
