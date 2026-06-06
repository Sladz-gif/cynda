import { Link } from 'react-router-dom';
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Upload, 
  Plus, 
  Trash2, 
  Check, 
  ArrowRight, 
  Bot, 
  UserPlus, 
  FileSpreadsheet,
  Settings2,
  ChevronRight,
  Save,
  X,
  PlusCircle,
  Type,
  Calendar as CalendarIcon,
  Hash as HashIcon,
  List as ListIcon,
  Mail,
  Shield,
  Briefcase,
  AlertCircle,
  FileUp,
  RotateCcw,
  CheckCircle2,
  MoreVertical,
  Search,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIndustryStore, DEPARTMENTS } from "@/lib/industry-store";
import { cn, generateChatName } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const StaffOnboardingPage = () => {
  const { staffList, addStaff, staffCustomFields, setStaffCustomFields, userType } = useIndustryStore();
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isDynamicFieldsOpen, setIsDynamicFieldsOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState<'upload' | 'review' | 'success'>('upload');
  const [undoTimer, setUndoTimer] = useState<number | null>(null);
  
  // Method 1: AI Parsing State
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [importStats, setImportStats] = useState({ created: 0, updated: 0, skipped: 0 });
  
  // Method 2: Manual Entry State
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: 'Employee' as const,
    department: '',
    title: '',
    startDate: '',
    assignedModules: [] as string[],
    personalMessage: '',
    customFields: {} as Record<string, string>
  });

  // Dynamic Field State
  const [editingFields, setEditingFields] = useState(staffCustomFields);

  // Two-step Delete Confirmation
  const [isDeleteModal1Open, setIsDeleteModal1Open] = useState(false);
  const [isDeleteModal2Open, setIsDeleteModal2Open] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteField = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModal1Open(true);
  };

  const confirmDeleteStep1 = () => {
    setIsDeleteModal1Open(false);
    setIsDeleteModal2Open(true);
  };

  const finalizeDelete = () => {
    if (itemToDelete) {
      setEditingFields(prev => prev.filter(f => f.id !== itemToDelete));
      setIsDeleteModal2Open(false);
      setItemToDelete(null);
      toast({ title: "Field Removed", description: "The custom field has been permanently removed." });
    }
  };

  const allTools = useMemo(() => Object.values(DEPARTMENTS).flatMap(d => d.tools), []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    // Simulate Cyndi AI Parsing
    setTimeout(() => {
      const mockParsed = [
        { id: '1', name: "Sarah Chen", email: "sarah@company.com", role: "Manager", department: "Engineering", title: "Lead Developer", confidence: 'High', suggestedTools: ['tasks', 'chat', 'notes', 'files'] },
        { id: '2', name: "Marcus Johnson", email: "marcus@company.com", role: "Employee", department: "Design", title: "UI Designer", confidence: 'High', suggestedTools: ['tasks', 'chat', 'notes', 'files'] },
        { id: '3', name: "Elena Rodriguez", email: "elena@company.com", role: "Manager", department: "Operations", title: "Operations Head", confidence: 'Medium', suggestedTools: ['tasks', 'chat', 'notes'] },
        { id: '4', name: "David Kim", email: "david@company.com", role: "Employee", department: "Marketing", title: "Growth lead", confidence: 'Low', suggestedTools: ['marketing', 'crm-dashboard', 'chat'] },
      ];
      
      setMappings([
        { fileColumn: 'Full Name', mappedTo: 'Name', confidence: 'High' },
        { fileColumn: 'Work Email', mappedTo: 'Email', confidence: 'High' },
        { fileColumn: 'Position', mappedTo: 'Job Title', confidence: 'Medium' },
        { fileColumn: 'Dept', mappedTo: 'Department', confidence: 'High' },
        { fileColumn: 'LinkedIn', mappedTo: 'LinkedIn Profile (New)', confidence: 'Medium' },
      ]);

      // Simulate creating a new custom box detected by AI
      if (!staffCustomFields.find(f => f.label === 'LinkedIn Profile')) {
        setStaffCustomFields([...staffCustomFields, { id: 'ai-linkedin', label: 'LinkedIn Profile', type: 'url', required: false }]);
      }
      
      setParsedData(mockParsed.map(p => ({ ...p, tools: p.suggestedTools })));
      setIsParsing(false);
      setParsingStep('review');
    }, 3000);
  };

  const toggleParsedStaffTool = (staffId: string, toolId: string) => {
    setParsedData(prev => prev.map(staff => {
      if (staff.id === staffId) {
        const hasTool = staff.tools.includes(toolId);
        return {
          ...staff,
          tools: hasTool 
            ? staff.tools.filter(id => id !== toolId)
            : [...staff.tools, toolId]
        };
      }
      return staff;
    }));
  };

  const confirmImport = () => {
    setIsParsing(true);
    // Simulate Import
    setTimeout(() => {
      parsedData.forEach(staff => addStaff({
        ...staff,
        chatName: generateChatName(staff.name),
        tools: staff.tools
      }));
      setImportStats({ created: parsedData.length, updated: 0, skipped: 0 });
      setIsParsing(false);
      setParsingStep('success');
      setUndoTimer(600); // 10 minutes in seconds
    }, 2000);
  };

  const handleAddManual = () => {
    if (!newStaff.name || !newStaff.email) {
      toast({ title: "Error", description: "Name and Email are required", variant: "destructive" });
      return;
    }
    addStaff({
      id: Math.random().toString(),
      ...newStaff,
      chatName: generateChatName(newStaff.name),
      tools: newStaff.assignedModules
    });
    setNewStaff({ 
      name: '', email: '', role: 'Employee', department: '', title: '', 
      startDate: '', assignedModules: [], personalMessage: '', customFields: {} 
    });
    setIsManualOpen(false);
    toast({ title: "Staff Member Added", description: `${newStaff.name} has been invited to the workspace.` });
  };

  const toggleModule = (moduleId: string) => {
    setNewStaff(prev => ({
      ...prev,
      assignedModules: prev.assignedModules.includes(moduleId)
        ? prev.assignedModules.filter(id => id !== moduleId)
        : [...prev.assignedModules, moduleId]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-[2.5rem] border-2 border-border shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tight">Staff Onboarding</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-1 opacity-70">
            {userType === 'large-business' ? 'Organisation-wide onboarding and HR lead tools' : 'Team management and automated staff setup'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 border-2"
            onClick={() => setIsDynamicFieldsOpen(true)}
          >
            <Settings2 className="w-4 h-4" /> Customize Structure
          </Button>
          <Button 
            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 bg-primary text-white shadow-glow"
            onClick={() => setIsManualOpen(true)}
          >
            <UserPlus className="w-4 h-4" /> Add Manually
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {parsingStep === 'upload' && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column: Methods */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Method 1: AI Upload */}
                <div className="p-8 rounded-[2.5rem] bg-card border-2 border-border relative overflow-hidden group hover:border-primary/50 transition-all flex flex-col">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Bot className="w-24 h-24" />
                  </div>
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FileUp className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">AI Document Upload</h3>
                  <p className="text-xs text-muted-foreground font-medium mb-8 leading-relaxed">
                    Upload spreadsheets, PDFs, or contracts. Cyndi will automatically extract names, roles, and departments.
                  </p>
                  
                  <div className="relative mt-auto">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      onChange={handleFileUpload}
                      disabled={isParsing}
                    />
                    <div className={cn(
                      "border-4 border-dashed border-border rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all",
                      isParsing ? "bg-muted animate-pulse" : "bg-muted/30 group-hover:border-primary/30"
                    )}>
                      {isParsing ? (
                        <>
                          <div className="w-12 h-12 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Cyndi is reading file...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                          <p className="text-xs font-black uppercase tracking-tight text-foreground">Click or Drag File</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">CSV, XLSX, PDF, DOCX</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Method 2: Manual */}
                <div className="p-8 rounded-[2.5rem] bg-card border-2 border-border relative overflow-hidden group hover:border-primary/50 transition-all flex flex-col">
                  <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">Manual Entry</h3>
                  <p className="text-xs text-muted-foreground font-medium mb-8 leading-relaxed">
                    Input details for a single team member. Best for individual hires and immediate onboarding.
                  </p>
                  <Button 
                    onClick={() => setIsManualOpen(true)}
                    className="mt-auto w-full h-14 rounded-[1.5rem] bg-secondary text-foreground hover:bg-secondary/80 font-black uppercase tracking-widest text-xs border-2 border-border"
                  >
                    Open Staff Form
                  </Button>
                </div>
              </div>

              {/* Recent Onboarding Activity */}
              <div className="p-8 rounded-[2.5rem] bg-card border-2 border-border">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Recent Onboarding</h3>
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest h-8">View History</Button>
                </div>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Chen", status: "Onboarding In Progress", progress: 65, date: "2h ago", avatar: "https://i.pravatar.cc/150?u=1" },
                    { name: "Marcus Johnson", status: "Account Created", progress: 25, date: "5h ago", avatar: "https://i.pravatar.cc/150?u=2" },
                    { name: "Elena Rodriguez", status: "Pending Invitation", progress: 0, date: "1d ago", avatar: "https://i.pravatar.cc/150?u=3" },
                  ].map((hire, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/10 hover:bg-secondary/20 transition-colors group">
                      <div className="flex items-center gap-4">
                        <img src={hire.avatar} alt={hire.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="text-sm font-bold">{hire.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{hire.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right w-24">
                        <p className="text-xs font-black text-primary">{hire.progress}%</p>
                        <Progress value={hire.progress} className="h-1.5 mt-1" />
                      </div>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                        <Link to="/app/hr">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Stats & Structure */}
            <div className="space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-primary/5 border-2 border-primary/10">
                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6">Onboarding Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Users className="w-4 h-4" /></div>
                      <span className="text-[10px] font-black uppercase">Total Staff</span>
                    </div>
                    <span className="text-xl font-black">{staffList.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10 text-green-500"><CheckCircle2 className="w-4 h-4" /></div>
                      <span className="text-[10px] font-black uppercase">Active Now</span>
                    </div>
                    <span className="text-xl font-black">24</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Clock className="w-4 h-4" /></div>
                      <span className="text-[10px] font-black uppercase">Pending Invites</span>
                    </div>
                    <span className="text-xl font-black">2</span>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-card border-2 border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Workspace Structure</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsDynamicFieldsOpen(true)}>
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20">
                    <Type className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase">Name & Email</span>
                    <Badge variant="secondary" className="ml-auto text-[8px] uppercase font-black">Required</Badge>
                  </div>
                  {staffCustomFields.map(field => (
                    <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-transparent hover:border-border transition-all">
                      {field.type === 'text' ? <Type className="w-4 h-4 text-primary" /> : 
                       field.type === 'date' ? <CalendarIcon className="w-4 h-4 text-primary" /> : <HashIcon className="w-4 h-4 text-primary" />}
                      <span className="text-[10px] font-black uppercase">{field.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {parsingStep === 'review' && (
          <motion.div 
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="bg-card p-8 rounded-[2.5rem] border-2 border-border shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Review AI Mappings</h2>
                    <p className="text-sm text-muted-foreground font-medium">Cyndi has detected {parsedData.length} records. Confirm the field mapping before import.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => setParsingStep('upload')} className="rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
                  <Button onClick={confirmImport} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-glow">
                    Confirm & Import {parsedData.length} Records
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/10 pb-2">Column Mapping</h3>
                  <div className="space-y-3">
                    {mappings.map((m, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-secondary/10 border-2 border-border/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-muted-foreground">File Column</span>
                          <Badge className={cn(
                            "text-[8px] font-black uppercase",
                            m.confidence === 'High' ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
                          )}>
                            {m.confidence} Confidence
                          </Badge>
                        </div>
                        <p className="text-xs font-black uppercase">{m.fileColumn}</p>
                        <div className="flex items-center gap-2 py-1 text-primary">
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase">Mapped to: {m.mappedTo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/10 pb-2">Record Preview & Tool Assignment</h3>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {parsedData.map((staff, i) => (
                      <div key={i} className="p-6 rounded-[2rem] border-2 border-border bg-card space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center font-black text-primary">
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black uppercase">{staff.name}</p>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{staff.email} • {staff.role} • {staff.department}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] font-black uppercase tracking-widest self-start md:self-center">
                            AI Confidence: {staff.confidence}
                          </Badge>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border/50">
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary">Assigned Workspace Tools (AI Suggested)</p>
                          <div className="flex flex-wrap gap-2">
                            {allTools.map(tool => {
                              const selected = staff.tools.includes(tool.id);
                              const Icon = tool.icon;
                              return (
                                <button
                                  key={tool.id}
                                  onClick={() => toggleParsedStaffTool(staff.id, tool.id)}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all",
                                    selected ? "bg-primary text-white border-primary shadow-sm" : "bg-muted/30 border-transparent hover:border-border text-muted-foreground"
                                  )}
                                >
                                  <Icon className="w-3 h-3 shrink-0" />
                                  <span className="text-[8px] font-black uppercase tracking-tight">{tool.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {parsingStep === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center space-y-8 py-12"
          >
            <div className="w-24 h-24 rounded-[2.5rem] bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center mx-auto shadow-glow shadow-green-500/20">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-black uppercase tracking-tight">Import Successful</h2>
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
                {importStats.created} records have been added to your organisation.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 bg-card p-6 rounded-[2rem] border-2 border-border shadow-sm">
              <div className="text-center">
                <p className="text-2xl font-black text-green-500">{importStats.created}</p>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Created</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-2xl font-black text-primary">{importStats.updated}</p>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Updated</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-muted-foreground">{importStats.skipped}</p>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Skipped</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-8">
              <Button 
                onClick={() => setParsingStep('upload')}
                className="rounded-2xl h-14 px-12 font-black uppercase tracking-widest text-xs bg-primary text-white shadow-glow w-full sm:w-auto"
              >
                View Staff Directory <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                  Undo window active for 10 minutes.
                </p>
                <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-500/10 ml-2">
                  <RotateCcw className="w-3 h-3 mr-1.5" /> Undo Import
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Entry Dialog */}
      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 border-b-2 border-border bg-muted/30">
            <DialogTitle className="text-3xl font-black uppercase tracking-tight">Add Team Member</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 text-primary">
              Manual staff configuration and role assignment
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Full Name <span className="text-primary">*</span></label>
                <Input 
                  placeholder="e.g. John Doe"
                  className="rounded-xl h-12 border-2 font-bold text-sm uppercase tracking-tight"
                  value={newStaff.name}
                  onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Work Email <span className="text-primary">*</span></label>
                <Input 
                  placeholder="john@company.com"
                  className="rounded-xl h-12 border-2 font-bold text-sm"
                  value={newStaff.email}
                  onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Job Title</label>
                <Input 
                  placeholder="e.g. Senior Product Manager"
                  className="rounded-xl h-12 border-2 font-bold text-sm uppercase tracking-tight"
                  value={newStaff.title}
                  onChange={e => setNewStaff({...newStaff, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Department</label>
                <Select value={newStaff.department} onValueChange={(v) => setNewStaff({...newStaff, department: v})}>
                  <SelectTrigger className="rounded-xl h-12 border-2 font-bold text-sm uppercase tracking-tight">
                    <SelectValue placeholder="Select Dept" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR / People</SelectItem>
                    <SelectItem value="new">+ Create New Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-border/50">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Workspace Role</label>
                <Select value={newStaff.role} onValueChange={(v: any) => setNewStaff({...newStaff, role: v})}>
                  <SelectTrigger className="rounded-xl h-12 border-2 font-bold text-sm uppercase tracking-tight">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Director">Director / C-Suite</SelectItem>
                    <SelectItem value="Manager">Manager / Team Lead</SelectItem>
                    <SelectItem value="Employee">Standard Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Start Date</label>
                <Input 
                  type="date"
                  className="rounded-xl h-12 border-2 font-bold text-sm uppercase tracking-tight"
                  value={newStaff.startDate}
                  onChange={e => setNewStaff({...newStaff, startDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t-2 border-border/50">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary">Assigned Modules</label>
                <Button variant="link" className="text-[9px] font-black uppercase p-0 h-auto" onClick={() => setNewStaff({...newStaff, assignedModules: allTools.map(t => t.id)})}>Select All</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allTools.map(tool => {
                  const selected = newStaff.assignedModules.includes(tool.id);
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleModule(tool.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left",
                        selected ? "bg-primary text-white border-primary shadow-glow" : "bg-muted/30 border-transparent hover:border-border"
                      )}
                    >
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-tight truncate">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Custom Fields in Manual Entry */}
            <div className="pt-6 border-t-2 border-border/50 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Custom Information</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
                  onClick={() => setIsDynamicFieldsOpen(true)}
                >
                  <PlusCircle className="w-3 h-3 mr-1.5" /> Add New Box
                </Button>
              </div>
              
              {staffCustomFields.length === 0 ? (
                <div className="p-4 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">No custom boxes added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staffCustomFields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">{field.label}</label>
                      <Input 
                        type={field.type}
                        placeholder={`Enter ${field.label}...`}
                        className="rounded-xl h-12 border-2 font-bold text-sm"
                        onChange={e => setNewStaff({
                          ...newStaff, 
                          customFields: { ...newStaff.customFields, [field.id]: e.target.value }
                        })}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t-2 border-border/50">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Welcome Message (Optional)</label>
              <Textarea 
                placeholder="Write a warm welcome note..."
                className="rounded-xl border-2 min-h-[100px] font-medium text-sm"
                value={newStaff.personalMessage}
                onChange={e => setNewStaff({...newStaff, personalMessage: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/30 border-t-2 border-border">
            <Button variant="ghost" onClick={() => setIsManualOpen(false)} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">Cancel</Button>
            <Button onClick={handleAddManual} className="rounded-xl h-12 px-10 font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-glow">
              Send Invitation <Mail className="ml-2 w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dynamic Fields Customization Dialog */}
      <Dialog open={isDynamicFieldsOpen} onOpenChange={setIsDynamicFieldsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 border-b-2 border-border bg-muted/30">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Custom Data Structure</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest mt-1">
              Add new input fields for staff records
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              {editingFields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border-2 border-transparent hover:border-border transition-all">
                  <div className="flex-1 space-y-3">
                    <Input 
                      className="bg-transparent border-none font-black uppercase tracking-tight h-8 p-0 focus-visible:ring-0 text-sm"
                      value={field.label}
                      onChange={e => {
                        const newFields = [...editingFields];
                        newFields[idx].label = e.target.value;
                        setEditingFields(newFields);
                      }}
                    />
                    <div className="flex items-center gap-4">
                      <Select value={field.type} onValueChange={(v: any) => {
                        const newFields = [...editingFields];
                        newFields[idx].type = v;
                        setEditingFields(newFields);
                      }}>
                        <SelectTrigger className="h-6 border-none bg-transparent p-0 text-[10px] font-bold uppercase text-primary focus:ring-0 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="text">Text Box</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => handleDeleteField(field.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full rounded-2xl h-12 border-2 border-dashed font-black uppercase tracking-widest text-[10px] gap-2"
              onClick={() => setEditingFields([...editingFields, { id: Math.random().toString(), label: 'New Field', type: 'text', required: false }])}
            >
              <PlusCircle className="w-4 h-4" /> Add New Field
            </Button>
          </div>
          <DialogFooter className="p-8 bg-muted/30 border-t-2 border-border">
            <Button variant="ghost" onClick={() => setIsDynamicFieldsOpen(false)} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">Cancel</Button>
            <Button onClick={() => { setStaffCustomFields(editingFields); setIsDynamicFieldsOpen(false); }} className="rounded-xl h-12 px-10 font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-glow">Save Structure</Button>
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
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Delete Field?</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Are you sure you want to remove this custom data box?
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

export default StaffOnboardingPage;

