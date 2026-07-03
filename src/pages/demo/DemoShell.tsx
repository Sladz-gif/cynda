import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Receipt, Kanban, FileText, Bot, ArrowLeft, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { EarlyAccessModal } from "@/components/demo/EarlyAccessModal";
import { ExitDemoModal } from "@/components/demo/ExitDemoModal";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

const DEMO_NAV_ITEMS = [
  { id: "dashboard", title: "Dashboard", url: "/demo/dashboard", icon: LayoutDashboard },
  { id: "crm", title: "CRM", url: "/demo/crm", icon: Users },
  { id: "finance", title: "Finance", url: "/demo/finance", icon: Receipt },
  { id: "hr", title: "HR", url: "/demo/hr", icon: Users },
  { id: "projects", title: "Projects", url: "/demo/projects", icon: Kanban },
  { id: "notes", title: "Notes & Files", url: "/demo/notes", icon: FileText },
  { id: "ai", title: "Cynda AI", url: "/demo/ai", icon: Bot },
];

const DemoShellContent = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar, isMobile } = useSidebar();

  // Intercept browser back button
  useEffect(() => {
    const handleBeforeUnload = (e: PopStateEvent) => {
      if (location.pathname.startsWith("/demo")) {
        e.preventDefault();
        setExitOpen(true);
      }
    };
    window.addEventListener("popstate", handleBeforeUnload);
    return () => window.removeEventListener("popstate", handleBeforeUnload);
  }, [location.pathname]);

  const handleExit = () => {
    setExitOpen(false);
    navigate("/");
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans antialiased">
      {/* Modals */}
      <EarlyAccessModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
      />
      <ExitDemoModal
        isOpen={exitOpen}
        onClose={() => setExitOpen(false)}
        onLeave={handleExit}
        onJoinWaitlist={() => setWaitlistOpen(true)}
      />

      {/* Sidebar */}
      <Sidebar collapsible="icon" className="border-r-0 shadow-xl">
        <SidebarHeader className="p-6 flex items-center gap-3">
          <Link
            to="/demo/dashboard"
            className="flex items-center gap-3 group/logo"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-glow group-hover:scale-110 transition-transform">
              <span className="text-primary-foreground font-black text-lg">C</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tighter uppercase leading-none">Cynda</span>
              <span className="text-[8px] font-bold text-primary tracking-[0.3em] uppercase opacity-80">Work OS</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <div className="px-3 py-4">
            <SidebarGroup className="p-0">
              <SidebarGroupContent>
                <SidebarMenu>
                  {DEMO_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className="flex items-center gap-3 px-3 py-6 rounded-xl transition-all h-12 mb-1"
                        >
                          <Link to={item.url}>
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-[11px] font-black uppercase tracking-widest">
                              {item.title}
                            </span>
                            {isActive && (
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
          </div>
        </SidebarContent>
      </Sidebar>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Demo Banner */}
        <DemoBanner onWaitlistClick={() => setWaitlistOpen(true)} />

        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-lg md:text-xl font-black tracking-tight">
              {DEMO_NAV_ITEMS.find((i) => i.url === location.pathname)?.title || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button onClick={() => setWaitlistOpen(true)} className="font-black uppercase tracking-widest text-xs md:text-sm">
              Join Waitlist
            </Button>
            <Button
              variant="secondary"
              onClick={() => setWaitlistOpen(true)}
              className="font-black uppercase tracking-widest text-rose-500 bg-rose-50 hover:bg-rose-100 text-xs md:text-sm"
            >
              <Heart className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Support Cynda</span>
            </Button>
            <Button variant="ghost" onClick={() => setExitOpen(true)} className="font-black uppercase tracking-widest text-xs md:text-sm">
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Exit Demo</span>
            </Button>
          </div>
        </div>

        {/* Page content with animation */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export const DemoShell = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <DemoShellContent />
    </SidebarProvider>
  );
};
