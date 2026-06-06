import { useState, useMemo, useEffect } from "react";
import { 
  Plus, Filter, MoreHorizontal, Calendar, List, Kanban as KanbanIcon, 
  Clock, User, X, Paperclip, MessageSquare, Link as LinkIcon, 
  CheckSquare, ArrowRight, TrendingUp, LayoutGrid, Timer, 
  ChevronDown, Search, Share2, Settings, UserPlus, Zap, CheckCircle2,
  Users, Check, AlertCircle, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIndustryStore, Staff } from "@/lib/industry-store";
import { useLocation, useNavigate } from "react-router-dom";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Task = {
  id: string;
  title: string;
  assignee: string;
  priority: "high" | "medium" | "low";
  due: string;
  tags: string[];
  description?: string;
  subtasks?: { title: string; done: boolean }[];
  comments?: { user: string; text: string; time: string }[];
  attachments?: { name: string; size: string }[];
  dependencies?: string[]; // IDs of tasks this task depends on
  status: string;
  startDate?: string;
  duration?: number; // in days
};

const initialTasks: Task[] = [];

import { triggerAutomation } from "@/lib/automationEngine";
import { transactionService } from "@/lib/transactionService";

const ProjectsPage = () => {
  const { toast } = useToast();
  const { 
    userType, 
    selectedModules = [], 
    tasks: storeTasks = [],
    addTask: storeAddTask,
    updateTask: storeUpdateTask,
    deleteTask: storeDeleteTask,
    addProject,
  } = useIndustryStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const allViews = [
    { id: "kanban", label: "Board", icon: KanbanIcon },
    { id: "list", label: "List", icon: List },
    { id: "timeline", label: "Timeline", icon: Timer },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "resource-management", label: "Resources", icon: Users },
  ];

  const views = useMemo(() => {
    const safeModules = Array.isArray(selectedModules) ? selectedModules : [];
    if (userType === 'enterprise' || userType === 'large-business') return allViews;
    
    // Map internal view IDs to industry-store tool IDs
    const idMap: Record<string, string> = {
      kanban: 'kanban',
      list: 'list-view',
      timeline: 'timeline',
      calendar: 'calendar',
      'resource-management': 'resource-management'
    };

    const filtered = allViews.filter(v => safeModules.includes(idMap[v.id]));
    
    // Always show at least one view if none selected
    if (filtered.length === 0) return [allViews[0]];
    return filtered;
  }, [selectedModules, userType]);

  const [view, setView] = useState<string>(views[0]?.id || "kanban");

  // Sync view if selection changes
  useEffect(() => {
    if (views.length > 0 && !views.find(v => v.id === view)) {
      setView(views[0].id);
    }
  }, [views]);

  useEffect(() => {
    const raw = location.pathname.split("/app/")[1] || "dashboard";
    const segment = raw.split("/")[0] || "dashboard";
    const fromRoute =
      segment === "projects" ? (views[0]?.id || "kanban") :
      segment === "list-view" ? "list" :
      segment;
    if (views.some((v) => v.id === fromRoute) && fromRoute !== view) {
      setView(fromRoute);
    }
  }, [location.pathname, view, views]);

  const goToView = (id: string) => {
    const url =
      id === "kanban" ? "/app/kanban" :
      id === "list" ? "/app/list-view" :
      id === "timeline" ? "/app/timeline" :
      id === "calendar" ? "/app/calendar" :
      id === "resource-management" ? "/app/resource-management" :
      "/app/projects";
    navigate(url);
  };

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", owner: "" });
  const [newTask, setNewTask] = useState({ title: "", due: "", priority: "medium", status: "todo", assignee: "" });
   const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");

  // Convert store tasks to the local Task format if needed, or just use storeTasks
  const tasks = useMemo(() => {
    // Ensure storeTasks have the fields we expect in ProjectsPage
    return storeTasks.map(t => ({
      ...t,
      assignee: t.assignees?.[0] || "JD",
      tags: ["General"],
      priority: (t.priority as "high" | "medium" | "low") || "medium",
    }));
  }, [storeTasks]);

  // --- Project Health Calculations (Spreadsheet Logic) ---
  const projectHealth = useMemo(() => {
    if (tasks.length === 0) return { score: 0, status: 'N/A', color: 'text-muted-foreground' };
    
    const completed = tasks.filter(t => t.status === 'done').length;
    const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
    const completionRate = (completed / tasks.length) * 100;
    
    // Logic: Completion rate weighted 70%, High priority backlog reduces score
    let score = (completionRate * 0.7) + (30 - (highPriority * 5));
    score = Math.max(0, Math.min(100, score));
    
    let status = 'Healthy';
    let color = 'text-green-500';
    
    if (score < 40) { status = 'At Risk'; color = 'text-destructive'; }
    else if (score < 70) { status = 'Warning'; color = 'text-orange-500'; }
    
    return { score: Math.round(score), status, color, completionRate: Math.round(completionRate) };
  }, [tasks]);

  // --- Resource Utilization Logic ---
  const resourceUtilization = useMemo(() => {
    const assignments: Record<string, number> = {};
    tasks.filter(t => t.status !== 'done').forEach(t => {
      assignments[t.assignee] = (assignments[t.assignee] || 0) + 1;
    });
    return assignments;
  }, [tasks]);

  // Seed store with initial tasks if empty
  useEffect(() => {
    // Initial data load would happen here from API
  }, []);

  // Two-step Delete Confirmation
  const [isDeleteModal1Open, setIsDeleteModal1Open] = useState(false);
  const [isDeleteModal2Open, setIsDeleteModal2Open] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'task' | 'project' } | null>(null);

  const handleDelete = (id: string, type: 'task' | 'project') => {
    setItemToDelete({ id, type });
    setIsDeleteModal1Open(true);
  };

  const confirmDeleteStep1 = () => {
    setIsDeleteModal1Open(false);
    setIsDeleteModal2Open(true);
  };

  const finalizeDelete = () => {
    if (itemToDelete) {
      const { id, type } = itemToDelete;
      if (type === 'task') {
        storeDeleteTask(id);
        toast({ title: "Task Deleted", description: "The task has been permanently removed." });
      }
      setIsDeleteModal2Open(false);
      setItemToDelete(null);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtask || !selectedTask) return;
    const updatedSubtasks = [...(selectedTask.subtasks || []), { title: newSubtask, done: false }];
    storeUpdateTask(selectedTask.id, { description: JSON.stringify({ ...JSON.parse(selectedTask.description || '{}'), subtasks: updatedSubtasks }) });
    setNewSubtask("");
    toast({ title: "Subtask Added" });
  };

  const handleAddComment = () => {
    if (!newComment || !selectedTask) return;
    const comment = {
      user: "John Doe",
      text: newComment,
      time: "Just now"
    };
    const updatedComments = [...(selectedTask.comments || []), comment];
    storeUpdateTask(selectedTask.id, { description: JSON.stringify({ ...JSON.parse(selectedTask.description || '{}'), comments: updatedComments }) });
    setNewComment("");
    toast({ title: "Comment Added" });
  };

  const handleToggleSubtask = (index: number) => {
    if (!selectedTask) return;
    const updatedSubtasks = [...(selectedTask.subtasks || [])];
    updatedSubtasks[index].done = !updatedSubtasks[index].done;
    storeUpdateTask(selectedTask.id, { description: JSON.stringify({ ...JSON.parse(selectedTask.description || '{}'), subtasks: updatedSubtasks }) });
  };

  const handleCreateProject = () => {
    if (!newProject.name) {
      toast({ title: "Error", description: "Project name is required", variant: "destructive" });
      return;
    }
    setIsNewProjectOpen(false);
    setNewProject({ name: "", owner: "" });
    toast({ title: "Project Created", description: `"${newProject.name}" has been created successfully.` });
  };

  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);
  const { staffList = [], adminProfile } = useIndustryStore();

  const handleAddTask = () => {
    if (!newTask.title) {
      toast({ title: "Error", description: "Task title is required", variant: "destructive" });
      return;
    }
    const task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      project: "General",
      due: newTask.due || "Mar 28",
      priority: newTask.priority,
      status: newTask.status,
      assignees: [newTask.assignee || "JD"],
    };
    storeAddTask(task);
    setIsAddTaskOpen(false);
    setNewTask({ title: "", due: "", priority: "medium", status: "todo", assignee: "" });
    toast({ title: "Task Added", description: `"${task.title}" has been added.` });
  };

  const columns = [
    { id: "backlog", title: "Backlog", color: "bg-muted-foreground/20" },
    { id: "todo", title: "To Do", color: "bg-accent" },
    { id: "in-progress", title: "In Progress", color: "bg-primary" },
    { id: "done", title: "Done", color: "bg-green-500" },
  ];

  const priorityDot: Record<string, string> = { high: "bg-destructive", medium: "bg-primary", low: "bg-muted-foreground/50" };

  const handleMarkComplete = (id: string) => {
    storeUpdateTask(id, { status: "done" });
    toast({ title: "Task Completed", description: "Task moved to Done." });
    
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (task.status !== "done") {
         transactionService.createGhostInvoiceFromProject(task, 'Internal Project Client');
         toast({ title: "Invoice Created", description: `A ghost invoice for this project task has been created in Finance.` });
      }
      triggerAutomation('task_completed', { task });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">Q2</div>
            <div>
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                Q2 Campaign <Badge className={cn("text-[9px] uppercase font-black", projectHealth.color)} variant="outline">{projectHealth.status}</Badge>
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Health Score: {projectHealth.score}%</p>
                <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", projectHealth.score > 70 ? "bg-green-500" : projectHealth.score > 40 ? "bg-orange-500" : "bg-destructive")} style={{ width: `${projectHealth.score}%` }} />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{projectHealth.completionRate}% complete</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
            <Button variant="outline" size="sm" className="rounded-xl h-9 flex-1 sm:flex-none whitespace-nowrap"><Share2 className="w-4 h-4 mr-1.5" /> Share</Button>
            <Button variant="outline" size="sm" className="rounded-xl h-9 flex-1 sm:flex-none whitespace-nowrap" onClick={() => setIsNewProjectOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> New Project</Button>
            <Button size="sm" className="rounded-xl h-9 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex-1 sm:flex-none whitespace-nowrap" onClick={() => setIsAddTaskOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Task
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-px gap-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {views.map((v) => {
              const ViewIcon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => goToView(v.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                    view === v.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ViewIcon className="w-3.5 h-3.5" />
                  {v.label}
                  {view === v.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto pb-2 sm:pb-0">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input placeholder="Search tasks..." className="h-8 pl-8 pr-3 text-xs bg-secondary/30 rounded-lg border-none focus:ring-1 focus:ring-primary w-full sm:w-40" />
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest shrink-0"><Filter className="w-3.5 h-3.5 mr-1.5" /> Filter</Button>
          </div>
        </div>
      </div>

      {/* Resource Management View */}
      {view === "resource-management" && (
        <div className="space-y-6">
          <div className="p-6 rounded-[24px] border border-border bg-card shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Team Resource Allocation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Team Member</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Tasks</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Utilization</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Capacity Status</th>
                    <th className="pb-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {staffList.map((staff) => {
                    const taskCount = resourceUtilization[staff.id.charAt(0) + staff.name.split(' ')[1]?.charAt(0)] || 0;
                    const utilization = Math.min(100, (taskCount / 5) * 100); // Max capacity is 5 tasks
                    return (
                      <tr key={staff.id} className="group hover:bg-secondary/10 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-lg">
                              <AvatarFallback className="text-[10px] font-black">{staff.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-bold">{staff.name}</p>
                              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">{staff.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant="secondary" className="text-[10px] font-bold">{taskCount} tasks</Badge>
                        </td>
                        <td className="py-4 w-48">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div className={cn(
                                "h-full rounded-full transition-all duration-500",
                                utilization > 80 ? "bg-destructive" : utilization > 50 ? "bg-orange-500" : "bg-green-500"
                              )} style={{ width: `${utilization}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground">{utilization}%</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                            utilization > 80 ? "bg-destructive/10 text-destructive" : 
                            utilization > 50 ? "bg-orange-500/10 text-orange-600" : "bg-green-500/10 text-green-600"
                          )}>
                            {utilization > 80 ? "Overloaded" : utilization > 50 ? "Optimal" : "Available"}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Reassign Tasks
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-[24px] border border-border bg-card shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Workload Distribution</h4>
              <div className="h-[200px] w-full bg-secondary/10 rounded-xl flex items-center justify-center border border-dashed border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Visualizing team balance...</p>
              </div>
            </div>
            <div className="p-6 rounded-[24px] border border-border bg-card shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Productivity Forecast</h4>
              <div className="space-y-4">
                {[
                  { label: "Estimated Completion", value: "Apr 12, 2024", icon: Calendar },
                  { label: "Remaining Work", value: `${tasks.filter(t => t.status !== 'done').length} Tasks`, icon: Clock },
                  { label: "Current Velocity", value: "4.2 tasks/week", icon: Zap },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-xs font-black">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {view === "kanban" && (
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide">
          {columns.map((col) => (
            <div key={col.id} className="w-80 flex-shrink-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground uppercase tracking-widest">{col.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-bold text-muted-foreground">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-secondary rounded transition-colors"><Plus className="w-4 h-4 text-muted-foreground" /></button>
                  <button className="p-1 hover:bg-secondary rounded transition-colors"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              </div>
              <div className="space-y-3 min-h-[500px]">
                {tasks.filter(t => t.status === col.id).map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    onClick={() => setSelectedTask(task)}
                    className="group rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-primary/40 transition-colors" />
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${priorityDot[task.priority]}`} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{task.priority}</span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1" onClick={(e) => { e.stopPropagation(); handleMarkComplete(task.id); }}>
                        <CheckSquare className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-foreground mb-3 leading-snug">{task.title}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {task.tags.map((tag) => (
                        <span key={tag} className="text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground">{tag}</span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{task.due}</span>
                        </div>
                        {task.subtasks && (
                          <div className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{task.subtasks.filter(s => s.done).length}/{task.subtasks.length}</span>
                          </div>
                        )}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[9px] font-bold text-accent-foreground ring-2 ring-card shadow-sm">
                        {task.assignee}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <button className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors bg-secondary/10 hover:bg-secondary/20 rounded-xl border border-dashed border-border mt-2">
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/20 border-b border-border">
                <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-4">Task Name</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-4">Assignee</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-4">Due Date</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-4">Priority</th>
                <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task) => (
                <tr key={task.id} onClick={() => setSelectedTask(task)} className="hover:bg-secondary/10 cursor-pointer transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary" />
                      <p className="text-sm font-bold text-foreground">{task.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[9px] font-bold text-accent-foreground">{task.assignee}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-muted-foreground">{task.due}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority]}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{task.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-secondary text-muted-foreground">{task.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline View */}
      {view === "timeline" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
          <div className="flex h-[500px] overflow-x-auto scrollbar-hide">
            {/* Sidebar for tasks */}
            <div className="w-64 border-r border-border flex-shrink-0 bg-secondary/5 z-20">
              <div className="h-12 border-b border-border flex items-center px-4 bg-secondary/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tasks</span>
              </div>
              <div className="divide-y divide-border/50">
                {tasks.map((task) => (
                  <div key={task.id} className="h-14 flex items-center px-4 hover:bg-secondary/10 cursor-pointer transition-colors" onClick={() => setSelectedTask(task)}>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{task.title}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{task.assignee}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-x-auto relative min-w-[1200px]">
              <div className="h-12 border-b border-border flex bg-secondary/10 sticky top-0 z-10">
                {Array.from({ length: 14 }, (_, i) => (
                  <div key={i} className="min-w-[120px] border-r border-border/50 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mar</span>
                    <span className="text-xs font-black">{20 + i}</span>
                  </div>
                ))}
              </div>
              <div className="relative h-full">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex pointer-events-none h-full">
                  {Array.from({ length: 14 }, (_, i) => (
                    <div key={i} className="min-w-[120px] border-r border-border/30 h-full" />
                  ))}
                </div>
                
                {/* Connection Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {tasks.map((task, idx) => {
                    return (task.dependencies || []).map(depId => {
                      const depTask = tasks.find(t => t.id === depId);
                      const depIdx = tasks.findIndex(t => t.id === depId);
                      if (!depTask || depIdx === -1) return null;

                      const startDay = parseInt(task.startDate?.split(' ')[1] || '20');
                      const depStartDay = parseInt(depTask.startDate?.split(' ')[1] || '20');
                      const depDuration = depTask.duration || 2;

                      const x1 = (depStartDay - 20 + depDuration) * 120;
                      const y1 = (depIdx * 56) + 28;
                      const x2 = (startDay - 20) * 120;
                      const y2 = (idx * 56) + 28;

                      return (
                        <g key={`${task.id}-${depId}`}>
                          <path
                            d={`M ${x1} ${y1} L ${x1 + 20} ${y1} L ${x1 + 20} ${y2} L ${x2} ${y2}`}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeOpacity="0.3"
                            strokeDasharray="4 4"
                          />
                          <circle cx={x2} cy={y2} r="3" fill="hsl(var(--primary))" fillOpacity="0.5" />
                        </g>
                      );
                    });
                  })}
                </svg>

                {/* Task Bars */}
                <div className="divide-y divide-border/50 relative z-10">
                  {tasks.map((task, idx) => {
                    const startDay = parseInt(task.startDate?.split(' ')[1] || '20');
                    const duration = task.duration || 2;
                    const offset = (startDay - 20) * 120;
                    const width = duration * 120;
                    
                    return (
                      <div key={task.id} className="h-14 relative group">
                        <motion.div
                          initial={{ opacity: 0, x: offset - 20 }}
                          animate={{ opacity: 1, x: offset }}
                          whileHover={{ scaleY: 1.05, zIndex: 30 }}
                          className={`absolute top-3 h-8 rounded-xl shadow-lg flex items-center px-4 cursor-grab active:cursor-grabbing border-2 transition-all ${
                            task.status === 'done' ? 'bg-green-500/10 border-green-500/30 text-green-600' :
                            task.status === 'in-progress' ? 'bg-primary/10 border-primary/30 text-primary' :
                            'bg-secondary border-border text-foreground'
                          }`}
                          style={{ width: `${width}px` }}
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot[task.priority]}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest truncate">{task.title}</span>
                          </div>
                          
                          {/* Resize handles */}
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-4 bg-foreground/10 rounded-full opacity-0 group-hover:opacity-100 cursor-ew-resize transition-opacity" />
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-4 bg-foreground/10 rounded-full opacity-0 group-hover:opacity-100 cursor-ew-resize transition-opacity" />
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-border bg-secondary/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary/20 border-2 border-primary/40" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500/20 border-2 border-green-500/40" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Completed</span>
              </div>
              <div className="h-4 w-px bg-border mx-2" />
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary opacity-50" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dependencies</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="xs" className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl" variant="outline">Today</Button>
              <Button size="xs" className="h-8 px-4 text-[9px] font-black uppercase tracking-widest rounded-xl" variant="outline">Month View</Button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-bold text-lg uppercase tracking-widest">March 2026</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg h-8 px-3">Prev</Button>
              <Button variant="outline" size="sm" className="rounded-lg h-8 px-3">Next</Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="bg-secondary/30 px-2 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 1; 
              const dateNum = day + 1;
              const isCurrentMonth = dateNum >= 1 && dateNum <= 31;
              const isToday = dateNum === 23;
              const tasksOnDay = isCurrentMonth ? tasks.filter((t) => t.due.includes(String(dateNum)) && t.due.includes("Mar")) : [];
              return (
                <div key={i} className={`bg-card min-h-[100px] p-2 hover:bg-secondary/5 transition-colors cursor-pointer border-none ${!isCurrentMonth ? "opacity-30" : ""}`}>
                  <span className={`text-xs font-bold ${isToday ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center shadow-md shadow-primary/20" : "text-muted-foreground"}`}>
                    {isCurrentMonth ? dateNum : ""}
                  </span>
                  <div className="mt-2 space-y-1">
                    {tasksOnDay.map((t) => (
                      <div key={t.id} className="text-[9px] font-bold px-2 py-1 rounded bg-primary/10 text-primary truncate border border-primary/20">{t.title}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Detail Sidebar/Modal */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl z-50 bg-card border-l border-border shadow-2xl overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleMarkComplete(selectedTask.id)} className="w-6 h-6 rounded-lg border-2 border-border hover:border-primary flex items-center justify-center transition-all group">
                      <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary" />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mark Complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors" onClick={() => handleDelete(selectedTask.id, 'task')}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors"><Paperclip className="w-4 h-4 text-muted-foreground" /></button>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors"><LinkIcon className="w-4 h-4 text-muted-foreground" /></button>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-secondary rounded-lg transition-colors ml-2"><X className="w-5 h-5 text-muted-foreground" /></button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-4">{selectedTask.title}</h2>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Assignee</Label>
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer group">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                            {selectedTask.assignee?.substring(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{selectedTask.assignee}</span>
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Workspace Member</span>
                          </div>
                          <UserPlus className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due Date</Label>
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer group">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-bold">{selectedTask.due}</span>
                          <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Priority</Label>
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer group">
                          <div className={`w-2 h-2 rounded-full ${priorityDot[selectedTask.priority]}`} />
                          <span className="text-sm font-bold capitalize">{selectedTask.priority}</span>
                          <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Projects</Label>
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer group">
                          <LayoutGrid className="w-4 h-4 text-primary" />
                          <span className="text-sm font-bold">Q2 Campaign</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                    <Textarea 
                      placeholder="Add more detail to this task..." 
                      className="min-h-[120px] rounded-xl bg-secondary/10 border-border/50 focus:ring-primary/20 text-sm leading-relaxed"
                      defaultValue={selectedTask.description}
                    />
                  </div>

                  {/* Subtasks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subtasks</Label>
                    </div>
                    <div className="space-y-2">
                      {selectedTask.subtasks?.map((sub, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-secondary/5 group hover:border-primary/30 transition-all cursor-pointer" onClick={() => handleToggleSubtask(i)}>
                          <CheckSquare className={`w-4 h-4 ${sub.done ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-medium ${sub.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{sub.title}</span>
                          <MoreHorizontal className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground cursor-pointer" />
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <Input 
                          placeholder="Add a subtask..." 
                          className="h-8 text-xs rounded-lg" 
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                        />
                        <Button size="sm" className="h-8 px-3 rounded-lg" onClick={handleAddSubtask}><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </div>

                  {/* Dependencies */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dependencies</Label>
                    <div className="space-y-2">
                      {selectedTask.dependencies?.map(depId => {
                        const depTask = tasks.find(t => t.id === depId);
                        return depTask ? (
                          <div key={depId} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/10 group">
                            <Zap className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-medium">{depTask.title}</span>
                            <span className={`ml-auto text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                              depTask.status === 'done' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                            }`}>{depTask.status}</span>
                          </div>
                        ) : null;
                      })}
                      <div className="p-4 rounded-xl border border-dashed border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Dependency
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-6 pt-6 border-t border-border">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" /> Activity & Comments
                    </h4>
                    <div className="space-y-4">
                      {selectedTask.comments?.map((comment, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[9px] font-bold">{comment.user.substring(0, 2).toUpperCase()}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold">{comment.user}</span>
                              <span className="text-[9px] text-muted-foreground font-bold uppercase">{comment.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-xl rounded-tl-none">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">JD</div>
                      <div className="flex-1 relative">
                        <Input 
                          placeholder="Add a comment..." 
                          className="rounded-xl pr-10 text-sm" 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        />
                        <button 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                          onClick={handleAddComment}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Create New Project</DialogTitle>
            <DialogDescription>Organize your work into a new project space.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input 
                id="project-name" 
                placeholder="e.g. Brand Refresh" 
                className="rounded-xl" 
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-owner">Project Owner</Label>
              <Input 
                id="project-owner" 
                placeholder="Select member..." 
                className="rounded-xl" 
                value={newProject.owner}
                onChange={(e) => setNewProject({ ...newProject, owner: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input 
                id="task-title" 
                placeholder="What needs to be done?" 
                className="rounded-xl" 
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Assignee</Label>
              <Popover open={isAssigneePopoverOpen} onOpenChange={setIsAssigneePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isAssigneePopoverOpen}
                    className="w-full h-10 rounded-xl border justify-between bg-transparent hover:bg-secondary/10"
                  >
                    {newTask.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[7px] font-black bg-primary/10 text-primary uppercase">
                            {newTask.assignee.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold">{newTask.assignee}</span>
                      </div>
                    ) : "Select Assignee..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 rounded-2xl border-2" align="start">
                  <Command>
                    <CommandInput placeholder="Search team members..." className="h-10" />
                    <CommandList>
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandGroup heading="Team Members">
                        {[adminProfile, ...staffList].filter(Boolean).map((member: any) => {
                          const initials = member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
                          const displayValue = member.chatName || initials;
                          return (
                            <CommandItem
                              key={member.id || 'admin'}
                              value={displayValue}
                              onSelect={(currentValue) => {
                                setNewTask({ ...newTask, assignee: currentValue });
                                setIsAssigneePopoverOpen(false);
                              }}
                              className="flex items-center gap-3 p-3 cursor-pointer"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-black uppercase tracking-tight">{member.name}</p>
                                  {member.chatName && (
                                    <span className="text-[8px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded-full">@{member.chatName}</span>
                                  )}
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground truncate">{member.role}</p>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4 text-primary",
                                  newTask.assignee === displayValue ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input 
                  id="task-due-date" 
                  type="date" 
                  className="rounded-xl" 
                  value={newTask.due}
                  onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-priority-select">Priority</Label>
                <select 
                  id="task-priority-select" 
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-status-select">Initial Status</Label>
              <select 
                id="task-status-select" 
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              >
                {columns.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal 1 */}
      <Dialog open={isDeleteModal1Open} onOpenChange={setIsDeleteModal1Open}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] border-4 p-8 bg-card">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground">Delete Task?</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Are you sure you want to remove this task from your project board?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              variant="destructive"
              className="h-12 rounded-2xl font-black uppercase tracking-widest text-[11px]"
              onClick={confirmDeleteStep1}
            >
              Yes, I'm sure
            </Button>
            <Button 
              variant="ghost" 
              className="h-12 rounded-2xl font-black uppercase tracking-widest text-[11px]"
              onClick={() => setIsDeleteModal1Open(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal 2 */}
      <Dialog open={isDeleteModal2Open} onOpenChange={setIsDeleteModal2Open}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] border-4 p-8 bg-card border-destructive">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive flex items-center justify-center text-white mb-4 animate-pulse">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-destructive">Final Confirmation</DialogTitle>
            <DialogDescription className="text-sm font-bold text-destructive/80 uppercase tracking-widest">
              This action is irreversible. Are you absolutely certain?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              variant="destructive"
              className="h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-destructive/20"
              onClick={finalizeDelete}
            >
              Permanently Delete
            </Button>
            <Button 
              variant="ghost" 
              className="h-12 rounded-2xl font-black uppercase tracking-widest text-[11px]"
              onClick={() => setIsDeleteModal2Open(false)}
            >
              I changed my mind
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Missing Icons ---
const AlertCircle = (props: any) => <div {...props} className={cn("text-destructive", props.className)}><TrendingUp {...props} /></div>;

export default ProjectsPage;

