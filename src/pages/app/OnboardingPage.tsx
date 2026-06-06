import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  User, Building2, Globe, ArrowRight, ArrowLeft, Check,
  MessageSquare, Kanban, Users, Receipt, UserCheck, FileText, BarChart3,
  Bot, ChevronRight, ChevronDown
} from "lucide-react";
import { useIndustryStore, USER_TYPES, DEPARTMENTS, UserType, Staff, TRIAL_ALLOWED_TOOLS } from "@/lib/industry-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import PhoneInput from "@/components/ui/PhoneInput";
import { 
  FileUp, Upload, UserPlus, Shield, Sparkles, CheckCircle2,
  Trash2, Plus, Info, Camera, Mail, X, Settings as SettingsIcon, Briefcase
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { generateChatName } from "@/lib/utils";

const OnboardingPage = () => {
  const { 
    userType, setUserType, setSelectedModules, 
    setAdminProfile, selectedModules, addStaff, staffList,
    setOnboarded, subscriptionTier, isAuthenticated
  } = useIndustryStore();
  
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  const [step, setStep] = useState(subscriptionTier === 'paid' ? 1 : 0);
  const [adminData, setAdminData] = useState({ name: "", email: "", companyName: "", logo: null as string | null, phone: "" });
  const [enterpriseData, setEnterpriseData] = useState({ 
    name: "", 
    email: "", 
    role: "", 
    company: "", 
    size: "", 
    departments: [] as string[],
    desc: "" 
  });
  const [enterpriseSubmitted, setEnterpriseSubmitted] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<string[]>(Object.keys(DEPARTMENTS));
  const [isParsing, setIsParsing] = useState(false);
  const [parsingComplete, setParsingComplete] = useState(false);
  const [localStaffList, setLocalStaffList] = useState<Staff[]>([]);
  const [invites, setInvites] = useState<{ email: string, role: 'Manager' | 'Employee', modules: string[] }[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'Manager' | 'Employee'>('Employee');
  const [inviteModules, setInviteModules] = useState<string[]>([]);
  const [isInvitePopoverOpen, setIsInvitePopoverOpen] = useState(false);
  
  const toggleTool = (toolId: string) => {
    setSelectedModules(
      selectedModules.includes(toolId)
        ? selectedModules.filter((id) => id !== toolId)
        : [...selectedModules, toolId]
    );
  };

  const toggleDept = (deptKey: string) => {
    setExpandedDepts(prev => 
      prev.includes(deptKey) 
        ? prev.filter(k => k !== deptKey) 
        : [...prev, deptKey]
    );
  };

  const isToolSelected = (toolId: string) => selectedModules.includes(toolId);

  const toggleEntireDept = (deptKey: string) => {
    const deptTools = DEPARTMENTS[deptKey as keyof typeof DEPARTMENTS].tools.map(t => t.id);
    const allSelected = deptTools.every(id => selectedModules.includes(id));
    
    if (allSelected) {
      setSelectedModules(selectedModules.filter(id => !deptTools.includes(id)));
    } else {
      const newModules = [...new Set([...selectedModules, ...deptTools])];
      setSelectedModules(newModules);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!userType;
    if (userType === 'solo') {
      if (step === 1) return selectedModules.length > 0;
    }
    if (userType === 'team') {
      if (step === 1) return !!adminData.companyName;
      if (step === 2) return selectedModules.length > 0;
      if (step === 3) return !!adminData.name;
      if (step === 4) return true; // Invites optional
      if (step === 5) return true;
    }
    if (userType === 'organisation') {
      if (step === 1) return true; // Modules preset or toggled
      if (step === 2) return true; // Profile
      if (step === 3) return true; // Departments
      if (step === 4) return true; // HR Access
      if (step === 5) return true;
    }
    if (userType === 'enterprise') {
      if (step === 1) return !!enterpriseData.name && !!enterpriseData.email && !!enterpriseData.company && !!enterpriseData.size && enterpriseData.departments.length > 0;
    }
    return true;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminData({ ...adminData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addInvite = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (invites.find(i => i.email === inviteEmail)) {
      toast({ title: "Already Added", description: "This email is already in the invite list." });
      return;
    }
    setInvites([...invites, { email: inviteEmail, role: inviteRole, modules: inviteModules }]);
    setInviteEmail("");
    setInviteModules([]);
  };

  const removeInvite = (email: string) => {
    setInvites(invites.filter(i => i.email !== email));
  };

  const handleNext = () => {
    if (userType === 'organisation' && step === 0) {
      // For organisation, pre-select all tools
      const allTools = Object.values(DEPARTMENTS).flatMap(d => d.tools.map(t => t.id));
      setSelectedModules(allTools);
    }
    setStep(step + 1);
  };

  const handleFinish = async () => {
    try {
      if (userType === 'team' || userType === 'organisation') {
        const finalName = adminData.name || "Admin User";
        useIndustryStore.getState().setAdminProfile({
          name: finalName,
          email: adminData.email || "admin@workspace.com",
          chatName: generateChatName(finalName),
          companyName: adminData.companyName || "My Company",
          role: "Super Admin",
          logo: adminData.logo,
          phone: adminData.phone
        });
        
        useIndustryStore.getState().setAuthenticated(true);
        useIndustryStore.getState().setOnboarded(true);
        useIndustryStore.getState().setSelectedModules(selectedModules);

        // Add invited staff
        invites.forEach(invite => {
          const staffName = invite.email.split('@')[0];
          addStaff({
            id: Math.random().toString(36).substr(2, 9),
            name: staffName,
            email: invite.email,
            chatName: generateChatName(staffName),
            role: invite.role,
            department: "General",
            tools: invite.modules,
            status: 'Active'
          });
        });

        // Add all staff to the store if any were added via parsing (legacy logic, keeping it for now)
        localStaffList.forEach(staff => addStaff({
          ...staff,
          chatName: staff.chatName || generateChatName(staff.name)
        }));
      } else if (userType === 'enterprise') {
        setEnterpriseSubmitted(true);
        toast({ title: "Request Sent", description: "Our sales team will contact you shortly." });
        return; // Don't navigate yet
      } else if (userType === 'solo') {
        if (!selectedModules || selectedModules.length === 0) {
          setSelectedModules(['tasks', 'notes', 'chat']);
        }
        const finalName = adminData.name || "Solo User";
        setAdminProfile({
          name: finalName,
          email: adminData.email || "solo@workspace.com",
          companyName: adminData.companyName || `${finalName.split(' ')[0]}'s Workspace`,
          role: "Owner",
          logo: adminData.logo,
          phone: adminData.phone
        });
        useIndustryStore.getState().setAuthenticated(true);
        useIndustryStore.getState().setOnboarded(true);
        useIndustryStore.getState().setSelectedModules(
          selectedModules.length > 0 ? selectedModules : ['tasks', 'notes', 'chat']
        );
      }

      toast({
        title: "Workspace Initialized",
        description: "Welcome to your new business operating system.",
      });

      // Force a small delay to ensure Zustand store has persisted to localStorage
      setTimeout(() => {
        navigate("/app/dashboard", { replace: true });
      }, 150);
    } catch (error) {
      console.error("Onboarding finish error:", error);
      navigate("/app/dashboard");
    }
  };

  const getSteps = () => {
    if (userType === 'solo') return ["Type", "Tools", "Ready"];
    if (userType === 'team') return ["Type", "Business", "Tools", "Profile", "Team", "Ready"];
    if (userType === 'organisation') return ["Type", "Organisation", "Profile", "Departments", "HR Setup", "Ready"];
    return ["Type", "Contact"];
  };

  const handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const stepsList = getSteps();

  const selectedToolsObjects = useMemo(() => {
    const tools: { id: string, label: string, icon: any }[] = [];
    Object.values(DEPARTMENTS).forEach(dept => {
      dept.tools.forEach(tool => {
        if (selectedModules.includes(tool.id)) {
          tools.push(tool);
        }
      });
    });
    return tools;
  }, [selectedModules]);

  const allTools = useMemo(() => {
    return Object.values(DEPARTMENTS).flatMap(d => d.tools);
  }, []);

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Reset Button for debugging */}
      <button 
        onClick={handleReset}
        className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors z-50"
      >
        Reset App State
      </button>

      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[420px] bg-gradient-dark flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-base">C</span>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-wahoo-foreground">Cynda</span>
          </div>
          <p className="text-sm text-wahoo-foreground/60 mt-4 leading-relaxed">
            Set up your workspace in under 60 seconds. We'll configure everything based on your choices.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {stepsList.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary/20 text-primary border border-primary/40" :
                "bg-wahoo-foreground/10 text-wahoo-foreground/40"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${
                i <= step ? "text-wahoo-foreground" : "text-wahoo-foreground/40"
              }`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-xl py-8 sm:py-12">
          {/* Mobile progress indicator */}
          <div className="lg:hidden flex items-center gap-1.5 mb-8 overflow-x-auto scrollbar-hide pb-2">
            {stepsList.map((s, i) => (
              <div key={s} className="flex items-center shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  i < step ? "bg-primary text-primary-foreground shadow-glow" :
                  i === step ? "bg-primary/20 text-primary border border-primary/40 scale-110" :
                  "bg-secondary text-muted-foreground/40"
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {i < stepsList.length - 1 && (
                  <div className={`w-4 h-px mx-1 ${i < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: User Type */}
            {step === 0 && (
              <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2 mb-10">
                  <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">Workspace setup</h2>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">Let's build your Cynda.</p>
                </div>
                <div className="flex flex-col gap-4">
                  {Object.values(USER_TYPES).map((t) => {
                    const UserTypeIcon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setUserType(t.id)}
                        className={`w-full flex items-center gap-6 p-6 rounded-[2rem] border-2 text-left transition-all active:scale-[0.99] ${
                          userType === t.id
                            ? "border-primary bg-primary/5 shadow-md ring-4 ring-primary/5"
                            : "border-border hover:border-primary/30 bg-card"
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                          userType === t.id ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground"
                        }`}>
                          {UserTypeIcon && <UserTypeIcon className="w-7 h-7" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-black text-foreground uppercase tracking-tight">{t.name}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed opacity-80">{t.description}</p>
                        </div>
                        {userType === t.id && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-glow">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Team: Step 1 - Business Setup */}
            {userType === 'team' && step === 1 && (
              <motion.div key="sb-step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2 mb-10 text-center sm:text-left">
                  <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">Set up your business.</h2>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">Tell us what you're building.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Business Name <span className="text-primary">*</span></label>
                    <Input 
                      placeholder="e.g. Acme Studio" 
                      value={adminData.companyName} 
                      onChange={e => setAdminData({...adminData, companyName: e.target.value})}
                      className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-primary/5 transition-all font-bold uppercase tracking-tight"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Business Logo (Optional)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-border flex items-center justify-center bg-card relative overflow-hidden group">
                        {adminData.logo ? (
                          <img src={adminData.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-muted-foreground/30" />
                        )}
                        <input 
                          type="file" 
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          accept="image/*"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-xs font-black uppercase tracking-tight text-foreground">Upload your brand</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-widest leading-relaxed">
                          Recommended: Square PNG or SVG.
                        </p>
                        {adminData.logo && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setAdminData({...adminData, logo: null})}
                            className="mt-2 text-[9px] font-black uppercase tracking-widest h-7 text-destructive hover:bg-destructive/10"
                          >
                            Remove Logo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2 (Team) / Step 1 (Organisation) / Step 1 (Solo) - Pick Your Modules */}
            {((userType === 'team' && step === 2) || (userType === 'organisation' && step === 1) || (userType === 'solo' && step === 1)) && (
              <motion.div key="modules" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2 mb-10 text-center sm:text-left">
                  <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">
                    {userType === 'solo' ? 'What do you want to use?' : 'What does your business need?'}
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">
                    {userType === 'solo'
                      ? 'Choose the tools for your workspace. You can change these anytime in Settings.'
                      : 'Select the departments and tools your team will use.'}
                  </p>
                </div>

                {userType === 'organisation' && (
                  <div className="mb-6 p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Organisation tier: all modules active by default</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[9px] font-black uppercase tracking-widest h-7"
                      onClick={() => setSelectedModules([])}
                    >
                      Clear All
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide pb-10">
                  {allTools.map((tool) => {
                    const selected = selectedModules.includes(tool.id);
                    const ToolIcon = tool.icon;
                    const isTrial = subscriptionTier === 'trial';
                    const isPremium = isTrial && !TRIAL_ALLOWED_TOOLS.includes(tool.id);

                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => toggleTool(tool.id)}
                        className={`relative flex flex-col items-start gap-4 p-5 rounded-[2rem] text-left transition-all border-2 ${
                          selected ? "bg-primary/5 border-primary ring-4 ring-primary/5 shadow-md" : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        {isPremium && (
                          <div className="absolute top-4 right-12 flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                            <Shield className="w-2.5 h-2.5" />
                            <span className="text-[7px] font-black uppercase tracking-widest">Premium</span>
                          </div>
                        )}
                        <div className={`p-3 rounded-2xl shrink-0 ${selected ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-secondary text-muted-foreground'}`}>
                          <ToolIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black uppercase tracking-tight">{tool.label}</p>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1 leading-relaxed opacity-60 line-clamp-2">{tool.description}</p>
                        </div>
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          selected ? "border-primary bg-primary shadow-glow scale-110" : "border-border bg-background"
                        }`}>
                          {selected && <Check className="w-4 h-4 text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3 (Team) / Step 2 (Organisation) - Your Profile */}
            {((userType === 'team' && step === 3) || (userType === 'organisation' && step === 2)) && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2 mb-10 text-center sm:text-left">
                  <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">Tell us about yourself.</h2>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">This is your personal profile within the workspace.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-secondary flex items-center justify-center border-2 border-border relative overflow-hidden group">
                      <User className="w-10 h-10 text-muted-foreground/30" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-black uppercase tracking-tight text-foreground">Personal Avatar</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-widest">Optional but encouraged.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                      <Input 
                        placeholder="e.g. John Doe" 
                        value={adminData.name} 
                        onChange={e => setAdminData({...adminData, name: e.target.value})}
                        className="h-12 rounded-xl border-2 font-bold uppercase tracking-tight"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Job Title</label>
                      <Input 
                        placeholder="e.g. CEO" 
                        className="h-12 rounded-xl border-2 font-bold uppercase tracking-tight"
                      />
                    </div>
                    <PhoneInput
                      label="Phone Number (Optional)"
                      value={adminData.phone}
                      onChange={(val) => setAdminData({...adminData, phone: val})}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4 (Team) - Invite Your Team */}
            {userType === 'team' && step === 4 && (
              <motion.div key="sb-team" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2 mb-10 text-center sm:text-left">
                  <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">Who else is on your team?</h2>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">You can invite people now or do it later from your settings.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input 
                        placeholder="colleague@business.com" 
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addInvite()}
                        className="h-14 pl-12 rounded-2xl border-2 focus:ring-4 focus:ring-primary/5 transition-all font-bold uppercase tracking-tight"
                      />
                    </div>
                    <Popover open={isInvitePopoverOpen} onOpenChange={setIsInvitePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-14 rounded-2xl border-2 px-4 flex flex-col items-center justify-center gap-1 group">
                          <SettingsIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Config</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-6 rounded-3xl shadow-2xl border-2 border-border bg-card">
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned Role</label>
                            <Select value={inviteRole} onValueChange={(val: any) => setInviteRole(val)}>
                              <SelectTrigger className="h-12 rounded-xl border-2 font-bold uppercase tracking-tight">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-2">
                                <SelectItem value="Manager" className="font-bold uppercase text-[10px]">Manager</SelectItem>
                                <SelectItem value="Employee" className="font-bold uppercase text-[10px]">Employee</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module Assignment</label>
                            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide">
                              {selectedToolsObjects.map(tool => (
                                <div key={tool.id} className="flex items-center space-x-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => {
                                  if (inviteModules.includes(tool.id)) {
                                    setInviteModules(inviteModules.filter(id => id !== tool.id));
                                  } else {
                                    setInviteModules([...inviteModules, tool.id]);
                                  }
                                }}>
                                  <Checkbox id={tool.id} checked={inviteModules.includes(tool.id)} onCheckedChange={() => {}} />
                                  <label htmlFor={tool.id} className="text-[9px] font-black uppercase tracking-tight cursor-pointer truncate">{tool.label}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <Button className="w-full h-10 rounded-xl uppercase font-black tracking-widest text-[9px]" onClick={() => setIsInvitePopoverOpen(false)}>Done</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button onClick={addInvite} className="h-14 w-14 rounded-2xl shadow-glow">
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-[48px] p-2 rounded-2xl bg-secondary/20 border-2 border-dashed border-border">
                    {invites.length === 0 && (
                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest m-auto">Invitees will appear here</p>
                    )}
                    {invites.map((invite) => (
                      <div key={invite.email} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border-2 border-border shadow-sm group">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-tight text-foreground">{invite.email}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-primary">{invite.role} • {invite.modules.length} Tools</span>
                        </div>
                        <button onClick={() => removeInvite(invite.email)} className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center pt-4">
                    <Button variant="ghost" onClick={handleNext} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                      Skip for now
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 (Organisation) - First Department */}
            {userType === 'organisation' && step === 3 && (
              <motion.div key="lb-dept" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2 mb-10 text-center sm:text-left">
                  <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">Set up your first department.</h2>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">Departments organise your people and control who sees what.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department Name <span className="text-primary">*</span></label>
                    <Input 
                      placeholder="e.g. Engineering" 
                      className="h-14 rounded-2xl border-2 font-bold uppercase tracking-tight"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department Head Email (Optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input 
                        placeholder="head@department.com" 
                        className="h-14 pl-12 rounded-2xl border-2 font-bold uppercase tracking-tight"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (Optional)</label>
                    <Textarea 
                      placeholder="What does this department do?" 
                      className="rounded-2xl border-2 min-h-[100px] font-bold uppercase tracking-tight"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button variant="outline" className="flex-1 h-12 rounded-2xl border-2 uppercase font-black tracking-widest text-[9px] bg-card hover:bg-secondary">
                      <Plus className="w-4 h-4 mr-2" /> Add Another Department
                    </Button>
                    <Button variant="ghost" onClick={handleNext} className="h-12 rounded-2xl uppercase font-black tracking-widest text-[9px] text-muted-foreground hover:text-foreground">
                      Skip for now
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4 (Organisation) - HR Access */}
            {userType === 'organisation' && step === 4 && (
              <motion.div key="lb-hr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2 mb-10 text-center sm:text-left">
                  <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">Who manages your people?</h2>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">Assign your HR lead. They will manage onboarding and the team directory.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">HR Lead Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input 
                        placeholder="hr@organisation.com" 
                        className="h-14 pl-12 rounded-2xl border-2 font-bold uppercase tracking-tight"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-primary/5 rounded-[2.5rem] border-2 border-primary/20 flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Briefcase className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-primary">HR Lead Permissions</p>
                      <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-widest leading-relaxed">
                        Full access to the People module, onboarding tools, and organisation directory.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center pt-4">
                    <Button variant="ghost" onClick={handleNext} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                      Skip for now
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Confirmation Screen (Last Step for non-enterprise) */}
            {userType !== 'enterprise' && step === (stepsList.length - 1) && (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center py-12">
                <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-glow mx-auto mb-10">
                  <Check className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-display text-4xl font-black uppercase tracking-tight mb-4 text-balance leading-none">Your workspace is ready.</h2>
                <p className="text-muted-foreground uppercase font-black tracking-widest max-w-sm mx-auto mb-12 opacity-70 text-[10px] leading-relaxed">Everything you selected is waiting. Let's get to work.</p>
                
                <div className="max-w-xs mx-auto mb-8 p-6 rounded-3xl bg-secondary/20 border-2 border-border space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-muted-foreground">Workspace</span>
                    <span className="text-[10px] font-black uppercase text-foreground">{adminData.companyName || "My Workspace"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-muted-foreground">Tier</span>
                    <span className="text-[10px] font-black uppercase text-foreground">
                      {userType === 'solo' ? 'Solo' : userType === 'team' ? 'Team' : 'Organisation'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-muted-foreground">Modules</span>
                    <span className="text-[10px] font-black uppercase text-foreground">{selectedModules.length} Active</span>
                  </div>
                  {invites.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase text-muted-foreground">Team</span>
                      <span className="text-[10px] font-black uppercase text-foreground">{invites.length} Invited</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 max-w-xs mx-auto mb-12">
                  <Button onClick={handleFinish} size="lg" className="rounded-2xl h-16 px-12 shadow-glow uppercase font-black tracking-[0.2em] text-xs w-full">
                    Take me to my workspace <ArrowRight className="ml-3 w-5 h-5" />
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="sm" className="rounded-xl border-2 uppercase font-black tracking-widest text-[8px] h-10 w-full opacity-50 hover:opacity-100">
                    Reset App State
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Enterprise: Contact Sales */}
            {userType === 'enterprise' && step === 1 && (
              <motion.div key="enterprise" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {enterpriseSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-glow mx-auto mb-10">
                      <Check className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="font-display text-4xl font-black uppercase tracking-tight mb-4 leading-none">Thank you!</h2>
                    <p className="text-muted-foreground uppercase font-black tracking-widest max-w-sm mx-auto mb-12 opacity-70 text-[10px] leading-relaxed">
                      We've received your request. Our enterprise team will get back to you shortly to discuss your custom workspace.
                    </p>
                    <Button onClick={() => navigate("/")} variant="outline" className="rounded-2xl h-14 px-10 uppercase font-black tracking-widest text-[10px]">
                      Return Home
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-10 text-center sm:text-left">
                      <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight">Contact Enterprise Sales</h2>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">Tell us about your organization and we'll reach out.</p>
                    </div>
                    
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Your Name</label>
                          <Input 
                            placeholder="e.g. John Doe" 
                            value={enterpriseData.name}
                            onChange={e => setEnterpriseData({...enterpriseData, name: e.target.value})}
                            className="h-12 rounded-xl border-2 font-bold uppercase tracking-tight"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Work Email</label>
                          <Input 
                            placeholder="e.g. admin@acme.com" 
                            type="email"
                            value={enterpriseData.email}
                            onChange={e => setEnterpriseData({...enterpriseData, email: e.target.value})}
                            className="h-12 rounded-xl border-2 font-bold uppercase tracking-tight"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Job Title / What you do</label>
                        <Input 
                          placeholder="e.g. Head of Operations" 
                          value={enterpriseData.role}
                          onChange={e => setEnterpriseData({...enterpriseData, role: e.target.value})}
                          className="h-12 rounded-xl border-2 font-bold uppercase tracking-tight"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Name</label>
                          <Input 
                            placeholder="e.g. Acme Corporation" 
                            value={enterpriseData.company}
                            onChange={e => setEnterpriseData({...enterpriseData, company: e.target.value})}
                            className="h-12 rounded-xl border-2 font-bold uppercase tracking-tight"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Size</label>
                          <Select value={enterpriseData.size} onValueChange={val => setEnterpriseData({...enterpriseData, size: val})}>
                            <SelectTrigger className="h-12 rounded-xl border-2 font-bold uppercase tracking-tight">
                              <SelectValue placeholder="Select Size" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                              <SelectItem value="500-1000" className="font-bold uppercase text-[10px]">500 - 1,000 employees</SelectItem>
                              <SelectItem value="1000-5000" className="font-bold uppercase text-[10px]">1,000 - 5,000 employees</SelectItem>
                              <SelectItem value="5000+" className="font-bold uppercase text-[10px]">5,000+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Departments</label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(DEPARTMENTS).map(deptKey => (
                            <div 
                              key={deptKey} 
                              className={`flex items-center space-x-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                enterpriseData.departments.includes(deptKey) ? "border-primary bg-primary/5" : "border-border bg-card"
                              }`}
                              onClick={() => {
                                if (enterpriseData.departments.includes(deptKey)) {
                                  setEnterpriseData({...enterpriseData, departments: enterpriseData.departments.filter(d => d !== deptKey)});
                                } else {
                                  setEnterpriseData({...enterpriseData, departments: [...enterpriseData.departments, deptKey]});
                                }
                              }}
                            >
                              <Checkbox id={`dept-${deptKey}`} checked={enterpriseData.departments.includes(deptKey)} onCheckedChange={() => {}} />
                              <label htmlFor={`dept-${deptKey}`} className="text-[10px] font-black uppercase tracking-tight cursor-pointer">{deptKey}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Brief Description of Needs</label>
                        <Textarea 
                          placeholder="Tell us about your specific requirements..." 
                          className="min-h-[100px] rounded-2xl border-2 font-bold uppercase tracking-tight"
                          value={enterpriseData.desc}
                          onChange={e => setEnterpriseData({...enterpriseData, desc: e.target.value})}
                        />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {!enterpriseSubmitted && step < (stepsList.length - 1) && (
            <div className="flex items-center justify-between mt-10">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
          
          {!enterpriseSubmitted && userType === 'enterprise' && step === (stepsList.length - 1) && (
            <div className="flex items-center justify-end mt-10">
              <Button onClick={handleFinish} disabled={!canProceed()} className="shadow-glow bg-primary text-primary-foreground">
                Submit Request <Bot className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
