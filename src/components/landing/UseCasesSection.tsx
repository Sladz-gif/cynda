import { motion } from "framer-motion";
import { User, Building2, Building, Globe } from "lucide-react";

const useCases = [
  {
    icon: User,
    title: "Freelancer",
    description: "Lightweight workspace with messaging, notes, and task tracking. Everything a solo professional needs.",
    tools: ["To-Do", "Notes", "Messages", "Invoicing"],
  },
  {
    icon: Building2,
    title: "Small Business",
    description: "One admin, tool-based access. Simple structure without the enterprise complexity.",
    tools: ["Projects", "CRM", "Finance", "Team"],
  },
  {
    icon: Building,
    title: "Large Business",
    description: "Departments, teams, and manager oversight with role-based permissions across modules.",
    tools: ["All Modules", "Analytics", "HR", "Automation"],
  },
  {
    icon: Globe,
    title: "Enterprise",
    description: "Multi-layer hierarchy, advanced analytics, and automation at scale across the entire organization.",
    tools: ["Everything", "API Access", "SSO", "Audit Logs"],
  },
];

const UseCasesSection = () => {
  return (
    <section id="solutions" className="py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">
            Solutions
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Built for how you work
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            From solo freelancers to global enterprises — Cynda adapts to your structure and scales with you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {useCases.map(({ icon: Icon, title, description, tools }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-6 flex flex-col"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{description}</p>
              <div className="flex flex-wrap gap-1.5">
                {tools.map((tool) => (
                  <span key={tool} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
