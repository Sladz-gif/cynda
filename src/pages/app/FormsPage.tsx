import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, Plus, Share2, MoreHorizontal, FileText, Send, Users, 
  ArrowRight, Download, Trash2, Copy, GripVertical, Settings, 
  CheckSquare, Type, List, ChevronDown, Upload, Calendar, Clock, 
  Hash, Layout, Palette, Image as ImageIcon, Zap, Filter, SortAsc, 
  Link as LinkIcon, Database, Grid, Kanban, Calendar as CalendarIcon, 
  GalleryVertical, Eye, FileSpreadsheet, ExternalLink, Code, Save,
  X, CheckCircle2, ChevronRight, Search, Columns, Rows
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// --- Types ---

type QuestionType = 'short_answer' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'linear_scale' | 'date' | 'time';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation?: {
    type: string;
    value: any;
  };
}

interface Form {
  id: string;
  title: string;
  description: string;
  status: 'Draft' | 'Active';
  questions: Question[];
  theme: {
    primaryColor: string;
    font: string;
    headerImage?: string;
  };
  responses: any[];
}

type FieldType = 'text' | 'number' | 'date' | 'attachment' | 'checkbox' | 'dropdown' | 'link';

interface Field {
  id: string;
  name: string;
  type: FieldType;
  options?: string[]; // For dropdown
}

interface Record {
  id: string;
  data: { [key: string]: any };
}

interface Table {
  id: string;
  name: string;
  fields: Field[];
  records: Record[];
  views: {
    id: string;
    name: string;
    type: 'grid' | 'kanban' | 'calendar' | 'gallery';
  }[];
}

interface Base {
  id: string;
  name: string;
  tables: Table[];
}

// --- Mock Initial Data ---

const INITIAL_FORMS: Form[] = [
  {
    id: "1",
    title: "Creative Request Form",
    description: "Submit your design and content requests here.",
    status: "Active",
    questions: [
      { id: "q1", type: "short_answer", title: "Project Name", required: true },
      { id: "q2", type: "paragraph", title: "Description", required: true },
      { id: "q3", type: "multiple_choice", title: "Priority", required: true, options: ["Low", "Medium", "High"] },
    ],
    theme: { primaryColor: "#3b82f6", font: "Inter" },
    responses: [
      { id: "r1", data: { q1: "Logo Redesign", q2: "We need a fresh look.", q3: "High" }, submittedAt: "2024-03-20" },
    ]
  },
  {
    id: "2",
    title: "Bug Report Form",
    description: "Report technical issues or glitches.",
    status: "Active",
    questions: [
      { id: "q1", type: "short_answer", title: "Issue Title", required: true },
      { id: "q2", type: "dropdown", title: "Environment", required: true, options: ["Production", "Staging", "Development"] },
      { id: "q3", type: "file_upload", title: "Screenshot", required: false },
    ],
    theme: { primaryColor: "#ef4444", font: "Inter" },
    responses: []
  }
];

const INITIAL_BASES: Base[] = [
  {
    id: "b1",
    name: "Marketing CRM",
    tables: [
      {
        id: "t1",
        name: "Contacts",
        fields: [
          { id: "f1", name: "Name", type: "text" },
          { id: "f2", name: "Email", type: "text" },
          { id: "f3", name: "Status", type: "dropdown", options: ["Lead", "Customer", "Churned"] },
          { id: "f4", name: "Last Contact", type: "date" },
        ],
        records: [
          { id: "rec1", data: { f1: "John Doe", f2: "john@example.com", f3: "Customer", f4: "2024-03-15" } },
          { id: "rec2", data: { f1: "Jane Smith", f2: "jane@company.com", f3: "Lead", f4: "2024-03-22" } },
        ],
        views: [
          { id: "v1", name: "Main Grid", type: "grid" },
          { id: "v2", name: "Status Kanban", type: "kanban" },
        ]
      }
    ]
  }
];

const FormsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "builder" | "databases" | "responses" | "sharing">("overview");
  
  // Forms State
  const [forms, setForms] = useState<Form[]>(INITIAL_FORMS);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("");

  // Database State
  const [bases, setBases] = useState<Base[]>(INITIAL_BASES);
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeView, setActiveView] = useState<string>("");

  // Navigation Items
  const navItems = [
    { id: "overview", label: "Overview", icon: ClipboardList },
    { id: "builder", label: "Form Builder", icon: Send },
    { id: "databases", label: "Databases", icon: Database },
    { id: "responses", label: "Responses", icon: FileText },
    { id: "sharing", label: "Sharing", icon: Share2 },
  ];

  // --- Form Builder Logic ---

  const handleCreateForm = () => {
    if (!newFormTitle) return;
    const form: Form = {
      id: Math.random().toString(36).substr(2, 9),
      title: newFormTitle,
      description: "New form description",
      status: "Draft",
      questions: [],
      theme: { primaryColor: "#3b82f6", font: "Inter" },
      responses: []
    };
    setForms(prev => [form, ...prev]);
    setSelectedForm(form);
    setActiveTab("builder");
    setIsCreateFormOpen(false);
    setNewFormTitle("");
    toast({ title: "Form Created", description: `"${form.title}" is ready for building.` });
  };

  const addQuestion = (type: QuestionType) => {
    if (!selectedForm) return;
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: "Untitled Question",
      required: false,
      options: ['multiple_choice', 'checkboxes', 'dropdown'].includes(type) ? ["Option 1"] : undefined
    };
    setForms(prev => prev.map(f => f.id === selectedForm.id ? { ...f, questions: [...f.questions, newQuestion] } : f));
    setSelectedForm(prev => prev ? { ...prev, questions: [...prev.questions, newQuestion] } : null);
    toast({ title: "Question Added" });
  };

  const deleteQuestion = (qId: string) => {
    if (!selectedForm) return;
    setForms(prev => prev.map(f => f.id === selectedForm.id ? { ...f, questions: f.questions.filter(q => q.id !== qId) } : f));
    setSelectedForm(prev => prev ? { ...prev, questions: prev.questions.filter(q => q.id !== qId) } : null);
    toast({ title: "Question Deleted", variant: "destructive" });
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    if (!selectedForm) return;
    setForms(prev => prev.map(f => f.id === selectedForm.id ? { 
      ...f, 
      questions: f.questions.map(q => q.id === qId ? { ...q, ...updates } : q) 
    } : f));
    setSelectedForm(prev => prev ? { 
      ...prev, 
      questions: prev.questions.map(q => q.id === qId ? { ...q, ...updates } : q) 
    } : null);
  };

  // --- Database Logic ---

  const addTable = () => {
    if (!selectedBase) return;
    const newTable: Table = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Table",
      fields: [{ id: "f1", name: "Name", type: "text" }],
      records: [],
      views: [{ id: "v1", name: "Grid View", type: "grid" }]
    };
    setBases(prev => prev.map(b => b.id === selectedBase.id ? { ...b, tables: [...b.tables, newTable] } : b));
    setSelectedBase(prev => prev ? { ...prev, tables: [...prev.tables, newTable] } : null);
    setSelectedTable(newTable);
    toast({ title: "Table Added" });
  };

  const addRecord = () => {
    if (!selectedBase || !selectedTable) return;
    const newRecord: Record = {
      id: Math.random().toString(36).substr(2, 9),
      data: {}
    };
    setBases(prev => prev.map(b => b.id === selectedBase.id ? {
      ...b,
      tables: b.tables.map(t => t.id === selectedTable.id ? { ...t, records: [...t.records, newRecord] } : t)
    } : b));
    setSelectedTable(prev => prev ? { ...prev, records: [...prev.records, newRecord] } : null);
    toast({ title: "Record Added" });
  };

  const addField = (type: FieldType) => {
    if (!selectedBase || !selectedTable) return;
    const newField: Field = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Field",
      type
    };
    setBases(prev => prev.map(b => b.id === selectedBase.id ? {
      ...b,
      tables: b.tables.map(t => t.id === selectedTable.id ? { ...t, fields: [...t.fields, newField] } : t)
    } : b));
    setSelectedTable(prev => prev ? { ...prev, fields: [...prev.fields, newField] } : null);
    toast({ title: "Field Added" });
  };

  // --- Render Helpers ---

  const renderQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'short_answer': return <Type className="w-4 h-4" />;
      case 'paragraph': return <AlignLeft className="w-4 h-4" />;
      case 'multiple_choice': return <Circle className="w-4 h-4" />;
      case 'checkboxes': return <CheckSquare className="w-4 h-4" />;
      case 'dropdown': return <ChevronDown className="w-4 h-4" />;
      case 'file_upload': return <Upload className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Forms & Databases</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === 'overview' ? 'Manage your collection forms and data bases.' : 
               activeTab === 'builder' ? 'Design your form structure and logic.' : 
               activeTab === 'databases' ? 'Organize structured data in tables.' : 
               'Analyze submissions and manage responses.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast({ title: "Exporting data..." })}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            {activeTab === 'overview' && (
              <Button size="sm" className="rounded-xl" onClick={() => setIsCreateFormOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> New Form
              </Button>
            )}
            {activeTab === 'databases' && (
              <Button size="sm" className="rounded-xl" onClick={() => toast({ title: "Creating base..." })}>
                <Plus className="w-4 h-4 mr-1.5" /> New Base
              </Button>
            )}
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                  activeTab === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {item.label}
                {activeTab === item.id && (
                  <motion.div layoutId="activeFormsTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div 
              key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {forms.map((form) => (
                  <Card key={form.id} className="group hover:border-primary/30 transition-all cursor-pointer shadow-sm overflow-hidden" onClick={() => { setSelectedForm(form); setActiveTab("builder"); }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <Badge variant={form.status === 'Active' ? 'default' : 'secondary'} className="text-[9px] font-bold uppercase tracking-wider px-1.5">
                          {form.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-4">{form.title}</CardTitle>
                      <CardDescription className="text-xs line-clamp-1">{form.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4 flex items-center justify-between border-t border-border mt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">
                        {form.responses.length} Submissions
                      </p>
                      <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary mt-4">
                        Edit <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                <div 
                  className="rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 hover:bg-secondary/20 transition-colors cursor-pointer text-center group"
                  onClick={() => setIsCreateFormOpen(true)}
                >
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-sm">Create New Form</h3>
                  <p className="text-xs text-muted-foreground mt-1">Build surveys or intake forms</p>
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> Active Databases
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {bases.map(base => (
                    <div 
                      key={base.id} 
                      className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group"
                      onClick={() => { setSelectedBase(base); setSelectedTable(base.tables[0]); setActiveTab("databases"); }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        <Grid className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <h4 className="font-bold text-sm">{base.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{base.tables.length} Tables</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Form Builder Tab */}
          {activeTab === "builder" && (
            <motion.div 
              key="builder" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3 space-y-6">
                {!selectedForm ? (
                  <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/5">
                    <Send className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold">Select a form to start building</h3>
                    <p className="text-sm text-muted-foreground mt-1">Or create a new one from the overview.</p>
                  </div>
                ) : (
                  <>
                    <Card className="border-t-4 border-t-primary shadow-sm">
                      <CardContent className="pt-6 space-y-4">
                        <Input 
                          value={selectedForm.title} 
                          onChange={(e) => setForms(prev => prev.map(f => f.id === selectedForm.id ? { ...f, title: e.target.value } : f))}
                          className="text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0 bg-transparent"
                          placeholder="Form Title"
                        />
                        <Textarea 
                          value={selectedForm.description}
                          onChange={(e) => setForms(prev => prev.map(f => f.id === selectedForm.id ? { ...f, description: e.target.value } : f))}
                          className="text-sm text-muted-foreground border-none px-0 h-auto min-h-[60px] focus-visible:ring-0 resize-none bg-transparent"
                          placeholder="Form description..."
                        />
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      {selectedForm.questions.map((q, idx) => (
                        <Card key={q.id} className="group hover:border-primary/20 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="mt-2 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                  <Input 
                                    value={q.title} 
                                    onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                                    className="font-semibold text-sm h-10 rounded-lg bg-secondary/20"
                                    placeholder="Question Title"
                                  />
                                  <Select value={q.type} onValueChange={(val: any) => updateQuestion(q.id, { type: val })}>
                                    <SelectTrigger className="w-[180px] h-10 rounded-lg">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="short_answer">Short answer</SelectItem>
                                      <SelectItem value="paragraph">Paragraph</SelectItem>
                                      <SelectItem value="multiple_choice">Multiple choice</SelectItem>
                                      <SelectItem value="checkboxes">Checkboxes</SelectItem>
                                      <SelectItem value="dropdown">Dropdown</SelectItem>
                                      <SelectItem value="file_upload">File upload</SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                      <SelectItem value="time">Time</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {['multiple_choice', 'checkboxes', 'dropdown'].includes(q.type) && (
                                  <div className="space-y-2 pl-4 border-l-2 border-secondary">
                                    {q.options?.map((opt, optIdx) => (
                                      <div key={optIdx} className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border border-border" />
                                        <Input 
                                          value={opt} 
                                          onChange={(e) => {
                                            const newOpts = [...(q.options || [])];
                                            newOpts[optIdx] = e.target.value;
                                            updateQuestion(q.id, { options: newOpts });
                                          }}
                                          className="h-8 text-xs border-none focus-visible:ring-0 bg-transparent px-0"
                                        />
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => {
                                          const newOpts = q.options?.filter((_, i) => i !== optIdx);
                                          updateQuestion(q.id, { options: newOpts });
                                        }}>
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary" onClick={() => {
                                      updateQuestion(q.id, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] });
                                    }}>
                                      <Plus className="w-3 h-3 mr-1" /> Add Option
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-2 mr-4 border-r pr-4 border-border">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Required</Label>
                                <Switch checked={q.required} onCheckedChange={(val) => updateQuestion(q.id, { required: val })} size="sm" />
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => addQuestion(q.type)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteQuestion(q.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Builder Sidebar */}
              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Form Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start rounded-xl h-10 text-xs font-bold uppercase tracking-widest" onClick={() => addQuestion('short_answer')}>
                      <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-xl h-10 text-xs font-bold uppercase tracking-widest" onClick={() => toast({ title: "Theme panel opened" })}>
                      <Palette className="w-4 h-4 mr-2" /> Customize Theme
                    </Button>
                    <Button variant="outline" className="w-full justify-start rounded-xl h-10 text-xs font-bold uppercase tracking-widest" onClick={() => toast({ title: "Previewing form..." })}>
                      <Eye className="w-4 h-4 mr-2" /> Preview
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Question Types</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'short_answer', label: 'Short Text', icon: Type },
                      { id: 'paragraph', label: 'Paragraph', icon: FileText },
                      { id: 'multiple_choice', label: 'Multiple Choice', icon: Circle },
                      { id: 'checkboxes', label: 'Checkboxes', icon: CheckSquare },
                      { id: 'dropdown', label: 'Dropdown', icon: ChevronDown },
                      { id: 'file_upload', label: 'File Upload', icon: Upload },
                    ].map(type => (
                      <button 
                        key={type.id} 
                        className="p-3 rounded-lg border border-border bg-secondary/10 hover:border-primary/50 transition-colors text-left"
                        onClick={() => addQuestion(type.id as any)}
                      >
                        <type.icon className="w-4 h-4 text-primary mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-wider block">{type.label}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-sm bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Zap className="w-3 h-3" /> Automation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                      Every submission can automatically create tasks or update database records.
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest border-primary/20 hover:bg-primary/10">
                      Configure Logic
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Databases Tab */}
          {activeTab === "databases" && (
            <motion.div 
              key="databases" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {!selectedBase ? (
                <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/5">
                  <Database className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-bold">Select a base to manage data</h3>
                  <p className="text-sm text-muted-foreground mt-1">Or create a new database base.</p>
                </div>
              ) : (
                <div className="flex flex-col h-[700px] border border-border rounded-2xl bg-card overflow-hidden shadow-lg">
                  {/* Table Toolbar */}
                  <div className="h-14 border-b border-border bg-secondary/10 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-lg">
                        <Database className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold">{selectedBase.name}</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <div className="h-6 w-px bg-border mx-1" />
                      <div className="flex items-center gap-1">
                        {selectedBase.tables.map(t => (
                          <button 
                            key={t.id} 
                            onClick={() => setSelectedTable(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              selectedTable?.id === t.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-background/50"
                            }`}
                          >
                            {t.name}
                          </button>
                        ))}
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={addTable}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="h-9 rounded-xl text-xs font-bold uppercase tracking-widest" onClick={() => toast({ title: "Form view created" })}>
                        <Layout className="w-4 h-4 mr-2" /> Create Form View
                      </Button>
                      <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs font-bold uppercase tracking-widest" onClick={() => toast({ title: "Sharing base..." })}>
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </Button>
                    </div>
                  </div>

                  {/* Grid Toolbar */}
                  <div className="h-12 border-b border-border bg-background flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <Grid className="w-4 h-4" /> Views
                        <ChevronDown className="w-3 h-3" />
                      </div>
                      <div className="h-4 w-px bg-border mx-1" />
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
                          <Filter className="w-3.5 h-3.5" /> Filter
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
                          <SortAsc className="w-3.5 h-3.5" /> Sort
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
                          <Users className="w-3.5 h-3.5" /> Group
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input placeholder="Search records..." className="pl-8 h-8 text-xs rounded-lg w-48 bg-secondary/20 border-none focus-visible:ring-1" />
                      </div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <ScrollArea className="flex-1">
                    <div className="min-w-full inline-block align-middle">
                      <table className="min-w-full divide-y divide-border border-collapse">
                        <thead>
                          <tr className="bg-secondary/5">
                            <th className="w-10 px-2 py-3 border-r border-border sticky left-0 bg-secondary/5 z-10">
                              <div className="w-4 h-4 border border-border rounded" />
                            </th>
                            {selectedTable?.fields.map(field => (
                              <th key={field.id} className="px-4 py-3 text-left border-r border-border group relative">
                                <div className="flex items-center gap-2">
                                  {field.type === 'text' && <Type className="w-3 h-3 text-muted-foreground" />}
                                  {field.type === 'number' && <Hash className="w-3 h-3 text-muted-foreground" />}
                                  {field.type === 'date' && <Calendar className="w-3 h-3 text-muted-foreground" />}
                                  {field.type === 'dropdown' && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                                  <span className="text-[10px] font-bold uppercase tracking-widest">{field.name}</span>
                                </div>
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </th>
                            ))}
                            <th className="px-4 py-3 text-left w-12 group">
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={() => addField('text')}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {selectedTable?.records.map((record, idx) => (
                            <tr key={record.id} className="hover:bg-secondary/10 transition-colors group">
                              <td className="px-2 py-3 border-r border-border sticky left-0 bg-background group-hover:bg-secondary/10 z-10 text-center text-[10px] font-bold text-muted-foreground">
                                {idx + 1}
                              </td>
                              {selectedTable.fields.map(field => (
                                <td key={field.id} className="px-4 py-3 border-r border-border text-xs truncate max-w-[200px]">
                                  <Input 
                                    value={record.data[field.id] || ""} 
                                    onChange={(e) => {
                                      const newData = { ...record.data, [field.id]: e.target.value };
                                      setBases(prev => prev.map(b => b.id === selectedBase.id ? {
                                        ...b,
                                        tables: b.tables.map(t => t.id === selectedTable.id ? {
                                          ...t,
                                          records: t.records.map(r => r.id === record.id ? { ...r, data: newData } : r)
                                        } : t)
                                      } : b));
                                      setSelectedTable(prev => prev ? {
                                        ...prev,
                                        records: prev.records.map(r => r.id === record.id ? { ...r, data: newData } : r)
                                      } : null);
                                    }}
                                    className="h-7 border-none bg-transparent px-0 focus-visible:ring-0 text-xs"
                                    placeholder="Empty"
                                  />
                                </td>
                              ))}
                              <td className="px-4 py-3">
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => {
                                  setBases(prev => prev.map(b => b.id === selectedBase.id ? {
                                    ...b,
                                    tables: b.tables.map(t => t.id === selectedTable.id ? {
                                      ...t,
                                      records: t.records.filter(r => r.id !== record.id)
                                    } : t)
                                  } : b));
                                  setSelectedTable(prev => prev ? {
                                    ...prev,
                                    records: prev.records.filter(r => r.id !== record.id)
                                  } : null);
                                  toast({ title: "Record Deleted", variant: "destructive" });
                                }}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td className="px-2 py-3 border-r border-border sticky left-0 bg-background z-10" />
                            <td colSpan={selectedTable?.fields.length || 1} className="px-4 py-3">
                              <button 
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                                onClick={addRecord}
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Record
                              </button>
                            </td>
                            <td />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </motion.div>
          )}

          {/* Responses Tab */}
          {activeTab === "responses" && (
            <motion.div 
              key="responses" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                      <CardTitle className="text-lg">Recent Responses</CardTitle>
                      <CardDescription className="text-xs">Summary of all form submissions across the platform.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-bold uppercase tracking-widest">
                      <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> View Spreadsheet
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {forms.flatMap(f => f.responses.map(r => ({ ...r, formTitle: f.title }))).map((resp, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{resp.formTitle}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{resp.submittedAt}</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{Object.values(resp.data)[0] as string}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Analytics Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-muted-foreground">Completion Rate</span>
                          <span className="text-primary">84%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[84%]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-muted-foreground">Avg. Time to Fill</span>
                          <span className="text-primary">2m 45s</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[65%]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm bg-accent/5 border-accent/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                        <ExternalLink className="w-3 h-3" /> External Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start rounded-xl h-9 text-[10px] font-bold uppercase tracking-widest border-accent/20">
                        <ImageIcon className="w-3.5 h-3.5 mr-2" /> Sync to Google Sheets
                      </Button>
                      <Button variant="outline" className="w-full justify-start rounded-xl h-9 text-[10px] font-bold uppercase tracking-widest border-accent/20">
                        <Zap className="w-3.5 h-3.5 mr-2" /> Export to Airtable
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sharing Tab */}
          {activeTab === "sharing" && (
            <motion.div 
              key="sharing" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="max-w-3xl mx-auto space-y-8 py-12"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <Share2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold">Share Your Form</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Distribute your form to collect responses. You can share via link, email, or embed it on your website.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm border-primary/20 bg-primary/5">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm">Direct Link</h4>
                    </div>
                    <div className="flex gap-2">
                      <Input value="https://cynda.app/f/creative-req" readOnly className="h-9 text-xs rounded-lg" />
                      <Button size="sm" className="rounded-lg h-9" onClick={() => toast({ title: "Link copied!" })}>Copy</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <Code className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <h4 className="font-bold text-sm">Embed Code</h4>
                    </div>
                    <Button variant="outline" className="w-full rounded-lg h-9 text-xs font-bold uppercase tracking-widest" onClick={() => toast({ title: "Embed code copied!" })}>
                      Copy HTML Snippet
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Sharing Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Public Access</p>
                      <p className="text-[10px] text-muted-foreground">Anyone with the link can submit the form.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Collect Emails</p>
                      <p className="text-[10px] text-muted-foreground">Require users to sign in to submit.</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Allow Multiple Submissions</p>
                      <p className="text-[10px] text-muted-foreground">Users can submit the form more than once.</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Dialogs */}
      <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>Give your form a title to start building.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Form Title</Label>
              <Input
                id="title"
                placeholder="e.g. Marketing Intake Form"
                value={newFormTitle}
                onChange={(e) => setNewFormTitle(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsCreateFormOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={handleCreateForm}>Create & Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Missing Icons ---
const AlignLeft = (props: any) => <Type {...props} />;
const Circle = (props: any) => <div {...props} className={`rounded-full border border-current ${props.className}`} />;

export default FormsPage;
