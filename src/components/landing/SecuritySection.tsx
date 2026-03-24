import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

const SecuritySection = () => {
  const items = [
    { icon: Lock, title: "End-to-End Encryption", desc: "All sensitive data encrypted in transit and at rest." },
    { icon: Shield, title: "Role-Based Access", desc: "Granular permissions from Super Admin to staff level." },
    { icon: Eye, title: "Audit Logging", desc: "Every action tracked and searchable for compliance." },
    { icon: FileCheck, title: "Data Isolation", desc: "Complete workspace separation with zero-trust architecture." },
  ];

  return (
    <section className="py-32 bg-card">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">Security</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Enterprise-grade security
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Built with a zero-trust mindset from day one. Your data stays yours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold mb-2 text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
