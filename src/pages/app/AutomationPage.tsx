import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus, Filter, MoreHorizontal, CheckCircle2, Play, Settings, Bell, MessageSquare, Clock, LayoutDashboard, History, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AutomationPage = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState([
    { id: "1", title: "Move task to 'Done' when subtasks are finished", trigger: "Subtasks complete", action: "Move to Done", active: true },
    { id: "2", title: "Assign to Sarah when label is 'Design'", trigger: "Label added", action: "Assign user", active: true },
    { id: "3", title: "Send notification when deadline is approaching", trigger: "Due in 24 hours", action: "Send message", active: false },
    { id: "4", title: "Auto-archive completed tasks after 7 days", trigger: "7 days post-completion", action: "Archive task", active: true },
  ]);

  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [newRule, setNewRule] = useState({ title: "", trigger: "Task created", action: "Assign user" });
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "rules", label: "My Rules", icon: Zap },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleCreateRule = () => {
    if (!newRule.title) return;
    const rule = {
      id: Math.random().toString(36).substr(2, 9),
      title: newRule.title,
      trigger: newRule.trigger,
      action: newRule.action,
      active: true
    };
    setRules(prev => [rule, ...prev]);
    setIsCreateRuleOpen(false);
    setNewRule({ title: "", trigger: "Task created", action: "Assign user" });
    toast({ title: "Rule Created" });
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    toast({ title: "Rule status updated" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Automation</h2>
            <p className="text-sm text-muted-foreground mt-1">Automate your workflows and save time with custom rules.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast({ title: "Export Started" })}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            <Button size="sm" className="rounded-xl" onClick={() => setIsCreateRuleOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Create Rule</Button>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                  activeTab === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {item.label}
                {activeTab === item.id && (
                  <motion.div layoutId="activeAutomationTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Active Rules", value: "8", icon: Zap, color: "text-primary" },
                  { label: "Triggers Today", value: "142", icon: Play, color: "text-green-500" },
                  { label: "Time Saved", value: "12h", icon: Clock, color: "text-accent" },
                  { label: "Errors", value: "0", icon: Bell, color: "text-muted-foreground" },
                ].map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        {StatIcon && <StatIcon className={`w-5 h-5 ${stat.color}`} />}
                      </div>
                      <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground font-display uppercase tracking-widest">Active Rules</h3>
                  <span className="text-xs text-muted-foreground font-medium">{rules.length} rules</span>
                </div>
                <div className="divide-y divide-border">
                  {rules.map((rule) => (
                    <div key={rule.id} className="p-5 flex items-center gap-6 hover:bg-secondary/5 transition-colors group cursor-pointer" onClick={() => toggleRule(rule.id)}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${rule.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-bold text-foreground">{rule.title}</p>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${rule.active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                            {rule.active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                          <div className="flex items-center gap-1.5"><span className="text-primary uppercase font-bold text-[9px]">When:</span> {rule.trigger}</div>
                          <div className="w-1 h-1 rounded-full bg-border" />
                          <div className="flex items-center gap-1.5"><span className="text-primary uppercase font-bold text-[9px]">Then:</span> {rule.action}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><MoreHorizontal className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab !== "overview" && (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }}
              className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/5"
            >
              <h3 className="text-lg font-bold mb-2 uppercase tracking-widest">{activeTab} Module</h3>
              <p className="text-sm text-muted-foreground">This module is being updated to the new horizontal navigation layout.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Automation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Rule Name</Label>
              <Input
                id="title"
                placeholder="e.g. Notify team on high priority tasks"
                value={newRule.title}
                onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateRuleOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRule}>Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutomationPage;
