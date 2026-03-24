import { motion } from "framer-motion";
import {
  MessageSquare,
  Kanban,
  Users,
  Receipt,
  UserCheck,
  FileText,
  CheckSquare,
  BarChart3,
} from "lucide-react";

const features = [
  { icon: MessageSquare, title: "Messaging", description: "DMs, channels, threads, and file sharing in one unified inbox." },
  { icon: Kanban, title: "Projects", description: "Kanban, list, and calendar views with tasks, deadlines, and dependencies." },
  { icon: Users, title: "CRM", description: "Lead tracking, pipelines, and contact management with smart automation." },
  { icon: Receipt, title: "Finance", description: "Invoicing, expenses, payroll, and real-time revenue analytics." },
  { icon: UserCheck, title: "HR", description: "Employee records, attendance, leave management, and performance reviews." },
  { icon: FileText, title: "Notes & Docs", description: "Smart documentation linked to tasks, searchable and always accessible." },
  { icon: CheckSquare, title: "To-Do", description: "Lightweight personal and team task tracking that stays out of your way." },
  { icon: BarChart3, title: "Analytics", description: "Dashboards with predictive insights powered by AI across all modules." },
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
    <section id="product" className="py-32 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
            Modules
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Eight powerful modules that replace your entire tool stack — unified, intelligent, and beautifully simple.
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
