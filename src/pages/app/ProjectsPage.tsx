import { useState } from "react";
import { 
  Plus, Filter, MoreHorizontal, Calendar, List, Kanban as KanbanIcon, 
  Clock, User, X, Paperclip, MessageSquare, Link as LinkIcon, 
  CheckSquare, ArrowRight, TrendingUp, LayoutGrid, Timer, 
  ChevronDown, Search, Share2, Settings, UserPlus, Zap, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
  status: string;
};

const initialTasks: Task[] = [
  { id: "1", title: "Research competitor pricing", assignee: "AK", priority: "low", due: "Apr 2", tags: ["Research"], status: "backlog", comments: [{ user: "Sarah", text: "Look at Acme Corp specifically.", time: "2h ago" }], subtasks: [{ title: "Gather data", done: true }, { title: "Create comparison", done: false }] },
  { id: "2", title: "Update API documentation", assignee: "MJ", priority: "medium", due: "Apr 5", tags: ["Docs"], status: "backlog", attachments: [{ name: "api-spec.pdf", size: "1.2MB" }] },
  { id: "3", title: "Design new onboarding flow", assignee: "SC", priority: "high", due: "Mar 28", tags: ["Design", "UX"], status: "todo", description: "Create a multi-step onboarding experience that collects user type, industry, and tool preferences.", subtasks: [{ title: "Wireframes", done: true }, { title: "High-fidelity mockup", done: false }, { title: "Prototype", done: false }] },
  { id: "4", title: "Set up CI/CD pipeline", assignee: "ED", priority: "high", due: "Mar 29", tags: ["Engineering"], status: "todo" },
  { id: "6", title: "Build messaging module", assignee: "MJ", priority: "high", due: "Mar 26", tags: ["Engineering"], status: "in-progress", subtasks: [{ title: "Channel UI", done: true }, { title: "Thread system", done: true }, { title: "File sharing", done: false }] },
];

const ProjectsPage = () => {
  const { toast } = useToast();
  const [view, setView] = useState<"kanban" | "list" | "calendar" | "timeline">("kanban");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [newProject, setNewProject] = useState({ name: "", owner: "" });
  const [newTask, setNewTask] = useState({ title: "", due: "", priority: "medium", status: "todo" });
   const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");

  const handleAddSubtask = () => {
    if (!newSubtask || !selectedTask) return;
    const updatedTask = {
      ...selectedTask,
      subtasks: [...(selectedTask.subtasks || []), { title: newSubtask, done: false }]
    };
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
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
    const updatedTask = {
      ...selectedTask,
      comments: [...(selectedTask.comments || []), comment]
    };
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
    setNewComment("");
    toast({ title: "Comment Added" });
  };

  const handleToggleSubtask = (index: number) => {
    if (!selectedTask) return;
    const updatedSubtasks = [...(selectedTask.subtasks || [])];
    updatedSubtasks[index].done = !updatedSubtasks[index].done;
    const updatedTask = { ...selectedTask, subtasks: updatedSubtasks };
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
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

  const handleAddTask = () => {
    if (!newTask.title) {
      toast({ title: "Error", description: "Task title is required", variant: "destructive" });
      return;
    }
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      assignee: "JD",
      priority: newTask.priority as "high" | "medium" | "low",
      due: newTask.due || "Mar 28",
      tags: ["General"],
      status: newTask.status,
    };
    setTasks(prev => [...prev, task]);
    setIsAddTaskOpen(false);
    setNewTask({ title: "", due: "", priority: "medium", status: "todo" });
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
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "done" } : t));
    toast({ title: "Task Completed", description: "Task moved to Done." });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">Q2</div>
            <div>
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                Q2 Campaign <ChevronDown className="w-4 h-4 text-muted-foreground cursor-pointer" />
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Project Progress</p>
                <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "65%" }} />
                </div>
                <span className="text-[10px] font-bold text-primary">65%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl"><Share2 className="w-4 h-4 mr-1.5" /> Share</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsNewProjectOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> New Project</Button>
            <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => setIsAddTaskOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Task
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-px overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1">
            {[
              { id: "kanban", label: "Board", icon: KanbanIcon },
              { id: "list", label: "List", icon: List },
              { id: "timeline", label: "Timeline", icon: Timer },
              { id: "calendar", label: "Calendar", icon: Calendar },
            ].map((v) => {
              const ViewIcon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => setView(v.id as typeof view)}
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
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input placeholder="Search tasks..." className="h-8 pl-8 pr-3 text-xs bg-secondary/30 rounded-lg border-none focus:ring-1 focus:ring-primary w-40" />
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest"><Filter className="w-3.5 h-3.5 mr-1.5" /> Filter</Button>
          </div>
        </div>
      </div>

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
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex h-[500px] overflow-x-auto scrollbar-hide">
            {/* Sidebar for tasks */}
            <div className="w-64 border-r border-border flex-shrink-0 bg-secondary/5">
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
            <div className="flex-1 overflow-x-auto relative">
              <div className="h-12 border-b border-border flex bg-secondary/10 sticky top-0 z-10">
                {Array.from({ length: 14 }, (_, i) => (
                  <div key={i} className="min-w-[120px] border-r border-border/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Mar {20 + i}
                  </div>
                ))}
              </div>
              <div className="relative">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {Array.from({ length: 14 }, (_, i) => (
                    <div key={i} className="min-w-[120px] border-r border-border/30 h-full" />
                  ))}
                </div>
                
                {/* Task Bars */}
                <div className="divide-y divide-border/50">
                  {tasks.map((task, idx) => {
                    const startDay = 20 + (idx % 5); // Simulated start date
                    const duration = 2 + (idx % 4); // Simulated duration
                    const offset = (startDay - 20) * 120;
                    const width = duration * 120;
                    
                    return (
                      <div key={task.id} className="h-14 relative group">
                        <motion.div
                          initial={{ opacity: 0, x: offset - 20 }}
                          animate={{ opacity: 1, x: offset }}
                          className={`absolute top-3 h-8 rounded-lg shadow-sm flex items-center px-3 cursor-move hover:brightness-110 transition-all ${
                            task.status === 'done' ? 'bg-green-500/20 border border-green-500/40 text-green-600' :
                            task.status === 'in-progress' ? 'bg-primary/20 border border-primary/40 text-primary' :
                            'bg-accent/20 border border-accent/40 text-accent-foreground'
                          }`}
                          style={{ width: `${width}px` }}
                        >
                          <span className="text-[10px] font-bold truncate">{task.title}</span>
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-primary/20 border border-primary/40" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Normal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-green-500/20 border border-green-500/40" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completed</span>
              </div>
            </div>
            <Button size="xs" className="h-7 text-[9px] font-bold uppercase tracking-widest" variant="outline">Adjust View Range</Button>
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
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">{selectedTask.assignee}</div>
                          <span className="text-sm font-bold">{selectedTask.assignee === "MJ" ? "Michael J." : "Team Member"}</span>
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
                    <div className="p-4 rounded-xl border border-dashed border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                      <Zap className="w-3.5 h-3.5 mr-2" /> Add Dependency
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
    </div>
  );
};

export default ProjectsPage;

