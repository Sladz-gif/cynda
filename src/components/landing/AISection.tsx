import { motion } from "framer-motion";
import { Sparkles, MessageCircle, Workflow, TrendingUp } from "lucide-react";

const capabilities = [
  { icon: MessageCircle, title: "Natural Language Commands", desc: "Create tasks, pull reports, and trigger workflows just by asking Cyndi." },
  { icon: Workflow, title: "Workflow Automation", desc: "IF/THEN logic across modules — auto-assign, escalate, and notify." },
  { icon: TrendingUp, title: "Predictive Insights", desc: "Revenue forecasts, team performance trends, and risk detection." },
];

const AISection = () => {
  return (
    <section className="py-32 bg-wahoo text-wahoo-foreground relative overflow-hidden">
      {/* Gradient orb */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-wahoo-foreground/20 px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-wahoo-foreground/70">Meet Cyndi</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Intelligence built into{" "}
              <span className="text-gradient-primary">every layer</span>
            </h2>

            <p className="text-lg text-wahoo-foreground/70 mb-10 leading-relaxed max-w-lg">
              Cyndi isn't a chatbot. It's an embedded intelligence layer that understands your workflows, anticipates needs, and executes actions across your entire workspace.
            </p>

            <div className="space-y-6">
              {capabilities.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex-shrink-0 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1 text-wahoo-foreground">{title}</h3>
                    <p className="text-sm text-wahoo-foreground/60 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Chat simulation */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-xl border border-wahoo-foreground/10 bg-noble p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-display font-semibold text-sm text-wahoo-foreground">Cyndi</span>
                <span className="ml-auto text-[10px] text-wahoo-foreground/40">Just now</span>
              </div>

              <div className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-primary/20 rounded-lg rounded-br-sm px-4 py-2.5 max-w-[280px]">
                    <p className="text-sm text-wahoo-foreground">
                      Create a task for the design team: finalize Q2 brand guidelines by Friday
                    </p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex justify-start">
                  <div className="bg-wahoo-foreground/5 rounded-lg rounded-bl-sm px-4 py-2.5 max-w-[300px]">
                    <p className="text-sm text-wahoo-foreground/90 mb-2">
                      Done! I've created the task and assigned it to the Design team:
                    </p>
                    <div className="rounded-md border border-wahoo-foreground/10 bg-noble/50 p-3 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-wahoo-foreground/50">Task</span>
                        <span className="text-wahoo-foreground">Finalize Q2 Brand Guidelines</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wahoo-foreground/50">Team</span>
                        <span className="text-wahoo-foreground">Design</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wahoo-foreground/50">Due</span>
                        <span className="text-primary">Friday, Mar 28</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex gap-1 px-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary/50"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-4 -z-10 rounded-2xl bg-primary/5 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
