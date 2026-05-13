import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-48 pb-32 px-4 md:px-8 relative overflow-hidden bg-background">
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-8 border border-primary/20"
          >
            <Zap className="w-4 h-4" /> Introducing Cynda
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            One workspace.{" "}
            <span className="text-gradient-primary">100%</span>{" "}
            of your business.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Cynda brings your projects, clients, finances, and team into a single workspace.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col items-center justify-center gap-6 mb-16"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="px-8 h-12 relative z-20 font-black uppercase tracking-widest text-[11px]" asChild>
                <Link to="/signup" className="flex items-center justify-center gap-2">
                  Start free trial 
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" className="px-8 h-12 font-black uppercase tracking-widest text-[11px]" asChild>
                <a href="#how" className="flex items-center justify-center">See how it works</a>
              </Button>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Free for 3 days · No card required · Cancel anytime
              </p>
            </div>
          </motion.div>

          {/* Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative mx-auto max-w-5xl"
          >
            <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <div className="w-3 h-3 rounded-full bg-primary/20" />
                <div className="ml-4 h-6 flex-1 max-w-xs rounded-md bg-secondary" />
              </div>

              {/* App mockup */}
              <div className="flex h-[400px] sm:h-[480px]">
                {/* Sidebar */}
                <div className="hidden sm:flex w-56 border-r border-border flex-col p-4 gap-1 bg-card">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-[10px] font-bold">C</span>
                    </div>
                    <span className="font-display text-sm font-semibold text-foreground">Workspace</span>
                  </div>
                  {["Dashboard", "Messages", "Projects", "CRM", "Finance", "Team"].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                        i === 0 ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="h-5 w-32 rounded bg-foreground/10 mb-2" />
                      <div className="h-3 w-48 rounded bg-foreground/5" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-20 rounded-md bg-primary/10" />
                      <div className="h-8 w-8 rounded-md bg-secondary" />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { icon: BarChart3, label: "Revenue", value: "$124K" },
                      { icon: Zap, label: "Tasks Done", value: "847" },
                      { icon: Shield, label: "Uptime", value: "99.9%" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-lg border border-border p-4 bg-background">
                        <Icon className="w-4 h-4 text-primary mb-2" />
                        <div className="text-xl font-display font-bold text-foreground">{value}</div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Activity bars */}
                  <div className="space-y-3">
                    {[85, 65, 45, 75].map((w, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-20 h-3 rounded bg-foreground/5" />
                        <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${w}%` }}
                            transition={{ duration: 1, delay: 1 + i * 0.15 }}
                            className="h-full rounded-full bg-primary/70"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating glow behind preview */}
            <div className="absolute -inset-4 -z-10 rounded-2xl bg-primary/5 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
