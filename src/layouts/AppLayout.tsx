import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/app/AppSidebar";
import AppTopBar from "@/components/app/AppTopBar";
import CyndiPanel from "@/components/app/CyndiPanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useRef, useEffect } from "react";
import { useHydration } from "@/hooks/use-hydration";
import { useIndustryStore } from "@/lib/industry-store";

const AppLayout = () => {
  const [cyndiOpen, setCyndiOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { userType = 'solo' } = useIndustryStore();
  const hydrated = useHydration();

  // Scroll to top on route change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const getPageTitle = () => {
    try {
      const path = location.pathname.split("/app/")[1] || "dashboard";
      const segment = path.split("/")[0] || "dashboard";
      return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    } catch (e) {
      return "Workspace";
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full bg-background selection:bg-primary/20">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center relative z-10 shadow-glow">
              <span className="text-primary-foreground font-black text-2xl tracking-tighter">C</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground opacity-80">Loading Workspace</p>
            <div className="flex gap-1.5">
              <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1 h-1 rounded-full bg-primary animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden font-sans antialiased selection:bg-primary/20">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <AppTopBar
            title={getPageTitle()}
            onCyndiToggle={() => setCyndiOpen(!cyndiOpen)}
            cyndiOpen={cyndiOpen}
          />
          
          <div className="flex-1 flex overflow-hidden relative">
            <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6" ref={scrollAreaRef}>
              <Outlet />
            </main>
            
            {cyndiOpen && (
              <aside className="w-80 border-l border-border bg-card hidden md:block h-full">
                <CyndiPanel onClose={() => setCyndiOpen(false)} />
              </aside>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
