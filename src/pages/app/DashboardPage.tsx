import { 
  BarChart3, CheckCircle2, Clock, MessageSquare, TrendingUp, Users, Zap, 
  ArrowRight, Sparkles, Calendar, Plus, List, Bell, Filter, MoreHorizontal,
  CheckCircle, LayoutDashboard, Activity, UserPlus, Shield, Eye, Trophy,
  FileUp, Settings, Trash2, Edit2, ChevronRight, ChevronDown
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
            <h2 className="font-display text-3xl font-black tracking-tight text-foreground">Welcome, {adminProfile?.name || "User"}</h2>
            <p className="text-sm text-muted-foreground mt-1 uppercase font-bold tracking-widest opacity-60">
              Workspace Mode: {safeUserType.replace('-', ' ')}
            </p>
          </div>
          <Button onClick={() => setIsCreateTaskOpen(true)} className="rounded-xl shadow-glow">
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>

        <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                activeTab === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
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
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-secondary/20 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground opacity-60">Upcoming Tasks</h3>
            </div>
            <div className="divide-y divide-border">
              {upcomingTasks.filter(t => !t.completed).map((task) => (
                <div key={task.id} className="px-6 py-4 flex items-center gap-4 hover:bg-secondary/10 transition-colors group">
                  <button onClick={() => handleMarkComplete(task.id)} className="w-6 h-6 rounded-full border-2 border-border hover:border-primary flex items-center justify-center transition-colors">
                    <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate uppercase tracking-tight">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{task.project}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase font-black px-2 py-0.5">{task.priority}</Badge>
                </div>
              ))}
              {upcomingTasks.filter(t => !t.completed).length === 0 && (
                <div className="p-12 text-center text-muted-foreground text-xs italic font-bold uppercase tracking-widest">No pending tasks</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground opacity-60 mb-6">Workspace Statistics</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Active Tools</span>
                </div>
                <span className="font-black text-foreground text-xl tracking-tighter">{safeSelectedModules.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Team Members</span>
                </div>
                <span className="font-black text-foreground text-xl tracking-tighter">{safeStaffList.length + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-black uppercase tracking-tight">Create New Task</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Add a task to your current workspace</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Task Title</Label>
              <Input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="rounded-xl h-12" placeholder="e.g. Design homepage" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Project Name</Label>
              <Input value={newTask.project} onChange={e => setNewTask({...newTask, project: e.target.value})} className="rounded-xl h-12" placeholder="e.g. Marketing" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateTask} className="w-full rounded-xl h-12 shadow-glow">Create Task <Plus className="w-4 h-4 ml-2" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;