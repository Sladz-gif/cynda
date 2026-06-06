import { Link, useNavigate } from "react-router-dom";
import React, { useState, useMemo, useEffect } from "react";
import { 
  Users, Building2, Search as SearchIcon, Plus, Shield, ShieldCheck, 
  Filter, MoreHorizontal, Mail, Phone, 
  ExternalLink, Trash2, Edit2, CheckCircle2, XCircle,
  Clock, ArrowUpRight, HelpCircle, LifeBuoy, BellRing, Smartphone,
  Ticket, Gift, RefreshCcw, Copy, LogOut, Database, Layers, UserPlus,
  Briefcase, Layout, Settings, ChevronRight, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIndustryStore } from "@/lib/industry-store";

// Empty initial states
const SuperAdminPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { adminProfile, setAdminProfile } = useIndustryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Security Guard
  useEffect(() => {
    if (!adminProfile || adminProfile.role !== 'Super Admin') {
      navigate("/super-admin/auth", { replace: true });
    }
  }, [adminProfile, navigate]);

  const handleLogout = () => {
    setAdminProfile(null);
    toast({ title: "Logged Out", description: "Admin session ended." });
    navigate("/super-admin/auth");
  };
  
  // These would typically come from a database/API
  const accounts: any[] = [];
  const tickets: any[] = [];
  const waitlist: any[] = [];
  const codes: any[] = [];

  // New account form state
  const [createStep, setCreateStep] = useState(1);
  const [newAccount, setNewAccount] = useState({
    companyName: "",
    adminName: "",
    adminEmail: "",
    tempPassword: Math.random().toString(36).slice(-8),
    userType: "enterprise" as any,
    departments: ["CRM", "Finance", "Projects", "HR", "Other"],
    workspaces: ["Main HQ"],
    defaultRoles: ["Director", "Manager", "Employee"]
  });

  const availableDepts = ["CRM", "Finance", "Projects", "HR", "Marketing", "Operations", "Legal", "Other"];

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (createStep < (newAccount.userType === 'enterprise' ? 2 : 1)) {
      setCreateStep(createStep + 1);
      return;
    }

    toast({
      title: "Account Provisioned",
      description: `${newAccount.userType.toUpperCase()} account for ${newAccount.companyName || newAccount.adminName} has been initialized.`,
    });
    setIsCreateModalOpen(false);
    setCreateStep(1);
    setNewAccount({
      companyName: "",
      adminName: "",
      adminEmail: "",
      tempPassword: Math.random().toString(36).slice(-8),
      userType: "enterprise",
      departments: ["CRM", "Finance", "Projects", "HR", "Other"],
      workspaces: ["Main HQ"],
      defaultRoles: ["Director", "Manager", "Employee"]
    });
  };

  // New code form state
  const [newCode, setNewCode] = useState({
    code: "",
    duration: "2",
    reason: ""
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode({ ...newCode, code: result });
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => 
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, accounts]);

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Redemption Code Created",
      description: `Code ${newCode.code} for ${newCode.duration} months has been generated.`,
    });
    setIsCodeModalOpen(false);
    setNewCode({ code: "", duration: "2", reason: "" });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            Super Admin Control
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mt-1 opacity-70">
            Enterprise Management & Global Support System
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="h-12 px-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
          <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 border-2">
                <Gift className="w-4 h-4" /> Manage Codes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-2">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Redemption Codes</DialogTitle>
                <DialogDescription className="font-bold uppercase tracking-widest text-[10px] opacity-60">
                  Create and manage codes for free pro access.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCode} className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Promotional Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. SUMMER2024" 
                        className="h-12 rounded-xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-mono font-bold"
                        value={newCode.code}
                        onChange={e => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                        required
                      />
                      <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={generateRandomCode}>
                        <RefreshCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Duration (Months)</Label>
                      <Select value={newCode.duration} onValueChange={v => setNewCode({...newCode, duration: v})}>
                        <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                          <SelectItem value="1">1 Month</SelectItem>
                          <SelectItem value="2">2 Months</SelectItem>
                          <SelectItem value="3">3 Months</SelectItem>
                          <SelectItem value="6">6 Months</SelectItem>
                          <SelectItem value="12">12 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Reason</Label>
                      <Input 
                        placeholder="e.g. Support Ticket" 
                        className="h-12 rounded-xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
                        value={newCode.reason}
                        onChange={e => setNewCode({...newCode, reason: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-glow">
                    Generate Redemption Code
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
            setIsCreateModalOpen(open);
            if (!open) setCreateStep(1);
          }}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-glow flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Provision New Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-3xl border-2">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  {createStep === 1 ? "Provision Account" : "Enterprise Configuration"}
                </DialogTitle>
                <DialogDescription className="font-bold uppercase tracking-widest text-[10px] opacity-60">
                  {createStep === 1 
                    ? "Select user type and primary administrator credentials." 
                    : "Pre-configure departments, roles, and workspaces for the enterprise."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAccount} className="space-y-6 py-4">
                {createStep === 1 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Account Type</Label>
                      <Select 
                        value={newAccount.userType} 
                        onValueChange={v => setNewAccount({...newAccount, userType: v as any})}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                          <SelectItem value="solo">Solo Professional</SelectItem>
                          <SelectItem value="team">Small Team</SelectItem>
                          <SelectItem value="organisation">Organisation</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {newAccount.userType !== 'solo' && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Entity/Company Name</Label>
                        <Input 
                          placeholder="e.g. Wayne Enterprises" 
                          className="h-12 rounded-xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
                          value={newAccount.companyName}
                          onChange={e => setNewAccount({...newAccount, companyName: e.target.value})}
                          required={newAccount.userType !== 'solo'}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Admin Full Name</Label>
                        <Input 
                          placeholder="e.g. Bruce Wayne" 
                          className="h-12 rounded-xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
                          value={newAccount.adminName}
                          onChange={e => setNewAccount({...newAccount, adminName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Admin Primary Email</Label>
                        <Input 
                          type="email"
                          placeholder="bruce@wayne.com" 
                          className="h-12 rounded-xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
                          value={newAccount.adminEmail}
                          onChange={e => setNewAccount({...newAccount, adminEmail: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Temporary Security Password</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={newAccount.tempPassword}
                          readOnly
                          className="h-12 rounded-xl bg-muted/50 border-2 border-transparent font-mono font-bold"
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          className="h-12 rounded-xl"
                          onClick={() => setNewAccount({...newAccount, tempPassword: Math.random().toString(36).slice(-8)})}
                        >
                          Regen
                        </Button>
                      </div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        User will be forced to change this upon first login.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Core Departments
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableDepts.map(dept => (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => {
                              const depts = newAccount.departments.includes(dept)
                                ? newAccount.departments.filter(d => d !== dept)
                                : [...newAccount.departments, dept];
                              setNewAccount({...newAccount, departments: depts});
                            }}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                              newAccount.departments.includes(dept) 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-transparent bg-muted/30 text-muted-foreground opacity-60 hover:opacity-100"
                            )}
                          >
                            {dept}
                            {newAccount.departments.includes(dept) && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Briefcase className="w-3 h-3" /> Default Roles
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {["Director", "Manager", "Employee", "Guest", "Contractor"].map(role => (
                          <Badge 
                            key={role}
                            variant={newAccount.defaultRoles.includes(role) ? "default" : "outline"}
                            className="cursor-pointer rounded-lg px-3 py-1 font-bold uppercase tracking-widest text-[9px]"
                            onClick={() => {
                              const roles = newAccount.defaultRoles.includes(role)
                                ? newAccount.defaultRoles.filter(r => r !== role)
                                : [...newAccount.defaultRoles, role];
                              setNewAccount({...newAccount, defaultRoles: roles});
                            }}
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Layout className="w-3 h-3" /> Initial Workspace
                      </Label>
                      <Input 
                        placeholder="e.g. London HQ" 
                        className="h-12 rounded-xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
                        value={newAccount.workspaces[0]}
                        onChange={e => setNewAccount({...newAccount, workspaces: [e.target.value]})}
                      />
                    </div>
                  </div>
                )}
                
                <DialogFooter className="pt-4 border-t gap-2">
                  {createStep === 2 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                      onClick={() => setCreateStep(1)}
                    >
                      Back
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 h-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-glow">
                    {createStep === 1 && newAccount.userType === 'enterprise' ? "Next: Configure" : "Initialize Account"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-2 border-primary/10 bg-primary/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{accounts.length}</div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> No new accounts
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2 border-blue-500/10 bg-blue-500/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">0</div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 0% increase
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2 border-amber-500/10 bg-amber-500/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{tickets.filter(t => t.status !== 'closed').length}</div>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">0 Urgent priority</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-2 border-purple-500/10 bg-purple-500/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rev (ARR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">$0</div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> $0 month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-2xl mb-8 flex overflow-x-auto no-scrollbar justify-start md:justify-center">
          <TabsTrigger value="accounts" className="rounded-xl px-6 py-2.5 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5 mr-2" /> Accounts & Users
          </TabsTrigger>
          <TabsTrigger value="support" className="rounded-xl px-6 py-2.5 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
            <LifeBuoy className="w-3.5 h-3.5 mr-2" /> Customer Service
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="rounded-xl px-6 py-2.5 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
            <BellRing className="w-3.5 h-3.5 mr-2" /> Feature Waitlist
          </TabsTrigger>
          <TabsTrigger value="database" className="rounded-xl px-6 py-2.5 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
            <Database className="w-3.5 h-3.5 mr-2" /> Global Database
          </TabsTrigger>
          <TabsTrigger value="codes" className="rounded-xl px-6 py-2.5 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
            <Ticket className="w-3.5 h-3.5 mr-2" /> Redemption Codes
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-xl px-6 py-2.5 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 mr-2" /> System Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search companies, owners, or email addresses..." 
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 px-6 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>

          <Card className="rounded-3xl border-2 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b-2 hover:bg-transparent">
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Company / User</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Type</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Users</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Created</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length > 0 ? filteredAccounts.map((acc) => (
                  <TableRow key={acc.id} className="group hover:bg-muted/20 transition-colors border-b-2 last:border-0">
                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-sm">{acc.name}</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {acc.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[9px] px-2 py-0.5 bg-background">
                        {acc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{acc.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-black">{acc.users}</TableCell>
                    <TableCell className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{acc.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-2 w-48">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="font-bold text-xs flex items-center gap-2 py-2.5 cursor-pointer">
                            <Edit2 className="w-3.5 h-3.5" /> Edit Account
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-bold text-xs flex items-center gap-2 py-2.5 cursor-pointer">
                            <Users className="w-3.5 h-3.5" /> Manage Users
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-bold text-xs flex items-center gap-2 py-2.5 cursor-pointer text-blue-500">
                            <ExternalLink className="w-3.5 h-3.5" /> Login As...
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="font-bold text-xs flex items-center gap-2 py-2.5 cursor-pointer text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-3.5 h-3.5" /> Suspend Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                      No enterprise accounts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search tickets, subjects, or user names..." 
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tickets.length > 0 ? tickets.map((ticket) => (
              <Card key={ticket.id} className="rounded-3xl border-2 group hover:border-primary/30 transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={cn(
                      "rounded-lg font-black uppercase tracking-widest text-[9px] px-2 py-0.5",
                      ticket.priority === 'high' ? "bg-destructive/10 text-destructive border-destructive/20" :
                      ticket.priority === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}>
                      {ticket.priority} priority
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{ticket.id}</span>
                  </div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">{ticket.subject}</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3 h-3" /> {ticket.user} • {ticket.company}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        ticket.status === 'open' ? "bg-destructive animate-pulse" :
                        ticket.status === 'in-progress' ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{ticket.status}</span>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{ticket.createdAt}</span>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 opacity-20">
                  <LifeBuoy className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">No support tickets at this time</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by email, feature, or phone..." 
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
              />
            </div>
          </div>

          <Card className="rounded-3xl border-2 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b-2 hover:bg-transparent">
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">User / Contact</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Feature Interested</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Method</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Joined</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitlist.length > 0 ? waitlist.map((entry) => (
                  <TableRow key={entry.id} className="group hover:bg-muted/20 transition-colors border-b-2 last:border-0">
                    <TableCell className="py-6">
                      <div className="space-y-1">
                        <div className="font-black text-sm">{entry.email}</div>
                        {entry.whatsapp && (
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-primary" /> {entry.whatsapp}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="rounded-lg font-black uppercase tracking-widest text-[9px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                        {entry.feature}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {entry.whatsapp ? (
                          <Badge variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[9px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">WhatsApp + Email</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-lg font-black uppercase tracking-widest text-[9px] border-blue-500/30 text-blue-500 bg-blue-500/5">Email Only</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {entry.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] text-primary hover:bg-primary/10">
                        Reach Out
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                      Feature waitlist is currently empty
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase tracking-tight">Core Database Explorer</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global cross-tenant monitoring and management</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-10 rounded-xl font-black uppercase text-[9px] tracking-widest">
                <Settings className="w-3.5 h-3.5 mr-2" /> DB Settings
              </Button>
              <Button size="sm" className="h-10 rounded-xl font-black uppercase text-[9px] tracking-widest bg-emerald-600 text-white">
                <Download className="w-3.5 h-3.5 mr-2" /> Export Global CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-3xl border-2 bg-secondary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Database Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-lg font-black">99.9% Uptime</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-2 bg-secondary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-black">12,482 Objects</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-2 bg-secondary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-black">42 Active Sessions</div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border-2 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b-2 hover:bg-transparent">
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 pl-6">Tenant Name</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Tier</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Usage</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Last Sync</TableHead>
                  <TableHead className="text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b-2 last:border-0 hover:bg-muted/10 transition-colors">
                  <TableCell className="py-6 pl-6 font-black">Cynda Internal</TableCell>
                  <TableCell><Badge className="bg-primary/20 text-primary border-0 text-[9px] font-black uppercase">System</Badge></TableCell>
                  <TableCell>
                    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="w-1/4 h-full bg-primary" />
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-muted-foreground">2 mins ago</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg font-black uppercase text-[9px] tracking-widest text-primary">
                      Manage <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
                {/* Empty states or other rows here */}
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                    Awaiting additional tenant synchronizations
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by code or reason..." 
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
              />
            </div>
            <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-glow flex items-center gap-2" onClick={() => setIsCodeModalOpen(true)}>
              <Plus className="w-4 h-4" /> New Code
            </Button>
          </div>

          <Card className="rounded-3xl border-2 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b-2 hover:bg-transparent">
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Code</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Duration</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Reason</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Created</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.length > 0 ? codes.map((code) => (
                  <TableRow key={code.id} className="group hover:bg-muted/20 transition-colors border-b-2 last:border-0">
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 rounded bg-primary/10 text-primary font-mono font-bold text-xs">{code.code}</code>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100" onClick={() => {
                          navigator.clipboard.writeText(code.code);
                          toast({ title: "Copied", description: "Code copied to clipboard." });
                        }}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-black">{code.duration} Months</TableCell>
                    <TableCell className="text-xs font-bold uppercase tracking-widest opacity-70">{code.reason}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-lg font-black uppercase tracking-widest text-[9px] px-2 py-0.5",
                        code.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                      )}>
                        {code.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{code.created}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-10 w-10 p-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                      No redemption codes generated yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card className="rounded-3xl border-2 p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">System Logs Coming Soon</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                We are currently building the global audit log system to track all enterprise activities and system events.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminPage;
