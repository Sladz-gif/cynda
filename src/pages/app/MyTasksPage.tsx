import { motion } from "framer-motion";
import { CheckCircle, Plus, Filter, MoreHorizontal, Calendar, Clock, List, Kanban as KanbanIcon, User, Users, Paperclip, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Review marketing brief", project: "Q2 Campaign", due: "Today", priority: "high", status: "todo", assignees: ["https://i.pravatar.cc/150?u=a"], subtasks: [{id: "s1", title: "Initial draft", completed: true}], comments: 2 },
    { id: "2", title: "Update style guide", project: "Design", due: "Today", priority: "medium", status: "todo", assignees: ["https://i.pravatar.cc/150?u=b"], subtasks: [], comments: 0 },
    { id: "3", title: "Prepare for client meeting", project: "Acme Corp", due: "Tomorrow", priority: "high", status: "todo", assignees: [], subtasks: [], comments: 5 },
    { id: "4", title: "Write weekly report", project: "Internal", due: "Friday", priority: "low", status: "todo", assignees: [], subtasks: [], comments: 0 },
  ]);

  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleSelectTask = useCallback((task) => {
    setSelectedTask(task);
    setIsTaskOpen(true);
  }, []);

  const handleAddTask = useCallback(() => {
    setSelectedTask(null);
    setIsTaskOpen(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">My Tasks</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your personal task list and priorities.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1.5" /> Filter</Button>
          <Button size="sm" onClick={handleAddTask}><Plus className="w-4 h-4 mr-1.5" /> Add Task</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/20 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Today</h3>
          <span className="text-xs text-muted-foreground">2 tasks</span>
        </div>
        <div className="divide-y divide-border/50">
          {tasks.filter(t => t.due === "Today").map((task) => (
            <div 
              key={task.id} 
              className="px-4 sm:px-6 py-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-secondary/30 transition-all group cursor-pointer active:bg-secondary/50" 
              onClick={() => handleSelectTask(task)}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center shrink-0 hover:border-primary transition-colors group-hover:shadow-sm">
                  <CheckCircle className="w-4 h-4 opacity-0 group-hover:opacity-30" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{task.title}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60">{task.project}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 shrink-0">
                <div className="flex -space-x-2 overflow-hidden">
                  {task.assignees.map((a, i) => (
                    <Avatar key={i} className="h-7 w-7 border-2 border-background shadow-sm ring-1 ring-border/10">
                      <AvatarImage src={a} />
                      <AvatarFallback className="text-[8px] font-black">U</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-lg">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{task.due}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${
                      task.priority === 'high' ? 'border-destructive/30 text-destructive bg-destructive/5' :
                      task.priority === 'medium' ? 'border-primary/30 text-primary bg-primary/5' :
                      'border-muted text-muted-foreground'
                    }`}>
                      {task.priority}
                    </Badge>
                    <button className="p-2 -m-2 text-muted-foreground hover:text-foreground md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/20 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Upcoming</h3>
          <span className="text-xs text-muted-foreground">2 tasks</span>
        </div>
        <div className="divide-y divide-border/50">
          {tasks.filter(t => t.due !== "Today").map((task) => (
            <div 
              key={task.id} 
              className="px-4 sm:px-6 py-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-secondary/30 transition-all group cursor-pointer active:bg-secondary/50" 
              onClick={() => handleSelectTask(task)}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center shrink-0 hover:border-primary transition-colors group-hover:shadow-sm">
                  <CheckCircle className="w-4 h-4 opacity-0 group-hover:opacity-30" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{task.title}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60">{task.project}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 shrink-0">
                <div className="flex -space-x-2 overflow-hidden">
                  {task.assignees.map((a, i) => (
                    <Avatar key={i} className="h-7 w-7 border-2 border-background shadow-sm ring-1 ring-border/10">
                      <AvatarImage src={a} />
                      <AvatarFallback className="text-[8px] font-black">U</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-lg">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{task.due}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${
                      task.priority === 'high' ? 'border-destructive/30 text-destructive bg-destructive/5' :
                      task.priority === 'medium' ? 'border-primary/30 text-primary bg-primary/5' :
                      'border-muted text-muted-foreground'
                    }`}>
                      {task.priority}
                    </Badge>
                    <button className="p-2 -m-2 text-muted-foreground hover:text-foreground md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-2xl font-bold">{selectedTask ? selectedTask.title : "Add New Task"}</DialogTitle>
            {selectedTask && <p className="text-sm text-muted-foreground">in <span className="font-semibold text-foreground">{selectedTask.project}</span></p>}
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-2 p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <Textarea placeholder="Add a description..." className="min-h-[120px]" defaultValue={selectedTask?.description} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Subtasks</h4>
                <div className="space-y-2">
                  {selectedTask?.subtasks.map(st => (
                    <div key={st.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                      <CheckCircle className={`w-4 h-4 ${st.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm ${st.completed ? 'line-through text-muted-foreground' : ''}`}>{st.title}</span>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm"><Plus className="w-4 h-4 mr-1.5" /> Add subtask</Button>
                </div>
              </div>
            </div>
            <div className="col-span-1 p-6 bg-secondary/30 border-l md:border-l border-t md:border-t-0 border-border space-y-6">
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">Properties</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={selectedTask?.status === 'todo' ? 'secondary' : 'default'}>{selectedTask?.status || "Todo"}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Due Date</span>
                    <Button variant="outline" size="sm" className="h-7"><Calendar className="w-3.5 h-3.5 mr-1.5" /> {selectedTask?.due || "Set Date"}</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Priority</span>
                    <Select defaultValue={selectedTask?.priority || "medium"}>
                      <SelectTrigger className="w-[100px] h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">Assignees</h4>
                <div className="flex items-center gap-2">
                  {selectedTask?.assignees.map(a => (
                    <Avatar key={a} className="h-8 w-8">
                      <AvatarImage src={a} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  ))}
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-dashed">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {selectedTask && <Button variant="outline" className="w-full">Request to Join</Button>}
            </div>
          </div>
          <DialogFooter className="p-4 border-t bg-secondary/30">
            <Button variant="ghost" onClick={() => setIsTaskOpen(false)}>Cancel</Button>
            <Button>{selectedTask ? "Save Changes" : "Create Task"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default MyTasksPage;
