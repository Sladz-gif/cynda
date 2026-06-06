import { Outlet, useLocation, Navigate, Link } from "react-router-dom";
import AppSidebar from "@/components/app/AppSidebar";
import AppTopBar from "@/components/app/AppTopBar";
import CyndiPanel from "@/components/app/CyndiPanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useRef, useEffect, useMemo } from "react";
import { useIndustryStore, DEPARTMENTS, Staff, Notification, DEFAULT_SELECTED_MODULES } from "@/lib/industry-store";
import { cn } from '@/lib/utils';
import ForbiddenPage from "@/pages/app/ForbiddenPage";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, X, Bot, Zap, ShieldCheck, Trophy, Users2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/app/ErrorBoundary";
import KeyboardShortcutsPanel from "@/components/app/KeyboardShortcutsPanel";

const TrialEndedOverlay = () => (
  <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-xl flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl w-full bg-card border-2 border-primary/30 rounded-[2.5rem] p-8 md:p-12 shadow-glow text-center space-y-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="w-20 h-20 rounded-3xl bg-primary mx-auto flex items-center justify-center shadow-glow animate-bounce">
        <Rocket className="w-10 h-10 text-white" />
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">The Trial has Ended</h2>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Your workspace is paused, but your data is safe.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-left">
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <ShieldCheck className="w-5 h-5 text-primary mb-2" />
          <p className="text-[10px] font-black uppercase tracking-tight">Full Security</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <Zap className="w-5 h-5 text-primary mb-2" />
          <p className="text-[10px] font-black uppercase tracking-tight">Automations</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <Trophy className="w-5 h-5 text-primary mb-2" />
          <p className="text-[10px] font-black uppercase tracking-tight">Performance</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <Users2 className="w-5 h-5 text-primary mb-2" />
          <p className="text-[10px] font-black uppercase tracking-tight">Team Seats</p>
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <Button size="lg" className="h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-glow w-full" asChild>
          <Link to="/billing/select-plan">Choose Your Plan & Continue</Link>
        </Button>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Questions? <Link to="/support" className="text-primary hover:underline">Talk to our team</Link>
        </p>
      </div>
    </motion.div>
  </div>
);

const AppLayout = () => {
  const { toast } = useToast();
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { 
    userType = 'solo', 
    selectedModules = [], 
    currentUser, 
    adminProfile,
    isAuthenticated,
    isOnboarded,
    trialStartedAt,
    notifications = [],
    cyndiOpen,
    setCyndiOpen,
    seedNotifications
  } = useIndustryStore();

  // One-time seed for notifications if empty
  useEffect(() => {
    if (isAuthenticated && notifications.length === 0) {
      seedNotifications();
    }
  }, [isAuthenticated, notifications.length, seedNotifications]);

  const unreadCyndiMessages = useMemo(() => {
    if (!notifications || !Array.isArray(notifications)) return 0;
    return notifications.filter(n => n.source === 'Cyndi' && !n.read).length;
  }, [notifications]);

  // Reminder Checker
  useEffect(() => {
    if (typeof notifications === 'undefined' || !Array.isArray(notifications)) return;
    
    const interval = setInterval(() => {
      try {
        const now = new Date();
        notifications.forEach(n => {
          if (n && !n.read && n.source === 'Cyndi' && n.timestamp && new Date(n.timestamp) <= now) {
            toast({
              title: "Cyndi Reminder",
              description: n.message,
              duration: 5000,
            });
            useIndustryStore.getState().markNotificationRead(n.id);
          }
        });
      } catch (e) {
        console.error("Reminder check failed:", e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [notifications, toast]);

  const activeUser = currentUser || adminProfile;
  const isAdmin = activeUser?.role === 'Super Admin' || activeUser?.role === 'Director' || userType === 'solo';
  const isSuperAdmin = activeUser?.role === 'Super Admin';
  const isStaff = !!(currentUser && 'tools' in currentUser);
  const isTrial = useIndustryStore(s => s.subscriptionTier === 'trial');
  const needsPasswordReset = useIndustryStore(s => s.needsPasswordReset);

  const trialDaysRemaining = useMemo(() => {
    if (!isTrial || !trialStartedAt) return 3;
    const start = new Date(trialStartedAt).getTime();
    const now = new Date().getTime();
    const elapsed = now - start;
    const remainingMs = (3 * 24 * 60 * 60 * 1000) - elapsed;
    return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  }, [isTrial, trialStartedAt]);

  const isTrialExpired = isTrial && trialDaysRemaining <= 0;

  const effectiveTools = useMemo(() => {
    if (isStaff) {
      return Array.isArray((currentUser as Staff).tools) ? (currentUser as Staff).tools : [];
    }
    // Ensure selectedModules is always an array, fallback to DEFAULT_SELECTED_MODULES if empty
    const modules = Array.isArray(selectedModules) ? selectedModules : [];
    return modules.length > 0 ? modules : DEFAULT_SELECTED_MODULES;
  }, [isStaff, currentUser, selectedModules]);

  // Route Protection Logic
  const hasAccess = useMemo(() => {
    const path = location.pathname.split("/app/")[1] || "dashboard";
    const segment = path.split("/")[0] || "dashboard";

    // 1. Core Routes (Always accessible for all users)
    const coreRoutes = ["dashboard", "inbox", "settings", "profile", "email", "performance", "marketplace"];
    if (coreRoutes.includes(segment)) return true;

    // 2. Department Routes
    // Check if the segment matches a department ID and user has at least one tool in it
    const dept = Object.values(DEPARTMENTS).find(d => d.id === segment);
    if (dept) {
      return dept.tools.some(tool => effectiveTools.includes(tool.id));
    }

    // 3. Individual Tool Routes (from 'Other' or direct)
    // Check if the segment is a tool ID the user has access to
    const allTools = Object.values(DEPARTMENTS).flatMap(d => d.tools);
    const tool = allTools.find(t => t.id === segment);
    if (tool) {
      return effectiveTools.includes(tool.id);
    }

    // 4. Admin Only Routes
    const adminRoutes = ["hr/onboarding", "crm/import-history"];
    if (adminRoutes.includes(path) && !isAdmin) return false;

    // Special cases for renamed routes or aliases
    if (
      (segment === "file-management" || segment === "files") &&
      effectiveTools.includes("file-management")
    )
      return true;
    if (segment === "chat" && effectiveTools.includes("chat")) return true;
    if (segment === "notes" && effectiveTools.includes("notes")) return true;
    if (segment === "automation" && effectiveTools.includes("automation")) return true;
    if (segment === "forms" && effectiveTools.includes("forms")) return true;
    if (segment === "my-tasks" && effectiveTools.includes("tasks")) return true;

    if (segment === "surveillance") {
      return isAdmin && userType !== "solo";
    }

    if (segment === "super-admin") {
      return isSuperAdmin;
    }

    return false;
  }, [location.pathname, effectiveTools, isAdmin, isSuperAdmin, userType]);

  // Scroll to top on route change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (needsPasswordReset) {
    return <Navigate to="/force-password-reset" replace />;
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  const getPageTitle = () => {
    try {
      const path = location.pathname.split("/app/")[1] || "dashboard";
      const segment = path.split("/")[0] || "dashboard";
      
      // If no access, title should be Access Denied
      if (!hasAccess) return "Access Denied";

      if (segment === "messages") return "Chat";
      return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    } catch (e) {
      return "Workspace";
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden font-sans antialiased selection:bg-primary/20 relative">
        {isTrialExpired && <TrialEndedOverlay />}
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <AppTopBar
            title={getPageTitle()}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <AnimatePresence>
              {isTrial && showTrialBanner && isAdmin && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-primary border-b border-primary/20 overflow-hidden shadow-glow-sm"
                >
                  <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none mb-0.5">
                          Trial Edition: <span className="opacity-80">{trialDaysRemaining} days remaining</span>
                        </p>
                        <p className="text-[9px] font-bold text-white/70 uppercase tracking-tighter leading-none">
                          Upgrade now to unlock <span className="text-white">Full Automation</span> and <span className="text-white">Surveillance</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Link to="/billing/select-plan">
                        <Button size="sm" className="h-8 px-4 rounded-xl bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest text-[9px] shadow-sm">
                          Unlock Full Power
                        </Button>
                      </Link>
                      <button onClick={() => setShowTrialBanner(false)} className="text-white/60 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 flex overflow-hidden relative min-h-0">
              <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-6" ref={scrollAreaRef}>
                <ErrorBoundary boundaryName="Page Router">
                  {hasAccess ? <Outlet /> : <ForbiddenPage />}
                </ErrorBoundary>
              </main>

              <AnimatePresence>
                {cyndiOpen && hasAccess && (
                  <motion.div
                    key="cyndi-overlay"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed inset-y-0 right-0 z-[100] w-full sm:w-[400px] md:w-[450px] lg:w-[500px] flex min-h-0 flex-col bg-card shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)] border-l border-border"
                  >
                    <CyndiPanel onClose={() => setCyndiOpen(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <KeyboardShortcutsPanel />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;


