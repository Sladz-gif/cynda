import type { ComponentType } from "react";
import { 
  LayoutDashboard, Inbox, Users, Receipt, Kanban, CheckCircle, 
  UserCheck, MessageSquare, FileText, Zap, ClipboardList, BarChart3, Building2,
  ChevronLeft, ChevronRight, LogOut, Settings, HelpCircle, Search, Plus, Shield, User, UserPlus,
  HardDrive, LayoutGrid, Activity, ShieldCheck, CreditCard, Users2, Clock, Globe,
  Trophy, Store, Mail
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useIndustryStore, DEPARTMENTS, Staff, TRIAL_ALLOWED_TOOLS } from "@/lib/industry-store";
import { TOOL_METADATA, getToolIcon } from "@/lib/tool-metadata";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Lock } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppSidebar = () => {
  const location = useLocation();
  const { 
    userType = 'solo', 
    selectedModules = [], 
    adminProfile, 
    currentUser, 
    setCurrentUser,
    staffList = [],
    logout,
    subscriptionTier,
    trialStartedAt,
    cyndiOpen,
    setCyndiOpen
  } = useIndustryStore();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  const activeUser = currentUser || adminProfile;
  const isAdmin = activeUser?.role === 'Super Admin' || activeUser?.role === 'Director' || userType === 'solo';
  const isStaff = !!(currentUser && 'tools' in currentUser);
  const isTrial = subscriptionTier === 'trial';

  // Helper to close sidebar on mobile after navigation
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const trialDaysRemaining = useMemo(() => {
    if (!isTrial || !trialStartedAt) return 3;
    const start = new Date(trialStartedAt).getTime();
    const now = new Date().getTime();
    const elapsed = now - start;
    const remainingMs = (3 * 24 * 60 * 60 * 1000) - elapsed;
    return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  }, [isTrial, trialStartedAt]);

  const effectiveTools = useMemo(() => {
    return isStaff 
      ? (Array.isArray((currentUser as Staff).tools) ? (currentUser as Staff).tools : [])
      : (Array.isArray(selectedModules) ? selectedModules : []);
  }, [isStaff, currentUser, selectedModules]);

  const menuGroups = useMemo(() => {
    const groups: { 
      id: string; 
      label: string; 
      items: { 
        id: string; 
        title: string; 
        url: string; 
        icon: ComponentType<{ className?: string }>;
        isPremium?: boolean;
      }[] 
    }[] = [];
    
    // 1. PRIMARY Group
    const primaryItems = [];
    if (effectiveTools.length > 0) {
      primaryItems.push({ id: "dashboard", title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard });
    }
    
    // Add Departments to PRIMARY
    Object.values(DEPARTMENTS).forEach(dept => {
      const hasAccessToDept = dept.tools.some(tool => effectiveTools.includes(tool.id));
      if (hasAccessToDept && ['projects', 'crm', 'finance', 'hr'].includes(dept.id)) {
        const isPremium = isTrial && !dept.tools.some(tool => TRIAL_ALLOWED_TOOLS.includes(tool.id));
        
        primaryItems.push({
          id: dept.id,
          title: dept.label,
          url: isPremium ? "/app/settings?tab=billing" : `/app/${dept.id}`,
          icon: getToolIcon(dept.id) || Building2,
          isPremium
        });
      }
    });

    if (primaryItems.length > 0) {
      groups.push({ id: 'primary', label: 'Primary', items: primaryItems });
    }

    // 2. SECONDARY Group
    const secondaryItems = [];
    const secondaryToolIds = ['notes', 'inbox', 'file-management', 'forms', 'automation', 'chat'];
    
    secondaryToolIds.forEach(toolId => {
      if (effectiveTools.includes(toolId)) {
        let url = `/app/${toolId}`;
        if (toolId === 'file-management') url = '/app/files';
        
        const isPremium = isTrial && !TRIAL_ALLOWED_TOOLS.includes(toolId);
        if (isPremium) url = "/app/settings?tab=billing";

        secondaryItems.push({
          id: toolId,
          title: TOOL_METADATA[toolId]?.label || toolId,
          url: url,
          icon: getToolIcon(toolId),
          isPremium
        });
      }
    });

    if (secondaryItems.length > 0) {
      groups.push({ id: 'secondary', label: 'Secondary', items: secondaryItems });
    }

    // 3. COMING SOON v1.2
    const v12ToolIds = ['email', 'performance', 'marketplace'];
    const v12Items = [];

    v12ToolIds.forEach(toolId => {
      if (effectiveTools.includes(toolId)) {
        const isPremium = isTrial; // All v1.2 are premium for trial users
        const url = isPremium ? "/app/settings?tab=billing" : `/app/${toolId}`;

        v12Items.push({
          id: `v12-${toolId}`,
          title: TOOL_METADATA[toolId]?.label || toolId,
          url: url,
          icon: getToolIcon(toolId),
          isPremium
        });
      }
    });

    if (v12Items.length > 0) {
      groups.push({ id: "v12", label: "Coming Soon v1.2", items: v12Items });
    }

    // 5. Settings & Administration Group
    const adminItems = [];
    
    if (activeUser?.role === 'Super Admin') {
      adminItems.push({ 
        id: "super-admin", 
        title: "Super Admin", 
        url: "/app/super-admin", 
        icon: Shield,
        isPremium: false
      });
    }

    if (isAdmin && userType !== 'solo') {
      const isPremium = isTrial;
      adminItems.push({ 
        id: "surveillance", 
        title: "Surveillance", 
        url: isPremium ? "/app/settings?tab=billing" : "/app/surveillance", 
        icon: ShieldCheck,
        isPremium
      });
    }
    
    adminItems.push({ id: "settings", title: "Settings", url: "/app/settings", icon: Settings });

    groups.push({
      id: 'admin',
      label: isAdmin ? 'Administration' : 'Preferences',
      items: adminItems
    });

    return groups;
  }, [effectiveTools, isAdmin, userType, isTrial]);

  // If no tools and not admin, we still show the sidebar with Settings now
  return (
    <Sidebar collapsible="icon" className="border-r-0 shadow-xl">
      <SidebarHeader className={cn(
        "p-6 flex items-center gap-3 transition-all",
        collapsed ? "justify-center p-4" : "p-6"
      )}>
        <Link 
          to="/app/dashboard" 
          onClick={handleNavClick}
          className="flex items-center gap-3 group/logo"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-glow group-hover:scale-110 transition-transform">
            <span className="text-primary-foreground font-black text-lg">C</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tighter uppercase leading-none">Cynda</span>
              <span className="text-[8px] font-bold text-primary tracking-[0.3em] uppercase opacity-80">Work OS</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 px-3 group-data-[collapsible=icon]:px-2">
          <div className="space-y-6 py-4">
            {menuGroups.map((group) => (
              <SidebarGroup key={group.id} className="p-0">
                {!collapsed && (
                  <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3 h-auto">
                    {group.label}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.url || (item.id !== 'dashboard' && location.pathname.startsWith(item.url));
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.title}
                            className={cn(
                              "flex items-center gap-3 px-3 py-6 rounded-xl transition-all group relative h-12 mb-1",
                              isActive 
                                ? "bg-primary text-primary-foreground shadow-glow-sm hover:bg-primary/90 hover:text-primary-foreground" 
                                : item.isPremium
                                  ? "text-muted-foreground/40 hover:bg-secondary/20 hover:text-muted-foreground"
                                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                              collapsed && "justify-center px-0"
                            )}
                          >
                            <Link to={item.url} onClick={handleNavClick}>
                              <Icon className={cn(
                                "w-5 h-5 flex-shrink-0", 
                                isActive ? "animate-pulse-slow" : "group-hover:scale-110 transition-transform",
                                item.isPremium && !isActive && "opacity-50"
                              )} />
                              {!collapsed && (
                                <span className={cn(
                                  "text-[11px] font-black uppercase tracking-widest",
                                  item.isPremium && "opacity-50"
                                )}>
                                  {item.title}
                                </span>
                              )}
                              {item.isPremium && !collapsed && (
                                <div className="absolute right-3 flex items-center">
                                  <Lock className="w-3 h-3 text-primary/40 group-hover:text-primary/60 transition-colors" />
                                </div>
                              )}
                              {isActive && !collapsed && (
                                <div className="absolute left-0 w-1 h-6 bg-primary-foreground rounded-r-full" />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className={cn(
        "p-4 border-t border-border/50 space-y-2 bg-sidebar/50 backdrop-blur-sm",
        collapsed && "items-center px-2"
      )}>
        {isTrial && isAdmin && !collapsed && (
          <div className="mx-2 mb-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden group/trial">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/trial:opacity-20 transition-opacity">
              <Shield className="w-12 h-12 text-primary rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Trial Active</span>
              </div>
              <p className="text-lg font-black tracking-tighter mb-1">
                {trialDaysRemaining} <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Days left</span>
              </p>
              <Button asChild size="sm" className="w-full h-8 mt-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-glow">
                <Link to="/app/settings?tab=billing" onClick={handleNavClick}>Upgrade Now</Link>
              </Button>
            </div>
          </div>
        )}
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                logout();
                handleNavClick();
              }}
              tooltip="Sign Out"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-6 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group h-12",
                collapsed && "justify-center px-0"
              )}
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              {!collapsed && <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
