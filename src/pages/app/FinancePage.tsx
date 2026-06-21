import React, { useState } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Download, Plus, Search,
  Calendar, FileText, Target, PieChart as PieChartIcon, ArrowRight,
  Filter, MoreHorizontal, LayoutDashboard, Receipt, Wallet,
  CreditCard, Users, Clock, ShieldCheck, Globe, Zap, CheckCircle2,
  AlertCircle, Package, Building2, Landmark, History, Link2, ExternalLink,
  Edit, Trash2, MoreVertical, Send, Eye, BarChart3, Check, User, Bot, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIndustryStore, CRMContact } from "@/lib/industry-store";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, exportToCSV } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type FinanceTool = string;

const FinancePage = () => {
  // Finance module component
  const { 
    userType, 
    subscriptionTier,
    selectedModules = [], 
    crmContacts = [], 
    setCyndiOpen, 
    setCyndiDraft,
    invoices: storeInvoices = [],
    addInvoice: storeAddInvoice,
    expenses: storeExpenses = [],
    addExpense: storeAddExpense,
    payroll: storePayroll = [],
    addPayroll: storeAddPayroll,
    assets: storeAssets = [],
    addAsset: storeAddAsset,
  } = useIndustryStore();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const allTools = useMemo(() => [
    { id: 'finance-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoicing', label: 'Invoicing', icon: Receipt },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'finance-time-tracking', label: 'Billable Hours', icon: Clock },
    { id: 'payments', label: 'Payments', icon: ShieldCheck },
    { id: 'multi-currency', label: 'Currency', icon: Globe },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'finance-reports', label: 'Reports', icon: BarChart3 },
  ], []);

  const tools = useMemo(() => {
    const safeModules = Array.isArray(selectedModules) ? selectedModules : [];
    if (userType === 'enterprise' || userType === 'organisation' || userType === 'solo') return allTools;
    
    const filtered = allTools.filter(item => safeModules.includes(item.id));
    
    if (filtered.length === 0) {
      return [allTools[0]]; // Default to dashboard
    }
    return filtered;
  }, [selectedModules, userType, allTools]);

  const [activeTool, setActiveTool] = useState<string>(tools[0]?.id || 'finance-dashboard');

  // Sync active tool if selection changes
  useEffect(() => {
    if (tools.length > 0 && !tools.find(i => i.id === activeTool)) {
      setActiveTool(tools[0].id);
    }
  }, [tools, activeTool]);

  useEffect(() => {
    const raw = location.pathname.split("/app/")[1] || "dashboard";
    const segment = raw.split("/")[0] || "dashboard";
    const fromRoute = segment === "finance" ? "finance-dashboard" : segment;
    if (allTools.some((t) => t.id === fromRoute) && fromRoute !== activeTool) {
      setActiveTool(fromRoute);
    }
  }, [location.pathname, activeTool, allTools]);

  const goToTool = (id: string) => {
    const url = id === "finance-dashboard" ? "/app/finance" : `/app/${id}`;
    navigate(url);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [activeReportType, setActiveReportType] = useState<'p-and-l' | 'balance-sheet' | 'cash-flow'>('p-and-l');

  // --- Calculations (Spreadsheet Logic) ---
  const revenueTotal = useMemo(() => 
    storeInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0)
  , [storeInvoices]);

  const expenseTotal = useMemo(() => 
    storeExpenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0)
  , [storeExpenses]);

  const netProfit = revenueTotal - expenseTotal;
  const burnRate = expenseTotal / 6; // Average over 6 months
  const profitMargin = revenueTotal > 0 ? (netProfit / revenueTotal) * 100 : 0;

  const [taxRate, setTaxRate] = useState(15);
  const [invoiceItems, setInvoiceItems] = useState([{ id: Date.now(), description: "", amount: 0, quantity: 1 }]);
  
  const calculatedInvoice = useMemo(() => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    const tax = subtotal * (taxRate / 100);
    return { subtotal, tax, total: subtotal + tax };
  }, [invoiceItems, taxRate]);

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { id: Date.now(), description: "", amount: 0, quantity: 1 }]);
  };

  const removeInvoiceItem = (id: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  const updateInvoiceItem = (id: number, patch: any) => {
    setInvoiceItems(invoiceItems.map(item => item.id === id ? { ...item, ...patch } : item));
  };

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

  // Sync store with mock data if empty
  useEffect(() => {
    // Initial data load would happen here from API
  }, []);

  // Format store invoices for display
  const invoices = useMemo(() => {
    return storeInvoices.map(inv => ({
      ...inv,
      amount: typeof inv.amount === 'number' ? `$${inv.amount.toLocaleString()}` : inv.amount,
      icon: inv.client.includes('Global') ? Globe : inv.client.includes('Solaris') ? Zap : inv.client.includes('Nebula') ? ShieldCheck : Building2
    }));
  }, [storeInvoices]);

  const expenses = useMemo(() => {
    return storeExpenses.map(exp => ({
      ...exp,
      amount: typeof exp.amount === 'number' ? `$${exp.amount.toLocaleString()}` : exp.amount
    }));
  }, [storeExpenses]);

  const [payroll, setPayroll] = useState<{ id: string; employee: string; role: string; amount: string; status: string }[]>(storePayroll.map(p => ({
    id: p.id,
    employee: p.employee,
    role: p.role,
    amount: `$${p.amount.toLocaleString()}`,
    status: p.status
  })));

  const [inventory, setInventory] = useState<{ id: string; item: string; serial: string; value: string; status: string }[]>(storeAssets.map(a => ({
    id: a.id,
    item: a.item,
    serial: a.serial,
    value: `$${a.value.toLocaleString()}`,
    status: a.status
  })));

  const [timeEntries, setTimeEntries] = useState<{ id: string; employee: string; project: string; hours: string; date: string; status: string }[]>([]);

  const [payments, setPayments] = useState<{ id: string; method: string; amount: string; date: string; status: string; type: string }[]>([]);

  const [currencies, setCurrencies] = useState([
    { code: "USD", name: "US Dollar", rate: "1.00", status: "Primary" },
  ]);

  const [integrations, setIntegrations] = useState<{ id: string; name: string; category: string; status: string; icon: any }[]>([]);

  // File Upload State
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const [documents, setDocuments] = useState<{ id: string; name: string; type: string; size: string; date: string }[]>([]);

  const revenueData: { name: string; revenue: number; profit: number }[] = [];

  const categoryData: { name: string; value: number; color: string }[] = [];

  const handlePrimaryAction = () => {
    if (activeTool === 'invoicing') setIsAddInvoiceOpen(true);
    else if (activeTool === 'expenses') setIsAddExpenseOpen(true);
    else if (activeTool === 'payroll') setIsAddPayrollOpen(true);
    else if (activeTool === 'inventory') setIsAddAssetOpen(true);
    else if (activeTool === 'finance-time-tracking') setIsAddTimeEntryOpen(true);
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

  const [newInvoice, setNewInvoice] = useState({ client: "", amount: "", date: new Date().toISOString().split('T')[0] });
  const [newExpense, setNewExpense] = useState({ category: "", amount: "", date: new Date().toISOString().split('T')[0] });
  const [newPayment, setNewPayment] = useState({ method: "Bank Transfer", amount: "", date: new Date().toISOString().split('T')[0], type: "Inbound" as const });
  const [newPayroll, setNewPayroll] = useState({ employee: "", role: "", amount: "", status: "Pending" });
  const [newAsset, setNewAsset] = useState({ item: "", serial: "", value: "", status: "Active" });

  const [isClientPopoverOpen, setIsClientPopoverOpen] = useState(false);

  const handleLetCyndiHandleIt = (context: string) => {
    setIsAddInvoiceOpen(false);
    setIsAddExpenseOpen(false);
    setCyndiDraft(`I want to ${context}. Here's what I need...`);
    setCyndiOpen(true);
  };

  const handleAddInvoice = (calculatedTotal?: number) => {
    if (!newInvoice.client) return;
    const finalAmount = calculatedTotal !== undefined ? calculatedTotal : Number(newInvoice.amount);
    if (!finalAmount) return;

    const inv = {
      id: `INV-${Math.floor(100 + Math.random() * 900)}`,
      client: newInvoice.client,
      amount: finalAmount,
      date: newInvoice.date,
      status: "Pending" as const
    };
    storeAddInvoice(inv);
    setIsAddInvoiceOpen(false);
    setNewInvoice({ client: "", amount: "", date: new Date().toISOString().split('T')[0] });
    setInvoiceItems([{ id: Date.now(), description: "", amount: 0, quantity: 1 }]);
    toast({ title: "Invoice Created", description: `Invoice for ${newInvoice.client} has been generated.` });
  };

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.amount) return;
    const exp = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      category: newExpense.category,
      amount: `$${Number(newExpense.amount).toLocaleString()}`,
      date: newExpense.date,
      status: "Pending" as const
    };
    storeAddExpense({
      id: exp.id,
      category: exp.category,
      amount: Number(newExpense.amount),
      date: exp.date,
      status: exp.status
    });
    setIsAddExpenseOpen(false);
    setNewExpense({ category: "", amount: "", date: new Date().toISOString().split('T')[0] });
     toast({ title: "Expense Logged", description: `Expense for ${newExpense.category} is pending approval.` });
   };

   const handleAddPayment = () => {
    if (!newPayment.amount) return;
    const payment = {
      id: `TRX-${Math.floor(100 + Math.random() * 900)}`,
      method: newPayment.method,
      amount: `$${Number(newPayment.amount).toLocaleString()}`,
      date: newPayment.date,
      status: "Completed" as const,
      type: newPayment.type
    };
    setPayments([payment, ...payments]);
    setIsAddPaymentOpen(false);
    setNewPayment({ method: "Bank Transfer", amount: "", date: new Date().toISOString().split('T')[0], type: "Inbound" as const });
    toast({ title: "Payment Recorded", description: "The transaction has been logged successfully." });
  };

  const handleAddPayroll = () => {
    if (!newPayroll.employee || !newPayroll.role || !newPayroll.amount) return;
    const payrollEntry = {
      id: `PYR-${Math.floor(100 + Math.random() * 900)}`,
      employee: newPayroll.employee,
      role: newPayroll.role,
      amount: Number(newPayroll.amount),
      date: new Date().toISOString().split('T')[0],
      status: newPayroll.status
    };
    storeAddPayroll(payrollEntry);
    setPayroll([{
      id: payrollEntry.id,
      employee: payrollEntry.employee,
      role: payrollEntry.role,
      amount: `$${payrollEntry.amount.toLocaleString()}`,
      status: payrollEntry.status
    }, ...payroll]);
    setIsAddPayrollOpen(false);
    setNewPayroll({ employee: "", role: "", amount: "", status: "Pending" });
    toast({ title: "Payroll Processed", description: `Payroll for ${newPayroll.employee} has been created.` });
  };

  const handleAddAsset = () => {
    if (!newAsset.item || !newAsset.serial || !newAsset.value) return;
    const asset = {
      id: `AST-${Math.floor(100 + Math.random() * 900)}`,
      item: newAsset.item,
      serial: newAsset.serial,
      value: Number(newAsset.value),
      date: new Date().toISOString().split('T')[0],
      status: newAsset.status
    };
    storeAddAsset(asset);
    setInventory([{
      id: asset.id,
      item: asset.item,
      serial: asset.serial,
      value: `$${asset.value.toLocaleString()}`,
      status: asset.status
    }, ...inventory]);
    setIsAddAssetOpen(false);
    setNewAsset({ item: "", serial: "", value: "", status: "Active" });
    toast({ title: "Asset Added", description: `Asset ${newAsset.item} has been registered.` });
  };

   const handleExport = () => {
    if (subscriptionTier === 'trial') {
      toast({ 
        title: "Export not available", 
        description: "Upgrade your account to export data.", 
        variant: "destructive" 
      });
      return;
    }

    let data: any[] = [];
    const filename = `finance_${activeTool}`;
    
    if (activeTool === 'invoicing') data = storeInvoices;
    else if (activeTool === 'expenses') data = storeExpenses;
    else if (activeTool === 'payroll') data = payroll;
    else if (activeTool === 'inventory') data = inventory;
    else if (activeTool === 'payments') data = payments;
    
    if (data.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }
    
    exportToCSV(data, filename);
    toast({ 
      title: "Export Successful", 
      description: `Your ${activeTool} data has been exported.` 
    });
   };

  const handleFileUpload = async () => {
    if (!uploadedFile) return;

    setIsProcessingFile(true);
    setExtractedData(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("department", "finance");
      formData.append("business_id", "default"); // TODO: Get actual business_id from store

      // Try to call Python automation service
      const response = await fetch("http://localhost:8000/file-processing/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process file");
      }

      const data = await response.json();

      setExtractedData({
        fileName: data.file_name,
        fileType: data.file_type,
        extractedRecords: data.extracted_records,
        summary: data.summary,
      });

      toast({
        title: "File Processed",
        description: `AI has extracted ${data.extracted_records.length} records from ${uploadedFile.name}.`
      });
    } catch (error) {
      console.error("File upload error:", error);
      // Use mock data when service is unavailable (development mode)
      const mockData = {
        fileName: uploadedFile.name,
        fileType: uploadedFile.type,
        extractedRecords: [
          { type: "Invoice", client: "Sample Client", amount: 5000, date: "2024-01-15" },
          { type: "Expense", category: "Office Supplies", amount: 250, date: "2024-01-16" },
          { type: "Expense", category: "Travel", amount: 1200, date: "2024-01-17" },
        ],
        summary: "Successfully extracted 3 financial records from your file."
      };
      setExtractedData(mockData);
      toast({
        title: "File Processed (Mock Mode)",
        description: `AI has extracted ${mockData.extractedRecords.length} records from ${uploadedFile.name}.`
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

   // Two-step Delete Confirmation
   const [isDeleteModal1Open, setIsDeleteModal1Open] = useState(false);
   const [isDeleteModal2Open, setIsDeleteModal2Open] = useState(false);
   const [itemToDelete, setItemToDelete] = useState<{ id: string, type: string } | null>(null);

   const handleDelete = (id: string, type: string) => {
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
       // We can add logic here to delete from store if needed
       setIsDeleteModal2Open(false);
       setItemToDelete(null);
       toast({ title: "Deleted", description: `${type} ${id} removed successfully.` });
     }
   };
 
   return (
    <div className="space-y-6">
      {/* Add Invoice Dialog */}
      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl uppercase tracking-tight">New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Client Name</Label>
              <Popover open={isClientPopoverOpen} onOpenChange={setIsClientPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isClientPopoverOpen}
                    className="w-full h-12 rounded-xl border-2 font-bold justify-between bg-transparent hover:bg-secondary/10"
                  >
                    {newInvoice.client || "Select CRM Contact..."}
                    <MoreVertical className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 rounded-2xl border-2" align="start">
                  <Command>
                    <CommandInput placeholder="Search CRM contacts..." className="h-12" />
                    <CommandList>
                      <CommandEmpty>No contact found.</CommandEmpty>
                      <CommandGroup heading="CRM Contacts">
                        {crmContacts.map((contact) => (
                          <CommandItem
                            key={contact.id}
                            value={contact.name}
                            onSelect={(currentValue) => {
                              setNewInvoice({ ...newInvoice, client: currentValue });
                              setIsClientPopoverOpen(false);
                            }}
                            className="flex items-center gap-3 p-3 cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black uppercase tracking-tight">{contact.name}</p>
                              <p className="text-[10px] font-bold text-muted-foreground truncate">{contact.email}</p>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4 text-primary",
                                newInvoice.client === contact.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Amount ($)</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                  className="h-12 rounded-xl border-2 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Date</Label>
                <Input 
                  type="date"
                  value={newInvoice.date}
                  onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})}
                  className="h-12 rounded-xl border-2 font-bold"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleLetCyndiHandleIt("create an invoice")}
              className="w-full rounded-xl border-2 border-primary/30 text-primary hover:bg-primary/5 uppercase font-black tracking-widest text-[10px] h-12"
            >
              <Bot className="w-4 h-4 mr-2" /> Let Cyndi handle it
            </Button>
            <Button onClick={handleAddInvoice} className="w-full h-12 rounded-xl shadow-glow uppercase font-black tracking-widest text-xs">Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl uppercase tracking-tight">Log Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Category</Label>
              <Select onValueChange={(val) => setNewExpense({...newExpense, category: val})}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {["Software", "Rent", "Marketing", "Travel", "Hardware", "Utilities"].map(c => (
                    <SelectItem key={c} value={c} className="font-bold uppercase text-[10px]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Amount ($)</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="h-12 rounded-xl border-2 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Date</Label>
                <Input 
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="h-12 rounded-xl border-2 font-bold"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleLetCyndiHandleIt("log an expense")}
              className="w-full rounded-xl border-2 border-primary/30 text-primary hover:bg-primary/5 uppercase font-black tracking-widest text-[10px] h-12"
            >
              <Bot className="w-4 h-4 mr-2" /> Let Cyndi handle it
            </Button>
            <Button onClick={handleAddExpense} className="w-full h-12 rounded-xl shadow-glow uppercase font-black tracking-widest text-xs">Submit Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl uppercase tracking-tight">Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Payment Type</Label>
              <Select defaultValue="Inbound" onValueChange={(val) => setNewPayment({...newPayment, type: val as "Inbound" | "Outbound"})}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inbound">Inbound (Received)</SelectItem>
                  <SelectItem value="Outbound">Outbound (Sent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Payment Method</Label>
              <Select defaultValue="Bank Transfer" onValueChange={(val) => setNewPayment({...newPayment, method: val})}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Amount ($)</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  className="h-12 rounded-xl border-2 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Date</Label>
                <Input 
                  type="date"
                  value={newPayment.date}
                  onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                  className="h-12 rounded-xl border-2 font-bold"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-3">
            <Button onClick={handleAddPayment} className="w-full h-12 rounded-xl shadow-glow uppercase font-black tracking-widest text-xs">Log Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payroll Dialog */}
      <Dialog open={isAddPayrollOpen} onOpenChange={setIsAddPayrollOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl uppercase tracking-tight">Run Payroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Employee Name</Label>
              <Input 
                placeholder="John Doe" 
                value={newPayroll.employee}
                onChange={(e) => setNewPayroll({...newPayroll, employee: e.target.value})}
                className="h-12 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Role</Label>
              <Input 
                placeholder="Software Engineer" 
                value={newPayroll.role}
                onChange={(e) => setNewPayroll({...newPayroll, role: e.target.value})}
                className="h-12 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Amount ($)</Label>
                <Input 
                  type="number"
                  placeholder="5000" 
                  value={newPayroll.amount}
                  onChange={(e) => setNewPayroll({...newPayroll, amount: e.target.value})}
                  className="h-12 rounded-xl border-2 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Status</Label>
                <Select 
                  defaultValue="Pending"
                  onValueChange={(v) => setNewPayroll({...newPayroll, status: v})}
                >
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-3">
            <Button onClick={handleAddPayroll} className="w-full h-12 rounded-xl shadow-glow uppercase font-black tracking-widest text-xs">Run Payroll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Asset Dialog */}
      <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl uppercase tracking-tight">Add Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Item Name</Label>
              <Input 
                placeholder="MacBook Pro" 
                value={newAsset.item}
                onChange={(e) => setNewAsset({...newAsset, item: e.target.value})}
                className="h-12 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Serial Number</Label>
              <Input 
                placeholder="C02X12345678" 
                value={newAsset.serial}
                onChange={(e) => setNewAsset({...newAsset, serial: e.target.value})}
                className="h-12 rounded-xl border-2 font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Value ($)</Label>
                <Input 
                  type="number"
                  placeholder="2000" 
                  value={newAsset.value}
                  onChange={(e) => setNewAsset({...newAsset, value: e.target.value})}
                  className="h-12 rounded-xl border-2 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Status</Label>
                <Select 
                  defaultValue="Active"
                  onValueChange={(v) => setNewAsset({...newAsset, status: v})}
                >
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-3">
            <Button onClick={handleAddAsset} className="w-full h-12 rounded-xl shadow-glow uppercase font-black tracking-widest text-xs">Add Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="font-black text-xl uppercase tracking-tight">Import Finance Data</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Upload a CSV, XLSX, or PDF file and AI will extract and arrange the information for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!extractedData ? (
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".csv,.xlsx,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadedFile(file);
                  }}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm font-bold mb-2">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">CSV, XLSX, or PDF up to 10MB</p>
                </label>
                {uploadedFile && (
                  <div className="mt-4 p-3 bg-secondary/30 rounded-xl">
                    <p className="text-xs font-bold">{uploadedFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">AI Extraction Complete</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{extractedData.summary}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Extracted Records</p>
                  {extractedData.extractedRecords.map((record: any, idx: number) => (
                    <div key={idx} className="p-3 bg-secondary/30 rounded-xl text-xs">
                      <p className="font-bold">{record.type}: {record.client || record.category}</p>
                      <p className="text-muted-foreground">Amount: ${record.amount} | Date: {record.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-3">
            {!extractedData ? (
              <Button
                onClick={handleFileUpload}
                disabled={!uploadedFile || isProcessingFile}
                className="w-full h-12 rounded-xl shadow-glow uppercase font-black tracking-widest text-xs"
              >
                {isProcessingFile ? "Processing..." : "Process with AI"}
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setExtractedData(null);
                    setUploadedFile(null);
                    setIsFileUploadOpen(false);
                  }}
                  className="w-full h-12 rounded-xl shadow-glow uppercase font-black tracking-widest text-xs"
                >
                  Import to Finance
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setExtractedData(null);
                    setUploadedFile(null);
                  }}
                  className="w-full h-12 rounded-xl uppercase font-black tracking-widest text-xs"
                >
                  Upload Another File
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Finance</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your company's financial health and operations.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
            <Button variant="outline" size="sm" className="rounded-xl h-9 whitespace-nowrap" onClick={() => setIsFileUploadOpen(true)}>
              <Upload className="w-4 h-4 mr-1.5" /> Import File
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl h-9 whitespace-nowrap" 
                    onClick={handleExport}
                    disabled={subscriptionTier === 'trial'}
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Export
                  </Button>
                </TooltipTrigger>
                {subscriptionTier === 'trial' && (
                  <TooltipContent>
                    <p>Upgrade to export data</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Button
              size="sm"
              className="rounded-xl h-9 bg-primary hover:bg-primary/90 text-white shadow-sm whitespace-nowrap"
              onClick={handlePrimaryAction}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {activeTool === 'invoicing' ? 'New Invoice' :
               activeTool === 'expenses' ? 'Log Expense' :
               activeTool === 'payroll' ? 'Run Payroll' :
               activeTool === 'inventory' ? 'Add Asset' :
               activeTool === 'clients' ? 'New Client' :
               activeTool === 'finance-time-tracking' ? 'Log Time' : 'New Entry'}
            </Button>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto no-scrollbar">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => goToTool(tool.id)}
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
            {activeTool === 'finance-dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Revenue", value: `$${revenueTotal.toLocaleString()}`, change: "+12.5%", icon: DollarSign, color: "text-green-500" },
                    { label: "Net Profit", value: `$${netIncome.toLocaleString()}`, change: `${profitMargin.toFixed(1)}% margin`, icon: TrendingUp, color: "text-primary" },
                    { label: "Burn Rate", value: `$${burnRate.toLocaleString()}/mo`, change: "-2.4%", icon: Clock, color: "text-primary" },
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Invoices</h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative w-full sm:w-[250px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search invoices..." 
                          className="pl-9 h-9 w-full text-xs rounded-xl"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl h-9">
                        <Filter className="w-4 h-4 mr-1.5" /> Filter
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Invoice</th>
                          <th className="pb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Client</th>
                          <th className="pb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</th>
                          <th className="pb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                          <th className="pb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                          <th className="pb-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {invoices.filter(i => i.client.toLowerCase().includes(searchQuery.toLowerCase())).map((invoice) => (
                          <tr key={invoice.id} className="group hover:bg-secondary/20 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-sm font-bold">{invoice.id}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                {invoice.icon && <invoice.icon className="w-3.5 h-3.5 text-muted-foreground" />}
                                <span className="text-sm font-medium">{invoice.client}</span>
                              </div>
                            </td>
                            <td className="py-4 text-sm font-bold">{invoice.amount}</td>
                            <td className="py-4 text-sm text-muted-foreground">{invoice.date}</td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                invoice.status === 'Paid' ? 'bg-green-500/10 text-green-600' :
                                invoice.status === 'Overdue' ? 'bg-destructive/10 text-destructive' :
                                'bg-primary/10 text-primary'
                              }`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleDelete(invoice.id, 'invoice')}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
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

            {activeTool === 'expenses' && (
              <motion.div key="expenses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Recent Expenses</h3>
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{expense.category}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{expense.date} • {expense.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{expense.amount}</p>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            expense.status === 'Approved' ? 'text-green-600' : 'text-primary'
                          }`}>{expense.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'payroll' && (
              <motion.div key="payroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Payroll Summary</h3>
                  <div className="space-y-4">
                    {payroll.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{entry.employee}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{entry.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{entry.amount}</p>
                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{entry.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'inventory' && (
              <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Company Assets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-border bg-secondary/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white border border-border">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{item.item}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.serial}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{item.value}</p>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'finance-time-tracking' && (
              <motion.div key="time" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Billable Hours</h3>
                  <div className="space-y-4">
                    {timeEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{entry.employee}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{entry.project}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{entry.hours} hrs</p>
                          <p className="text-[10px] text-muted-foreground">{entry.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'payments' && (
              <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Recent Payments</h3>
                  <div className="space-y-4">
                    {payments.map((trx) => (
                      <div key={trx.id} className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            trx.type === "Inbound" ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                          )}>
                            {trx.type === "Inbound" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{trx.method}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{trx.id} • {trx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-sm font-bold", trx.type === "Inbound" ? "text-green-600" : "text-destructive")}>
                            {trx.type === "Inbound" ? "+" : "-"}{trx.amount}
                          </p>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{trx.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTool === 'finance-reports' && (
              <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between bg-secondary/10 p-4 rounded-2xl border border-border">
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'p-and-l', label: 'Profit & Loss' },
                      { id: 'balance-sheet', label: 'Balance Sheet' },
                      { id: 'cash-flow', label: 'Cash Flow' },
                    ].map((report) => (
                      <button
                        key={report.id}
                        onClick={() => setActiveReportType(report.id as any)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeReportType === report.id ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {report.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="this-month">
                      <SelectTrigger className="w-[140px] h-9 text-[10px] font-black uppercase tracking-widest rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-quarter">Last Quarter</SelectItem>
                        <SelectItem value="this-year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="rounded-xl h-9">
                      <Download className="w-3.5 h-3.5 mr-2" /> Export PDF
                    </Button>
                  </div>
                </div>

                <div className="p-8 rounded-[24px] border-2 border-border bg-card shadow-sm max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <h3 className="font-display text-2xl font-black uppercase tracking-tight">
                      {activeReportType === 'p-and-l' ? 'Statement of Profit and Loss' : 
                       activeReportType === 'balance-sheet' ? 'Balance Sheet' : 'Cash Flow Statement'}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Cynda Business OS • As of March 2024</p>
                  </div>

                  {activeReportType === 'p-and-l' && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Operating Revenue</h4>
                        <div className="space-y-3">
                          {storeInvoices.filter(i => i.status === 'Paid').slice(0, 5).map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between text-sm">
                              <span className="font-medium text-muted-foreground">{inv.client}</span>
                              <span className="font-bold">${inv.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                            <span className="text-xs font-black uppercase tracking-widest">Total Revenue</span>
                            <span className="text-base font-black text-primary">${revenueTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Operating Expenses</h4>
                        <div className="space-y-3">
                          {storeExpenses.filter(e => e.status === 'Approved').slice(0, 5).map((exp) => (
                            <div key={exp.id} className="flex items-center justify-between text-sm">
                              <span className="font-medium text-muted-foreground">{exp.category}</span>
                              <span className="font-bold">${exp.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                            <span className="text-xs font-black uppercase tracking-widest">Total Expenses</span>
                            <span className="text-base font-black text-primary">${expenseTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/20 mt-12">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Net Operating Income</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Earnings before interest and taxes (EBIT)</p>
                          </div>
                          <p className={cn("text-3xl font-display font-black", netIncome >= 0 ? "text-primary" : "text-destructive")}>
                            ${netIncome.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeReportType === 'balance-sheet' && (
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-green-600 border-b border-green-600/20 pb-2">Assets</h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">Current Assets</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium"><span>Cash and Equivalents</span><span>$142,500</span></div>
                                <div className="flex justify-between text-xs font-medium"><span>Accounts Receivable</span><span>$18,400</span></div>
                                <div className="flex justify-between text-xs font-medium"><span>Inventory</span><span>$32,100</span></div>
                              </div>
                            </div>
                            <div className="space-y-2 pt-2">
                              <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">Fixed Assets</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium"><span>Equipment & Hardware</span><span>$24,000</span></div>
                                <div className="flex justify-between text-xs font-medium"><span>Accumulated Depreciation</span><span className="text-red-500">($4,200)</span></div>
                              </div>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-border">
                              <span className="text-xs font-black uppercase">Total Assets</span>
                              <span className="text-sm font-black text-green-600">$212,800</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 border-b border-red-600/20 pb-2">Liabilities & Equity</h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">Liabilities</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium"><span>Accounts Payable</span><span>$12,400</span></div>
                                <div className="flex justify-between text-xs font-medium"><span>Deferred Revenue</span><span>$8,500</span></div>
                                <div className="flex justify-between text-xs font-medium"><span>Short-term Loans</span><span>$15,000</span></div>
                              </div>
                            </div>
                            <div className="space-y-2 pt-2">
                              <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">Equity</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium"><span>Owner Capital</span><span>$100,000</span></div>
                                <div className="flex justify-between text-xs font-medium"><span>Retained Earnings</span><span>$76,900</span></div>
                              </div>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-border">
                              <span className="text-xs font-black uppercase">Total L & E</span>
                              <span className="text-sm font-black text-red-600">$212,800</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-secondary/30 rounded-xl flex items-center gap-3 border border-border">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Balance sheet is in balance • Assets = Liabilities + Equity</p>
                      </div>
                    </div>
                  )}

                  {activeReportType === 'cash-flow' && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Operating Activities</h4>
                        <div className="space-y-3">
                          {[
                            { label: 'Net Income', amount: '$42,400.00' },
                            { label: 'Adjustments for Depreciation', amount: '$4,200.00' },
                            { label: 'Changes in Working Capital', amount: '($2,500.00)' },
                          ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between text-sm">
                              <span className="font-medium text-muted-foreground">{row.label}</span>
                              <span className="font-bold">{row.amount}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                            <span className="text-xs font-black uppercase tracking-widest">Net Cash from Operations</span>
                            <span className="text-base font-black text-primary">$44,100.00</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b border-blue-600/20 pb-2">Investing Activities</h4>
                        <div className="space-y-3">
                          {[
                            { label: 'Purchase of Equipment', amount: '($15,000.00)' },
                            { label: 'Sale of Assets', amount: '$2,000.00' },
                          ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between text-sm">
                              <span className="font-medium text-muted-foreground">{row.label}</span>
                              <span className="font-bold">{row.amount}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                            <span className="text-xs font-black uppercase tracking-widest">Net Cash from Investing</span>
                            <span className="text-base font-black text-blue-600">($13,000.00)</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-secondary/30 rounded-2xl border-2 border-border mt-12">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Net Cash Change</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Total increase/decrease in cash</p>
                          </div>
                          <p className="text-3xl font-display font-black text-foreground">$31,100.00</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTool === 'integrations' && (
              <motion.div key="integrations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {integrations.map((int) => (
                    <div key={int.id} className="p-6 rounded-[24px] border-2 border-border bg-card hover:border-primary/30 transition-all group">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                          {int.icon && <int.icon className="w-6 h-6 text-primary" />}
                        </div>
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest border-none px-2 py-0.5",
                          int.status === 'Connected' ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                        )}>
                          {int.status}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight mb-1">{int.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">{int.category}</p>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant={int.status === 'Connected' ? "outline" : "default"} 
                          className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                          onClick={() => {
                            setIntegrations(integrations.map(i => i.id === int.id ? { ...i, status: i.status === 'Connected' ? 'Disconnected' : 'Connected' } : i));
                            toast({ title: int.status === 'Connected' ? "Integration Disconnected" : "Integration Connected" });
                          }}
                        >
                          {int.status === 'Connected' ? "Configure" : "Connect"}
                        </Button>
                        {int.status === 'Connected' && (
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => {
                            setIntegrations(integrations.map(i => i.id === int.id ? { ...i, status: 'Disconnected' } : i));
                            toast({ title: "Integration Removed" });
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-6 rounded-[24px] border-2 border-dashed border-border bg-secondary/5 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/30 transition-all" onClick={() => toast({ title: "Integration Request Sent" })}>
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Request Integration</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Financial Documents</h3>
                    <Button size="sm" className="rounded-xl h-9" onClick={() => toast({ title: "Upload Started" })}>
                      <Upload className="w-4 h-4 mr-1.5" /> Upload File
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.length > 0 ? documents.map((doc) => (
                      <div key={doc.id} className="p-4 rounded-xl border border-border hover:bg-secondary/10 transition-colors group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm font-bold truncate">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">{doc.size} • {doc.date}</p>
                      </div>
                    )) : (
                      <div className="col-span-full py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No documents uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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

      {/* Add Invoice Dialog */}
      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[32px] border-4 p-8 bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Create Invoice</DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Generate a new billable item for a client.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest px-1">Client Name</Label>
              <Input 
                placeholder="e.g. Acme Corp" 
                className="rounded-xl h-12 border-2" 
                value={newInvoice.client}
                onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest px-1">Line Items</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-secondary/30 px-2 py-1 rounded-lg">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tax Rate %</Label>
                    <Input 
                      type="number" 
                      className="w-12 h-6 text-[10px] font-bold p-1 rounded border-none bg-transparent focus-visible:ring-0" 
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-7 rounded-lg text-[9px] uppercase font-black" onClick={addInvoiceItem}>
                    <Plus className="w-3 h-3 mr-1" /> Add Item
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                {invoiceItems.map((item, index) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-2 items-start bg-secondary/10 p-2 rounded-xl sm:bg-transparent sm:p-0">
                    <Input 
                      placeholder="Description" 
                      className="w-full sm:flex-1 h-10 rounded-lg text-xs" 
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(item.id, { description: e.target.value })}
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Input 
                        type="number" 
                        placeholder="Qty" 
                        className="flex-1 sm:w-20 h-10 rounded-lg text-xs" 
                        value={item.quantity || ""}
                        onChange={(e) => updateInvoiceItem(item.id, { quantity: parseFloat(e.target.value) })}
                      />
                      <Input 
                        type="number" 
                        placeholder="Price" 
                        className="flex-1 sm:w-24 h-10 rounded-lg text-xs" 
                        value={item.amount || ""}
                        onChange={(e) => updateInvoiceItem(item.id, { amount: parseFloat(e.target.value) })}
                      />
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive shrink-0" onClick={() => removeInvoiceItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/50 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase tracking-widest">Subtotal</span>
                <span>${calculatedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase tracking-widest">Tax ({taxRate}%)</span>
                <span>${calculatedInvoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black border-t border-border pt-2 mt-2">
                <span className="uppercase tracking-tight">Total Amount</span>
                <span className="text-primary">${calculatedInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest px-1">Status</Label>
              <Select value={newInvoice.status} onValueChange={(v) => setNewInvoice({ ...newInvoice, status: v })}>
                <SelectTrigger className="rounded-xl h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-widest shadow-glow" onClick={() => handleAddInvoice(calculatedInvoice.total)}>Create Invoice</Button>
            <Button variant="ghost" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest" onClick={() => setIsAddInvoiceOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[32px] border-4 p-8 bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Log Expense</DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Record a new business expenditure.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest px-1">Category</Label>
              <Input 
                placeholder="e.g. Software, Travel, Marketing" 
                className="rounded-xl h-12 border-2" 
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest px-1">Amount ($)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="rounded-xl h-12 border-2" 
                  value={newExpense.amount || ""}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest px-1">Status</Label>
                <Select value={newExpense.status} onValueChange={(v) => setNewExpense({ ...newExpense, status: v })}>
                  <SelectTrigger className="rounded-xl h-12 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button className="w-full h-12 rounded-2xl font-black uppercase tracking-widest shadow-glow" onClick={handleAddExpense}>Log Expense</Button>
            <Button variant="ghost" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest" onClick={() => setIsAddExpenseOpen(false)}>Cancel</Button>
          </DialogFooter>
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

export default FinancePage;
