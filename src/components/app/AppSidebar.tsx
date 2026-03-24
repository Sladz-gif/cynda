import { 
  LayoutDashboard, Inbox, Users, Receipt, Kanban, CheckCircle, 
  UserCheck, MessageSquare, FileText, Zap, ClipboardList, BarChart3, Building2,
  ChevronLeft, ChevronRight, LogOut, Settings, HelpCircle, Search, Plus
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useIndustryStore, USER_TYPES, DEPARTMENTS } from "@/lib/industry-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";
import { useSidebar } from "@/components/ui/sidebar";

const toolToIcon: Record<string, any> = {
  crm: Users,
  finance: Receipt,
  projects: Kanban,
  tasks: CheckCircle,
  hr: UserCheck,
  chat: MessageSquare,
  notes: FileText,
  automation: Zap,
  forms: ClipboardList,
  analytics: BarChart3,
  inbox: Inbox,
  dashboard: LayoutDashboard
};

const AppSidebar = () => {
  const location = useLocation();
  const { userType = 'solo', selectedModules = [], adminProfile } = useIndustryStore();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const menuItems = useMemo(() => {
    const items = [
      { id: "dashboard", title: "Overview", url: "/app/dashboard", icon: LayoutDashboard },
      { id: "inbox", title: "Inbox", url: "/app/inbox", icon: Inbox },
    ];

    // Group selected tools by department
    Object.values(DEPARTMENTS).forEach(dept => {
      const selectedInDept = dept.tools.filter(t => Array.isArray(selectedModules) && selectedModules.includes(t.id));
      
      if (selectedInDept.length > 0 || userType === 'enterprise' || userType === 'large-business') {
        // Use the department's first tool's icon as a representative, or a default
        const deptIcon = toolToIcon[dept.id] || FileText;
        
        items.push({
          id: dept.id,
          title: dept.label,
          url: `/app/${dept.id}`,
          icon: deptIcon
        });
      }
    });

    return items;
  }, [selectedModules, userType]);

  return (
    <div className={cn(
      "h-full bg-card border-r border-border flex flex-col transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-glow">
          <span className="text-primary-foreground font-black">C</span>
        </div>
        {!collapsed && <span className="font-display font-black text-xl tracking-tighter uppercase">Cynda</span>}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-6 mb-8">
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{adminProfile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-black truncate">{adminProfile?.name || "Guest User"}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{userType}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.id}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-glow-sm" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "animate-pulse-slow" : "group-hover:scale-110 transition-transform")} />
                {!collapsed && (
                  <span className="text-xs font-black uppercase tracking-widest">{item.title}</span>
                )}
                {isActive && !collapsed && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                )}
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-xs font-black uppercase tracking-widest">Exit App</span>}
        </Link>
      </div>
    </div>
  );
};

export default AppSidebar;