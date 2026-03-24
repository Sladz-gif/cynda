import { 
  BarChart3, CheckCircle2, Clock, MessageSquare, TrendingUp, Users, Zap, 
  ArrowRight, Sparkles, Calendar, Plus, List, Bell, Filter, MoreHorizontal,
  CheckCircle, LayoutDashboard, Activity, UserPlus, Shield, Eye, Trophy,
  FileUp, Settings, Trash2, Edit2, ChevronRight, ChevronDown, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useIndustryStore, DEPARTMENTS } from "@/lib/industry-store";
import React, { useState, useMemo, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DashboardPage = () => {
  const { userType = 'solo', adminProfile, staffList = [], addStaff, selectedModules = [], customDepartments = [], addCustomDepartment, teams = [], addTeam } = useIndustryStore();
  const { toast } = useToast();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Safe data access
  const safeUserType = userType || 'solo';
  const safeStaffList = Array.isArray(staffList) ? staffList : [];
  const safeSelectedModules = Array.isArray(selectedModules) ? selectedModules : [];

  const [upcomingTasks, setUpcomingTasks] = useState([
    { id: "1", title: "Review brand guidelines", project: "Marketing", due: "Today", priority: "high", completed: false },
    { id: "2", title: "Update CRM leads", project: "Sales", due: "Today", priority: "medium", completed: false },
  ]);

  const [newTask, setNewTask] = useState({ title: "", project: "", due: "", priority: "Medium" });

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  const handleMarkComplete = (id: string) => {
    setUpcomingTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
    toast({ title: "Task Completed" });
  };

  const handleCreateTask = () => {
    if (!newTask.title) return;
    const task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      project: newTask.project || "General",
      due: "Today",
      priority: newTask.priority.toLowerCase() as "high" | "medium" | "low",
      completed: false
    };
    setUpcomingTasks(prev => [task, ...prev]);
    setIsCreateTaskOpen(false);
    setNewTask({ title: "", project: "", due: "", priority: "Medium" });
    toast({ title: "Task Created" });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-black tracking-tight text-foreground uppercase">Good morning, {adminProfile?.name || "User"}</h2>
            <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-[0.2em] opacity-60">
              Workspace Mode: <span className="text-primary">{safeUserType.replace('-', ' ')}</span>
            </p>
          </div>
          <Button onClick={() => setIsCreateTaskOpen(true)} className="rounded-xl shadow-glow h-12 px-6 uppercase font-black tracking-widest text-[10px]">
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>

        <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                activeTab === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
              {activeTab === item.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Tasks */}
          <div className="rounded-3xl border-2 border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b-2 border-border bg-secondary/20 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground opacity-60">Upcoming Tasks</h3>
              <Badge variant="secondary" className="rounded-lg font-black text-[9px] uppercase tracking-widest">{upcomingTasks.filter(t => !t.completed).length} Pending</Badge>
            </div>
            <div className="divide-y-2 divide-border">
              {upcomingTasks.filter(t => !t.completed).map((task) => (
                <div key={task.id} className="px-6 py-5 flex items-center gap-4 hover:bg-secondary/10 transition-colors group">
                  <button onClick={() => handleMarkComplete(task.id)} className="w-7 h-7 rounded-xl border-2 border-border hover:border-primary flex items-center justify-center transition-all active:scale-90 bg-background">
                    <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{task.project}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[9px] text-primary font-black uppercase tracking-widest">{task.due}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[9px] uppercase font-black px-2 py-1 rounded-lg border-2 ${
                    task.priority === 'high' ? 'border-destructive/20 text-destructive bg-destructive/5' : 
                    task.priority === 'medium' ? 'border-primary/20 text-primary bg-primary/5' : 
                    'border-muted-foreground/20 text-muted-foreground bg-muted/5'
                  }`}>{task.priority}</Badge>
                </div>
              ))}
              {upcomingTasks.filter(t => !t.completed).length === 0 && (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto mb-4 border-2 border-border">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">No pending tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl border-2 border-border bg-card p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap className="w-24 h-24 text-primary" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground opacity-60 mb-8">Workspace Intelligence</h3>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/5 shadow-glow-sm">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-muted-foreground font-black uppercase text-[9px] tracking-[0.2em] block mb-0.5">Active Tools</span>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Across {DEPARTMENTS ? Object.keys(DEPARTMENTS).length : 0} Depts</span>
                  </div>
                </div>
                <span className="font-black text-foreground text-3xl tracking-tighter">{safeSelectedModules.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border-2 border-accent/5">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <span className="text-muted-foreground font-black uppercase text-[9px] tracking-[0.2em] block mb-0.5">Team Size</span>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Managed by you</span>
                  </div>
                </div>
                <span className="font-black text-foreground text-3xl tracking-tighter">{safeStaffList.length + 1}</span>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t-2 border-border">
              <Button variant="outline" className="w-full rounded-xl border-2 h-12 uppercase font-black tracking-widest text-[9px]" asChild>
                <Link to="/app/settings">Workspace Settings <ArrowRight className="w-3.5 h-3.5 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-2 border-border p-8">
          <DialogHeader>
            <DialogTitle className="font-display font-black uppercase tracking-tight text-2xl">Create New Task</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground pt-1">Assign a new task to your workspace</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1">Task Title</Label>
              <Input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="rounded-2xl h-14 border-2 focus-visible:ring-primary/20 bg-secondary/5 font-bold" placeholder="e.g. Design homepage" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-1">Project Name</Label>
              <Input value={newTask.project} onChange={e => setNewTask({...newTask, project: e.target.value})} className="rounded-2xl h-14 border-2 focus-visible:ring-primary/20 bg-secondary/5 font-bold" placeholder="e.g. Marketing" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateTask} className="w-full rounded-2xl h-14 shadow-glow uppercase font-black tracking-widest text-xs">Create Task <Plus className="w-4 h-4 ml-2" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;