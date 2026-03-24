import React, { useState, useMemo } from "react";
import { 
  Plus, Search, MapPin, ChevronRight, X, Mail, Phone, Calendar, Clock, 
  CheckCircle2, XCircle, AlertCircle, LayoutDashboard, Users, UserPlus, 
  Briefcase, Coffee, CreditCard, BarChart3, FileText, Bell, Sparkles,
  TrendingUp, TrendingDown, Cake, PartyPopper, UserCheck, UserMinus,
  MessageSquare, Kanban, List, Filter, MoreHorizontal, Star, Award, 
  Zap, ArrowRight, ShieldCheck, Download, Globe, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { useToast } from "@/components/ui/use-toast";
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
import { format } from "date-fns";

// --- Types ---

type HRTool = 'dashboard' | 'directory' | 'hiring' | 'onboarding' | 'time-off' | 'time-tracking' | 'payroll' | 'performance' | 'analytics';

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

const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", name: "Alex Rivera", role: "Senior Product Designer", department: "Design", status: "Active", avatar: "https://i.pravatar.cc/150?u=1", location: "San Francisco, CA", email: "alex@cynda.ai", phone: "+1 (555) 012-3456", startDate: "2023-01-15", manager: "Sarah Chen", salary: "$145,000", performance: 4.8 },
  { id: "2", name: "Sarah Chen", role: "VP of Engineering", department: "Engineering", status: "Active", avatar: "https://i.pravatar.cc/150?u=2", location: "Remote", email: "sarah@cynda.ai", phone: "+1 (555) 012-3457", startDate: "2022-06-01", manager: "James Wilson", salary: "$210,000", performance: 4.9 },
  { id: "3", name: "Marcus Johnson", role: "Software Engineer", department: "Engineering", status: "Active", avatar: "https://i.pravatar.cc/150?u=3", location: "London, UK", email: "marcus@cynda.ai", phone: "+44 20 7123 4567", startDate: "2023-03-10", manager: "Sarah Chen", salary: "$120,000", performance: 4.5 },
  { id: "4", name: "Elena Rodriguez", role: "HR Manager", department: "People", status: "Active", avatar: "https://i.pravatar.cc/150?u=4", location: "Madrid, ES", email: "elena@cynda.ai", phone: "+34 91 123 4567", startDate: "2022-11-20", manager: "James Wilson", salary: "$95,000", performance: 4.7 },
  { id: "5", name: "David Kim", role: "Marketing Lead", department: "Marketing", status: "On Leave", avatar: "https://i.pravatar.cc/150?u=5", location: "Seoul, KR", email: "david@cynda.ai", phone: "+82 2 123 4567", startDate: "2023-05-05", manager: "James Wilson", salary: "$110,000", performance: 4.6 },
  { id: "6", name: "Jordan Smith", role: "Junior Developer", department: "Engineering", status: "Onboarding", avatar: "https://i.pravatar.cc/150?u=6", location: "Remote", email: "jordan@cynda.ai", phone: "+1 (555) 012-3458", startDate: "2024-03-20", manager: "Sarah Chen", salary: "$85,000", performance: 0 },
];

const MOCK_JOBS: Job[] = [
  { id: "1", title: "Senior Full Stack Engineer", department: "Engineering", location: "Remote", type: "Full-time", status: "Open", applicants: 42 },
  { id: "2", title: "Product Manager", department: "Product", location: "San Francisco", type: "Full-time", status: "Open", applicants: 128 },
  { id: "3", title: "Content Strategist", department: "Marketing", location: "Remote", type: "Contract", status: "Draft", applicants: 0 },
];

const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: "1", employee: "Alex Rivera", type: "Vacation", startDate: "2024-04-10", endDate: "2024-04-17", status: "Approved", reason: "Annual family trip" },
  { id: "2", employee: "Marcus Johnson", type: "Sick Leave", startDate: "2024-03-24", endDate: "2024-03-25", status: "Pending", reason: "Flu symptoms" },
  { id: "3", employee: "Elena Rodriguez", type: "Personal", startDate: "2024-05-02", endDate: "2024-05-02", status: "Pending", reason: "Family matter" },
];

const HRPage = () => {
  const [activeTool, setActiveTool] = useState<HRTool>('dashboard');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
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
  const [isReviewCycleOpen, setIsReviewCycleOpen] = useState(false);
  const [isRunPayrollOpen, setIsRunPayrollOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ title: string; date: string; icon: any; color: string } | null>(null);
  const { toast } = useToast();

  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const tools = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'hiring', label: 'Hiring', icon: UserPlus },
    { id: 'onboarding', label: 'Onboarding', icon: Briefcase },
    { id: 'time-off', label: 'Time Off', icon: Coffee },
    { id: 'time-tracking', label: 'Tracking', icon: Clock },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Human Resources</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your global workforce, hiring, and performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setIsExportOpen(true)}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            <Button size="sm" className="rounded-xl" onClick={() => setIsAddStaffOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Staff
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
                onClick={() => setActiveTool(tool.id as HRTool)}
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
            {activeTool === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Headcount", value: MOCK_EMPLOYEES.length.toString(), change: "+2", icon: Users, color: "text-blue-500" },
                    { label: "Active Now", value: MOCK_EMPLOYEES.filter(e => e.status === 'Active').length.toString(), change: "75%", icon: UserCheck, color: "text-green-500" },
                    { label: "Open Roles", value: MOCK_JOBS.filter(j => j.status === 'Open').length.toString(), change: "+1", icon: UserPlus, color: "text-orange-500" },
                    { label: "Retention", value: "98%", change: "+0.5%", icon: TrendingUp, color: "text-primary" },
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
                        { title: "Quarterly Review", date: "March 28", icon: BarChart3, color: "text-orange-500" },
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
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search employees by name, role, or department..." 
                      className="pl-10 h-10 rounded-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="rounded-xl h-10 gap-2" onClick={() => setIsFiltersOpen(true)}>
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
                            <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-xl object-cover" />
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${
                              emp.status === 'Active' ? 'bg-green-500' : emp.status === 'On Leave' ? 'bg-orange-500' : 'bg-blue-500'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{emp.name}</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{emp.role}</p>
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
                              <Sparkles className="w-3 h-3 text-primary" />
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
                    { label: "Sick Leave", value: "8 days", sub: "Available", icon: AlertCircle, color: "text-red-500" },
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
                              req.status === 'Pending' ? 'bg-orange-500/10 text-orange-600' : 'bg-red-500/10 text-red-600'
                            }`}>
                              {req.status}
                            </div>
                            {req.status === 'Pending' && (
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-lg text-green-600 hover:bg-green-500/10" 
                                  onClick={() => {
                                    setLeaveRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r));
                                    toast({ title: "Request Approved", description: `Leave for ${req.employee} has been approved.` });
                                  }}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-500/10" 
                                  onClick={() => {
                                    setLeaveRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Rejected' } : r));
                                    toast({ title: "Request Rejected", description: `Leave for ${req.employee} has been declined.` });
                                  }}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
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

            {activeTool === 'onboarding' && (
              <motion.div 
                key="onboarding"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "New Hires", value: "3", sub: "This month", icon: UserPlus, color: "text-blue-500" },
                    { label: "Avg. Time", value: "12 days", sub: "To complete", icon: Clock, color: "text-green-500" },
                    { label: "Completion", value: "88%", sub: "Rate", icon: CheckCircle2, color: "text-primary" },
                    { label: "Active", value: "5", sub: "Workflows", icon: Zap, color: "text-orange-500" },
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
                    <h3 className="font-display font-bold mb-6">Current Onboarding</h3>
                    <div className="space-y-6">
                      {[
                        { name: "Jordan Smith", role: "Junior Developer", progress: 65, tasks: "8/12", mentor: "Marcus Johnson", avatar: "https://i.pravatar.cc/150?u=6" },
                        { name: "Sopia Miller", role: "Product Designer", progress: 25, tasks: "3/12", mentor: "Alex Rivera", avatar: "https://i.pravatar.cc/150?u=11" },
                      ].map((hire, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={hire.avatar} alt={hire.name} className="w-10 h-10 rounded-xl object-cover" />
                              <div>
                                <p className="text-sm font-bold">{hire.name}</p>
                                <p className="text-[10px] text-muted-foreground">{hire.role} • Mentor: {hire.mentor}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold">{hire.progress}%</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{hire.tasks} tasks</p>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${hire.progress}%` }}
                              className="h-full bg-primary"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <h3 className="font-display font-bold mb-6">Onboarding Tasks</h3>
                    <div className="space-y-4">
                      {onboardingTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 group">
                          <button 
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                              task.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => {
                              const newStatus = !task.completed;
                              setOnboardingTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newStatus } : t));
                              toast({ title: "Task Updated", description: `Task "${task.title}" has been marked as ${newStatus ? 'completed' : 'incomplete'}.` });
                            }}
                          >
                            {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <span className={`text-xs ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-6 rounded-xl text-xs h-9 border-dashed" 
                      onClick={() => {
                        const newTask = { id: Math.random().toString(), title: "New Custom Task", completed: false };
                        setOnboardingTasks(prev => [...prev, newTask]);
                        toast({ title: "Task Added", description: "A new onboarding task has been created." });
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-2" /> Add Custom Task
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'time-tracking' && (
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
                      className={`rounded-xl h-9 text-xs ${isClockedIn ? 'bg-red-500 hover:bg-red-600' : ''}`} 
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
                    { label: "Overtime", value: "42h", sub: "This week", icon: AlertCircle, color: "text-orange-500" },
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
                        <div className="w-2 h-2 rounded-full bg-orange-500" /> Break
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

            {activeTool === 'payroll' && (
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
                      <Sparkles className="w-3.5 h-3.5 mr-2" /> Give Recognition
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'analytics' && (
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

            {!['dashboard', 'directory', 'hiring', 'time-off', 'onboarding', 'time-tracking', 'payroll', 'performance', 'analytics'].includes(activeTool) && (
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
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details of the new employee to add them to the directory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@cynda.ai" className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" placeholder="Software Engineer" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eng">Engineering</SelectItem>
                    <SelectItem value="des">Design</SelectItem>
                    <SelectItem value="mkt">Marketing</SelectItem>
                    <SelectItem value="peo">People</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Reporting Manager</Label>
              <Input id="manager" placeholder="Sarah Chen" className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={() => {
              setIsAddStaffOpen(false);
              toast({ title: "Staff Added", description: "The new employee has been added to the system." });
            }}>Add Employee</Button>
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
                  <h4 className="text-sm font-bold uppercase tracking-widest">Recent Feedback</h4>
                  {[
                    { date: 'Jan 15, 2024', reviewer: 'Sarah Chen', feedback: 'Alex consistently delivers high-quality work and is a great team player.', rating: 4.8 },
                    { date: 'Oct 10, 2023', reviewer: 'James Wilson', feedback: 'Strong technical skills, looking to see more leadership in the next quarter.', rating: 4.4 },
                  ].map((f, i) => (
                    <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{f.date} • {f.reviewer}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="text-xs font-bold">{f.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs italic text-muted-foreground">"{f.feedback}"</p>
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input id="edit-phone" defaultValue={selectedEmployee.phone} className="rounded-xl" />
                  </div>
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
                          <Sparkles className="w-3 h-3 text-primary" />
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
              toast({ title: "Export Started", description: "Your file will be ready in a few moments." });
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
    </div>
  );
};

export default HRPage;
