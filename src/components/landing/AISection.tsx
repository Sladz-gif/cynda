import { motion } from "framer-motion";
import { Settings, Users, Activity } from "lucide-react";

const steps = [
  { icon: Settings, title: "01. Pick what you need", desc: "Select only the modules your business uses today. Add more later with one click." },
  { icon: Users, title: "02. Bring your team in", desc: "Invite your staff and assign role-based access so everyone sees exactly what they need." },
  { icon: Activity, title: "03. Get to work", desc: "Start managing projects, closing deals, and sending invoices immediately." },
];

const HowItWorksSection = () => {
  return (
    <section id="how" className="py-32 bg-background text-foreground relative overflow-hidden">
      {/* Gradient orb */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 block">
            How it works
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-6">
            Set up in minutes.<br/>
            Use it for years.
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="relative p-8 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-foreground">{title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

