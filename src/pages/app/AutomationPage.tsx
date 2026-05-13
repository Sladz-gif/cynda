import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Plus, Filter, MoreHorizontal, CheckCircle2, Play, Settings, 
  Bell, MessageSquare, Clock, LayoutDashboard, History, Download,
  Eye, Trash2, Edit, AlertCircle, Info, ChevronRight, Search, 
  CheckCircle, ShieldCheck, Bot, ExternalLink, ArrowRight, Zap as ZapIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { useIndustryStore, AutomationTemplate, ActiveAutomation, AutomationLog } from "@/lib/industry-store";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const AutomationPage = () => {
  const { toast } = useToast();
  const { 
    automationLibrary, 
    activeAutomations, 
    automationLogs,
    selectedModules,
    activateAutomation,
    deactivateAutomation,
    toggleAutomationStatus,
    deleteAutomation,
    updateAutomationConfig
  } = useIndustryStore();

  const [activeTab, setActiveTab] = useState("my-automations");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configuringTemplate, setConfiguringTemplate] = useState<AutomationTemplate | null>(null);
  const [configData, setConfigData] = useState<any>({});

  // Two-step Delete Confirmation
  const [isDeleteModal1Open, setIsDeleteModal1Open] = useState(false);
  const [isDeleteModal2Open, setIsDeleteModal2Open] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const navItems = [
    { id: "my-automations", label: "My Automations", icon: Zap },
    { id: "library", label: "Automation Library", icon: LayoutDashboard },
    { id: "run-log", label: "Run Log", icon: History },
  ];

  const categories = ["All", "CRM", "Finance", "Projects", "HR", "Cross-Department"];

  const toolMap: Record<string, string> = {
    'CRM': 'crm',
    'Finance': 'finance-dashboard',
    'Projects': 'tasks',
    'HR': 'hr-dashboard'
  };

  const filteredLibrary = useMemo(() => {
    return automationLibrary.filter(t => {
      // Filter by selected tools
      const toolId = toolMap[t.department];
      const hasTool = !toolId || selectedModules.includes(toolId);
      if (!hasTool && t.department !== 'Cross-Department') return false;

      const matchesCategory = selectedCategory === "All" || t.department === selectedCategory;
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.triggerDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [automationLibrary, selectedCategory, searchQuery, selectedModules]);

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModal1Open(true);
  };

  const confirmDeleteStep1 = () => {
    setIsDeleteModal1Open(false);
    setIsDeleteModal2Open(true);
  };

  const finalizeDelete = () => {
    if (itemToDelete) {
      deleteAutomation(itemToDelete);
      setIsDeleteModal2Open(false);
      setItemToDelete(null);
      toast({ title: "Automation Deleted", description: "The automation has been permanently removed." });
    }
  };

  const handleOpenConfig = (template: AutomationTemplate) => {
    setConfiguringTemplate(template);
    setConfigData({}); // Reset config
    setIsConfigOpen(true);
  };

  const handleActivate = () => {
    if (!configuringTemplate) return;
    activateAutomation(configuringTemplate.id, configData);
    setIsConfigOpen(false);
    toast({ 
      title: "Automation Activated", 
      description: `${configuringTemplate.name} is now running in your workspace.` 
    });
  };

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case 'CRM': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Finance': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'Projects': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'HR': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Automations</h2>
            <p className="text-sm text-muted-foreground mt-1">Supercharge your workspace with Cyndi-powered background tasks.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl h-9 border-2 font-black uppercase tracking-widest text-[9px]" onClick={() => toast({ title: "Export Started" })}>
              <Download className="w-4 h-4 mr-1.5" /> Export Logs
            </Button>
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
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
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
          {activeTab === "my-automations" && (
            <motion.div 
              key="my-automations"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Active Automations", value: activeAutomations.filter(a => a.status === 'active').length, icon: Zap, color: "text-primary" },
                  { label: "Total Runs (Month)", value: activeAutomations.reduce((acc, a) => acc + a.runCount, 0), icon: Play, color: "text-green-500" },
                  { label: "AI Operations", value: automationLogs.filter(l => l.geminiCall).length, icon: Bot, color: "text-blue-500" },
                  { label: "Success Rate", value: automationLogs.length > 0 ? `${Math.round((automationLogs.filter(l => l.outcome === 'Success').length / automationLogs.length) * 100)}%` : "100%", icon: CheckCircle2, color: "text-accent" },
                ].map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-2xl border-2 border-border bg-card p-5 hover:border-primary/20 transition-all shadow-sm group">
                      <div className="flex items-center justify-between mb-3">
                        {StatIcon && (
                          <div className={cn("p-2 rounded-xl bg-secondary group-hover:bg-primary/5 transition-colors", stat.color)}>
                            <StatIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="font-display text-2xl font-black text-foreground">{stat.value}</div>
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {activeAutomations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeAutomations.map((automation) => (
                    <div key={automation.id} className="p-6 rounded-[32px] border-2 border-border bg-card hover:border-primary/30 transition-all group relative overflow-hidden">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                            automation.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          )}>
                            <Zap className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-tight text-foreground">{automation.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Runs: {automation.runCount}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                {automation.lastTriggered ? `Last: ${new Date(automation.lastTriggered).toLocaleTimeString()}` : 'Never run'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Switch 
                          checked={automation.status === 'active'} 
                          onCheckedChange={() => toggleAutomationStatus(automation.id)}
                        />
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                          <p className="text-xs font-bold text-muted-foreground">
                            Triggered by {automation.triggeredRecord || 'events'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-border/50">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest" onClick={() => setActiveTab("run-log")}>
                            <History className="w-3.5 h-3.5 mr-1.5" /> Log
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest">
                            <Settings className="w-3.5 h-3.5 mr-1.5" /> Config
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => handleDelete(automation.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center border-4 border-dashed border-border rounded-[48px] bg-secondary/5">
                  <div className="w-20 h-20 bg-secondary rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">No active automations</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
                    Browse the Automation Library to find pre-built templates for CRM, Finance, Projects, and more.
                  </p>
                  <Button className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[11px] shadow-glow" onClick={() => setActiveTab("library")}>
                    Browse Library <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "library" && (
            <motion.div 
              key="library"
              initial={{ opacity: 0, x: 12 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -12 }}
              className="space-y-8"
            >
              {/* Library Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                        selectedCategory === cat 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-card border-border text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search templates..." 
                    className="pl-10 h-11 rounded-xl bg-card border-2 border-border focus-visible:border-primary/30 transition-all font-bold text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLibrary.map((template) => (
                  <motion.div 
                    key={template.id}
                    layout
                    className="p-6 rounded-[32px] border-2 border-border bg-card hover:border-primary/30 transition-all group flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                        <Zap className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        getDepartmentColor(template.department)
                      )}>
                        {template.department}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-black uppercase tracking-tight text-foreground mb-4">{template.name}</h3>
                    
                    <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">When:</span>
                        <p className="text-xs font-bold text-muted-foreground leading-relaxed">{template.triggerDescription}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">Then:</span>
                        <p className="text-xs font-bold text-muted-foreground leading-relaxed">{template.actionDescription}</p>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                      {template.isGeminiPowered && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/5 text-blue-600">
                          <Bot className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Powered by Cyndi</span>
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        className="rounded-xl font-black uppercase tracking-widest text-[9px] h-9"
                        onClick={() => handleOpenConfig(template)}
                      >
                        Activate <Plus className="ml-1.5 w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "run-log" && (
            <motion.div 
              key="run-log"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div className="rounded-[32px] border-2 border-border bg-card overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest">Execution History</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="xs" className="h-7 text-[9px] font-black rounded-lg">All Status</Button>
                    <Button variant="outline" size="xs" className="h-7 text-[9px] font-black rounded-lg">Clear Log</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">Automation</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">Trigger</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">Record</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">Outcome</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest text-muted-foreground">AI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {automationLogs.length > 0 ? automationLogs.map((log) => (
                        <tr key={log.id} className="group hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-black uppercase tracking-tight text-foreground">{log.automationName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-border bg-secondary/30">
                              {log.triggerEvent}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer">
                              {log.affectedRecord} <ExternalLink className="w-3 h-3" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-none",
                              log.outcome === 'Success' ? "bg-green-500/10 text-green-600" : 
                              log.outcome === 'Failed' ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                            )}>
                              {log.outcome}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {log.geminiCall ? (
                              <div className="flex justify-end">
                                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                  <Bot className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] font-black text-muted-foreground uppercase">Off</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-sm text-muted-foreground font-medium">
                            No logs found. Once automations run, their history will appear here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[32px] border-4 p-0 overflow-hidden bg-card">
          <div className="p-8 space-y-8">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <Badge variant="outline" className={cn(
                  "text-[8px] font-black uppercase tracking-widest",
                  configuringTemplate ? getDepartmentColor(configuringTemplate.department) : ""
                )}>
                  {configuringTemplate?.department}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Activate {configuringTemplate?.name}</DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                Configure how this automation behaves in your workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4 p-5 rounded-2xl bg-secondary/30 border-2 border-border">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-md bg-primary/10 text-primary">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-1">Automation Logic</h4>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                      {configuringTemplate?.triggerDescription}. Then, {configuringTemplate?.actionDescription}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mock Configuration Fields based on Template */}
              <div className="grid gap-4">
                {configuringTemplate?.id === 'follow-up-reminder' && (
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Days of Inactivity</Label>
                    <select defaultValue="7" className="h-11 rounded-xl border-2 font-bold text-xs bg-transparent px-3">
                      <option value="3">3 Days</option>
                      <option value="7">7 Days (Default)</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">AI Enhancement</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Cyndi-powered contextual messaging</p>
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                className="h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow"
                onClick={handleActivate}
              >
                Activate Automation
              </Button>
              <Button 
                variant="ghost" 
                className="h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] text-muted-foreground"
                onClick={() => setIsConfigOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal 1 */}
      <Dialog open={isDeleteModal1Open} onOpenChange={setIsDeleteModal1Open}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] border-4 p-8 bg-card">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Delete Automation?</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Are you sure you want to remove this automation from your workspace?
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

export default AutomationPage;
