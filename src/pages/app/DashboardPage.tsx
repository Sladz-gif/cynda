import React, { useMemo, useState } from "react";
import { ArrowRight, Bot, HardDrive, Lock, Mail, Plus, ShieldCheck, Sparkles, Trophy, Users2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEPARTMENTS, useIndustryStore, Staff, TRIAL_ALLOWED_TOOLS } from "@/lib/industry-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const DEPT_HREF: Record<string, string> = {
  crm: "/app/crm",
  finance: "/app/finance",
  projects: "/app/projects",
  hr: "/app/hr",
  other: "/app/chat",
};

const DashboardPage = () => {
  const { toast } = useToast();
  const {
    adminProfile,
    currentUser,
    selectedModules = [],
    setCyndiOpen,
    setCyndiDraft,
    crmDeals = [],
    tasks = [],
    notifications = [],
    staffList = [],
    addTask,
    subscriptionTier,
  } = useIndustryStore();

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");

  const activeUser = currentUser || adminProfile;
  const isStaff = !!(currentUser && "tools" in currentUser);
  const isTrial = subscriptionTier === "trial";

  const effectiveTools = useMemo(() => {
    return isStaff 
      ? (Array.isArray((currentUser as Staff).tools) ? (currentUser as Staff).tools : [])
      : (Array.isArray(selectedModules) ? selectedModules : []);
  }, [isStaff, currentUser, selectedModules]);

  const allowedTools = useMemo(() => {
    if (isTrial) {
      return effectiveTools.filter(t => TRIAL_ALLOWED_TOOLS.includes(t));
    }
    return effectiveTools;
  }, [effectiveTools, isTrial]);

  const premiumTools = useMemo(() => {
    if (!isTrial) return [];
    return effectiveTools.filter(t => !TRIAL_ALLOWED_TOOLS.includes(t));
  }, [effectiveTools, isTrial]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const openDeals = useMemo(
    () => crmDeals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost").length,
    [crmDeals]
  );
  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status !== "completed").length,
    [tasks]
  );
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );
  const teamCount = staffList.length;

  const deptHasAccess = (deptKey: keyof typeof DEPARTMENTS) => {
    const dept = DEPARTMENTS[deptKey];
    return dept.tools.some((t) => allowedTools.includes(t.id));
  };

  const deptIsPremium = (deptKey: keyof typeof DEPARTMENTS) => {
    if (!isTrial) return false;
    const dept = DEPARTMENTS[deptKey];
    return dept.tools.some((t) => premiumTools.includes(t.id)) && !deptHasAccess(deptKey);
  };

  const handleLetCyndiHandleIt = () => {
    setIsCreateTaskOpen(false);
    setCyndiDraft("I want to create a task. Here's what I need…");
    setCyndiOpen(true);
  };

  const handleCreateTask = () => {
    const title = taskTitle.trim();
    if (!title) {
      toast({ title: "Add a title", description: "Give your task a short name.", variant: "destructive" });
      return;
    }
    addTask({
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      project: "General",
      due: new Date().toISOString().split("T")[0],
      priority: "medium",
      status: "todo",
      assignees: activeUser?.name ? [activeUser.name] : [],
    });
    setTaskTitle("");
    setIsCreateTaskOpen(false);
    toast({ title: "Task created", description: "It’s on your workspace list." });
  };

  const statCards = [
    { label: "Pipeline deals", value: String(openDeals), href: "/app/crm", hint: "Clients" },
    { label: "Active tasks", value: String(activeTasks), href: "/app/projects", hint: "Projects" },
    { label: "Unread alerts", value: String(unreadNotifications), href: "/app/inbox", hint: "Inbox" },
    { label: "Team (directory)", value: String(teamCount), href: "/app/hr", hint: "People" },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 pb-24 max-w-6xl mx-auto w-full min-w-0 overflow-x-hidden px-4 sm:px-6 lg:px-8">
      <header className="space-y-6">
        <div className="space-y-2 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
            Cynda · Work OS
          </p>
          <h1 className="font-display text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground uppercase leading-tight truncate">
            {greeting}, {activeUser?.chatName?.split(".")[0] || activeUser?.name?.split(" ")[0] || "there"}. Here's where things stand.
          </h1>
          <div className="flex flex-wrap gap-2 mt-1 sm:mt-2">
            <p className="text-[10px] sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              One place for clients, finance, projects, people, and day‑to‑day tools — with{" "}
              <span className="text-primary font-semibold">Cyndi</span> woven through the stack.
            </p>
          </div>
        </div>
      </header>

      {isTrial && (
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-6 md:p-8 relative overflow-hidden group shadow-glow-sm"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">You're on the free trial</h2>
                  <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Trial Edition</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                You're seeing a slice of what Cynda can do. Upgrade to unlock automations, full finance tools, and team management.
              </p>
            </div>
            <Button size="lg" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-glow shrink-0 w-full md:w-auto" asChild>
              <Link to="/billing/select-plan">Upgrade your plan</Link>
            </Button>
          </div>
        </motion.section>
      )}

      <section aria-label="Snapshot">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={s.href}
                className="flex flex-col rounded-2xl border-2 border-border bg-card p-4 sm:p-5 hover:border-primary/35 transition-colors h-full min-h-[110px]"
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
                <span className="mt-2 font-display text-2xl sm:text-3xl font-black text-foreground tabular-nums">{s.value}</span>
                <span className="mt-auto text-[9px] font-bold text-primary uppercase tracking-tight pt-2 flex items-center gap-1">
                  {s.hint} <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section aria-label="Departments" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-black uppercase tracking-tight text-foreground">Your business at a glance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(DEPARTMENTS) as (keyof typeof DEPARTMENTS)[]).map((key, index) => {
            const dept = DEPARTMENTS[key];
            const active = deptHasAccess(key);
            const premium = deptIsPremium(key);
            const href = premium ? "/app/settings?tab=billing" : (DEPT_HREF[dept.id] ?? "/app/dashboard");
            const previewTools = dept.tools.slice(0, 4);
            
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.05 }}
                className={cn(
                  "rounded-3xl border-2 bg-card p-6 flex flex-col gap-4 transition-all relative group",
                  active ? "border-border hover:border-primary/30" : premium ? "border-primary/20 bg-primary/[0.02] shadow-sm" : "border-dashed border-border/70 opacity-80"
                )}
              >
                {premium && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                    <Lock className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Premium</span>
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-3 pr-16">
                  <div>
                    <h3 className="font-display text-sm font-black uppercase tracking-tight text-foreground">{dept.label}</h3>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {key === "CRM" && "Clients, pipelines, campaigns, and sales — all tracked automatically."}
                      {key === "Finance" && "Cash position, invoices, expenses, and payroll — linked directly to your work."}
                      {key === "Projects" && "Tasks, boards, timelines, and resources — so nothing slips."}
                      {key === "HR" && "Directory, hiring, onboarding, and leave — managed without the paperwork."}
                      {key === "Other" && "Messaging, email, notes, automations, forms, and files."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {previewTools.map((t) => {
                    const isToolAllowed = allowedTools.includes(t.id);
                    const isToolPremium = isTrial && !TRIAL_ALLOWED_TOOLS.includes(t.id);
                    
                    return (
                      <span
                        key={t.id}
                        className={cn(
                          "text-[9px] font-black uppercase tracking-tight px-2 py-1 rounded-lg border flex items-center gap-1",
                          isToolAllowed
                            ? "border-primary/30 bg-primary/5 text-foreground font-bold"
                            : isToolPremium 
                              ? "border-primary/10 bg-primary/[0.03] text-primary/60"
                              : "border-border/80 bg-secondary/30 text-muted-foreground"
                        )}
                      >
                        {isToolPremium && <Lock className="w-2.5 h-2.5" />}
                        {t.label}
                      </span>
                    );
                  })}
                  {dept.tools.length > 4 ? (
                    <span className="text-[9px] font-bold text-muted-foreground px-2 py-1">+ more</span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button 
                    size="sm" 
                    className={cn(
                      "rounded-xl uppercase font-black text-[9px] tracking-widest h-9",
                      premium ? "bg-primary text-white shadow-glow" : "bg-secondary text-foreground hover:bg-primary hover:text-white"
                    )} 
                    asChild
                  >
                    <Link to={href}>
                      {premium ? "Unlock Department" : active ? "Go to Tools" : "Request Access"}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {isTrial && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t-2 border-border/50">
          <div className="md:col-span-1 space-y-4">
            <h2 className="font-display text-xl font-black uppercase tracking-tight text-foreground">Why serious African businesses upgrade</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlock the full power of Cynda for your growing business.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-colors">
              <Zap className="w-6 h-6 text-primary mb-3" />
              <h4 className="text-xs font-black uppercase tracking-tight mb-2">Automations that do the boring work</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Connect every part of your business with triggers that run while you sleep.</p>
            </div>
            <div className="p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-colors">
              <ShieldCheck className="w-6 h-6 text-primary mb-3" />
              <h4 className="text-xs font-black uppercase tracking-tight mb-2">Full visibility</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">See who did what, when, across every department. Built for accountability.</p>
            </div>
            <div className="p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-colors">
              <Trophy className="w-6 h-6 text-primary mb-3" />
              <h4 className="text-xs font-black uppercase tracking-tight mb-2">Real performance data</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Know who's moving the needle and where growth is coming from.</p>
            </div>
            <div className="p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-colors">
              <Users2 className="w-6 h-6 text-primary mb-3" />
              <h4 className="text-xs font-black uppercase tracking-tight mb-2">Unlimited seats, real control</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Add your whole team. Set permissions. Scale without chaos.</p>
            </div>
          </div>
        </section>
      )}

      <section
        aria-label="Cyndi"
        className="rounded-3xl border-2 border-primary/25 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-glow shrink-0">
          <Bot className="w-8 h-8" />
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="font-display text-base font-black uppercase tracking-tight text-foreground">Cyndi</h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Cyndi reads your documents, parses your data, and takes action in your workspace. Open the panel anytime — like asking your smartest colleague a question.
          </p>
        </div>
        <Button
          className="rounded-xl uppercase font-black text-[10px] tracking-widest h-12 px-6 shrink-0"
          onClick={() => {
            setCyndiDraft("What should I focus on first today based on my workspace?");
            setCyndiOpen(true);
          }}
        >
          Ask Cyndi
        </Button>
      </section>

      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-2 border-border p-8">
          <DialogHeader>
            <DialogTitle className="font-display font-black uppercase tracking-tight text-2xl">Create task</DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground">
              Adds to your workspace task list — refine details anytime in Projects.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</Label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                className="rounded-2xl h-12 border-2 bg-background font-semibold"
                placeholder="e.g. Send the revised proposal"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              variant="outline"
              onClick={handleLetCyndiHandleIt}
              className="w-full rounded-2xl h-12 border-2 border-primary/30 text-primary uppercase font-black text-[10px] tracking-widest gap-2"
            >
              <Bot className="w-4 h-4" /> Let Cyndi handle it
            </Button>
            <Button onClick={handleCreateTask} className="w-full rounded-2xl h-12 shadow-glow uppercase font-black text-[10px] tracking-widest">
              Save task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
