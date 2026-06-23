import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, Search, MoreHorizontal, DollarSign, Phone, Mail, ChevronRight, X, 
  Calendar, TrendingUp, Clock, User, UserPlus, Building2, Activity, Filter, 
  LayoutDashboard, Users, Kanban, ClipboardList, FileText, MessageSquare, 
  Zap, BarChart3, Ticket, BookOpen, CreditCard, Puzzle, ArrowRight,
  ChevronDown, CheckCircle2, Star, MailOpen, Send, Bot, Share2, Download,
  MoreVertical, Edit, Trash2, Upload, Settings, ShieldCheck, FileSpreadsheet, History, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn, exportToCSV } from "@/lib/utils";
import { useIndustryStore, CRMContact, CRMCompany, CRMDeal } from "@/lib/industry-store";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
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
} from "@/components/ui/dropdown-menu";

// --- Types ---

type CRMTab = 
  | "crm" 
  | "contacts" | "companies" | "marketing" | "crm-automation" | "reports" | "deals" | "import-history";

type CRMCampaign = {
  id: string;
  title: string;
  status: "Running" | "Scheduled" | "Completed" | "Draft";
  sent: string;
  opens: string;
  clicks: string;
};

type CRMWorkflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "Active" | "Paused";
  lastRun: string;
};

type CRMReport = {
  id: string;
  name: string;
  type: "Sales" | "Marketing" | "Activity";
  lastGenerated: string;
  createdBY: string;
};

// --- Mock Data ---

const initialDeals: CRMDeal[] = [];

const initialCampaigns: CRMCampaign[] = [];

const initialWorkflows: CRMWorkflow[] = [];

const initialReports: CRMReport[] = [];

const revenueData: { name: string; revenue: number }[] = [];

import { triggerAutomation } from "@/lib/automationEngine";
import { transactionService } from "@/lib/transactionService";

const CRMPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentUser, 
    adminProfile, 
    staffList, 
    userType, 
    selectedModules = [],
    crmContacts = [],
    crmCompanies = [],
    crmDeals = [],
    addCRMContact,
    addCRMCompany,
    addCRMDeal,
    updateCRMDeal,
    deleteCRMContact,
    deleteCRMCompany,
    deleteCRMDeal,
    addProject,
  } = useIndustryStore();
  
  const activeUser = currentUser || adminProfile;
  const isDeptHead = activeUser?.role === 'Super Admin' || activeUser?.role?.includes('Director') || activeUser?.role?.includes('Manager');
  
  // Two-step Delete Confirmation
  const [isDeleteModal1Open, setIsDeleteModal1Open] = useState(false);
  const [isDeleteModal2Open, setIsDeleteModal2Open] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: string } | null>(null);

  const handleDeleteItem = (id: string, type: string) => {
    setItemToDelete({ id, type });
    setIsDeleteModal1Open(true);
  };

  const confirmDeleteStep1 = () => {
    setIsDeleteModal1Open(false);
    setIsDeleteModal2Open(true);
  };

  const finalizeDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'contact') {
        deleteCRMContact(itemToDelete.id);
      } else if (itemToDelete.type === 'company') {
        deleteCRMCompany(itemToDelete.id);
      } else if (itemToDelete.type === 'deal') {
        deleteCRMDeal(itemToDelete.id);
      }
      setIsDeleteModal2Open(false);
      setItemToDelete(null);
      toast({ title: `${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} deleted`, description: "The item has been permanently removed." });
    }
  };

  const allNavItems = useMemo(() => [
    { id: "crm", label: "Dashboard", icon: LayoutDashboard },
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "deals", label: "Pipeline", icon: Kanban },
    { id: "marketing", label: "Marketing", icon: ClipboardList },
    { id: "crm-automation", label: "Automation", icon: Zap },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "import-history", label: "Import Logs", icon: History },
  ], []);

  const navItems = useMemo(() => {
    // If Admin or Solo user, show everything
    if (isDeptHead || userType === 'solo') return allNavItems;
    
    // For regular users, show based on effective tools
    const safeModules = Array.isArray(selectedModules) ? selectedModules : [];
    const filtered = allNavItems.filter(item => {
      if (item.id === 'crm') return true; // Always show dashboard
      return safeModules.includes(item.id);
    });
    return filtered;
  }, [selectedModules, isDeptHead, userType, allNavItems]);

  const [tab, setTab] = useState<string>(navItems[0]?.id || "crm");

  useEffect(() => {
    const raw = location.pathname.split("/app/")[1] || "dashboard";
    const segment = raw.split("/")[0] || "dashboard";
    const fromRoute = segment === "crm" ? "crm" : segment;
    if (navItems.some((i) => i.id === fromRoute) && fromRoute !== tab) {
      setTab(fromRoute as CRMTab);
    }
  }, [location.pathname, tab, navItems]);

  const goToTab = (id: CRMTab) => {
    const url = id === "crm" ? "/app/crm" : `/app/${id}`;
    navigate(url);
  };
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data State
  const [campaigns, setCampaigns] = useState<CRMCampaign[]>(initialCampaigns);
  const [workflows, setWorkflows] = useState<CRMWorkflow[]>(initialWorkflows);
  const [reports, setReports] = useState<CRMReport[]>(initialReports);
  
  // Modals for Quick Add
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);

  const [newContact, setNewContact] = useState<Partial<CRMContact>>({ name: "", email: "", status: 'Lead' });
  const [newCompany, setNewCompany] = useState<Partial<CRMCompany>>({ name: "", industry: "", status: 'Lead', size: '1-10' });
  const [newDeal, setNewDeal] = useState<Partial<CRMDeal>>({ title: "", value: 0, stage: 'Lead', probability: 10 });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) return;
    addCRMContact({
      id: Math.random().toString(36).substr(2, 9),
      name: newContact.name,
      email: newContact.email,
      status: newContact.status as any,
      phone: newContact.phone,
      companyId: newContact.companyId,
      role: newContact.role
    });
    setIsAddContactOpen(false);
    setNewContact({ name: "", email: "", status: 'Lead' });
    toast({ title: "Contact Added", description: `${newContact.name} has been added to your database.` });
  };

  const handleAddCompany = () => {
    if (!newCompany.name) return;
    addCRMCompany({
      id: Math.random().toString(36).substr(2, 9),
      name: newCompany.name,
      industry: newCompany.industry || "General",
      status: newCompany.status as any,
      size: newCompany.size || "1-10",
      website: newCompany.website
    });
    setIsAddCompanyOpen(false);
    setNewCompany({ name: "", industry: "", status: 'Lead', size: '1-10' });
    toast({ title: "Company Added", description: `${newCompany.name} has been added to your database.` });
  };

  const handleAddDeal = () => {
    if (!newDeal.title || !newDeal.companyId) return;
    addCRMDeal({
      id: Math.random().toString(36).substr(2, 9),
      title: newDeal.title,
      companyId: newDeal.companyId,
      value: newDeal.value || 0,
      stage: newDeal.stage as any,
      probability: newDeal.probability || 10,
      contactId: newDeal.contactId
    });
    setIsAddDealOpen(false);
    setNewDeal({ title: "", value: 0, stage: 'Lead', probability: 10 });
    toast({ title: "Deal Created", description: `"${newDeal.title}" added to pipeline.` });
  };

  const pipelineStages = [
    { name: "Lead", color: "bg-slate-400" },
    { name: "Qualified", color: "bg-primary" },
    { name: "Proposal", color: "bg-blue-500" },
    { name: "Negotiation", color: "bg-blue-600" },
    { name: "Closed Won", color: "bg-green-500" },
  ];

  const moveDeal = (id: string, stage: string) => {
    updateCRMDeal(id, { stage: stage as any });
    toast({ title: "Deal Stage Updated", description: `Moved to ${stage}` });
    
    const deal = crmDeals.find(d => d.id === id);
    if (deal) {
      if (stage === "Closed Won" && deal.stage !== "Closed Won") {
        const companyName = crmCompanies.find(c => c.id === deal.companyId)?.name || 'Unknown Company';
        transactionService.createGhostInvoiceFromDeal(deal, companyName);
        
        // Auto-create project
        addProject({
          id: `proj_${Date.now()}`,
          name: `Project: ${deal.title}`,
          status: 'Planning',
          completion: 0
        });

        toast({ 
          title: "Closed Won! 🚀", 
          description: `Invoice created and a new project has been added for ${companyName}.`,
        });
      }
      // Trigger Automation
      triggerAutomation('deal_stage_changed', { deal: { ...deal, stage } });
    }
  };
  
  // Modal state
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [isAddWorkflowOpen, setIsAddWorkflowOpen] = useState(false);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);
  const [isDealDetailOpen, setIsDealDetailOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<CRMDeal | null>(null);
  
  // Migration State
  const [migrationStep, setMigrationStep] = useState(1);
  const [migrationFile, setMigrationFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mappings, setMappings] = useState<any[]>([]);
  const [importStats, setImportStats] = useState({ created: 0, updated: 0, skipped: 0 });
  const [undoImportId, setUndoImportId] = useState<string | null>(null);

  const [newCampaign, setNewCampaign] = useState({ title: "", status: "Draft" as const });
  const [newWorkflow, setNewWorkflow] = useState({ name: "", trigger: "", action: "" });
  const [newReport, setNewReport] = useState({ name: "", type: "Sales" as const });

  const handleExport = () => {
    let data: any[] = [];
    const filename = `crm_${tab}`;
    
    if (tab === 'contacts') data = filteredContacts;
    else if (tab === 'companies') data = filteredCompanies;
    else if (tab === 'deals') data = crmDeals;
    else if (tab === 'marketing') data = campaigns;
    else if (tab === 'crm-automation') data = workflows;
    else if (tab === 'reports') data = reports;
    
    if (data.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }
    
    exportToCSV(data, filename);
    toast({ 
      title: "Export Successful", 
      description: `Your ${tab} data has been exported as CSV.` 
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMigrationFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple CSV/Text preview
      const lines = text.split('\n').slice(0, 5);
      console.log("Migration file preview:", lines);
      
      setIsProcessing(false);
      setMigrationStep(2);
      setMappings([
        { id: "1", fileColumn: "Name/Title", interpretedAs: "Name", destination: "Contacts", status: "mapped" },
        { id: "2", fileColumn: "Email/Contact", interpretedAs: "Email", destination: "Contacts", status: "mapped" },
        { id: "3", fileColumn: "Company/Account", interpretedAs: "Company", destination: "Companies", status: "mapped" },
        { id: "4", fileColumn: "Value/Revenue", interpretedAs: "Value", destination: "Deals", status: "mapped" },
      ]);
    };
    reader.readAsText(file);
  };

  const handleUpdateMapping = (id: string, interpretedAs: string, destination: string) => {
    setMappings(mappings.map(m => m.id === id ? { ...m, interpretedAs, destination, status: destination === 'Skip' ? 'unmapped' : 'mapped' } : m));
  };

  const handleImport = () => {
    setIsProcessing(true);
    
    // In a real application, this would parse the CSV file and send to API
    setTimeout(() => {
      setIsProcessing(false);
      toast({ 
        title: "Import Complete", 
        description: "Your data has been processed." 
      });
      setIsMigrationOpen(false);
    }, 2000);
  };

  const handleUndoImport = () => {
    setIsProcessing(true);
    // In a real application, this would call an API to delete the last import
    setTimeout(() => {
      setIsProcessing(false);
      setUndoImportId(null);
      setIsUndoModalOpen(false);
      setMigrationStep(1);
      toast({ title: "Migration Reversed", description: "All records from the last import have been removed." });
    }, 1500);
  };

  const handleShareReport = (name: string) => {
    toast({ title: "Report Shared", description: `${name} has been shared with your team.` });
  };

  const handleDownloadReport = (name: string) => {
    toast({ title: "Download Started", description: `Downloading ${name}...` });
  };

  const handleQuickAction = (action: string, contact: string) => {
    toast({ 
      title: `${action} Initialized`, 
      description: `Opening ${action.toLowerCase()} interface for ${contact}.` 
    });
  };

  const handleAddWorkflow = () => {
    if (!newWorkflow.name) return;
    const workflow: CRMWorkflow = {
      id: Math.random().toString(36).substr(2, 9),
      ...newWorkflow,
      status: "Active",
      lastRun: "Never"
    };
    setWorkflows([workflow, ...workflows]);
    setIsAddWorkflowOpen(false);
    setNewWorkflow({ name: "", trigger: "", action: "" });
    toast({ title: "Workflow Created" });
  };

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(workflows.map(w => 
      w.id === id ? { ...w, status: w.status === "Active" ? "Paused" : "Active" } : w
    ));
    toast({ title: "Workflow Status Updated" });
  };

  const handleAddReport = () => {
    if (!newReport.name) return;
    const report: CRMReport = {
      id: Math.random().toString(36).substr(2, 9),
      ...newReport,
      lastGenerated: "Just now",
      createdBY: "Me"
    };
    setReports([report, ...reports]);
    setIsAddReportOpen(false);
    setNewReport({ name: "", type: "Sales" });
    toast({ title: "Report Created" });
  };

  const handleAddCampaign = () => {
    if (!newCampaign.title) return;
    const campaign: CRMCampaign = {
      id: Math.random().toString(36).substr(2, 9),
      title: newCampaign.title,
      status: "Draft",
      sent: "0",
      opens: "0",
      clicks: "0"
    };
    setCampaigns([campaign, ...campaigns]);
    setIsAddCampaignOpen(false);
    setNewCampaign({ title: "", status: "Draft" });
    toast({ title: "Campaign Created" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold">CRM</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your entire customer lifecycle in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl h-9 border-2 font-black uppercase tracking-widest text-[9px] whitespace-nowrap" 
              onClick={() => {
                if (!isDeptHead) {
                  toast({ title: "Access Denied", description: "Only department heads can migrate data.", variant: "destructive" });
                  return;
                }
                setIsMigrationOpen(true);
              }}
            >
              <Upload className="w-3.5 h-3.5 mr-2" /> Data Migration
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl h-9 whitespace-nowrap" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            {tab === "marketing" && <Button size="sm" className="rounded-xl h-9 whitespace-nowrap" onClick={() => setIsAddCampaignOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Campaign</Button>}
            {tab === "crm-automation" && <Button size="sm" className="rounded-xl h-9 whitespace-nowrap" onClick={() => setIsAddWorkflowOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Workflow</Button>}
            {tab === "reports" && <Button size="sm" className="rounded-xl h-9 whitespace-nowrap" onClick={() => setIsAddReportOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Report</Button>}
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => goToTab(item.id as CRMTab)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                      tab === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {item.label}
                    {tab === item.id && (
                      <motion.div layoutId="activeCrmTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                );
              })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {tab === "crm" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Lead Growth", value: "0", change: "0%", Icon: TrendingUp, color: "text-green-500" },
                  { label: "Active Campaigns", value: (campaigns || []).filter(c => c.status === 'Running').length, change: "0", Icon: Zap, color: "text-primary" },
                  { label: "Engagement Rate", value: "0%", change: "0%", Icon: Activity, color: "text-accent" },
                ].map((stat) => {
                  const StatIcon = stat.Icon;
                  return (
                    <div key={stat.label} className="p-5 rounded-xl border border-border bg-card shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        {StatIcon && (
                          <div className={`p-2 rounded-lg bg-secondary/50 ${stat.color}`}>
                            <StatIcon className="w-5 h-5" />
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{stat.change}</span>
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                  );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Revenue Growth</h3>
                <div className="h-[250px] w-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-muted-foreground opacity-50" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No revenue data available</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Recent Interactions</h3>
                <div className="space-y-4">
                  {[].length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center mb-3">
                        <MessageSquare className="w-6 h-6 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No recent activity</p>
                    </div>
                  ) : [].map((act, i) => {
                    const ActIcon = act.Icon;
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => handleQuickAction(act.type.charAt(0).toUpperCase() + act.type.slice(1), act.contact)}>
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                          {ActIcon && <ActIcon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">{act.contact}</p>
                          <p className="text-xs text-muted-foreground">{act.action}</p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{act.time}</span>
                      </div>
                    );
                  })}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-[10px] font-bold uppercase tracking-widest text-primary" onClick={() => setTab("crm-automation")}>View All Activity</Button>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "contacts" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search contacts..." 
                  className="pl-10 h-11 rounded-xl bg-card border-2 border-border focus-visible:border-primary/30 transition-all font-bold text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-2 uppercase font-black tracking-widest text-[9px] h-11">
                  <Filter className="w-3.5 h-3.5 mr-2" /> Filters
                </Button>
                <Button onClick={() => setIsAddContactOpen(true)} className="flex-1 sm:flex-none rounded-xl shadow-glow h-11 px-6 uppercase font-black tracking-widest text-[9px]">
                  <Plus className="w-4 h-4 mr-2" /> Add Contact
                </Button>
              </div>
            </div>

            <div className="rounded-[32px] border-2 border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 whitespace-nowrap">
                      <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">Name</th>
                      <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">Company</th>
                      <th className="hidden md:table-cell px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">Role</th>
                      <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="group hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-xl border border-border">
                              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">{contact.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight">{contact.name}</p>
                              <p className="text-[10px] font-bold text-muted-foreground lowercase tracking-widest">{contact.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-foreground uppercase tracking-tight whitespace-nowrap">
                            {crmCompanies.find(c => c.id === contact.companyId)?.name || ""}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{contact.role || ""}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-none",
                            contact.status === 'Active' ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"
                          )}>
                            {contact.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem 
                                className="text-[10px] font-black uppercase tracking-widest p-2 rounded-lg cursor-pointer"
                                onClick={() => {
                                  navigate(`/app/chat?contactId=${contact.id}`);
                                }}
                              >
                                Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest p-2 rounded-lg cursor-pointer">Edit Contact</DropdownMenuItem>
                              <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest p-2 rounded-lg cursor-pointer">Create Deal</DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-[10px] font-black uppercase tracking-widest p-2 rounded-lg cursor-pointer text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteItem(contact.id, 'contact');
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "companies" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search companies..." 
                  className="pl-10 h-11 rounded-xl bg-card border-2 border-border focus-visible:border-primary/30 transition-all font-bold text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl border-2 uppercase font-black tracking-widest text-[9px] h-11">
                  <Filter className="w-3.5 h-3.5 mr-2" /> Filters
                </Button>
                <Button onClick={() => setIsAddCompanyOpen(true)} className="rounded-xl shadow-glow h-11 px-6 uppercase font-black tracking-widest text-[9px]">
                  <Plus className="w-4 h-4 mr-2" /> Add Company
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <motion.div 
                  key={company.id}
                  layout
                  className="p-6 rounded-[32px] border-2 border-border bg-card hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <Badge className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-none",
                      company.status === 'Client' ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"
                    )}>
                      {company.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-foreground">{company.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{company.industry}</span>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Deals</p>
                      <p className="text-sm font-black text-foreground">
                        {crmDeals.filter(d => d.companyId === company.id).length}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "deals" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input placeholder="Search deals..." className="h-9 pl-8 pr-3 text-xs bg-secondary/30 rounded-xl border-none focus:ring-1 focus:ring-primary w-full" />
                </div>
                <Button variant="outline" size="sm" className="rounded-xl h-9 text-[10px] font-bold uppercase tracking-widest"><Filter className="w-3.5 h-3.5 mr-1.5" /> Filter</Button>
              </div>
              <Button size="sm" onClick={() => setIsAddDealOpen(true)} className="rounded-xl h-9 bg-primary text-white shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-1.5" /> New Deal</Button>
            </div>

            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:-mx-2 sm:px-2 snap-x snap-mandatory">
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="w-[280px] sm:w-80 flex-shrink-0 snap-center">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                      <span className="text-xs font-black uppercase tracking-widest text-foreground">{stage.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-bold text-muted-foreground">
                        {crmDeals.filter(d => d.stage === stage.name).length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 min-h-[500px]">
                    {crmDeals.filter(d => d.stage === stage.name).map((deal) => (
                      <motion.div
                        key={deal.id}
                        layout
                        className="group rounded-2xl border-2 border-border bg-card p-5 cursor-pointer hover:border-primary/40 hover:shadow-xl transition-all relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <p className="text-sm font-black text-foreground uppercase tracking-tight leading-none">
                            {crmCompanies.find(c => c.id === deal.companyId)?.name || "Unknown Company"}
                          </p>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-border bg-secondary/30">{deal.probability}%</Badge>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{deal.title}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <p className="text-lg font-display font-black text-primary">${deal.value.toLocaleString()}</p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest">Move to Stage</DropdownMenuLabel>
                                {pipelineStages.map(s => (
                                  <DropdownMenuItem 
                                    key={s.name} 
                                    onClick={() => moveDeal(deal.id, s.name)}
                                    className="text-[10px] font-black uppercase tracking-widest p-2 rounded-lg cursor-pointer"
                                  >
                                    {s.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <button onClick={() => setIsAddDealOpen(true)} className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all bg-secondary/30 hover:bg-secondary/50 rounded-2xl border-2 border-dashed border-border mt-2">
                      <Plus className="w-3.5 h-3.5" /> Add Deal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "marketing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Campaigns", value: (campaigns || []).filter(c => c.status === 'Running').length, change: "+2", Icon: Zap },
                { label: "Avg. Open Rate", value: "32.4%", change: "+4.1%", Icon: MailOpen },
                { label: "New Leads", value: "142", change: "+12%", Icon: UserPlus },
                { label: "Click Rate", value: "4.8%", change: "+0.5%", Icon: TrendingUp },
              ].map((stat) => {
                const StatIcon = stat.Icon;
                return (
                  <div key={stat.label} className="p-4 rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      {StatIcon && <StatIcon className="w-4 h-4 text-primary" />}
                      <span className="text-[10px] font-bold text-green-600">+{stat.change}</span>
                    </div>
                    <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest">Recent Campaigns</h3>
                <Button size="sm" className="rounded-xl" onClick={() => setIsAddCampaignOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Create Campaign</Button>
              </div>
              <div className="divide-y divide-border">
                {(campaigns || []).length > 0 ? (campaigns || []).map((camp) => (
                  <div key={camp.id} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/5 transition-colors group">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{camp.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                          camp.status === 'Running' ? 'bg-green-500/10 text-green-600' :
                          camp.status === 'Scheduled' ? 'bg-primary/10 text-primary' :
                          camp.status === 'Completed' ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
                        }`}>{camp.status}</span>
                        <span className="text-[10px] text-muted-foreground">Sent to {camp.sent} recipients</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 mr-12 text-center">
                      <div>
                        <p className="text-sm font-bold text-foreground">{camp.opens}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Opens</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{camp.clicks}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Clicks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleQuickAction("Analytics", camp.title); }}><BarChart3 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleQuickAction("Edit", camp.title); }}><Edit className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center">
                    <p className="text-sm text-muted-foreground">No campaigns found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "crm-automation" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Active Workflows", value: (workflows || []).filter(w => w.status === 'Active').length, Icon: Zap, color: "text-primary" },
                { label: "Triggers Today", value: "142", Icon: Activity, color: "text-green-500" },
                { label: "Success Rate", value: "99.8%", Icon: CheckCircle2, color: "text-accent" },
              ].map((stat) => {
                const StatIcon = stat.Icon;
                return (
                  <div key={stat.label} className="p-5 rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-secondary/50 ${stat.color}`}>
                        {StatIcon && <StatIcon className="w-5 h-5" />}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    </div>
                    <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest">Workflow Builder</h3>
                <Button size="sm" className="rounded-xl" onClick={() => setIsAddWorkflowOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Create Workflow</Button>
              </div>
              <div className="divide-y divide-border">
                {(workflows || []).length > 0 ? (workflows || []).map((wf) => (
                  <div key={wf.id} className="p-5 flex items-center gap-6 hover:bg-secondary/5 transition-colors group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${wf.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-bold text-foreground">{wf.name}</p>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${wf.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                          {wf.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5"><span className="text-primary uppercase font-bold text-[9px]">When:</span> {wf.trigger}</div>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <div className="flex items-center gap-1.5"><span className="text-primary uppercase font-bold text-[9px]">Then:</span> {wf.action}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Last Run</p>
                        <p className="text-xs font-bold">{wf.lastRun}</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-bold uppercase" onClick={() => toggleWorkflowStatus(wf.id)}>
                        {wf.status === 'Active' ? 'Pause' : 'Resume'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><Settings className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center">
                    <p className="text-sm text-muted-foreground">No workflows found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Deal Conversion Trends</h3>
                    <Select defaultValue="30d">
                      <SelectTrigger className="w-[120px] h-8 text-xs rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="90d">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-md)' }}
                          cursor={{ fill: 'hsl(var(--secondary)/0.2)' }}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Custom Reports</h3>
                    <Button size="sm" variant="outline" className="rounded-xl h-8" onClick={() => setIsAddReportOpen(true)}><Plus className="w-3.5 h-3.5 mr-1.5" /> Build Report</Button>
                  </div>
                  <div className="divide-y divide-border">
                    {(reports || []).length > 0 ? (reports || []).map((report) => (
                      <div key={report.id} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{report.name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{report.type}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="text-[10px] text-muted-foreground">Generated {report.lastGenerated}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary" onClick={(e) => { e.stopPropagation(); handleDownloadReport(report.name); }}><Download className="w-3.5 h-3.5 mr-1.5" /> Export</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleShareReport(report.name); }}><Share2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center">
                        <p className="text-sm text-muted-foreground">No reports found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Pipeline Value</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Lead', value: 12000, color: '#94a3b8' },
                            { name: 'Qualified', value: 39000, color: 'hsl(var(--primary))' },
                            { name: 'Proposal', value: 42000, color: '#3b82f6' },
                            { name: 'Negotiation', value: 68000, color: '#2563eb' },
                          ]}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                          {[0,1,2,3].map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#94a3b8', 'hsl(var(--primary))', '#3b82f6', '#2563eb'][index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-4">
                    {[
                      { label: 'Lead', val: '$12k', color: 'bg-slate-400' },
                      { label: 'Qualified', val: '$39k', color: 'bg-primary' },
                      { label: 'Proposal', val: '$42k', color: 'bg-blue-500' },
                      { label: 'Negotiation', val: '$68k', color: 'bg-blue-600' },
                    ].map((p) => (
                      <div key={p.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${p.color}`} />
                          <span className="text-xs font-medium text-muted-foreground">{p.label}</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">{p.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card shadow-sm bg-primary/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Bot className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary">AI Insight</h3>
                  </div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    Sales velocity has increased by <span className="text-primary font-bold">14%</span> this month. Based on current trends, you are projected to exceed your Q1 target by <span className="text-primary font-bold">$22,500</span>.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-[10px] font-bold uppercase tracking-widest mt-4">Read Full Analysis <ArrowRight className="w-3 h-3 ml-1.5" /></Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "import-history" && (
          <div key="import-history" className="space-y-6">
            <div className="rounded-2xl border-2 border-border bg-card overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Migration Logs</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Review past data imports and mapping history</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                    {importHistory.length} Imports Saved
                  </div>
                </div>
              </div>
              <div className="divide-y divide-border">
                {importHistory.length > 0 ? importHistory.map((log) => (
                  <div key={log.id} className="p-8 hover:bg-secondary/5 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-card border-2 border-border flex items-center justify-center text-primary shadow-sm">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black uppercase tracking-tight text-foreground">{log.fileName}</h4>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span>{log.date}</span>
                            <span className="w-1 h-1 rounded-full bg-muted" />
                            <span>Imported by {log.importedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="flex gap-6">
                          <div className="text-center">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Created</p>
                            <p className="text-lg font-black text-primary">{log.created}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Updated</p>
                            <p className="text-lg font-black text-foreground">{log.updated}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Skipped</p>
                            <p className="text-lg font-black text-muted-foreground">{log.skipped}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 rounded bg-green-500/10 text-green-600 border border-green-500/20 text-[9px] font-black uppercase tracking-widest">
                          {log.status}
                        </div>
                      </div>
                    </div>
                    
                    {/* Expandable Mappings Info */}
                    <div className="mt-8 pt-6 border-t border-dashed border-border grid grid-cols-2 md:grid-cols-3 gap-4">
                      {log.mappings.filter((m: any) => m.status === 'mapped').slice(0, 3).map((m: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-border">
                          <span className="text-[10px] font-black uppercase text-foreground">{m.fileColumn}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-black uppercase text-primary">{m.interpretedAs}</span>
                        </div>
                      ))}
                      {log.mappings.filter((m: any) => m.status === 'mapped').length > 3 && (
                        <div className="flex items-center justify-center px-4 py-2 rounded-xl bg-muted/30 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          + {log.mappings.filter((m: any) => m.status === 'mapped').length - 3} More Mappings
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="p-24 text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-secondary/30 flex items-center justify-center mx-auto">
                      <History className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">No migration history</h4>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Imports will appear here once completed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl uppercase tracking-tight">New Contact</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Add a new lead or client to your database</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Full Name</Label>
              <Input 
                placeholder="James Wilson" 
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                className="h-12 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Work Email</Label>
              <Input 
                placeholder="james@company.com" 
                value={newContact.email}
                onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                className="h-12 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Company</Label>
              <Select onValueChange={(val) => setNewContact({...newContact, companyId: val})}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {crmCompanies.map(c => (
                    <SelectItem key={c.id} value={c.id} className="font-bold uppercase text-[10px]">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddContact} className="w-full h-12 rounded-xl shadow-glow uppercase font-black tracking-widest text-xs">Create Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Company Dialog */}
      <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl uppercase tracking-tight">New Company</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Add a new organization to your records</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Company Name</Label>
              <Input 
                placeholder="TechFlow Inc" 
                value={newCompany.name}
                onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                className="h-12 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Industry</Label>
              <Input 
                placeholder="Software, Finance, etc." 
                value={newCompany.industry}
                onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})}
                className="h-12 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Size</Label>
                <Select onValueChange={(val) => setNewCompany({...newCompany, size: val})}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                    <SelectValue placeholder="1-10" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map(s => (
                      <SelectItem key={s} value={s} className="font-bold uppercase text-[10px]">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Status</Label>
                <Select onValueChange={(val) => setNewCompany({...newCompany, status: val as any})}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                    <SelectValue placeholder="Lead" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {["Lead", "Client", "Former"].map(s => (
                      <SelectItem key={s} value={s} className="font-bold uppercase text-[10px]">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddCompany} className="w-full h-12 rounded-xl shadow-glow uppercase font-black tracking-widest text-xs">Create Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Deal Dialog */}
      <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl uppercase tracking-tight">New Deal</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Add a new opportunity to the pipeline</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Deal Title</Label>
              <Input 
                placeholder="Enterprise License" 
                value={newDeal.title}
                onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                className="h-12 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Value ($)</Label>
                <Input 
                  type="number"
                  placeholder="5000" 
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({...newDeal, value: Number(e.target.value)})}
                  className="h-12 rounded-xl border-2 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Probability (%)</Label>
                <Input 
                  type="number"
                  placeholder="20" 
                  value={newDeal.probability}
                  onChange={(e) => setNewDeal({...newDeal, probability: Number(e.target.value)})}
                  className="h-12 rounded-xl border-2 font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Company</Label>
              <Select onValueChange={(val) => setNewDeal({...newDeal, companyId: val})}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {crmCompanies.map(c => (
                    <SelectItem key={c.id} value={c.id} className="font-bold uppercase text-[10px]">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddDeal} className="w-full h-12 rounded-xl shadow-glow uppercase font-black tracking-widest text-xs">Create Deal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Migration logic modals */}
      <Dialog open={isMigrationOpen} onOpenChange={setIsMigrationOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[24px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Data Migration</span>
            </div>
            <DialogTitle className="font-black text-2xl text-foreground uppercase tracking-tight">MIGRATE YOUR CRM</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Upload any spreadsheet and Cyndi will map it to your workspace
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8 bg-background min-h-[400px]">
            {migrationStep === 1 && (
              <div className="space-y-6">
                {!isProcessing ? (
                  <div className="relative group">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileUpload} />
                    <div className="border-4 border-dashed border-border group-hover:border-primary/50 rounded-3xl p-12 flex flex-col items-center justify-center transition-all bg-card/50">
                      <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                      <p className="text-sm font-black uppercase tracking-tight text-foreground">Upload CSV or XLSX</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">Export from HubSpot, Salesforce, or Excel</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="text-center space-y-2">
                      <p className="text-sm font-black uppercase tracking-widest">Cyndi is interpreting data...</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Analyzing columns and mapping entities</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {migrationStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Review AI Mappings</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">47 records detected in "{migrationFile?.name}"</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest">98% Confidence</span>
                </div>
                <div className="space-y-3">
                  {mappings.map((m, i) => (
                    <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${m.status === 'unmapped' ? 'bg-secondary/5 border-border/50 opacity-60' : 'bg-muted/30 border-border'}`}>
                      <div className="flex-1">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Your Column</p>
                        <p className="text-xs font-black uppercase text-foreground">{m.fileColumn}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <div className="flex-[1.5]">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Interpreted As</p>
                        <Select 
                          defaultValue={m.interpretedAs} 
                          onValueChange={(val) => handleUpdateMapping(m.id, val, m.destination)}
                        >
                          <SelectTrigger className="h-7 border-none bg-transparent p-0 text-xs font-black uppercase text-primary focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Name" className="text-xs font-bold uppercase">Name</SelectItem>
                            <SelectItem value="Email" className="text-xs font-bold uppercase">Email</SelectItem>
                            <SelectItem value="Phone" className="text-xs font-bold uppercase">Phone</SelectItem>
                            <SelectItem value="Company" className="text-xs font-bold uppercase">Company</SelectItem>
                            <SelectItem value="Value" className="text-xs font-bold uppercase">Value</SelectItem>
                            <SelectItem value="Notes" className="text-xs font-bold uppercase">Notes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Destination</p>
                        <Select 
                          defaultValue={m.destination}
                          onValueChange={(val) => handleUpdateMapping(m.id, m.interpretedAs, val)}
                        >
                          <SelectTrigger className="h-7 border-none bg-transparent p-0 text-[10px] font-black uppercase text-muted-foreground focus:ring-0 text-right justify-end">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Contacts" className="text-xs font-bold uppercase">Contacts</SelectItem>
                            <SelectItem value="Companies" className="text-xs font-bold uppercase">Companies</SelectItem>
                            <SelectItem value="Deals" className="text-xs font-bold uppercase">Deals</SelectItem>
                            <SelectItem value="Skip" className="text-xs font-bold uppercase text-destructive">Skip Column</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Integrity Preview */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Data Integrity Rules Active</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">New</p>
                      <p className="text-xs font-black text-primary">+42</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Update</p>
                      <p className="text-xs font-black text-muted-foreground">5</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Skip</p>
                      <p className="text-xs font-black text-muted-foreground">3</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {migrationStep === 3 && (
              <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tight text-foreground">Migration Complete</h4>
                  <p className="text-sm font-medium text-muted-foreground mt-2">
                    {importStats.created} records created, {importStats.updated} updated, and {importStats.skipped} duplicates skipped.
                  </p>
                </div>
                
                {undoImportId && (
                  <div className="w-full p-4 rounded-2xl bg-muted/30 border-2 border-border flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Undo Window Active</p>
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">You have 10 minutes to reverse this import.</p>
                    <Button 
                      variant="outline" 
                      className="rounded-lg h-8 text-[9px] font-black uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/5"
                      onClick={() => setIsUndoModalOpen(true)}
                    >
                      Undo Migration
                    </Button>
                  </div>
                )}

                <Button className="rounded-xl h-12 px-12 font-black uppercase tracking-widest text-[9px] bg-primary text-white shadow-lg w-full" onClick={() => setIsMigrationOpen(false)}>Back to Dashboard</Button>
              </div>
            )}
          </div>

          {migrationStep === 2 && (
            <DialogFooter className="p-8 border-t border-border bg-muted/30">
              <Button variant="outline" className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[9px]" onClick={() => setMigrationStep(1)}>Back</Button>
              <Button className="rounded-xl h-12 px-12 font-black uppercase tracking-widest text-[9px] bg-primary text-white shadow-lg" onClick={handleImport}>
                {isProcessing ? 'Importing...' : `Import 47 Records`}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Undo Confirmation Modal */}
      <Dialog open={isUndoModalOpen} onOpenChange={setIsUndoModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Reverse Migration?</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              This will remove all 47 records added during this session. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2">
            <Button variant="outline" className="rounded-xl flex-1 h-11" onClick={() => setIsUndoModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl flex-1 h-11" onClick={handleUndoImport}>
              {isProcessing ? 'Rolling back...' : 'Confirm Undo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDealDetailOpen} onOpenChange={setIsDealDetailOpen}>
        <DialogContent className="sm:max-w-[800px] rounded-[24px] p-0 overflow-hidden border-none shadow-2xl">
          {selectedDeal && (
            <div className="flex flex-col h-[85vh]">
              {/* Header */}
              <div className="p-8 border-b border-border bg-muted/30 relative">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Pipeline</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                  <span>{selectedDeal.stage}</span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display font-black text-3xl text-foreground tracking-tight uppercase leading-none mb-2">{selectedDeal.company}</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-black uppercase text-muted-foreground">{selectedDeal.contact}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-muted" />
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-black uppercase text-muted-foreground">TechFlow Inc</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-black text-primary leading-none mb-1">{selectedDeal.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{selectedDeal.probability}% Probability</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-8">
                  {pipelineStages.map((s, idx) => {
                    const isCurrent = s.name === selectedDeal.stage;
                    const isPast = pipelineStages.findIndex(ps => ps.name === selectedDeal.stage) > idx;
                    return (
                      <React.Fragment key={s.name}>
                        <button 
                          onClick={() => moveDeal(selectedDeal.id, s.name)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            isCurrent ? "bg-primary text-white shadow-md" : 
                            isPast ? "bg-green-500/10 text-green-600 border border-green-500/20" : 
                            "bg-card border border-border text-muted-foreground hover:bg-muted/30"
                          }`}
                        >
                          {s.name}
                        </button>
                        {idx < pipelineStages.length - 1 && <div className="w-4 h-px bg-border" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Content Grid */}
              <div className="flex-1 overflow-y-auto bg-background p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="md:col-span-2 space-y-8">
                  {/* Activity Input */}
                  <div className="p-6 rounded-[20px] bg-muted/30 border-2 border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <Bot className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Log Activity</span>
                    </div>
                    <Textarea 
                      placeholder="Add a note or log a call/meeting..." 
                      className="min-h-[100px] bg-card border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 text-sm font-medium p-4"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-card text-muted-foreground shadow-sm"><Phone className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-card text-muted-foreground shadow-sm"><Mail className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-card text-muted-foreground shadow-sm"><Calendar className="w-4 h-4" /></Button>
                      </div>
                      <Button className="rounded-xl h-9 px-6 font-black uppercase tracking-widest text-[9px] bg-primary hover:bg-primary/90 text-white shadow-md">Post Note</Button>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Activity Timeline
                    </h3>
                    <div className="space-y-4 relative">
                      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />
                      {[
                        { type: 'Stage Change', detail: 'Moved from Proposal to Negotiation', time: '2 hours ago', icon: Kanban, color: 'text-primary' },
                        { type: 'Email Sent', detail: 'Pricing overview sent to James Wilson', time: 'Yesterday', icon: Send, color: 'text-blue-500' },
                        { type: 'Call Logged', detail: 'Discussed budget and implementation timeline', time: '2 days ago', icon: Phone, color: 'text-green-500' },
                        { type: 'Note Added', detail: 'Strong interest in the enterprise tier with Cyndi automations', time: '3 days ago', icon: FileText, color: 'text-primary' },
                      ].map((activity, i) => (
                        <div key={i} className="flex gap-4 relative group">
                          <div className={`w-10 h-10 rounded-xl bg-card border-2 border-border flex items-center justify-center shrink-0 z-10 group-hover:border-primary transition-colors ${activity.color}`}>
                            <activity.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 pb-6 border-b border-muted/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{activity.type}</span>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{activity.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{activity.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                  <div className="p-6 rounded-[20px] border-2 border-border space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deal Info</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Owner</span>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 rounded-md">
                            <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-black">JW</AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] font-black uppercase text-foreground">James Wilson</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Priority</span>
                        <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[9px] font-black uppercase tracking-widest">High</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Forecast</span>
                        <span className="text-[10px] font-black uppercase text-foreground">Q2 2024</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-[20px] border-2 border-border space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Details</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Email</p>
                          <p className="text-[10px] font-black uppercase text-foreground truncate">{selectedDeal.email || 'james@techflow.com'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Phone</p>
                          <p className="text-[10px] font-black uppercase text-foreground">+1 555-0101</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl h-10 text-[9px] font-black uppercase tracking-widest border-border bg-muted/30 hover:bg-border transition-all">View Contact</Button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-muted/30 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl h-9 text-[9px] font-black uppercase tracking-widest border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/20 transition-all"
                    onClick={() => handleDeleteItem(selectedDeal.id, 'deal')}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Deal
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="rounded-xl h-9 px-6 text-[9px] font-black uppercase tracking-widest border-border bg-card text-muted-foreground" onClick={() => setIsDealDetailOpen(false)}>Close</Button>
                  <Button className="rounded-xl h-9 px-8 text-[9px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-md">Won Deal</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal 1 */}
      <Dialog open={isDeleteModal1Open} onOpenChange={setIsDeleteModal1Open}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] border-4 p-8 bg-card">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Delete {itemToDelete?.type.charAt(0).toUpperCase() + itemToDelete?.type.slice(1)}?
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Are you sure you want to remove this {itemToDelete?.type} from your records?
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

      <Dialog open={isAddWorkflowOpen} onOpenChange={setIsAddWorkflowOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Create New Workflow</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Workflow Name</Label>
              <Input 
                placeholder="e.g. Auto-assign Leads" 
                className="rounded-xl" 
                value={newWorkflow.name}
                onChange={e => setNewWorkflow({...newWorkflow, name: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label>Trigger (When...)</Label>
              <Input 
                placeholder="e.g. New Lead Created" 
                className="rounded-xl" 
                value={newWorkflow.trigger}
                onChange={e => setNewWorkflow({...newWorkflow, trigger: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label>Action (Then...)</Label>
              <Input 
                placeholder="e.g. Send Welcome Email" 
                className="rounded-xl" 
                value={newWorkflow.action}
                onChange={e => setNewWorkflow({...newWorkflow, action: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWorkflowOpen(false)}>Cancel</Button>
            <Button onClick={handleAddWorkflow}>Create Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddReportOpen} onOpenChange={setIsAddReportOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Build Custom Report</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Report Name</Label>
              <Input 
                placeholder="e.g. Q1 Sales Audit" 
                className="rounded-xl" 
                value={newReport.name}
                onChange={e => setNewReport({...newReport, name: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label>Report Type</Label>
              <Select value={newReport.type} onValueChange={val => setNewReport({...newReport, type: val as any})}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddReportOpen(false)}>Cancel</Button>
            <Button onClick={handleAddReport}>Build Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCampaignOpen} onOpenChange={setIsAddCampaignOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Create New Campaign</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Campaign Title</Label>
              <Input 
                placeholder="e.g. Summer Sale" 
                className="rounded-xl" 
                value={newCampaign.title}
                onChange={e => setNewCampaign({...newCampaign, title: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCampaignOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCampaign}>Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CRMPage;
