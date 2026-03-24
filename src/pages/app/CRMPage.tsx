import React, { useState } from "react";
import { 
  Plus, Search, MoreHorizontal, DollarSign, Phone, Mail, ChevronRight, X, 
  Calendar, TrendingUp, Clock, User, UserPlus, Building2, Activity, Filter, 
  LayoutDashboard, Users, Kanban, ClipboardList, FileText, MessageSquare, 
  Zap, BarChart3, Ticket, BookOpen, CreditCard, Puzzle, ArrowRight,
  ChevronDown, CheckCircle2, Star, MailOpen, Send, Bot, Share2, Download,
  MoreVertical, Edit, Trash2, Upload, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useIndustryStore } from "@/lib/industry-store";
import { useToast } from "@/components/ui/use-toast";
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

// --- Types ---

type CRMTab = 
  | "dashboard" | "contacts" | "companies" | "deals" 
  | "marketing" | "automation" | "reports";

type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  lastContact: string;
  deals: number;
  value: string;
  notes?: string;
};

type Company = {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  contacts: number;
  activeDeals: number;
  totalValue: string;
};

type Deal = {
  id: string;
  company: string;
  contact: string;
  email: string;
  value: string;
  probability: number;
  lastActivity: string;
  nextAction?: string;
  stage: string;
};

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

const initialContacts: Contact[] = [
  { id: "c1", name: "James Wilson", company: "TechFlow Inc", email: "james@techflow.com", phone: "+1 555-0101", status: "Lead", lastContact: "2 days ago", deals: 1, value: "$12,000" },
  { id: "c2", name: "Rachel Adams", company: "Acme Corp", email: "rachel@acme.com", phone: "+1 555-0102", status: "Negotiation", lastContact: "4 hours ago", deals: 2, value: "$68,000" },
  { id: "c3", name: "David Chen", company: "GreenLeaf Labs", email: "david@greenleaf.com", phone: "+1 555-0103", status: "Proposal", lastContact: "1 day ago", deals: 1, value: "$42,000" },
  { id: "c4", name: "Lisa Park", company: "DataSync Corp", email: "lisa@datasync.com", phone: "+1 555-0104", status: "Lead", lastContact: "1 day ago", deals: 1, value: "$8,500" },
];

const initialCompanies: Company[] = [
  { id: "co1", name: "TechFlow Inc", industry: "Software", size: "50-200", location: "San Francisco", contacts: 12, activeDeals: 1, totalValue: "$12,000" },
  { id: "co2", name: "Acme Corp", industry: "Manufacturing", size: "500+", location: "Chicago", contacts: 45, activeDeals: 2, totalValue: "$150,000" },
  { id: "co3", name: "GreenLeaf Labs", industry: "Biotech", size: "10-50", location: "Boston", contacts: 8, activeDeals: 1, totalValue: "$42,000" },
];

const initialDeals: Deal[] = [
  { id: "d1", company: "TechFlow Inc", contact: "James Wilson", email: "james@techflow.com", value: "$12,000", probability: 20, lastActivity: "2 days ago", nextAction: "Send intro email", stage: "Lead" },
  { id: "d2", company: "DataSync Corp", contact: "Lisa Park", email: "lisa@datasync.com", value: "$8,500", probability: 15, lastActivity: "1 day ago", stage: "Lead" },
  { id: "d3", company: "CloudBase", contact: "Tom Richards", email: "tom@cloudbase.io", value: "$24,000", probability: 40, lastActivity: "3 hours ago", nextAction: "Schedule demo", stage: "Qualified" },
  { id: "d4", company: "PixelPerfect", contact: "Ana Martinez", email: "ana@pixelperfect.co", value: "$15,000", probability: 50, lastActivity: "5 hours ago", stage: "Qualified" },
  { id: "d5", company: "GreenLeaf Labs", contact: "David Chen", email: "david@greenleaf.com", value: "$42,000", probability: 65, lastActivity: "1 day ago", nextAction: "Follow up on proposal", stage: "Proposal" },
  { id: "d6", company: "Acme Corp", contact: "Rachel Adams", email: "rachel@acme.com", value: "$68,000", probability: 80, lastActivity: "4 hours ago", nextAction: "Review contract terms", stage: "Negotiation" },
  { id: "d7", company: "BlueWave Digital", contact: "Mark Taylor", email: "mark@bluewave.io", value: "$35,000", probability: 100, lastActivity: "Yesterday", stage: "Closed Won" },
];

const initialCampaigns: CRMCampaign[] = [
  { id: "cam1", title: "Spring Product Launch", status: "Running", sent: "12,400", opens: "3,820", clicks: "412" },
  { id: "cam2", title: "Customer Retargeting", status: "Scheduled", sent: "0", opens: "0", clicks: "0" },
  { id: "cam3", title: "Q1 Newsletter", status: "Completed", sent: "10,800", opens: "2,940", clicks: "215" },
];

const initialWorkflows: CRMWorkflow[] = [
  { id: "w1", name: "Auto-assign New Leads", trigger: "New Lead Created", action: "Assign to Sales Team", status: "Active", lastRun: "10 min ago" },
  { id: "w2", name: "Follow-up Reminder", trigger: "No activity for 3 days", action: "Send Notification", status: "Active", lastRun: "2 hrs ago" },
  { id: "w3", name: "Welcome Email Sequence", trigger: "Deal Closed Won", action: "Start Email Campaign", status: "Paused", lastRun: "Yesterday" },
];

const initialReports: CRMReport[] = [
  { id: "r1", name: "Monthly Sales Performance", type: "Sales", lastGenerated: "Mar 01, 2024", createdBY: "James W." },
  { id: "r2", name: "Lead Source Attribution", type: "Marketing", lastGenerated: "Mar 15, 2024", createdBY: "Rachel A." },
  { id: "r3", name: "Team Activity Audit", type: "Activity", lastGenerated: "Yesterday", createdBY: "System" },
];

const revenueData = [
  { name: "Jan", revenue: 45000 },
  { name: "Feb", revenue: 52000 },
  { name: "Mar", revenue: 48000 },
  { name: "Apr", revenue: 61000 },
  { name: "May", revenue: 55000 },
  { name: "Jun", revenue: 67000 },
];

const pipelineStages = [
  { name: "Lead", color: "bg-muted-foreground/30" },
  { name: "Qualified", color: "bg-accent" },
  { name: "Proposal", color: "bg-primary" },
  { name: "Negotiation", color: "bg-primary" },
  { name: "Closed Won", color: "bg-green-500" },
];

const CRMPage = () => {
  const { toast } = useToast();
  const { userType } = useIndustryStore();
  const industryName = userType?.replace('-', ' ') || 'business';
  
  const [tab, setTab] = useState<CRMTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selection state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  // State for entities
  const [contacts, setContacts] = useState<Contact[]>(initialContacts || []);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies || []);
  const [deals, setDeals] = useState<Deal[]>(initialDeals || []);
  const [campaigns, setCampaigns] = useState<CRMCampaign[]>(initialCampaigns || []);
  const [workflows, setWorkflows] = useState<CRMWorkflow[]>(initialWorkflows || []);
  const [reports, setReports] = useState<CRMReport[]>(initialReports || []);
  
  // Modal state
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [isAddWorkflowOpen, setIsAddWorkflowOpen] = useState(false);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);

  const [newContact, setNewContact] = useState({ name: "", company: "", email: "", phone: "" });
  const [newCompany, setNewCompany] = useState({ name: "", industry: "", location: "" });
  const [newDeal, setNewDeal] = useState({ company: "", contact: "", value: "", stage: "Lead" });
  const [newCampaign, setNewCampaign] = useState({ title: "", status: "Draft" as const });
  const [newWorkflow, setNewWorkflow] = useState({ name: "", trigger: "", action: "" });
  const [newReport, setNewReport] = useState({ name: "", type: "Sales" as const });

  const totalValue = (deals || []).reduce((a, d) => {
    const val = parseInt((d.value || "").replace(/\D/g, "")) || 0;
    return a + val;
  }, 0);
  const weightedValue = (deals || []).reduce((a, d) => {
    const val = parseInt((d.value || "").replace(/\D/g, "")) || 0;
    return a + (val * (d.probability || 0)) / 100;
  }, 0);

  const handleExport = () => {
    toast({ 
      title: "Export Started", 
      description: `Exporting ${tab} data as CSV. Your download will begin shortly.` 
    });
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    toast({ title: "Contact Deleted" });
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    toast({ title: "Company Deleted" });
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

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) return;
    const contact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      ...newContact,
      status: "Lead",
      lastContact: "Just now",
      deals: 0,
      value: "$0"
    };
    setContacts((prev) => [contact, ...(prev || [])]);
    setIsAddContactOpen(false);
    setNewContact({ name: "", company: "", email: "", phone: "" });
    toast({ title: "Contact Added", description: `${contact.name} has been added to your database.` });
  };

  const handleAddCompany = () => {
    if (!newCompany.name) return;
    const company: Company = {
      id: Math.random().toString(36).substr(2, 9),
      ...newCompany,
      size: "1-10",
      contacts: 0,
      activeDeals: 0,
      totalValue: "$0"
    };
    setCompanies((prev) => [company, ...(prev || [])]);
    setIsAddCompanyOpen(false);
    setNewCompany({ name: "", industry: "", location: "" });
    toast({ title: "Company Added", description: `${company.name} has been created.` });
  };

  const handleAddDeal = () => {
    if (!newDeal.company || !newDeal.value) return;
    const deal: Deal = {
      id: Math.random().toString(36).substr(2, 9),
      company: newDeal.company,
      contact: newDeal.contact || "Unknown",
      email: "",
      value: `$${newDeal.value}`,
      probability: 10,
      lastActivity: "Just now",
      stage: newDeal.stage
    };
    setDeals((prev) => [...(prev || []), deal]);
    setIsAddDealOpen(false);
    setNewDeal({ company: "", contact: "", value: "", stage: "Lead" });
    toast({ title: "Deal Created", description: `New deal for ${deal.company} added to pipeline.` });
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

  const moveDeal = (id: string, newStage: string) => {
    setDeals((prev) => {
      if (!prev) return [];
      return prev.map(d => d.id === id ? { ...d, stage: newStage, lastActivity: "Just now" } : d);
    });
    toast({ title: "Deal Moved", description: `Deal moved to ${newStage}.` });
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "deals", label: "Deals", icon: Kanban },
    { id: "marketing", label: "Marketing", icon: ClipboardList },
    { id: "automation", label: "Automation", icon: Zap },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">CRM</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your entire customer lifecycle in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            {tab === "contacts" && <Button size="sm" className="rounded-xl" onClick={() => setIsAddContactOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Add Contact</Button>}
            {tab === "companies" && <Button size="sm" className="rounded-xl" onClick={() => setIsAddCompanyOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Add Company</Button>}
            {tab === "deals" && <Button size="sm" className="rounded-xl" onClick={() => setIsAddDealOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Create Deal</Button>}
            {tab === "marketing" && <Button size="sm" className="rounded-xl" onClick={() => setIsAddCampaignOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Create Campaign</Button>}
            {tab === "automation" && <Button size="sm" className="rounded-xl" onClick={() => setIsAddWorkflowOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Create Workflow</Button>}
            {tab === "reports" && <Button size="sm" className="rounded-xl" onClick={() => setIsAddReportOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Create Report</Button>}
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id as CRMTab)}
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
        {tab === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Total Revenue", value: `$${((totalValue || 0) / 1000).toFixed(1)}k`, change: "+12.5%", Icon: DollarSign, color: "text-green-500" },
                  { label: "Active Deals", value: (deals || []).filter(d => d.stage !== "Closed Won").length, change: "+3", Icon: Kanban, color: "text-primary" },
                  { label: "Lead Conversion", value: "24%", change: "+2.1%", Icon: TrendingUp, color: "text-accent" },
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
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-md)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Recent Interactions</h3>
                <div className="space-y-4">
                  {[
                    { type: "email", contact: "James Wilson", action: "Replied to intro", time: "5 min ago", Icon: MailOpen },
                    { type: "call", contact: "Rachel Adams", action: "Discovery call completed", time: "1 hr ago", Icon: Phone },
                    { type: "meeting", contact: "David Chen", action: "Proposal review scheduled", time: "3 hrs ago", Icon: Calendar },
                  ].map((act, i) => {
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
                <Button variant="ghost" className="w-full mt-4 text-[10px] font-bold uppercase tracking-widest text-primary" onClick={() => setTab("automation")}>View All Activity</Button>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "contacts" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search contacts by name, email or company..." 
                  className="pl-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="rounded-xl"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/20 border-b border-border">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Company</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Deals</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Contact</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(contacts || []).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase())).map((contact) => (
                    <tr key={contact.id} className="hover:bg-secondary/10 transition-colors group cursor-pointer" onClick={() => setSelectedContact(contact)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {(contact.name || "U").split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{contact.name || "Unknown"}</p>
                            <p className="text-[10px] text-muted-foreground">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground font-medium">{contact.company}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          contact.status === 'Lead' ? 'bg-orange-500/10 text-orange-600' : 
                          contact.status === 'Negotiation' ? 'bg-primary/10 text-primary' : 
                          'bg-green-500/10 text-green-600'
                        }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-foreground">{contact.deals}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-muted-foreground">{contact.lastContact}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleQuickAction("Email", contact.name); }}><Mail className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleQuickAction("Call", contact.name); }}><Phone className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === "companies" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search companies by name or industry..." 
                  className="pl-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="rounded-xl"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/20 border-b border-border">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Company Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Industry</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Size</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contacts</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Value</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {companies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.industry.toLowerCase().includes(searchQuery.toLowerCase())).map((company) => (
                    <tr key={company.id} className="hover:bg-secondary/10 transition-colors group cursor-pointer" onClick={() => setSelectedCompany(company)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-bold text-foreground">{company.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-muted-foreground">{company.industry}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-foreground font-bold">{company.size}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-muted-foreground">{company.location}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-foreground">{company.contacts}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-display font-bold text-primary">{company.totalValue}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleQuickAction("Contact Team", company.name); }}><Users className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteCompany(company.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === "deals" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between bg-secondary/10 p-4 rounded-xl border border-border">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Pipeline</p>
                  <p className="text-xl font-display font-bold text-foreground">${((totalValue || 0) / 1000).toFixed(1)}k</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Weighted Forecast</p>
                  <p className="text-xl font-display font-bold text-primary">${((weightedValue || 0) / 1000).toFixed(1)}k</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl">Board View</Button>
                <Button variant="ghost" size="sm" className="rounded-xl">List View</Button>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide">
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="w-72 flex-shrink-0">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                      <span className="text-sm font-bold text-foreground uppercase tracking-widest">{stage.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-bold text-muted-foreground">
                        {(deals || []).filter(d => d.stage === stage.name).length}
                      </span>
                    </div>
                    <button className="p-1 hover:bg-secondary rounded transition-colors"><Plus className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  
                  <div className="space-y-3 min-h-[500px]">
                    {(deals || []).filter(d => d.stage === stage.name).map((deal) => (
                      <motion.div
                        key={deal.id}
                        layout
                        onClick={() => setSelectedDeal(deal)}
                        className="group rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{deal.company}</p>
                          <button onClick={(e) => { e.stopPropagation(); moveDeal(deal.id, pipelineStages[Math.min(pipelineStages.length - 1, pipelineStages.findIndex(s => s.name === stage.name) + 1)].name); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-3.5 h-3.5 text-primary" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-foreground mb-3">{deal.contact}</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-display font-bold text-foreground">{deal.value}</span>
                          <span className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">{deal.probability}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-secondary overflow-hidden mb-4">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${deal.probability}%` }} />
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                            <Clock className="w-3 h-3" />
                            {deal.lastActivity}
                          </div>
                          {deal.nextAction && (
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase">
                              <Star className="w-3 h-3" />
                              Next Action
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
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

        {tab === "automation" && (
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
                            { name: 'Qualified', value: 39000, color: '#f97316' },
                            { name: 'Proposal', value: 42000, color: '#3b82f6' },
                            { name: 'Negotiation', value: 68000, color: '#2563eb' },
                          ]}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                          {[0,1,2,3].map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#94a3b8', '#f97316', '#3b82f6', '#2563eb'][index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-4">
                    {[
                      { label: 'Lead', val: '$12k', color: 'bg-slate-400' },
                      { label: 'Qualified', val: '$39k', color: 'bg-orange-500' },
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
      </div>

      {/* Global Modals */}
      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Add New Contact</DialogTitle>
            <DialogDescription>Add a new customer or lead to your CRM database.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="c-name">Full Name</Label>
              <Input id="c-name" placeholder="John Doe" className="rounded-xl" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-email">Email Address</Label>
              <Input id="c-email" type="email" placeholder="john@example.com" className="rounded-xl" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="c-company">Company</Label>
                <Input id="c-company" placeholder="Acme Inc" className="rounded-xl" value={newContact.company} onChange={e => setNewContact({...newContact, company: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-phone">Phone</Label>
                <Input id="c-phone" placeholder="+1..." className="rounded-xl" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>Cancel</Button>
            <Button onClick={handleAddContact}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Create New Deal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Company</Label>
              <Input placeholder="Select company..." className="rounded-xl" value={newDeal.company} onChange={e => setNewDeal({...newDeal, company: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Value ($)</Label>
                <Input type="number" placeholder="5000" className="rounded-xl" value={newDeal.value} onChange={e => setNewDeal({...newDeal, value: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Initial Stage</Label>
                <Select value={newDeal.stage} onValueChange={val => setNewDeal({...newDeal, stage: val})}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelineStages.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDealOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDeal}>Create Deal</Button>
          </DialogFooter>
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

      {/* Entity Details Sidebar */}
      <AnimatePresence>
        {selectedContact && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedContact(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 bg-card border-l border-border shadow-2xl p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact Details</h3>
                <button onClick={() => setSelectedContact(null)} className="p-2 hover:bg-secondary rounded-lg transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  {(selectedContact.name || "U").split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">{selectedContact.name || "Unknown"}</h2>
                  <p className="text-sm text-muted-foreground">{selectedContact.company}</p>
                </div>
              </div>
              <div className="flex justify-center gap-2 mb-8">
                <Button size="sm" variant="outline" className="h-8" onClick={() => handleQuickAction("Email", selectedContact.name)}>
                  <Mail className="w-3.5 h-3.5 mr-1.5" /> Email
                </Button>
                <Button size="sm" variant="outline" className="h-8" onClick={() => handleQuickAction("Call", selectedContact.name)}>
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> Call
                </Button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl border border-border bg-secondary/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Email</p>
                    <p className="text-xs font-bold truncate">{selectedContact.email}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-secondary/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Phone</p>
                    <p className="text-xs font-bold">{selectedContact.phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Notes</Label>
                  <Textarea placeholder="Add private notes about this contact..." className="rounded-xl min-h-[100px]" defaultValue={selectedContact.notes} />
                </div>
                <div className="pt-6 border-t border-border">
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="flex-col h-16 gap-1 rounded-xl" onClick={() => handleQuickAction("Email", selectedContact.name)}><Mail className="w-4 h-4" /> <span className="text-[9px]">Email</span></Button>
                    <Button variant="outline" className="flex-col h-16 gap-1 rounded-xl" onClick={() => handleQuickAction("Call", selectedContact.name)}><Phone className="w-4 h-4" /> <span className="text-[9px]">Call</span></Button>
                    <Button variant="outline" className="flex-col h-16 gap-1 rounded-xl" onClick={() => handleQuickAction("Meeting", selectedContact.name)}><Calendar className="w-4 h-4" /> <span className="text-[9px]">Meeting</span></Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {selectedCompany && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedCompany(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 bg-card border-l border-border shadow-2xl p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Company Details</h3>
                <button onClick={() => setSelectedCompany(null)} className="p-2 hover:bg-secondary rounded-lg transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">{selectedCompany.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedCompany.industry} · {selectedCompany.location}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl border border-border bg-secondary/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Size</p>
                    <p className="text-xs font-bold">{selectedCompany.size}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-secondary/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Contacts</p>
                    <p className="text-xs font-bold">{selectedCompany.contacts}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-secondary/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Deals</p>
                    <p className="text-xs font-bold">{selectedCompany.activeDeals}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border bg-primary/5">
                  <p className="text-[10px] font-bold text-primary uppercase mb-1 tracking-widest">Total Value</p>
                  <p className="text-2xl font-display font-bold text-primary">{selectedCompany.totalValue}</p>
                </div>
                <div className="pt-6 border-t border-border">
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-4">Associations</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-between rounded-xl h-12">
                      <span className="flex items-center gap-2"><Users className="w-4 h-4" /> View Linked Contacts</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between rounded-xl h-12">
                      <span className="flex items-center gap-2"><Kanban className="w-4 h-4" /> View Linked Deals</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRMPage;
