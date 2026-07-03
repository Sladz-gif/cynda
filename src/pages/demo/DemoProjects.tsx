import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SkeletonLoader } from "@/components/demo/SkeletonLoader";
import { PROJECTS_DATA, PROJECT_TASKS } from "@/lib/demo-data";

export const DemoProjects = () => {
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(PROJECTS_DATA[0].id);
  const [tasks, setTasks] = useState(PROJECT_TASKS);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const selectedProject = PROJECTS_DATA.find(p => p.id === selectedProjectId)!;

  const toggleTask = (taskId: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;
      
      const newColumnId = task.columnId === "done" ? "todo" : "done";
      return prev.map(t =>
        t.id === taskId ? { ...t, columnId: newColumnId } : t
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-black tracking-tight">Projects</h2>
        <Button className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
            {[1,2,3,4].map(i => (
              <SkeletonLoader key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <div className="flex-1">
            <SkeletonLoader className="h-96 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Project list */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
            {PROJECTS_DATA.map((project, i) => (
              <motion.button
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedProjectId(project.id)}
                className={`w-full p-5 rounded-2xl text-left border-2 transition-all ${
                  selectedProjectId === project.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{project.title}</h3>
                  {project.status === "Completed" && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project.progress}% complete</span>
                    <span>Due {project.due}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Project detail */}
          <div className="flex-1 p-6 rounded-2xl border border-border bg-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-black">{selectedProject.title}</h3>
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>

            <Tabs defaultValue="kanban">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="kanban" className="text-xs md:text-sm">Tasks</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs md:text-sm">Timeline</TabsTrigger>
                <TabsTrigger value="team" className="text-xs md:text-sm">Team</TabsTrigger>
                <TabsTrigger value="files" className="text-xs md:text-sm">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="kanban" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {["todo", "inprogress", "review", "done"].map((col) => (
                    <div key={col} className="space-y-3">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        {col === "todo" ? "To Do" :
                         col === "inprogress" ? "In Progress" :
                         col === "review" ? "Review" : "Done"}
                      </h4>
                      <div className="min-h-[200px] p-3 bg-muted/30 rounded-xl space-y-3">
                        {tasks
                          .filter(t => t.columnId === col && t.projectId === selectedProjectId)
                          .map((task, i) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="p-4 bg-card border border-border rounded-xl cursor-pointer"
                              onClick={() => toggleTask(task.id)}
                            >
                              <div className="flex items-center gap-3">
                                {col === "done" ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                )}
                                <p className="font-medium text-sm">{task.title}</p>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};
