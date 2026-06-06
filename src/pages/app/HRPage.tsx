import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, Search, MapPin, ChevronRight, X, Mail, Phone, Calendar, Clock, 
  CheckCircle2, XCircle, AlertCircle, LayoutDashboard, Users, UserPlus, 
  Briefcase, Coffee, CreditCard, BarChart3, FileText, Bell, 
  TrendingUp, TrendingDown, Cake, PartyPopper, UserCheck, UserMinus,
  MessageSquare, Kanban, List, Filter, MoreHorizontal, Star, Award, 
  Zap, ArrowRight, ShieldCheck, Download, Globe, Bot, Eye,
  Network as Sitemap, Users2, Network, GitBranch, Layers, FileUp, MoreVertical,
  Settings as SettingsIcon, Trash2, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn, generateChatName, exportToCSV } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import PhoneInput from "@/components/ui/PhoneInput";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useIndustryStore, DEPARTMENTS } from "@/lib/industry-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation, useNavigate } from "react-router-dom";

// --- Types ---

type HRTool = 'dashboard' | 'directory' | 'hiring' | 'onboarding' | 'time-off' | 'time-tracking' | 'payroll' | 'performance' | 'analytics' | 'surveillance' | 'teams' | 'org-chart';

type Team = {
  id: string;
  name: string;
  lead: string;
  members: string[]; // IDs
  description: string;
  icon: any;
  color: string;
};

type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "Active" | "On Leave" | "Onboarding" | "Offboarding";
  avatar: string;
  location: string;
  email: string;
  phone: string;
  startDate: string;
  manager: string;
  salary: string;
  performance: number;
};

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: "Open" | "Closed" | "Draft";
  applicants: number;
};

type OnboardingTask = {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
};

type LeaveRequest = {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
};

// --- Mock Data ---

const MOCK_EMPLOYEES: Employee[] = [];

const MOCK_JOBS: Job[] = [];

const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [];

const MOCK_TEAMS: Team[] = [];

const MOCK_SURVEILLANCE: any[] = [];

const HRPage = () => {
  const { 
    userType, 
    selectedModules = [], 
    adminProfile, 
    currentUser, 
    deleteStaff,
    staffList = [],
    addStaff
  } = useIndustryStore();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const activeUser = currentUser || adminProfile;
  const isAdmin = activeUser?.role === 'Super Admin' || userType === 'solo';

  // Two-step Delete Confirmation
  const [isDeleteModal1Open, setIsDeleteModal1Open] = useState(false);
  const [isDeleteModal2Open, setIsDeleteModal2Open] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'staff' | 'leave-request' } | null>(null);

  const handleDeleteStaff = (staffId: string) => {
    setItemToDelete({ id: staffId, type: 'staff' });
    setIsDeleteModal1Open(true);
  };

  const handleDeleteLeaveRequest = (requestId: string) => {
    setItemToDelete({ id: requestId, type: 'leave-request' });
    setIsDeleteModal1Open(true);
  };

  const confirmDeleteStep1 = () => {
    setIsDeleteModal1Open(false);
    setIsDeleteModal2Open(true);
  };

  const finalizeDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'staff') {
        deleteStaff(itemToDelete.id);
        toast({ title: "Staff member deleted", description: "The staff member has been permanently removed." });
      } else if (itemToDelete.type === 'leave-request') {
        setLeaveRequests(prev => prev.filter(r => r.id !== itemToDelete.id));
        toast({ title: "Request deleted", description: "The leave request has been removed." });
      }
      setIsDeleteModal2Open(false);
      setItemToDelete(null);
    }
  };

  const hrNavigationTools = useMemo(() => [
    { id: 'hr-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'departments', label: 'Departments', icon: Sitemap },
    { id: 'hiring', label: 'Hiring', icon: UserPlus },
    { id: 'onboarding', label: 'Onboarding', icon: Briefcase },
    { id: 'time-off', label: 'Time Off', icon: Coffee },
    { id: 'hr-time-tracking', label: 'Tracking', icon: Clock },
    { id: 'hr-payroll', label: 'Payroll', icon: CreditCard },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'hr-analytics', label: 'Analytics', icon: FileText },
    { id: 'surveillance', label: 'Surveillance', icon: Eye },
    { id: 'teams', label: 'Teams', icon: Users2 },
  ], []);

  const tools = useMemo(() => {
    const safeModules = Array.isArray(selectedModules) ? selectedModules : [];
    if (userType === 'enterprise' || userType === 'large-business') return hrNavigationTools;
    
    const filtered = hrNavigationTools.filter(item => safeModules.includes(item.id));
    
    if (filtered.length === 0) {
      return [hrNavigationTools[0]]; // Default to dashboard
    }
    return filtered;
  }, [selectedModules, userType, hrNavigationTools]);

  const [activeTool, setActiveTool] = useState<string>(tools[0]?.id || 'hr-dashboard');

  // Sync active tool if selection changes
  useEffect(() => {
    if (tools.length > 0 && !tools.find(i => i.id === activeTool)) {
      setActiveTool(tools[0].id);
    }
  }, [tools, activeTool]);

  // Drive active tool from the URL so each tool has a dedicated page.
  useEffect(() => {
    const raw = location.pathname.split("/app/")[1] || "dashboard";
    const segment = raw.split("/")[0] || "dashboard";
    const fromRoute = segment === "hr" ? "hr-dashboard" : segment;
    if (hrNavigationTools.some((t) => t.id === fromRoute) && fromRoute !== activeTool) {
      setActiveTool(fromRoute);
    }
  }, [location.pathname, activeTool, hrNavigationTools]);

  const goToTool = (id: string) => {
    const url = id === "hr-dashboard" ? "/app/hr" : `/app/${id}`;
    navigate(url);
  };

  const [searchQuery, setSearchQuery] = useState("");
   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
   const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    name: "",
    email: "",
    role: "Employee",
    department: "",
    manager: "Sarah Chen",
    tools: [] as string[],
    customFields: {} as Record<string, string>
  });
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const { staffCustomFields, setStaffCustomFields, customDepartments, addCustomDepartment } = useIndustryStore();
  const [isCreateDeptModalOpen, setIsCreateDeptModalOpen] = useState(false);
  const [newDeptConfig, setNewDeptConfig] = useState({ name: "", tools: [] as string[] });

  const handleCreateDepartment = () => {
    if (!newDeptConfig.name) {
      toast({ title: "Error", description: "Department name is required." });
      return;
    }
    addCustomDepartment(newDeptConfig);
    setIsCreateDeptModalOpen(false);
    setNewDeptConfig({ name: "", tools: [] });
    toast({ title: "Department Created", description: `${newDeptConfig.name} is now available with ${newDeptConfig.tools.length} assigned tools.` });
  };

  const toggleDeptTool = (toolId: string) => {
    setNewDeptConfig(prev => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter(id => id !== toolId)
        : [...prev.tools, toolId]
    }));
  };

  const allTools = useMemo(() => Object.values(DEPARTMENTS).flatMap(d => d.tools), []);

  const handleAddStaff = () => {
    if (!newStaffData.name || !newStaffData.email || !newStaffData.role) {
      toast({ title: "Error", description: "Name, Email, and Role are required", variant: "destructive" });
      return;
    }
    
    const finalDept = isCreatingDept ? newDeptName : newStaffData.department;
    
    addStaff({
      id: Math.random().toString(),
      name: newStaffData.name,
      email: newStaffData.email,
      chatName: generateChatName(newStaffData.name),
      role: newStaffData.role as any,
      department: finalDept,
      tools: newStaffData.tools,
      customFields: newStaffData.customFields
    });

    setIsAddStaffOpen(false);
    setNewStaffData({ name: "", email: "", role: "", department: "", manager: "Sarah Chen", tools: [], customFields: {} });
    setIsCreatingDept(false);
    setNewDeptName("");
    toast({ title: "Staff Added", description: `${newStaffData.name} has been added and tools assigned.` });
  };

  // AI Tool Suggestions based on Role and Department
  useEffect(() => {
    if (newStaffData.role && (newStaffData.department || newDeptName)) {
      const role = newStaffData.role.toLowerCase();
      const dept = (isCreatingDept ? newDeptName : newStaffData.department).toLowerCase();
      
      let suggestedTools: string[] = [];
      
      if (role.includes('engineer') || dept.includes('engineering')) {
        suggestedTools = ['tasks', 'chat', 'notes', 'files', 'crm-dashboard'];
      } else if (role.includes('design') || dept.includes('design')) {
        suggestedTools = ['tasks', 'chat', 'notes', 'files'];
      } else if (role.includes('marketing') || dept.includes('marketing')) {
        suggestedTools = ['marketing', 'crm-dashboard', 'chat', 'tasks'];
      } else if (role.includes('sales') || dept.includes('sales')) {
        suggestedTools = ['crm-dashboard', 'chat', 'tasks', 'marketing'];
      } else {
        suggestedTools = ['tasks', 'chat', 'notes'];
      }

      setNewStaffData(prev => ({ ...prev, tools: [...new Set([...prev.tools, ...suggestedTools])] }));
      
      if (newStaffData.role.length > 3) {
        toast({ 
          title: "AI Tool Suggestions", 
          description: `Cyndi has suggested ${suggestedTools.length} tools based on the role and department.`,
          duration: 3000
        });
      }
    }
  }, [newStaffData.role, newStaffData.department, isCreatingDept, newDeptName]);

  const toggleStaffTool = (toolId: string) => {
    setNewStaffData(prev => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter(id => id !== toolId)
        : [...prev.tools, toolId]
    }));
  };
   const [isPostJobOpen, setIsPostJobOpen] = useState(false);
   const [isRequestLeaveOpen, setIsRequestLeaveOpen] = useState(false);
   const [isGiveRecognitionOpen, setIsGiveRecognitionOpen] = useState(false);
   const [isPerformanceHistoryOpen, setIsPerformanceHistoryOpen] = useState(false);
   const [isMessageOpen, setIsMessageOpen] = useState(false);
   const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
   const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
   const [isFiltersOpen, setIsFiltersOpen] = useState(false);
   const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);
   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
   const [isPaystubOpen, setIsPaystubOpen] = useState(false);
   const [isExportOpen, setIsExportOpen] = useState(false);
   const [isClockedIn, setIsClockedIn] = useState(false);
   const [clockInTime, setClockInTime] = useState<Date | null>(null);
   const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
   const [onboardingTasks, setOnboardingTasks] = useState([
    { id: '1', title: "Set up hardware", completed: true },
    { id: '2', title: "Access to Slack/Email", completed: true },
    { id: '3', title: "Initial 1:1 with Mentor", completed: false },
    { id: '4', title: "Security Training", completed: false },
    { id: '5', title: "Product Deep Dive", completed: false },
  ]);

  // --- HR Calculations (Spreadsheet Logic) ---
  const hrMetrics = useMemo(() => {
    const allEmployees = [...MOCK_EMPLOYEES, ...staffList];
    const totalEmployees = allEmployees.length;
    const activeEmployees = allEmployees.filter(e => e.status === 'Active' || !e.status).length;
    const onLeave = allEmployees.filter(e => e.status === 'On Leave').length;
    
    // Logic: Retention Rate calculation (Mocked with trend)
    const retentionRate = 98.2; 
    const turnoverRate = 1.8;
    
    // Average Performance Score
    const avgPerformance = allEmployees.reduce((sum, e) => sum + ( (e as any).performance || 0), 0) / (totalEmployees || 1);
    
    // Department Distribution
    const deptDistribution: Record<string, number> = {};
    allEmployees.forEach(e => {
      const dept = e.department || "General";
      deptDistribution[dept] = (deptDistribution[dept] || 0) + 1;
    });

    return { totalEmployees, activeEmployees, onLeave, retentionRate, turnoverRate, avgPerformance: avgPerformance.toFixed(1), deptDistribution };
  }, [staffList]);

  const [isReviewCycleOpen, setIsReviewCycleOpen] = useState(false);
   const [isRunPayrollOpen, setIsRunPayrollOpen] = useState(false);
   const [selectedEvent, setSelectedEvent] = useState<{ title: string; date: string; icon: any; color: string } | null>(null);

   const filteredEmployees = useMemo(() => {
     const allEmployees = [...MOCK_EMPLOYEES, ...staffList];
     return allEmployees.filter(emp => 
       emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (emp.role && emp.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (emp.chatName && emp.chatName.toLowerCase().includes(searchQuery.toLowerCase()))
     );
   }, [searchQuery, staffList]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">HR Management</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your global workforce, performance, and culture.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 no-scrollbar">
            {isAdmin && (
              <Button variant="outline" size="sm" className="rounded-xl h-9 border-primary/20 text-primary hover:bg-primary/5 whitespace-nowrap" onClick={() => navigate('/app/hr/onboarding')}>
                <UserPlus className="w-4 h-4 mr-1.5" /> Staff Onboarding
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-xl h-9 whitespace-nowrap" onClick={() => setIsExportOpen(true)}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            <Button size="sm" className="rounded-xl h-9 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 whitespace-nowrap" onClick={() => setIsAddStaffOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Quick Add
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
                  <motion.div layoutId="activeHrTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
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
            {activeTool === 'hr-dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Headcount", value: hrMetrics.totalEmployees.toString(), change: "+2", icon: Users, color: "text-blue-500" },
                    { label: "Active Now", value: hrMetrics.activeEmployees.toString(), change: "75%", icon: UserCheck, color: "text-green-500" },
                    { label: "Retention", value: `${hrMetrics.retentionRate}%`, change: "Excellent", icon: TrendingUp, color: "text-primary" },
                    { label: "Avg Performance", value: hrMetrics.avgPerformance, change: "+0.5%", icon: Award, color: "text-primary" },
                  ].map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={stat.label} className="p-5 rounded-[2rem] border-2 border-border bg-card shadow-sm min-h-[140px]">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-xl bg-secondary/50 ${stat.color}`}>
                            {StatIcon && <StatIcon className="w-5 h-5" />}
                          </div>
                          <span className="text-[10px] font-black text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{stat.change}</span>
                        </div>
                        <p className="text-2xl font-black tracking-tighter text-foreground">{stat.value}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold">Growth Trends</h3>
                      <Select defaultValue="6m">
                        <SelectTrigger className="w-[120px] h-8 text-xs rounded-lg">
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m">Last Month</SelectItem>
                          <SelectItem value="6m">Last 6 Months</SelectItem>
                          <SelectItem value="1y">Last Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: 'Oct', value: 18 },
                          { name: 'Nov', value: 20 },
                          { name: 'Dec', value: 21 },
                          { name: 'Jan', value: 22 },
                          { name: 'Feb', value: 24 },
                          { name: 'Mar', value: 24 },
                        ]}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <h3 className="font-display font-bold mb-6">Department Split</h3>
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Engineering', value: 12 },
                              { name: 'Design', value: 4 },
                              { name: 'Marketing', value: 5 },
                              { name: 'People', value: 3 },
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[
                              "hsl(var(--primary))",
                              "#3b82f6",
                              "#10b981",
                              "#f59e0b"
                            ].map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {[
                        { name: 'Engineering', count: 12, color: 'bg-primary' },
                        { name: 'Design', count: 4, color: 'bg-blue-500' },
                        { name: 'Marketing', count: 5, color: 'bg-green-500' },
                      ].map(dept => (
                        <div key={dept.name} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${dept.color}`} />
                            <span className="text-muted-foreground">{dept.name}</span>
                          </div>
                          <span>{dept.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold">Recent Activity</h3>
                      <Button variant="ghost" size="sm" className="text-xs h-8 rounded-lg" onClick={() => setIsActivityLogOpen(true)}>View All</Button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { user: "Sarah Chen", action: "approved a leave request", target: "Alex Rivera", time: "2h ago", icon: CheckCircle2, color: "text-green-500" },
                        { user: "Elena Rodriguez", action: "posted a new job", target: "Product Manager", time: "5h ago", icon: UserPlus, color: "text-blue-500" },
                        { user: "System", action: "completed payroll for", target: "March 2024", time: "1d ago", icon: CreditCard, color: "text-primary" },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className={`mt-1 p-1.5 rounded-lg bg-secondary/50 ${item.color}`}>
                            <item.icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs">
                              <span className="font-bold">{item.user}</span> {item.action} <span className="font-bold">{item.target}</span>
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold">Upcoming Events</h3>
                      <Button variant="ghost" size="sm" className="text-xs h-8 rounded-lg" onClick={() => setActiveTool('time-off')}>Calendar</Button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: "Alex Rivera's Birthday", date: "Tomorrow", icon: Cake, color: "text-pink-500" },
                        { title: "Quarterly Review", date: "March 28", icon: BarChart3, color: "text-primary" },
                        { title: "Team Lunch", date: "April 2", icon: Coffee, color: "text-blue-500" },
                      ].map((event, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-card ${event.color}`}>
                              <event.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{event.title}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{event.date}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelectedEvent(event)}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'directory' && (
              <motion.div 
                key="directory"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search employees by name, role, or department..." 
                      className="pl-10 h-11 rounded-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="rounded-xl h-11 gap-2 uppercase font-black tracking-widest text-[10px]" onClick={() => setIsFiltersOpen(true)}>
                    <Filter className="w-4 h-4" /> Filters
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees.map((emp) => (
                    <motion.div 
                      key={emp.id}
                      layout
                      className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12 rounded-xl">
                              <AvatarFallback className="font-black bg-primary/10 text-primary">
                                {emp.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${
                              emp.status === 'Active' || !emp.status ? 'bg-green-500' : emp.status === 'On Leave' ? 'bg-primary' : 'bg-blue-500'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{emp.name}</h4>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-1">@{emp.chatName || "username.cynda"}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{emp.role}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <MapPin className="w-3 h-3" /> {emp.location}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Mail className="w-3 h-3" /> {emp.email}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-5 h-5 rounded-full border border-card bg-secondary text-[8px] flex items-center justify-center font-bold">
                                {String.fromCharCode(64 + i)}
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">+5 skills</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                          <Star className="w-3 h-3 fill-primary" /> {emp.performance}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTool === 'performance' && (
              <motion.div key="performance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-6 rounded-[24px] border border-border bg-card shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Staff Performance Audit</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Employee</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Score (1-5)</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Review</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                          <th className="pb-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[...MOCK_EMPLOYEES, ...staffList].map((emp) => (
                          <tr key={emp.id} className="group hover:bg-secondary/10 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 rounded-lg">
                                  <AvatarFallback className="text-[10px] font-black">{emp.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold">{emp.name}</span>
                                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">@{emp.chatName || "username.cynda"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="text-xs text-muted-foreground">{emp.department}</span>
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col items-center gap-1">
                                <span className={cn(
                                  "text-sm font-black",
                                  emp.performance >= 4.5 ? "text-green-600" : emp.performance >= 4 ? "text-primary" : "text-orange-500"
                                )}>{emp.performance || "N/A"}</span>
                                <div className="w-20 h-1 rounded-full bg-secondary overflow-hidden">
                                  <div className={cn(
                                    "h-full rounded-full",
                                    emp.performance >= 4.5 ? "bg-green-600" : emp.performance >= 4 ? "bg-primary" : "bg-orange-500"
                                  )} style={{ width: `${(emp.performance / 5) * 100}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-xs text-muted-foreground">
                              {emp.startDate}
                            </td>
                            <td className="py-4">
                              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest">
                                {emp.performance >= 4.5 ? "Top Performer" : "Developing"}
                              </Badge>
                            </td>
                            <td className="py-4 text-right">
                              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Open Review
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'hiring' && (
              <motion.div 
                key="hiring"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-display font-bold">Active Jobs</h3>
                    <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{MOCK_JOBS.length}</div>
                  </div>
                  <Button className="rounded-xl h-9 gap-2" onClick={() => setIsPostJobOpen(true)}>
                    <Plus className="w-4 h-4" /> Post Job
                  </Button>
                </div>

                <div className="space-y-3">
                  {MOCK_JOBS.map((job) => (
                    <div key={job.id} className="p-4 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-secondary/50 text-primary">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{job.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{job.department}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{job.location}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{job.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-bold">{job.applicants}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Applicants</p>
                          </div>
                          <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            job.status === 'Open' ? 'bg-green-500/10 text-green-600' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {job.status}
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
                            setSelectedJob(job);
                            setIsApplicantsOpen(true);
                          }}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <h3 className="font-display font-bold mb-6">Recent Applications</h3>
                    <div className="space-y-4">
                      {[
                        { name: "Sopia Miller", role: "Product Designer", score: 92, status: "Reviewing", avatar: "https://i.pravatar.cc/150?u=11" },
                        { name: "Liam Wilson", role: "Senior Engineer", score: 88, status: "Interviewing", avatar: "https://i.pravatar.cc/150?u=12" },
                        { name: "Emma Davis", role: "Product Manager", score: 95, status: "Offer Sent", avatar: "https://i.pravatar.cc/150?u=13" },
                      ].map((app, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={app.avatar} alt={app.name} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <p className="text-xs font-bold">{app.name}</p>
                              <p className="text-[10px] text-muted-foreground">{app.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Bot className="w-3 h-3 text-primary" />
                              <span className="text-xs font-bold">{app.score}</span>
                            </div>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">{app.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <h3 className="font-display font-bold mb-6">Hiring Pipeline</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { stage: 'Sourced', count: 124 },
                          { stage: 'Screen', count: 45 },
                          { stage: 'Interview', count: 18 },
                          { stage: 'Offer', count: 4 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="stage" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'time-off' && (
              <motion.div 
                key="time-off"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Annual Leave", value: "14 days", sub: "Available", icon: Coffee, color: "text-blue-500" },
                    { label: "Sick Leave", value: "8 days", sub: "Available", icon: AlertCircle, color: "text-destructive" },
                    { label: "Personal Days", value: "2 days", sub: "Available", icon: Star, color: "text-primary" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-5 rounded-xl border border-border bg-card shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-secondary/50 ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold">Leave Requests</h3>
                      <Button className="rounded-xl h-9 gap-2" onClick={() => setIsRequestLeaveOpen(true)}>
                        <Plus className="w-4 h-4" /> Request Leave
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {leaveRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center font-bold text-xs">
                              {req.employee.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{req.employee}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{req.type} • {req.startDate} to {req.endDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'Approved' ? 'bg-green-500/10 text-green-600' : 
                              req.status === 'Pending' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                            }`}>
                              {req.status}
                            </div>
                          <div className="flex items-center gap-2">
                            <Select defaultValue={req.status}>
                              <SelectTrigger className="h-7 border-none bg-transparent text-[9px] font-black uppercase tracking-widest focus:ring-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-2">
                                <SelectItem value="Approved" className="text-[9px] font-black uppercase">Approved</SelectItem>
                                <SelectItem value="Pending" className="text-[9px] font-black uppercase">Pending</SelectItem>
                                <SelectItem value="Rejected" className="text-[9px] font-black uppercase">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteLeaveRequest(req.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <h3 className="font-display font-bold mb-6">Leave Calendar</h3>
                    <CalendarComponent mode="single" className="rounded-xl border border-border" />
                    <div className="mt-6 space-y-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Away Today</p>
                      <div className="flex -space-x-2">
                        {MOCK_EMPLOYEES.filter(e => e.status === 'On Leave').map(emp => (
                          <img key={emp.id} src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full border-2 border-card object-cover" title={emp.name} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'departments' && (
              <motion.div 
                key="departments"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Organisational Departments</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1 opacity-70">
                      Manage department structures and their default workspace tools.
                    </p>
                  </div>
                  <Button 
                    className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] gap-2 bg-primary text-white shadow-glow"
                    onClick={() => setIsCreateDeptModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" /> Create Department
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Default Departments */}
                  {['Engineering', 'Design', 'Marketing', 'People', 'Sales'].map((deptName) => (
                    <div key={deptName} className="p-6 rounded-[2rem] border-2 border-border bg-card hover:border-primary/30 transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest">System Default</Badge>
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-tight mb-2">{deptName}</h4>
                      <p className="text-xs text-muted-foreground font-medium mb-6">
                        {MOCK_EMPLOYEES.filter(e => e.department === deptName).length} Team Members
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/50">
                        {/* Mock default tools for system depts */}
                        {['tasks', 'chat', 'notes'].map(toolId => (
                          <Badge key={toolId} className="bg-secondary/50 text-muted-foreground border-none text-[8px] font-black uppercase tracking-tight">
                            {toolId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Custom Departments from Store */}
                  {customDepartments.map((dept, i) => (
                    <div key={i} className="p-6 rounded-[2rem] border-2 border-primary/20 bg-primary/5 hover:border-primary/50 transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Sitemap className="w-6 h-6" />
                        </div>
                        <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase tracking-widest">Custom</Badge>
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-tight mb-2">{dept.name}</h4>
                      <p className="text-xs text-muted-foreground font-medium mb-6">
                        {MOCK_EMPLOYEES.filter(e => e.department === dept.name).length} Team Members
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-primary/10">
                        {dept.tools.map(toolId => (
                          <Badge key={toolId} className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-tight">
                            {toolId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTool === 'onboarding' && (
              <motion.div 
                key="onboarding"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Onboarding Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Staff", value: MOCK_EMPLOYEES.length.toString(), sub: "Workspace members", icon: Users, color: "text-blue-500" },
                    { label: "Active", value: MOCK_EMPLOYEES.filter(e => e.status === 'Active').length.toString(), sub: "Currently working", icon: UserCheck, color: "text-green-500" },
                    { label: "Pending Invitations", value: "2", sub: "Awaiting activation", icon: Mail, color: "text-primary" },
                    { label: "Onboarding In Progress", value: "3", sub: "Currently in wizard", icon: Clock, color: "text-orange-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-5 rounded-xl border border-border bg-card shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-secondary/50 ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Onboarding Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    className="p-8 rounded-[2rem] border-2 border-dashed border-border bg-card hover:border-primary/50 transition-all cursor-pointer group text-center"
                    onClick={() => navigate('/app/hr/onboarding')}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <FileUp className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display font-black text-xl uppercase tracking-tight mb-2">Upload File</h3>
                    <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto mb-6">
                      Let Cyndi read your .csv, .xlsx, or .pdf and map your team details automatically.
                    </p>
                    <Button variant="outline" className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] border-2">
                      Start AI Import
                    </Button>
                  </div>

                  <div 
                    className="p-8 rounded-[2rem] border-2 border-dashed border-border bg-card hover:border-primary/50 transition-all cursor-pointer group text-center"
                    onClick={() => setIsAddStaffOpen(true)}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <UserPlus className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <h3 className="font-display font-black text-xl uppercase tracking-tight mb-2">Add Manually</h3>
                    <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto mb-6">
                      Input staff details individually for immediate workspace invitation.
                    </p>
                    <Button variant="outline" className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] border-2">
                      Open Staff Form
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold">Onboarding Processes</h3>
                      <div className="flex gap-2">
                        {['All', 'Pending', 'In Progress', 'Complete'].map(f => (
                          <Button key={f} variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest h-7 px-2 rounded-lg hover:bg-primary/10 hover:text-primary">
                            {f}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { name: "Jordan Smith", role: "Junior Developer", status: "Onboarding In Progress", progress: 65, avatar: "https://i.pravatar.cc/150?u=6", type: "Small Business" },
                        { name: "Sopia Miller", role: "Product Designer", status: "Account Created", progress: 25, avatar: "https://i.pravatar.cc/150?u=11", type: "Large Business" },
                        { name: "Liam Wilson", role: "Senior Engineer", status: "Pending Invitation", progress: 0, avatar: "https://i.pravatar.cc/150?u=12", type: "Large Business" },
                        { name: "Emma Davis", role: "Product Manager", status: "Onboarding Complete", progress: 100, avatar: "https://i.pravatar.cc/150?u=13", type: "Small Business" },
                      ].map((hire, i) => (
                        <div key={i} className="p-4 rounded-xl border border-border bg-secondary/10 hover:bg-secondary/20 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <img src={hire.avatar} alt={hire.name} className="w-10 h-10 rounded-xl object-cover" />
                              <div>
                                <p className="text-sm font-bold">{hire.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{hire.role} • {hire.type}</p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <div className="flex gap-1">
                                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                  hire.status === 'Onboarding Complete' ? 'bg-green-500/10 text-green-600' :
                                  hire.status === 'Pending Invitation' ? 'bg-primary/10 text-primary' :
                                  'bg-blue-500/10 text-blue-600'
                                }`}>
                                  {hire.status}
                                </div>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-md hover:bg-secondary">
                                      <MoreVertical className="w-3 h-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-48 p-2 rounded-xl shadow-xl border-2 border-border bg-card">
                                    <div className="space-y-1">
                                      {hire.status === 'Pending Invitation' && (
                                        <Button variant="ghost" size="sm" className="w-full justify-start text-[9px] font-black uppercase tracking-widest h-8 rounded-lg text-primary hover:bg-primary/5">
                                          <Mail className="w-3 h-3 mr-2" /> Resend Activation
                                        </Button>
                                      )}
                                      <Button variant="ghost" size="sm" className="w-full justify-start text-[9px] font-black uppercase tracking-widest h-8 rounded-lg hover:bg-secondary">
                                        <SettingsIcon className="w-3 h-3 mr-2" /> Edit Modules
                                      </Button>
                                      <Button variant="ghost" size="sm" className="w-full justify-start text-[9px] font-black uppercase tracking-widest h-8 rounded-lg text-destructive hover:bg-destructive/5">
                                        <Trash2 className="w-3 h-3 mr-2" /> Deactivate
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <p className="text-[10px] font-bold text-muted-foreground">{hire.progress}% Complete</p>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${hire.progress}%` }}
                              className={`h-full ${hire.status === 'Onboarding Complete' ? 'bg-green-500' : 'bg-primary'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold">Recent Activity</h3>
                      <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest h-7">History</Button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { hire: "Jordan Smith", action: "Completed Profile Setup", time: "2h ago", icon: UserCheck, color: "text-green-500" },
                        { hire: "Sopia Miller", action: "Assigned to Engineering", time: "5h ago", icon: GitBranch, color: "text-blue-500" },
                        { hire: "Liam Wilson", action: "Invitation Sent", time: "1d ago", icon: Mail, color: "text-primary" },
                        { hire: "Emma Davis", action: "Onboarding Finalized", time: "2d ago", icon: CheckCircle2, color: "text-green-600" },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 relative">
                          {i !== 3 && <div className="absolute left-[13px] top-8 w-px h-6 bg-border" />}
                          <div className={`mt-1 p-1.5 rounded-lg bg-secondary/50 ${item.color} z-10`}>
                            <item.icon className="w-3 h-3" />
                          </div>
                          <div>
                            <p className="text-[11px]">
                              <span className="font-bold">{item.hire}</span> <span className="text-muted-foreground">{item.action}</span>
                            </p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Cyndi's Insights</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                        "Liam Wilson's invitation expires in 2 days. Consider resending the activation link to ensure they land before their start date."
                      </p>
                      <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-primary mt-2">
                        Resend Invite
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'hr-time-tracking' && (
              <motion.div 
                key="time-tracking"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-display font-bold">Today's Attendance</h3>
                    <div className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold">18 PRESENT</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl h-9 text-xs" onClick={() => setIsExportOpen(true)}>
                      <Download className="w-4 h-4 mr-2" /> Timesheet
                    </Button>
                    <Button 
                      className={`rounded-xl h-9 text-xs ${isClockedIn ? 'bg-destructive hover:bg-destructive/90 text-white shadow-glow' : ''}`} 
                      onClick={() => {
                        if (!isClockedIn) {
                          setIsClockedIn(true);
                          setClockInTime(new Date());
                          toast({ title: "Clocked In", description: `Shift started at ${format(new Date(), 'hh:mm a')}` });
                        } else {
                          setIsClockedIn(false);
                          setClockInTime(null);
                          toast({ title: "Clocked Out", description: `Shift ended at ${format(new Date(), 'hh:mm a')}` });
                        }
                      }}
                    >
                      <Clock className="w-4 h-4 mr-2" /> {isClockedIn ? 'Clock Out' : 'Clock In'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Hours", value: "1,240", sub: "This week", icon: Clock, color: "text-blue-500" },
                    { label: "Overtime", value: "42h", sub: "This week", icon: AlertCircle, color: "text-primary" },
                    { label: "Punctuality", value: "94%", sub: "Avg. arrival", icon: UserCheck, color: "text-green-500" },
                    { label: "Utilization", value: "82%", sub: "Billable time", icon: BarChart3, color: "text-primary" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-5 rounded-xl border border-border bg-card shadow-sm">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <stat.icon className={`w-3 h-3 ${stat.color}`} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold">Live Status</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-green-500" /> Active
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary" /> Break
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-slate-300" /> Offline
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {MOCK_EMPLOYEES.slice(0, 5).map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-card bg-green-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{emp.name}</p>
                            <p className="text-[10px] text-muted-foreground">Current Task: <span className="text-primary font-medium">Design System Update</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clock In</p>
                            <p className="text-xs font-bold">09:12 AM</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Duration</p>
                            <p className="text-xs font-bold">6h 14m</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'hr-payroll' && (
              <motion.div 
                key="payroll"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-display font-bold">Payroll Overview</h3>
                    <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">NEXT PAY DAY: APRIL 1</div>
                  </div>
                  <Button className="rounded-xl h-9 text-xs" onClick={() => setIsRunPayrollOpen(true)}>
                    <CreditCard className="w-4 h-4 mr-2" /> Run Payroll
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Monthly", value: "$342,500", sub: "Gross salary", icon: CreditCard, color: "text-primary" },
                    { label: "Tax & Benefits", value: "$85,625", sub: "Estimated", icon: ShieldCheck, color: "text-blue-500" },
                    { label: "Net Payout", value: "$256,875", sub: "To employees", icon: TrendingUp, color: "text-green-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-5 rounded-xl border border-border bg-card shadow-sm">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <stat.icon className={`w-3 h-3 ${stat.color}`} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                  <h3 className="font-display font-bold mb-6">Employee Compensation</h3>
                  <div className="space-y-2">
                    {MOCK_EMPLOYEES.map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <p className="text-xs font-bold">{emp.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{emp.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-12">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Base Salary</p>
                            <p className="text-xs font-bold">{emp.salary}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pay Frequency</p>
                            <p className="text-xs font-bold">Monthly</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
                            setSelectedEmployee(emp);
                            setIsPaystubOpen(true);
                          }}>
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'performance' && (
              <motion.div 
                key="performance"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold">Performance Reviews</h3>
                  <Button className="rounded-xl h-9 text-xs" onClick={() => setIsReviewCycleOpen(true)}>
                    <Star className="w-4 h-4 mr-2" /> Start Review Cycle
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Avg. Rating", value: "4.7", sub: "Company wide", icon: Star, color: "text-primary" },
                    { label: "Reviews Done", value: "92%", sub: "This quarter", icon: CheckCircle2, color: "text-green-500" },
                    { label: "Goals Met", value: "85%", sub: "Avg. completion", icon: TrendingUp, color: "text-blue-500" },
                    { label: "Recognition", value: "124", sub: "Shoutouts sent", icon: Award, color: "text-orange-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-5 rounded-xl border border-border bg-card shadow-sm">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <stat.icon className={`w-3 h-3 ${stat.color}`} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <h3 className="font-display font-bold mb-6">Leaderboard</h3>
                    <div className="space-y-4">
                      {MOCK_EMPLOYEES.sort((a, b) => b.performance - a.performance).map((emp, i) => (
                        <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-muted-foreground w-4">{i + 1}</span>
                            <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <p className="text-sm font-bold">{emp.name}</p>
                              <p className="text-[10px] text-muted-foreground">{emp.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <Star className="w-3 h-3 text-primary fill-primary" />
                                <span className="text-sm font-bold">{emp.performance}</span>
                              </div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Performance</p>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs" onClick={() => {
                              setSelectedEmployee(emp);
                              setIsPerformanceHistoryOpen(true);
                            }}>View Review</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <h3 className="font-display font-bold mb-6">Recent Recognitions</h3>
                    <div className="space-y-4">
                      {[
                        { from: "Sarah Chen", to: "Marcus Johnson", reason: "Incredible work on the API refactor!", icon: Zap, color: "text-primary" },
                        { from: "James Wilson", to: "Elena Rodriguez", reason: "Outstanding hiring sprint this month.", icon: Award, color: "text-orange-500" },
                        { from: "Alex Rivera", to: "Sarah Chen", reason: "Great leadership during the launch.", icon: PartyPopper, color: "text-blue-500" },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-secondary/30 relative overflow-hidden group">
                          <item.icon className={`absolute -right-2 -bottom-2 w-16 h-16 opacity-5 group-hover:scale-110 transition-transform ${item.color}`} />
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold">{item.from}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-primary">{item.to}</span>
                          </div>
                          <p className="text-xs italic text-muted-foreground">"{item.reason}"</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-6 rounded-xl text-xs h-9 text-primary hover:bg-primary/5" onClick={() => setIsGiveRecognitionOpen(true)}>
                      <Bot className="w-3.5 h-3.5 mr-2" /> Give Recognition
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'teams' && (
              <motion.div 
                key="teams"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-display font-bold text-xl uppercase tracking-tight">Departmental Teams</h3>
                    <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">{MOCK_TEAMS.length} Active</div>
                  </div>
                  <Button className="rounded-xl h-10 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 stroke-[3px]" /> Create Team
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_TEAMS.map((team) => {
                    const TeamIcon = team.icon;
                    return (
                      <motion.div 
                        key={team.id}
                        whileHover={{ y: -4 }}
                        className="group p-6 rounded-[24px] border-2 border-border bg-card shadow-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="flex items-center gap-4 mb-6 relative">
                          <div className={`w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center ${team.color} group-hover:scale-110 transition-transform`}>
                            <TeamIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-lg uppercase tracking-tight text-[#222220]">{team.name}</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Team Lead: {team.lead}</p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-2">
                          {team.description}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-border/50">
                          <div className="flex -space-x-3">
                            {team.members.map((memberId, i) => {
                              const emp = MOCK_EMPLOYEES.find(e => e.id === memberId);
                              return (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-secondary ring-2 ring-transparent group-hover:ring-primary/20 transition-all overflow-hidden">
                                  {emp ? <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">?</div>}
                                </div>
                              );
                            })}
                            <div className="w-8 h-8 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary z-10">
                              +{team.members.length}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary group/btn">
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTool === 'org-chart' && (
              <motion.div 
                key="org-chart"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[#222220]">Organizational Chart</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Hierarchical structure of Cynda AI</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-secondary/30 p-1 rounded-xl border border-border">
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white shadow-sm">Tree View</Button>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground">Grid View</Button>
                    </div>
                    <Button variant="outline" className="rounded-xl h-10 gap-2 border-2">
                      <Download className="w-4 h-4" /> Export Chart
                    </Button>
                  </div>
                </div>

                <div className="relative p-12 bg-[#F8F8F5] rounded-[32px] border-2 border-dashed border-border/60 overflow-x-auto min-h-[600px] flex flex-col items-center">
                  {/* CEO Node */}
                  <div className="flex flex-col items-center relative mb-20">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="p-6 rounded-[28px] border-4 border-primary bg-card shadow-2xl shadow-primary/10 w-64 text-center z-10 relative group"
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full">CEO & FOUNDER</div>
                      <Avatar className="w-16 h-16 rounded-2xl mx-auto mb-4 border-2 border-border shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">JW</AvatarFallback>
                      </Avatar>
                      <h4 className="font-black text-lg uppercase tracking-tight text-[#222220]">James Wilson</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Executive Leadership</p>
                    </motion.div>
                    <div className="absolute bottom-0 left-1/2 w-0.5 h-20 bg-primary/20 translate-y-full" />
                  </div>

                  {/* VPs Level */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-32 relative">
                    <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[calc(100%+128px)] h-0.5 bg-primary/20" />
                    
                    {/* Engineering VP */}
                    <div className="flex flex-col items-center relative">
                      <div className="absolute top-[-40px] left-1/2 w-0.5 h-10 bg-primary/20" />
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="p-5 rounded-[24px] border-2 border-border bg-card shadow-lg w-56 text-center z-10 hover:border-primary/40 transition-all"
                      >
                        <Avatar className="w-12 h-12 rounded-xl mx-auto mb-3 border-2 border-border">
                          <AvatarFallback className="bg-blue-500/10 text-blue-600 font-black">SC</AvatarFallback>
                        </Avatar>
                        <h4 className="font-black text-base uppercase tracking-tight text-[#222220]">Sarah Chen</h4>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">VP of Engineering</p>
                      </motion.div>
                      <div className="absolute bottom-0 left-1/2 w-0.5 h-16 bg-primary/20 translate-y-full" />
                      
                      {/* Engineering Direct Reports */}
                      <div className="grid grid-cols-2 gap-8 mt-16">
                        {[
                          { name: "Marcus Johnson", role: "Software Engineer", initial: "MJ" },
                          { name: "Jordan Smith", role: "Junior Dev", initial: "JS" },
                        ].map((emp, i) => (
                          <div key={i} className="flex flex-col items-center relative">
                            <div className="absolute top-[-20px] left-1/2 w-0.5 h-5 bg-primary/20" />
                            <div className="absolute top-[-20px] left-0 w-full h-0.5 bg-primary/20" />
                            <motion.div 
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-2xl border border-border bg-card shadow-sm w-40 text-center hover:border-primary/30 transition-all"
                            >
                              <Avatar className="w-8 h-8 rounded-lg mx-auto mb-2 border border-border">
                                <AvatarFallback className="bg-secondary text-muted-foreground font-black text-[10px]">{emp.initial}</AvatarFallback>
                              </Avatar>
                              <h5 className="font-black text-[11px] uppercase tracking-tight truncate">{emp.name}</h5>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{emp.role}</p>
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* HR/Marketing Level */}
                    <div className="flex flex-col items-center relative">
                      <div className="absolute top-[-40px] left-1/2 w-0.5 h-10 bg-primary/20" />
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="p-5 rounded-[24px] border-2 border-border bg-card shadow-lg w-56 text-center z-10 hover:border-primary/40 transition-all"
                      >
                        <Avatar className="w-12 h-12 rounded-xl mx-auto mb-3 border-2 border-border">
                          <AvatarFallback className="bg-green-500/10 text-green-600 font-black">ER</AvatarFallback>
                        </Avatar>
                        <h4 className="font-black text-base uppercase tracking-tight text-[#222220]">Elena Rodriguez</h4>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">HR Manager</p>
                      </motion.div>
                      <div className="absolute bottom-0 left-1/2 w-0.5 h-16 bg-primary/20 translate-y-full" />

                      {/* HR/Marketing Reports */}
                      <div className="grid grid-cols-2 gap-8 mt-16">
                        {[
                          { name: "Alex Rivera", role: "Product Designer", initial: "AR" },
                          { name: "David Kim", role: "Marketing Lead", initial: "DK" },
                        ].map((emp, i) => (
                          <div key={i} className="flex flex-col items-center relative">
                            <div className="absolute top-[-20px] left-1/2 w-0.5 h-5 bg-primary/20" />
                            <div className="absolute top-[-20px] left-0 w-full h-0.5 bg-primary/20" />
                            <motion.div 
                              whileHover={{ y: -2 }}
                              className="p-3 rounded-2xl border border-border bg-card shadow-sm w-40 text-center hover:border-primary/30 transition-all"
                            >
                              <Avatar className="w-8 h-8 rounded-lg mx-auto mb-2 border border-border">
                                <AvatarFallback className="bg-secondary text-muted-foreground font-black text-[10px]">{emp.initial}</AvatarFallback>
                              </Avatar>
                              <h5 className="font-black text-[11px] uppercase tracking-tight truncate">{emp.name}</h5>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{emp.role}</p>
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-border bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Executive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Engineering</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">People & Growth</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary animate-bounce" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">"AI detected 2 optimal team formations based on current skills."</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'hr-analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold">Workforce Analytics</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsExportOpen(true)}>
                      <Calendar className="w-4 h-4 mr-2" /> Last 12 Months
                    </Button>
                    <Button size="sm" className="rounded-xl" onClick={() => setIsExportOpen(true)}>
                      <Download className="w-4 h-4 mr-2" /> Full Report
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="font-bold text-sm">Headcount Over Time</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Total growth trend</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">+32%</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Yearly Growth</p>
                      </div>
                    </div>
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: 'Apr', count: 12 },
                          { name: 'Jun', count: 15 },
                          { name: 'Aug', count: 18 },
                          { name: 'Oct', count: 20 },
                          { name: 'Dec', count: 22 },
                          { name: 'Feb', count: 24 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Tooltip />
                          <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="font-bold text-sm">Hiring Source Distribution</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Where talent comes from</p>
                      </div>
                    </div>
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { source: 'Referral', count: 45 },
                          { source: 'LinkedIn', count: 32 },
                          { source: 'Direct', count: 18 },
                          { source: 'Agency', count: 5 },
                        ]} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="source" 
                            type="category"
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <h4 className="font-bold text-sm mb-6">Department Diversity</h4>
                    <div className="space-y-6">
                      {[
                        { name: "Engineering", male: 65, female: 35 },
                        { name: "Design", male: 40, female: 60 },
                        { name: "Marketing", male: 45, female: 55 },
                        { name: "Operations", male: 50, female: 50 },
                      ].map((dept) => (
                        <div key={dept.name} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span>{dept.name}</span>
                            <span className="text-muted-foreground">{dept.female}% Female / {dept.male}% Male</span>
                          </div>
                          <div className="h-1.5 w-full flex rounded-full overflow-hidden">
                            <div style={{ width: `${dept.female}%` }} className="h-full bg-pink-500" />
                            <div style={{ width: `${dept.male}%` }} className="h-full bg-blue-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <h4 className="font-bold text-sm mb-6">Employee Retention Rate</h4>
                    <div className="flex items-center justify-center h-[200px]">
                      <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-secondary"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={364.4}
                            strokeDashoffset={364.4 * (1 - 0.98)}
                            className="text-primary"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold">98%</span>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Retention</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-3 rounded-xl bg-secondary/30">
                        <p className="text-lg font-bold">4.2y</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Avg Tenure</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-secondary/30">
                        <p className="text-lg font-bold">2.4%</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Turnover</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'surveillance' && (
              <motion.div 
                key="surveillance"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="font-display font-bold">Live Activity Surveillance</h3>
                    <div className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold animate-pulse">LIVE FEED</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input placeholder="Search by staff or action..." className="pl-9 h-9 w-[250px] text-xs rounded-xl" />
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs">
                      <Filter className="w-3.5 h-3.5 mr-2" /> Filter
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 space-y-3">
                    {MOCK_SURVEILLANCE.map((log) => (
                      <div key={log.id} className="p-4 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              log.status === 'success' ? 'bg-green-500/10 text-green-600' :
                              log.status === 'warning' ? 'bg-orange-500/10 text-orange-600' :
                              log.status === 'destructive' ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'
                            }`}>
                              <Bot className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black uppercase tracking-tight">{log.staff}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">• {log.time}</span>
                              </div>
                              <p className="text-xs mt-0.5">
                                <span className="text-muted-foreground">{log.action}:</span> <span className="font-bold">{log.detail}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="px-2.5 py-1 rounded-lg bg-secondary/50 text-[10px] font-black uppercase tracking-widest text-primary">
                              {log.tool}
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Activity Heatmap</h4>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 28 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`aspect-square rounded-sm ${
                              i % 5 === 0 ? 'bg-primary' : i % 3 === 0 ? 'bg-primary/60' : i % 2 === 0 ? 'bg-primary/30' : 'bg-secondary'
                            }`} 
                          />
                        ))}
                      </div>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-4 text-center">Last 24 Hours Engagement</p>
                    </div>

                    <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Top Contributors</h4>
                      <div className="space-y-4">
                        {[
                          { name: "Marcus Johnson", score: 98, color: "bg-green-500" },
                          { name: "Sarah Chen", score: 85, color: "bg-primary" },
                          { name: "Alex Rivera", score: 72, color: "bg-blue-500" },
                        ].map((user, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                              <span>{user.name}</span>
                              <span>{user.score}</span>
                            </div>
                            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                              <div className={`h-full ${user.color}`} style={{ width: `${user.score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {!['hr-dashboard', 'directory', 'hiring', 'time-off', 'onboarding', 'hr-time-tracking', 'hr-payroll', 'performance', 'hr-analytics', 'surveillance'].includes(activeTool) && (
              <motion.div 
                key={activeTool}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/5"
              >
                <h3 className="text-lg font-bold mb-2 uppercase tracking-widest">{activeTool} Module</h3>
                <p className="text-sm text-muted-foreground">This module is being updated with live functional components.</p>
                <Button 
                  className="mt-6 rounded-xl h-10 px-8" 
                  onClick={() => toast({ title: "Module Initialized", description: `${activeTool} is now active and ready.` })}
                >
                  Initialize {activeTool}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="sm:max-w-[650px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 border-b-2 border-border bg-muted/30">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Add New Staff Member</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest mt-1 text-primary">
              Manual staff configuration and workspace setup
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8 custom-scrollbar">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Full Name <span className="text-primary">*</span></Label>
                <Input 
                  placeholder="John Doe" 
                  className="rounded-xl h-14 border-2 font-bold uppercase tracking-tight" 
                  value={newStaffData.name}
                  onChange={e => setNewStaffData({...newStaffData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Email <span className="text-primary">*</span></Label>
                <Input 
                  type="email" 
                  placeholder="john@cynda.ai" 
                  className="rounded-xl h-14 border-2 font-bold" 
                  value={newStaffData.email}
                  onChange={e => setNewStaffData({...newStaffData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Role <span className="text-primary">*</span></Label>
                <Input 
                  placeholder="Software Engineer" 
                  className="rounded-xl h-14 border-2 font-bold uppercase tracking-tight" 
                  value={newStaffData.role}
                  onChange={e => setNewStaffData({...newStaffData, role: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Department</Label>
                {isCreatingDept ? (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter new dept..." 
                      className="rounded-xl h-14 border-2 font-bold uppercase tracking-tight flex-1"
                      value={newDeptName}
                      onChange={e => setNewDeptName(e.target.value)}
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl border-2" onClick={() => setIsCreatingDept(false)}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <Select value={newStaffData.department} onValueChange={(v) => {
                    if (v === 'new') setIsCreatingDept(true);
                    else setNewStaffData({...newStaffData, department: v});
                  }}>
                    <SelectTrigger className="rounded-xl h-14 border-2 font-bold uppercase tracking-tight">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="People">People</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      {customDepartments.map((dept, i) => (
                        <SelectItem key={i} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                      <SelectItem value="new" className="text-primary font-black">+ Create New</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Reporting Manager</Label>
                <Input 
                  placeholder="Sarah Chen" 
                  className="rounded-xl h-14 border-2 font-bold uppercase tracking-tight" 
                  value={newStaffData.manager}
                  onChange={e => setNewStaffData({...newStaffData, manager: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t-2 border-border/50">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary">Assign Workspace Tools</Label>
                <Button variant="link" className="text-[9px] font-black uppercase p-0 h-auto" onClick={() => setNewStaffData({...newStaffData, tools: allTools.map(t => t.id)})}>Select All</Button>
              </div>
              <div className="flex flex-col gap-2">
                {allTools.map(tool => {
                  const selected = newStaffData.tools.includes(tool.id);
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleStaffTool(tool.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                        selected ? "bg-primary/5 border-primary shadow-sm" : "bg-card border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl", selected ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight truncate">{tool.label}</span>
                      </div>
                      {selected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t-2 border-border/50 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Custom Information</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
                  onClick={() => {
                    const newField = { 
                      id: Math.random().toString(), 
                      label: 'New Field', 
                      type: 'text' as const, 
                      required: false 
                    };
                    setStaffCustomFields([...staffCustomFields, newField]);
                  }}
                >
                  <PlusCircle className="w-3 h-3 mr-1.5" /> Add New Box
                </Button>
              </div>
              
              <div className="flex flex-col gap-6">
                {staffCustomFields.map((field, idx) => (
                  <div key={field.id} className="p-5 rounded-2xl border-2 border-border bg-card/50 space-y-4 group relative">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <Input 
                          className="border-none bg-transparent font-black uppercase tracking-tight h-8 p-0 focus-visible:ring-0 text-xs text-primary"
                          value={field.label}
                          onChange={e => {
                            const newFields = [...staffCustomFields];
                            newFields[idx].label = e.target.value;
                            setStaffCustomFields(newFields);
                          }}
                          placeholder="Field Title (e.g. LinkedIn Profile)"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={field.type} 
                          onValueChange={(v: any) => {
                            const newFields = [...staffCustomFields];
                            newFields[idx].type = v;
                            setStaffCustomFields(newFields);
                          }}
                        >
                          <SelectTrigger className="h-8 border-2 rounded-lg text-[9px] font-black uppercase w-28 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="text" className="text-[10px] font-bold uppercase">Short Text</SelectItem>
                            <SelectItem value="textarea" className="text-[10px] font-bold uppercase">Long Text</SelectItem>
                            <SelectItem value="number" className="text-[10px] font-bold uppercase">Number</SelectItem>
                            <SelectItem value="date" className="text-[10px] font-bold uppercase">Date</SelectItem>
                            <SelectItem value="email" className="text-[10px] font-bold uppercase">Email</SelectItem>
                            <SelectItem value="tel" className="text-[10px] font-bold uppercase">Phone</SelectItem>
                            <SelectItem value="url" className="text-[10px] font-bold uppercase">Website/URL</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setStaffCustomFields(staffCustomFields.filter(f => f.id !== field.id))}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {field.type === 'textarea' ? (
                      <Textarea 
                        placeholder={`Enter ${field.label}...`}
                        className="rounded-xl border-2 font-medium text-sm min-h-[100px] bg-background"
                        onChange={e => setNewStaffData({
                          ...newStaffData, 
                          customFields: { ...newStaffData.customFields, [field.id]: e.target.value }
                        })}
                      />
                    ) : (
                      <Input 
                        type={field.type === 'textarea' ? 'text' : field.type}
                        placeholder={`Enter ${field.label}...`}
                        className="rounded-xl h-14 border-2 font-bold text-sm bg-background"
                        onChange={e => setNewStaffData({
                          ...newStaffData, 
                          customFields: { ...newStaffData.customFields, [field.id]: e.target.value }
                        })}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/30 border-t-2 border-border">
            <Button variant="ghost" className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
            <Button className="rounded-xl h-12 px-10 font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-glow" onClick={handleAddStaff}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Job Dialog */}
      <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Post a New Job</DialogTitle>
            <DialogDescription>
              Create a new job posting for your recruitment pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input id="job-title" placeholder="Senior Backend Developer" className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-dept">Department</Label>
                <Input id="job-dept" placeholder="Engineering" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-loc">Location</Label>
                <Input id="job-loc" placeholder="Remote / New York" className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-desc">Description</Label>
              <Textarea id="job-desc" placeholder="Brief overview of the role..." className="rounded-xl min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsPostJobOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => {
              setIsPostJobOpen(false);
              toast({ title: "Job Posted", description: "Your new job opening is now live." });
            }}>Publish Posting</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Leave Dialog */}
      <Dialog open={isRequestLeaveOpen} onOpenChange={setIsRequestLeaveOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Request Time Off</DialogTitle>
            <DialogDescription>
              Submit a leave request for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select defaultValue="vacation">
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Day</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea id="reason" placeholder="Briefly describe why you need leave..." className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsRequestLeaveOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => {
              setIsRequestLeaveOpen(false);
              toast({ title: "Request Submitted", description: "Your leave request is pending manager approval." });
            }}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Give Recognition Dialog */}
      <Dialog open={isGiveRecognitionOpen} onOpenChange={setIsGiveRecognitionOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Give Recognition</DialogTitle>
            <DialogDescription>
              Give a shoutout to a colleague for their great work!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recog-to">To</Label>
              <Select>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select colleague" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_EMPLOYEES.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recog-reason">Message</Label>
              <Textarea id="recog-reason" placeholder="What did they do that was awesome?" className="rounded-xl min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label>Badge</Label>
              <div className="flex gap-2">
                {[Award, Zap, Star, PartyPopper].map((Icon, i) => (
                  <Button key={i} variant="outline" size="icon" className="h-10 w-10 rounded-xl hover:border-primary hover:text-primary">
                    <Icon className="w-5 h-5" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsGiveRecognitionOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => {
              setIsGiveRecognitionOpen(false);
              toast({ title: "Recognition Sent!", description: "Your shoutout has been shared with the team." });
            }}>Send Shoutout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Run Payroll Confirmation Dialog */}
      <Dialog open={isRunPayrollOpen} onOpenChange={setIsRunPayrollOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Run Monthly Payroll</DialogTitle>
            <DialogDescription>
              Are you sure you want to process the payroll for the month of March 2024?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">Payroll Summary</h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex justify-between"><span>Total Net Pay:</span> <span className="text-foreground font-medium">$256,875.00</span></li>
                <li className="flex justify-between"><span>Employee Count:</span> <span className="text-foreground font-medium">24</span></li>
                <li className="flex justify-between"><span>Scheduled Date:</span> <span className="text-foreground font-medium">April 1, 2024</span></li>
              </ul>
            </div>
            <p className="text-[10px] text-muted-foreground italic text-center">Once confirmed, payments will be scheduled for delivery on the next pay day.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setIsRunPayrollOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => {
              setIsRunPayrollOpen(false);
              toast({ title: "Payroll Run Scheduled", description: "Payments are now in the processing queue." });
            }}>Confirm & Process</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-secondary/50 ${selectedEvent.color}`}>
                    <selectedEvent.icon className="w-5 h-5" />
                  </div>
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription>
                  Event scheduled for {selectedEvent.date}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>10:00 AM - 11:00 AM</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Main Office / Zoom</span>
                </div>
                <p className="text-sm">This event has been synced with your company calendar. You will receive a notification 15 minutes before it starts.</p>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-xl flex-1" onClick={() => setSelectedEvent(null)}>Close</Button>
                <Button className="rounded-xl flex-1" onClick={() => {
                  setSelectedEvent(null);
                  toast({ title: "Reminder Set", description: `We'll notify you about ${selectedEvent.title}.` });
                }}>Set Reminder</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Cycle Confirmation Dialog */}
      <Dialog open={isReviewCycleOpen} onOpenChange={setIsReviewCycleOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Start New Review Cycle</DialogTitle>
            <DialogDescription>
              This will notify all managers and employees that the performance review period for Q1 2024 has begun.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Cycle Details</h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex justify-between"><span>Period:</span> <span className="text-foreground font-medium">Q1 2024</span></li>
                <li className="flex justify-between"><span>Deadline:</span> <span className="text-foreground font-medium">April 15, 2024</span></li>
                <li className="flex justify-between"><span>Participants:</span> <span className="text-foreground font-medium">24 Employees</span></li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setIsReviewCycleOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => {
              setIsReviewCycleOpen(false);
              toast({ title: "Review Cycle Started", description: "All notifications have been sent." });
            }}>Confirm & Start</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Detail Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4">
                  <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="text-lg font-bold">{selectedEmployee.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{selectedEmployee.role}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Department</p>
                    <p className="text-sm font-medium">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm font-medium">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-medium">{selectedEmployee.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Location</p>
                    <p className="text-sm font-medium">{selectedEmployee.location}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Start Date</p>
                    <p className="text-sm font-medium">{selectedEmployee.startDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Manager</p>
                    <p className="text-sm font-medium">{selectedEmployee.manager}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Performance Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-lg font-bold">{selectedEmployee.performance}</span>
                    <span className="text-xs text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs" onClick={() => setIsPerformanceHistoryOpen(true)}>View History</Button>
              </div>
              <DialogFooter className="gap-2 sm:justify-start">
                <Button variant="outline" className="rounded-xl h-9 text-xs flex-1" onClick={() => setIsMessageOpen(true)}>
                  <Mail className="w-3.5 h-3.5 mr-2" /> Message
                </Button>
                <Button className="rounded-xl h-9 text-xs flex-1" onClick={() => setIsEditProfileOpen(true)}>
                  Edit Profile
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Performance History Dialog */}
      <Dialog open={isPerformanceHistoryOpen} onOpenChange={setIsPerformanceHistoryOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle>Performance History: {selectedEmployee.name}</DialogTitle>
                <DialogDescription>
                  Review rating trends and feedback from previous review cycles.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-6">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { period: 'Q1 2023', rating: 4.2 },
                      { period: 'Q2 2023', rating: 4.5 },
                      { period: 'Q3 2023', rating: 4.4 },
                      { period: 'Q4 2023', rating: 4.8 },
                      { period: 'Q1 2024', rating: selectedEmployee.performance },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="rating" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest">Feedback History</h4>
                  {[
                    { date: 'Jan 15, 2024', reviewer: 'Sarah Chen', feedback: 'Consistently delivers high-quality work and is a strong team contributor.', rating: 4.8 },
                    { date: 'Oct 10, 2023', reviewer: 'James Wilson', feedback: 'Technical proficiency is evident; focusing on leadership growth for the next quarter.', rating: 4.4 },
                  ].map((f, i) => (
                    <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{f.date} • {f.reviewer}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="text-xs font-bold">{f.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button className="rounded-xl" onClick={() => setIsPerformanceHistoryOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden">
          {selectedEmployee && (
            <>
              <div className="p-4 border-b border-border bg-primary/5 flex items-center gap-3">
                <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <p className="text-sm font-bold">{selectedEmployee.name}</p>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Online</p>
                </div>
              </div>
              <div className="h-[300px] p-4 space-y-4 overflow-y-auto bg-secondary/10">
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl rounded-tl-none bg-card border border-border text-xs">
                    Hey! Do you have a moment to chat about the new design system updates?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] p-3 rounded-2xl rounded-tr-none bg-primary text-primary-foreground text-xs">
                    Sure, I'll be free in about 10 minutes. Does that work?
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border flex gap-2">
                <Input placeholder="Type a message..." className="rounded-xl h-10" />
                <Button size="icon" className="rounded-xl h-10 w-10 shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Profile: {selectedEmployee.name}</DialogTitle>
                <DialogDescription>
                  Update employee information and professional details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Input id="edit-role" defaultValue={selectedEmployee.role} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-dept">Department</Label>
                    <Input id="edit-dept" defaultValue={selectedEmployee.department} className="rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" defaultValue={selectedEmployee.email} className="rounded-xl" />
                  </div>
                  <PhoneInput 
                    label="Phone"
                    value={selectedEmployee.phone} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-loc">Location</Label>
                  <Input id="edit-loc" defaultValue={selectedEmployee.location} className="rounded-xl" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
                <Button className="rounded-xl" onClick={() => {
                  setIsEditProfileOpen(false);
                  toast({ title: "Profile Updated", description: `Changes to ${selectedEmployee.name}'s profile have been saved.` });
                }}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Log Dialog */}
      <Dialog open={isActivityLogOpen} onOpenChange={setIsActivityLogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>HR Activity Log</DialogTitle>
            <DialogDescription>
              A complete record of all HR-related actions and system events.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
            {[
              { user: "Sarah Chen", action: "approved a leave request", target: "Alex Rivera", time: "2h ago", icon: CheckCircle2, color: "text-green-500" },
              { user: "Elena Rodriguez", action: "posted a new job", target: "Product Manager", time: "5h ago", icon: UserPlus, color: "text-blue-500" },
              { user: "System", action: "completed payroll for", target: "March 2024", time: "1d ago", icon: CreditCard, color: "text-primary" },
              { user: "James Wilson", action: "updated salary for", target: "David Kim", time: "2d ago", icon: CreditCard, color: "text-primary" },
              { user: "Sarah Chen", action: "assigned mentor to", target: "Jordan Smith", time: "3d ago", icon: Users, color: "text-orange-500" },
              { user: "Elena Rodriguez", action: "updated job description", target: "Senior Engineer", time: "4d ago", icon: FileText, color: "text-blue-500" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                <div className={`mt-1 p-2 h-fit rounded-lg bg-secondary/50 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-bold">{item.user}</span> {item.action} <span className="font-bold">{item.target}</span>
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button className="rounded-xl" onClick={() => setIsActivityLogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Department Dialog */}
      <Dialog open={isCreateDeptModalOpen} onOpenChange={setIsCreateDeptModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 border-b-2 border-border bg-muted/30">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Create New Department</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest mt-1 text-primary">
              Define a new organisational unit and its default workspace tools.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Department Name <span className="text-primary">*</span></Label>
              <Input 
                placeholder="e.g. Research & Development" 
                className="rounded-xl h-12 border-2 font-bold uppercase tracking-tight" 
                value={newDeptConfig.name}
                onChange={e => setNewDeptConfig({...newDeptConfig, name: e.target.value})}
              />
            </div>

            <div className="space-y-4 pt-4 border-t-2 border-border/50">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary">Assign Default Tools</Label>
                <Button variant="link" className="text-[9px] font-black uppercase p-0 h-auto" onClick={() => setNewDeptConfig({...newDeptConfig, tools: allTools.map(t => t.id)})}>Select All</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allTools.map(tool => {
                  const selected = newDeptConfig.tools.includes(tool.id);
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleDeptTool(tool.id)}
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
          </div>
          <DialogFooter className="p-8 bg-muted/30 border-t-2 border-border">
            <Button variant="ghost" className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsCreateDeptModalOpen(false)}>Cancel</Button>
            <Button className="rounded-xl h-12 px-10 font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-glow" onClick={handleCreateDepartment}>Create Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Applicants Dialog */}
      <Dialog open={isApplicantsOpen} onOpenChange={setIsApplicantsOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle>Applicants: {selectedJob.title}</DialogTitle>
                <DialogDescription>
                  Review and manage candidates for this position.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {[
                  { name: "Sopia Miller", role: "Product Designer", score: 92, status: "Reviewing", avatar: "https://i.pravatar.cc/150?u=11" },
                  { name: "Liam Wilson", role: "Senior Engineer", score: 88, status: "Interviewing", avatar: "https://i.pravatar.cc/150?u=12" },
                  { name: "Emma Davis", role: "Product Manager", score: 95, status: "Offer Sent", avatar: "https://i.pravatar.cc/150?u=13" },
                ].map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={app.avatar} alt={app.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <p className="text-xs font-bold">{app.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{app.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Bot className="w-3 h-3 text-primary" />
                          <span className="text-xs font-bold">{app.score}</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Score</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs">View Profile</Button>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button className="rounded-xl" onClick={() => setIsApplicantsOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Paystub Dialog */}
      <Dialog open={isPaystubOpen} onOpenChange={setIsPaystubOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle>Paystub: {selectedEmployee.name}</DialogTitle>
                <DialogDescription>
                  Payroll period: March 1 - March 31, 2024
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-xl bg-secondary/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Gross Pay</p>
                    <p className="text-xl font-bold">{selectedEmployee.salary}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/5">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Deductions</p>
                    <p className="text-xl font-bold text-red-600">-$2,450</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest border-b border-border pb-2">Breakdown</h4>
                  {[
                    { label: "Base Salary", amount: selectedEmployee.salary },
                    { label: "Federal Tax", amount: "-$1,200", color: "text-red-600" },
                    { label: "State Tax", amount: "-$450", color: "text-red-600" },
                    { label: "Health Insurance", amount: "-$800", color: "text-red-600" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={`font-bold ${item.color || ''}`}>{item.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-4 border-t border-border">
                    <span>Net Payout</span>
                    <span className="text-green-600">$9,650</span>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-xl flex-1" onClick={() => setIsPaystubOpen(false)}>
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button className="rounded-xl flex-1" onClick={() => setIsPaystubOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Export HR Data</DialogTitle>
            <DialogDescription>
              Choose your preferred format and data range for the export.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>File Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="pdf">PDF (Report)</SelectItem>
                  <SelectItem value="json">JSON (API Format)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Range</Label>
              <Select defaultValue="all">
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Full Directory</SelectItem>
                  <SelectItem value="active">Active Employees Only</SelectItem>
                  <SelectItem value="payroll">Payroll History</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsExportOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => {
              setIsExportOpen(false);
              const data = [...MOCK_EMPLOYEES, ...staffList];
              if (data.length === 0) {
                toast({ title: "No data to export", variant: "destructive" });
                return;
              }
              exportToCSV(data, 'hr_directory');
              toast({ title: "Export Successful", description: "Your employee directory has been exported as CSV." });
            }}>Start Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Filter Directory</DialogTitle>
            <DialogDescription>
              Narrow down your employee search with advanced filters.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <Label>Department</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Engineering', 'Design', 'Marketing', 'People', 'Sales', 'Product'].map(dept => (
                  <Button key={dept} variant="outline" className="rounded-xl h-9 text-xs justify-start px-3">
                    <div className="w-2 h-2 rounded-full bg-primary/20 mr-2" /> {dept}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Employment Status</Label>
              <div className="flex gap-2">
                {['Full-time', 'Contract', 'Remote'].map(status => (
                  <Button key={status} variant="outline" className="rounded-xl h-9 text-xs">
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Location</Label>
              <Select>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sf">San Francisco, CA</SelectItem>
                  <SelectItem value="lon">London, UK</SelectItem>
                  <SelectItem value="mad">Madrid, ES</SelectItem>
                  <SelectItem value="rem">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="rounded-xl" onClick={() => setIsFiltersOpen(false)}>Clear All</Button>
            <Button className="rounded-xl" onClick={() => setIsFiltersOpen(false)}>Apply Filters</Button>
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
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Delete {itemToDelete?.type === 'staff' ? 'Staff Member' : 'Leave Request'}?
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Are you sure you want to remove this {itemToDelete?.type === 'staff' ? 'staff member' : 'request'} from your records?
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

export default HRPage;
