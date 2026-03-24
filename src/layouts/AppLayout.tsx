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

  return (    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden font-sans antialiased">
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
          
          {!hydrated && (
            <div className="absolute inset-0 z-50 bg-background flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary animate-pulse flex items-center justify-center">
                  <span className="text-primary-foreground font-black">C</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rebuilding Workspace...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
