import React, { useState } from "react";
import { 
  TrendingUp, TrendingDown, DollarSign, Download, Plus, Search, 
  Calendar, FileText, Target, PieChart as PieChartIcon, ArrowRight,
  Filter, MoreHorizontal, LayoutDashboard, Receipt, Wallet, 
  CreditCard, Users, Clock, ShieldCheck, Globe, Zap, CheckCircle2,
  AlertCircle, Package, Building2, Landmark, History, Link2, ExternalLink,
  Edit, Trash2, MoreVertical, Send, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FinanceTool = 'dashboard' | 'invoicing' | 'expenses' | 'payroll' | 'inventory' | 'clients' | 'time-tracking' | 'payments' | 'multi-currency' | 'integrations' | 'documents';

const FinancePage = () => {
  const [activeTool, setActiveTool] = useState<FinanceTool>('dashboard');
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // --- Modals State ---
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddPayrollOpen, setIsAddPayrollOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isAddTimeEntryOpen, setIsAddTimeEntryOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddCurrencyOpen, setIsAddCurrencyOpen] = useState(false);
  const [isAddIntegrationOpen, setIsAddIntegrationOpen] = useState(false);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);

  // --- Mock Data ---
  const [invoices, setInvoices] = useState([
    { id: "INV-001", client: "Acme Corp", amount: "$4,250.00", date: "2024-03-20", status: "Paid", icon: Building2 },
    { id: "INV-002", client: "Global Tech", amount: "$1,800.00", date: "2024-03-22", status: "Pending", icon: Globe },
    { id: "INV-003", client: "Solaris Inc", amount: "$12,400.00", date: "2024-03-15", status: "Overdue", icon: Zap },
    { id: "INV-004", client: "Nebula Soft", amount: "$3,100.00", date: "2024-03-25", status: "Paid", icon: ShieldCheck },
  ]);

  const [expenses, setExpenses] = useState([
    { id: "EXP-001", category: "Office Rent", amount: "$2,500.00", date: "2024-03-01", status: "Approved" },
    { id: "EXP-002", category: "Cloud Services", amount: "$420.00", date: "2024-03-05", status: "Approved" },
    { id: "EXP-003", category: "Marketing", amount: "$1,200.00", date: "2024-03-10", status: "Pending" },
    { id: "EXP-004", category: "Hardware", amount: "$850.00", date: "2024-03-15", status: "Rejected" },
  ]);

  const [payroll, setPayroll] = useState([
    { id: "PAY-001", employee: "Sarah Johnson", role: "Sr. Engineer", amount: "$8,500.00", status: "Paid" },
    { id: "PAY-002", employee: "Michael Chen", role: "Designer", amount: "$6,200.00", status: "Paid" },
    { id: "PAY-003", employee: "Alex Rivera", role: "Product Manager", amount: "$7,800.00", status: "Pending" },
  ]);

  const [inventory, setInventory] = useState([
    { id: "AST-001", item: "MacBook Pro M3", serial: "SN-92831", value: "$2,499.00", status: "In Use" },
    { id: "AST-002", item: "Dell UltraSharp 27", serial: "SN-11203", value: "$650.00", status: "Available" },
    { id: "AST-003", item: "Herman Miller Aeron", serial: "SN-44592", value: "$1,200.00", status: "In Use" },
  ]);

  const [timeEntries, setTimeEntries] = useState([
    { id: "TME-001", employee: "Sarah Johnson", project: "Project Phoenix", hours: "32.5", date: "2024-03-18", status: "Approved" },
    { id: "TME-002", employee: "Michael Chen", project: "UI Design System", hours: "14.0", date: "2024-03-19", status: "Pending" },
    { id: "TME-003", employee: "Alex Rivera", project: "Client Strategy", hours: "8.0", date: "2024-03-20", status: "Approved" },
  ]);

  const [payments, setPayments] = useState([
    { id: "TRX-001", method: "Stripe", amount: "$12,400.00", date: "2024-03-22", status: "Completed", type: "Inbound" },
    { id: "TRX-002", method: "Bank Transfer", amount: "$2,500.00", date: "2024-03-21", status: "Processing", type: "Outbound" },
    { id: "TRX-003", method: "PayPal", amount: "$850.00", date: "2024-03-20", status: "Completed", type: "Inbound" },
  ]);

  const [currencies, setCurrencies] = useState([
    { code: "USD", name: "US Dollar", rate: "1.00", status: "Primary" },
    { code: "EUR", name: "Euro", rate: "0.92", status: "Active" },
    { code: "GBP", name: "British Pound", rate: "0.78", status: "Active" },
  ]);

  const [integrations, setIntegrations] = useState([
    { id: "INT-001", name: "Stripe", category: "Payment Gateway", status: "Connected", icon: CreditCard },
    { id: "INT-002", name: "QuickBooks", category: "Accounting", status: "Disconnected", icon: Building2 },
    { id: "INT-003", name: "Plio", category: "Bank Sync", status: "Connected", icon: Landmark },
  ]);

  const [documents, setDocuments] = useState([
    { id: "DOC-001", name: "Q1 Financial Report.pdf", type: "Report", size: "2.4 MB", date: "2024-03-01" },
    { id: "DOC-002", name: "Tax Returns 2023.zip", type: "Legal", size: "15.8 MB", date: "2024-02-15" },
    { id: "DOC-003", name: "Vendor Contract - Acme.pdf", type: "Contract", size: "1.1 MB", date: "2024-03-10" },
  ]);

  const revenueData = [
    { name: 'Oct', revenue: 45000, profit: 12000 },
    { name: 'Nov', revenue: 52000, profit: 15000 },
    { name: 'Dec', revenue: 61000, profit: 18000 },
    { name: 'Jan', revenue: 58000, profit: 14000 },
    { name: 'Feb', revenue: 72000, profit: 22000 },
    { name: 'Mar', revenue: 85000, profit: 28000 },
  ];

  const categoryData = [
    { name: 'Fixed', value: 45, color: '#f97316' },
    { name: 'Variable', value: 30, color: '#3b82f6' },
    { name: 'Marketing', value: 15, color: '#10b981' },
    { name: 'Other', value: 10, color: '#94a3b8' },
  ];

  const tools = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoicing', label: 'Invoicing', icon: Receipt },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'time-tracking', label: 'Time Tracking', icon: Clock },
    { id: 'payments', label: 'Payments', icon: ShieldCheck },
    { id: 'multi-currency', label: 'Currency', icon: Globe },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const handlePrimaryAction = () => {
    if (activeTool === 'invoicing') setIsAddInvoiceOpen(true);
    else if (activeTool === 'expenses') setIsAddExpenseOpen(true);
    else if (activeTool === 'payroll') setIsAddPayrollOpen(true);
    else if (activeTool === 'inventory') setIsAddAssetOpen(true);
    else if (activeTool === 'time-tracking') setIsAddTimeEntryOpen(true);
    else if (activeTool === 'payments') setIsAddPaymentOpen(true);
    else if (activeTool === 'multi-currency') setIsAddCurrencyOpen(true);
    else if (activeTool === 'integrations') setIsAddIntegrationOpen(true);
    else if (activeTool === 'documents') setIsAddDocumentOpen(true);
    else {
      toast({ 
        title: "Action Triggered", 
        description: `Opening ${activeTool} creation interface.` 
      });
    }
  };

  const handleExport = () => {
    toast({ 
      title: "Export Started", 
      description: `Your ${activeTool} report is being prepared for download.` 
    });
  };

  const handleDelete = (id: string, type: string) => {
    if (type === 'invoice') setInvoices(prev => prev.filter(i => i.id !== id));
    if (type === 'expense') setExpenses(prev => prev.filter(e => e.id !== id));
    if (type === 'time') setTimeEntries(prev => prev.filter(t => t.id !== id));
    if (type === 'document') setDocuments(prev => prev.filter(d => d.id !== id));
    if (type === 'asset') setInventory(prev => prev.filter(i => i.id !== id));
    toast({ title: "Deleted", description: `${type} ${id} removed successfully.` });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Finance</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your company's financial health and operations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            <Button 
              size="sm" 
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handlePrimaryAction}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {activeTool === 'invoicing' ? 'New Invoice' : 
               activeTool === 'expenses' ? 'Log Expense' : 
               activeTool === 'payroll' ? 'Run Payroll' : 
               activeTool === 'inventory' ? 'Add Asset' : 
               activeTool === 'clients' ? 'New Client' : 
               activeTool === 'time-tracking' ? 'Log Time' : 'New Entry'}
            </Button>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto scrollbar-hide">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as FinanceTool)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                  activeTool === tool.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {ToolIcon && <ToolIcon className="w-3.5 h-3.5" />}
                {tool.label}
                {activeTool === tool.id && (
                  <motion.div layoutId="activeFinanceTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[600px]">
        <div className="py-4">
          <AnimatePresence mode="wait">
            {activeTool === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Revenue", value: "$124,500", change: "+12.5%", icon: DollarSign, color: "text-green-500" },
                    { label: "Net Profit", value: "$42,200", change: "+8.2%", icon: TrendingUp, color: "text-primary" },
                    { label: "Outstanding", value: "$18,400", change: "-2.4%", icon: Clock, color: "text-orange-500" },
                  ].map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={stat.label} className="p-5 rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-lg bg-secondary/50 ${stat.color}`}>
                            {StatIcon && <StatIcon className="w-5 h-5" />}
                          </div>
                          <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{stat.change}</span>
                        </div>
                        <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Revenue vs Profit</h3>
                      <Select defaultValue="6m">
                        <SelectTrigger className="w-[120px] h-8 text-xs rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m">Last Month</SelectItem>
                          <SelectItem value="6m">Last 6 Months</SelectItem>
                          <SelectItem value="1y">Last Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="h-[300px] w-full">
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
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} tickFormatter={(v) => `$${v/1000}k`} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-md)' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                          <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Expense Categories</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                      {categoryData.map((cat) => (
                        <div key={cat.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-xs font-medium text-muted-foreground">{cat.name}</span>
                          </div>
                          <span className="text-xs font-bold text-foreground">{cat.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'invoicing' && (
              <motion.div key="invoicing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Invoiced", value: "$248,500", icon: Receipt, color: "text-primary" },
                    { label: "Total Paid", value: "$192,200", icon: CheckCircle2, color: "text-green-500" },
                    { label: "Unpaid", value: "$56,300", icon: Clock, color: "text-orange-500" },
                    { label: "Overdue", value: "$12,400", icon: AlertCircle, color: "text-destructive" },
                  ].map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={stat.label} className="p-4 rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-1.5 rounded-lg bg-secondary/50 ${stat.color}`}>
                            <StatIcon className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        </div>
                        <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Recent Invoices</h3>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input placeholder="Search..." className="h-8 pl-8 pr-3 text-xs bg-background rounded-lg border border-border w-48" />
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest"><Filter className="w-3.5 h-3.5 mr-1.5" /> Filter</Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary/5 border-b border-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ID</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Client</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due Date</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                          <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {invoices.map((inv) => {
                          const ClientIcon = inv.icon;
                          return (
                            <tr key={inv.id} className="hover:bg-secondary/5 transition-colors group">
                              <td className="px-6 py-4 text-xs font-bold text-foreground">{inv.id}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center text-primary">
                                    <ClientIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold text-foreground">{inv.client}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-foreground">{inv.amount}</td>
                              <td className="px-6 py-4 text-xs text-muted-foreground">{inv.date}</td>
                              <td className="px-6 py-4">
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  inv.status === 'Paid' ? 'bg-green-500/10 text-green-600' :
                                  inv.status === 'Pending' ? 'bg-orange-500/10 text-orange-600' :
                                  'bg-destructive/10 text-destructive'
                                }`}>{inv.status}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(inv.id, 'invoice')}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'expenses' && (
              <motion.div key="expenses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-widest">Expense Log</h3>
                      <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary">View All History</Button>
                    </div>
                    <div className="divide-y divide-border">
                      {expenses.map((exp) => (
                        <div key={exp.id} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/5 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-primary">
                              <Wallet className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{exp.category}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">{exp.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <p className="text-sm font-display font-bold text-foreground">{exp.amount}</p>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              exp.status === 'Approved' ? 'bg-green-500/10 text-green-600' :
                              exp.status === 'Pending' ? 'bg-orange-500/10 text-orange-600' :
                              'bg-destructive/10 text-destructive'
                            }`}>{exp.status}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(exp.id, 'expense')}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Approval Pipeline</h3>
                      <div className="space-y-4">
                        {[
                          { label: "Pending Review", value: 3, color: "bg-orange-500" },
                          { label: "Approved Today", value: 12, color: "bg-green-500" },
                          { label: "Flagged", value: 1, color: "bg-destructive" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/5">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${item.color}`} />
                              <span className="text-xs font-bold text-foreground">{item.label}</span>
                            </div>
                            <span className="text-sm font-display font-bold">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full mt-6 rounded-xl text-xs font-bold uppercase tracking-widest" variant="outline">Run Audit</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'payroll' && (
              <motion.div key="payroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between bg-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Next Pay Cycle: April 1st</h3>
                      <p className="text-sm text-muted-foreground">Estimated total: <span className="font-bold text-foreground">$142,500.00</span></p>
                    </div>
                  </div>
                  <Button className="rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => setIsAddPayrollOpen(true)}>Run Payroll Early</Button>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-secondary/10">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Employee Payroll</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {payroll.map((pay) => (
                      <div key={pay.id} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                            {pay.employee.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{pay.employee}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{pay.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-12">
                          <div className="text-right">
                            <p className="text-sm font-display font-bold text-foreground">{pay.amount}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold">Monthly Gross</p>
                          </div>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            pay.status === 'Paid' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                          }`}>{pay.status}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'inventory' && (
              <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {inventory.map((item) => (
                    <div key={item.id} className="p-5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'In Use' ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'
                          }`}>{item.status}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(item.id, 'asset')}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <h4 className="font-bold text-foreground mb-1">{item.item}</h4>
                      <p className="text-xs text-muted-foreground mb-4">Serial: {item.serial}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <p className="text-sm font-display font-bold text-primary">{item.value}</p>
                        <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase">Details</Button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsAddAssetOpen(true)}
                    className="p-5 rounded-xl border-2 border-dashed border-border bg-secondary/5 hover:bg-secondary/10 hover:border-primary/30 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Add New Asset</p>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTool === 'clients' && (
              <motion.div key="clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Client Financial Overview</h3>
                    <Button size="sm" variant="outline" className="rounded-xl h-8 text-[10px] font-bold uppercase"><Plus className="w-3.5 h-3.5 mr-1.5" /> New Client Record</Button>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { name: "Acme Corp", industry: "Manufacturing", totalBilled: "$42,500", status: "Active", health: "Good" },
                      { name: "Global Tech", industry: "SaaS", totalBilled: "$18,800", status: "Active", health: "Good" },
                      { name: "Solaris Inc", industry: "Energy", totalBilled: "$92,400", status: "On Hold", health: "Warning" },
                    ].map((client) => (
                      <div key={client.name} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{client.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{client.industry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-12">
                          <div className="text-right">
                            <p className="text-sm font-display font-bold text-foreground">{client.totalBilled}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold">Life-time Billed</p>
                          </div>
                          <div className="w-24">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              client.health === 'Good' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                            }`}>Health: {client.health}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'time-tracking' && (
              <motion.div key="time-tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Hours", value: "1,240.5", icon: Clock, color: "text-primary" },
                    { label: "Billable Hours", value: "982.0", icon: Target, color: "text-green-500" },
                    { label: "Pending Approval", value: "45.5", icon: AlertCircle, color: "text-orange-500" },
                  ].map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={stat.label} className="p-4 rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-1.5 rounded-lg bg-secondary/50 ${stat.color}`}>
                            <StatIcon className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        </div>
                        <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Time Logs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary/5 border-b border-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Employee</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hours</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                          <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {timeEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-secondary/5 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-foreground">{entry.employee}</span>
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">{entry.project}</td>
                            <td className="px-6 py-4 text-xs font-bold text-foreground">{entry.hours}h</td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">{entry.date}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                entry.status === 'Approved' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                              }`}>{entry.status}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(entry.id, 'time')}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'payments' && (
              <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Net Volume", value: "$452,400", icon: TrendingUp, color: "text-primary" },
                    { label: "Successful", value: "98.2%", icon: CheckCircle2, color: "text-green-500" },
                    { label: "Processing", value: "$12,400", icon: Clock, color: "text-orange-500" },
                    { label: "Disputes", value: "0", icon: ShieldCheck, color: "text-blue-500" },
                  ].map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={stat.label} className="p-4 rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-1.5 rounded-lg bg-secondary/50 ${stat.color}`}>
                            <StatIcon className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        </div>
                        <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-secondary/10">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Transaction History</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {payments.map((payment) => (
                      <div key={payment.id} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${payment.type === 'Inbound' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
                            {payment.type === 'Inbound' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{payment.method}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{payment.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <p className={`text-sm font-display font-bold ${payment.type === 'Inbound' ? 'text-green-600' : 'text-foreground'}`}>
                            {payment.type === 'Inbound' ? '+' : '-'}{payment.amount}
                          </p>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            payment.status === 'Completed' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                          }`}>{payment.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'multi-currency' && (
              <motion.div key="multi-currency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currencies.map((currency) => (
                    <div key={currency.code} className="p-6 rounded-xl border border-border bg-card shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                          {currency.code}
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          currency.status === 'Primary' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>{currency.status}</span>
                      </div>
                      <h4 className="font-bold text-foreground mb-1">{currency.name}</h4>
                      <p className="text-xs text-muted-foreground">1 USD = {currency.rate} {currency.code}</p>
                      <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                        <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase">Exchange Rate</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase text-primary">Set Primary</Button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setIsAddCurrencyOpen(true)} className="p-6 rounded-xl border-2 border-dashed border-border bg-secondary/5 hover:bg-secondary/10 transition-all flex flex-col items-center justify-center gap-2">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Add Currency</p>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTool === 'integrations' && (
              <motion.div key="integrations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrations.map((int) => {
                    const IntIcon = int.icon;
                    return (
                      <div key={int.id} className="p-5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
                            <IntIcon className="w-5 h-5" />
                          </div>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            int.status === 'Connected' ? 'bg-green-500/10 text-green-600' : 'bg-secondary text-muted-foreground'
                          }`}>{int.status}</span>
                        </div>
                        <h4 className="font-bold text-foreground mb-1">{int.name}</h4>
                        <p className="text-xs text-muted-foreground mb-4">{int.category}</p>
                        <Button variant={int.status === 'Connected' ? 'outline' : 'default'} className="w-full h-8 text-[10px] font-bold uppercase rounded-xl">
                          {int.status === 'Connected' ? 'Configure' : 'Connect'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTool === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest">Financial Documents</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {documents.map((doc) => (
                      <div key={doc.id} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-primary">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{doc.type} • {doc.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{doc.date}</p>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><Download className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(doc.id, 'document')}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Global Modals --- */}
      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client Name</Label>
              <Input id="client" placeholder="e.g. Acme Corp" className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" placeholder="$0.00" className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due">Due Date</Label>
                <Input id="due" type="date" className="rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddInvoiceOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => {
              setInvoices(prev => [{ id: `INV-00${prev.length + 1}`, client: "New Client", amount: "$0.00", date: "2024-04-01", status: "Pending", icon: Building2 }, ...prev]);
              setIsAddInvoiceOpen(false);
              toast({ title: "Invoice Created" });
            }} className="rounded-xl">Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Log Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office Rent</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="software">Software/SaaS</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exp-amount">Amount</Label>
              <Input id="exp-amount" placeholder="$0.00" className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => {
              setExpenses(prev => [{ id: `EXP-00${prev.length + 1}`, category: "New Expense", amount: "$0.00", date: "2024-03-25", status: "Pending" }, ...prev]);
              setIsAddExpenseOpen(false);
              toast({ title: "Expense Logged" });
            }} className="rounded-xl">Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPayrollOpen} onOpenChange={setIsAddPayrollOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Run Payroll</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <CreditCard className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-foreground">Confirm Payroll Execution</p>
              <p className="text-sm text-muted-foreground">This will process payments for all 24 active employees.</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/20 border border-border text-left">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Total Gross:</span>
                <span className="font-bold">$142,500.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Est. Taxes:</span>
                <span className="font-bold">$34,200.00</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPayrollOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => {
              setPayroll(prev => prev.map(p => ({ ...p, status: 'Paid' })));
              setIsAddPayrollOpen(false);
              toast({ title: "Payroll Executed", description: "All employee payments have been initiated." });
            }} className="rounded-xl bg-primary text-white">Confirm & Process</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Add New Asset</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-name">Asset Name</Label>
              <Input id="asset-name" placeholder="e.g. MacBook Pro" className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asset-value">Value</Label>
              <Input id="asset-value" placeholder="$0.00" className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAssetOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => {
              setInventory(prev => [{ id: `AST-00${prev.length + 1}`, item: "New Device", serial: "SN-PENDING", value: "$0.00", status: "Available" }, ...prev]);
              setIsAddAssetOpen(false);
              toast({ title: "Asset Added" });
            }} className="rounded-xl">Add to Inventory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTimeEntryOpen} onOpenChange={setIsAddTimeEntryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Log Time</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="emp-name">Employee</Label>
              <Input id="emp-name" placeholder="Search employee..." className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hours">Hours</Label>
                <Input id="hours" type="number" placeholder="0.0" className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" className="rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTimeEntryOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => {
              setTimeEntries(prev => [{ id: `TME-00${prev.length + 1}`, employee: "Current User", project: "General Work", hours: "1.0", date: "2024-03-23", status: "Pending" }, ...prev]);
              setIsAddTimeEntryOpen(false);
              toast({ title: "Time Logged" });
            }} className="rounded-xl">Save Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Process Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pay-method">Payment Method</Label>
              <Select>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pay-amount">Amount</Label>
              <Input id="pay-amount" placeholder="$0.00" className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => {
              setPayments(prev => [{ id: `TRX-00${prev.length + 1}`, method: "Stripe", amount: "$0.00", date: "2024-03-23", status: "Processing", type: "Inbound" }, ...prev]);
              setIsAddPaymentOpen(false);
              toast({ title: "Payment Initiated" });
            }} className="rounded-xl">Execute Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCurrencyOpen} onOpenChange={setIsAddCurrencyOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Add Currency</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="curr-code">Currency Code</Label>
              <Input id="curr-code" placeholder="e.g. JPY" className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="curr-rate">Exchange Rate (to USD)</Label>
              <Input id="curr-rate" placeholder="0.00" className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCurrencyOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => {
              setCurrencies(prev => [...prev, { code: "NEW", name: "New Currency", rate: "1.00", status: "Active" }]);
              setIsAddCurrencyOpen(false);
              toast({ title: "Currency Added" });
            }} className="rounded-xl">Save Currency</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddIntegrationOpen} onOpenChange={setIsAddIntegrationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Add Integration</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-primary">
              <Zap className="w-8 h-8" />
            </div>
            <p className="text-sm text-muted-foreground">Select a financial service to integrate with Cynda.</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {['Xero', 'Sage', 'FreshBooks', 'Stripe', 'Square', 'Adyen'].map(s => (
                <Button key={s} variant="outline" className="h-10 text-xs rounded-xl" onClick={() => {
                  setIntegrations(prev => [...prev, { id: `INT-00${prev.length + 1}`, name: s, category: "Financial Service", status: "Connected", icon: Zap }]);
                  setIsAddIntegrationOpen(false);
                  toast({ title: `${s} Connected` });
                }}>{s}</Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">Upload Document</DialogTitle>
          </DialogHeader>
          <div className="py-8 border-2 border-dashed border-border rounded-2xl text-center bg-secondary/5 group hover:bg-secondary/10 transition-colors cursor-pointer">
            <Download className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4 group-hover:text-primary transition-colors" />
            <p className="text-sm font-bold text-foreground">Click to upload or drag & drop</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">PDF, XLSX, or ZIP (max 50MB)</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDocumentOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => {
              setDocuments(prev => [{ id: `DOC-00${prev.length + 1}`, name: "Uploaded_Document.pdf", type: "General", size: "0.5 MB", date: "2024-03-23" }, ...prev]);
              setIsAddDocumentOpen(false);
              toast({ title: "Document Uploaded" });
            }} className="rounded-xl">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancePage;
