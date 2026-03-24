import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  User, Building2, Globe, ArrowRight, ArrowLeft, Check,
  MessageSquare, Kanban, Users, Receipt, UserCheck, FileText, BarChart3,
  Sparkles, ChevronRight, ChevronDown
} from "lucide-react";
import { useIndustryStore, USER_TYPES, DEPARTMENTS, UserType } from "@/lib/industry-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const { userType, setUserType, setSelectedModules, setAdminProfile, selectedModules } = useIndustryStore();
  const [adminData, setAdminData] = useState({ name: "", email: "", role: "Super Admin" });
  const [enterpriseData, setEnterpriseData] = useState({ company: "", email: "", desc: "" });
  const [expandedDepts, setExpandedDepts] = useState<string[]>(Object.keys(DEPARTMENTS));
  
  const navigate = useNavigate();

  const toggleDept = (deptKey: string) => {
    setExpandedDepts(prev => 
      prev.includes(deptKey) ? prev.filter(d => d !== deptKey) : [...prev, deptKey]
    );
  };

  const isToolSelected = (toolId: string) => selectedModules.includes(toolId);

  const toggleTool = (toolId: string) => {
    if (isToolSelected(toolId)) {
      setSelectedModules(selectedModules.filter(id => id !== toolId));
    } else {
      setSelectedModules([...selectedModules, toolId]);
    }
  };

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
    if (userType === 'small-business') {
      if (step === 1) return !!adminData.name && !!adminData.email;
      if (step === 2) return selectedModules.length > 0;
    }
    if (userType === 'large-business') {
      if (step === 1) return true;
    }
    if (userType === 'enterprise') {
      if (step === 1) return !!enterpriseData.company && !!enterpriseData.email;
    }
    return true;
  };

  const handleNext = () => {
    if (userType === 'large-business' && step === 0) {
      // For large business, pre-select all tools
      const allTools = Object.values(DEPARTMENTS).flatMap(d => d.tools.map(t => t.id));
      setSelectedModules(allTools);
    }
    setStep(step + 1);
  };

  const handleFinish = () => {
    try {
      if (userType === 'small-business') {
        setAdminProfile(adminData);
      } else if (userType === 'enterprise') {
        const allTools = Object.values(DEPARTMENTS).flatMap(d => d.tools.map(t => t.id));
        setSelectedModules(allTools);
        setAdminProfile({ 
          name: enterpriseData.company || "Enterprise Admin", 
          email: enterpriseData.email || "admin@enterprise.com", 
          role: "Super Admin" 
        });
        toast({ title: "Request Sent", description: "Our sales team will contact you shortly. In the meantime, explore your enterprise workspace." });
      } else if (userType === 'solo') {
        // Ensure defaults for solo if not set
        if (!selectedModules || selectedModules.length === 0) {
          setSelectedModules(['tasks', 'notes', 'chat', 'file-management', 'wiki']);
        }
      }

      // Force a small delay to ensure Zustand store has persisted to localStorage
      // before the next page tries to read it during its own initialization.
      setTimeout(() => {
        navigate("/app/dashboard", { replace: true });
      }, 150);
    } catch (error) {
      console.error("Onboarding finish error:", error);
      // Fallback navigation
      navigate("/app/dashboard");
    }
  };

  const getSteps = () => {
    if (userType === 'solo') return ["User Type", "Customize Workspace"];
    if (userType === 'small-business') return ["User Type", "Admin Profile", "Tools"];
    if (userType === 'large-business') return ["User Type", "HR Setup"];
    if (userType === 'enterprise') return ["User Type", "Contact Sales"];
    return ["User Type"];
  };

  const handleReset = () => {
    localStorage.removeItem('industry-workspace-storage');
    window.location.reload();
  };

  const stepsList = getSteps();

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
                <div className="space-y-2 mb-8">
                  <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase">How will you use Cynda?</h2>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">Tailoring your OS experience</p>
                </div>
                <div className="space-y-3">
                  {Object.values(USER_TYPES).map((t) => {
                    const UserTypeIcon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setUserType(t.id)}
                        className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                          userType === t.id
                            ? "border-primary bg-primary/5 shadow-md ring-4 ring-primary/5"
                            : "border-border hover:border-primary/30 bg-card"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          userType === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}>
                          {UserTypeIcon && <UserTypeIcon className="w-6 h-6" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight">{t.name}</p>
                          <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">{t.description}</p>
                        </div>
                        {userType === t.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-glow">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Solo: Customize Workspace / Small Business: Tools */}
            {((userType === 'solo' && step === 1) || (userType === 'small-business' && step === 2)) && (
              <motion.div key="customize" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2 mb-8">
                  <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase text-balance leading-tight">Customize your workspace</h2>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">Select the modules you'll need</p>
                </div>
                
                <div className="space-y-4 max-h-[65vh] pr-2 overflow-y-auto scrollbar-hide">
                  {Object.entries(DEPARTMENTS).map(([key, dept]) => {
                    const deptTools = dept.tools.map(t => t.id);
                    const allSelected = deptTools.every(id => selectedModules.includes(id));
                    const someSelected = deptTools.some(id => selectedModules.includes(id)) && !allSelected;
                    const isExpanded = expandedDepts.includes(key);

                    return (
                      <div key={key} className="border-2 border-border rounded-2xl overflow-hidden bg-card shadow-sm">
                        <div className={`flex items-center justify-between p-4 sm:p-5 cursor-pointer transition-colors active:bg-secondary/80 ${allSelected ? 'bg-primary/5' : 'bg-card hover:bg-secondary/50'}`} onClick={() => toggleDept(key)}>
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-secondary/50">
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                            </div>
                            <span className="text-xs sm:text-sm font-black uppercase tracking-widest">{dept.label}</span>
                          </div>
                          <button 
                            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                              allSelected ? "border-primary bg-primary shadow-glow" : 
                              someSelected ? "border-primary bg-primary/30" : "border-border bg-background"
                            }`}
                            onClick={(e) => { e.stopPropagation(); toggleEntireDept(key); }}
                          >
                            {allSelected && <Check className="w-5 h-5 text-primary-foreground" />}
                            {someSelected && <div className="w-3 h-1 bg-primary-foreground rounded-full" />}
                          </button>
                        </div>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0 }} 
                              animate={{ height: "auto" }} 
                              exit={{ height: 0 }} 
                              className="overflow-hidden bg-background/50 border-t border-border/50"
                            >
                              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {dept.tools.map((tool) => {
                                  const selected = isToolSelected(tool.id);
                                  const ToolIcon = tool.icon;
                                  return (
                                    <button
                                      key={tool.id}
                                      onClick={() => toggleTool(tool.id)}
                                      className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors w-full ${
                                        selected ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                                      }`}
                                    >
                                      <ToolIcon className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-xs font-bold uppercase tracking-wider">{tool.label}</span>
                                      <div className={`ml-auto w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                                        selected ? "border-primary bg-primary" : "border-border"
                                      }`}>
                                        {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Small Business: Super Admin Profile */}
            {userType === 'small-business' && step === 1 && (
              <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="font-display text-2xl font-bold mb-2">Create Super Admin Profile</h2>
                <p className="text-sm text-muted-foreground mb-8">This will be the primary account for your business.</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                    <Input 
                      placeholder="e.g. John Doe" 
                      value={adminData.name} 
                      onChange={e => setAdminData({...adminData, name: e.target.value})}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Email</label>
                    <Input 
                      placeholder="e.g. john@acme.com" 
                      type="email"
                      value={adminData.email} 
                      onChange={e => setAdminData({...adminData, email: e.target.value})}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <UserCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">Super Admin Privileges</p>
                      <p className="text-[10px] text-muted-foreground mt-1">You will have full control over tools, staff onboarding, and workspace surveillance.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Large Business: HR Dashboard Setup */}
            {userType === 'large-business' && step === 1 && (
              <motion.div key="large-hr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2 mb-8">
                  <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase">Multi-Department Setup</h2>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-70">Pre-configuring your enterprise workspace</p>
                </div>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                  {Object.values(DEPARTMENTS).map((d) => (
                    <div key={d.id} className="p-5 bg-card border-2 border-border rounded-2xl space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Check className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-black uppercase tracking-tight text-sm">{d.label} Department</h4>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">{d.tools.length} Tools included</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                        {d.tools.map(tool => {
                          const ToolIcon = tool.icon;
                          return (
                            <div key={tool.id} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-secondary/50 p-2 rounded-lg">
                              <ToolIcon className="w-3 h-3 text-primary/70" /> {tool.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                    "Directors and Managers will have automatic surveillance and team formation access across all selected modules."
                  </p>
                </div>
              </motion.div>
            )}

            {/* Enterprise: Contact Sales */}
            {userType === 'enterprise' && step === 1 && (
              <motion.div key="enterprise" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="font-display text-2xl font-bold mb-2">Contact Enterprise Sales</h2>
                <p className="text-sm text-muted-foreground mb-8">Tell us about your organization and we'll reach out.</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Name</label>
                    <Input 
                      placeholder="e.g. Acme Corporation" 
                      value={enterpriseData.company}
                      onChange={e => setEnterpriseData({...enterpriseData, company: e.target.value})}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Work Email</label>
                    <Input 
                      placeholder="e.g. admin@acme.com" 
                      type="email"
                      value={enterpriseData.email}
                      onChange={e => setEnterpriseData({...enterpriseData, email: e.target.value})}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brief Description</label>
                    <Textarea 
                      placeholder="What are your needs?" 
                      className="min-h-[100px] rounded-xl"
                      value={enterpriseData.desc}
                      onChange={e => setEnterpriseData({...enterpriseData, desc: e.target.value})}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : (
              <div />
            )}
            {step < (stepsList.length - 1) ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={!canProceed()} className="shadow-glow bg-primary text-primary-foreground">
                {userType === 'enterprise' ? 'Send Request' : 'Launch Workspace'} <Sparkles className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
