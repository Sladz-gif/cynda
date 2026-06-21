import { motion } from "framer-motion";
import { Kanban, Users, Receipt, UserCheck } from "lucide-react";

const features = [
  { icon: Users, title: "CRM", description: "Your clients, pipelines, and follow-ups  in one place that actually remembers everything." },
  { icon: Receipt, title: "Finance", description: "Invoices, expenses, payroll, and Mobile Money  built for how African businesses actually get paid." },
  { icon: Kanban, title: "Projects", description: "Tasks, boards, and deadlines your whole team can see. No more \"I didn't know that was due.\"" },
  { icon: UserCheck, title: "HR", description: "Onboard staff, approve leave, and manage your team without a dedicated HR department." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 block">
            THE SOLUTION
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight mb-4 text-foreground leading-[1.1]">
            Everything connected.<br/>
            Nothing missing.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-medium">
            Cynda replaces the stack you've been patching together since Day 1.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={item}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all duration-250"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
