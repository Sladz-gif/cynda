import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Bell, Sparkles, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import CyndiCommandBar from "@/components/app/CyndiCommandBar";

interface AppTopBarProps {
  title: string;
  onCyndiToggle: () => void;
  cyndiOpen: boolean;
}

const notifications = [
  { id: "1", type: "mention", title: "Sarah mentioned you in #design", detail: "Take a look at the new onboarding wireframes.", time: "5 min ago", read: false },
  { id: "2", type: "update", title: "Project update: Q2 Campaign", detail: "Campaign was moved from 'Todo' to 'In Progress'.", time: "1 hr ago", read: false },
  { id: "3", type: "task", title: "New task assigned: Client brief", detail: "Write the brief for the upcoming Acme Corp project.", time: "3 hrs ago", read: true },
  { id: "4", type: "comment", title: "New comment on 'Logo Refresh'", detail: "Alex: I think we should try a more vibrant orange.", time: "Yesterday", read: true },
];

const AppTopBar = ({ title, onCyndiToggle, cyndiOpen }: AppTopBarProps) => {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border hidden md:block" />
          <h1 className="font-display text-sm md:text-lg font-bold text-foreground truncate uppercase tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Search / Command Bar */}
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:border-primary/30 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search or ask Cyndi...</span>
            <kbd className="ml-4 text-[10px] px-1.5 py-0.5 rounded bg-secondary font-mono">⌘K</kbd>
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-8 w-8"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="p-3 border-b border-border">
                <h3 className="font-medium text-sm">Notifications</h3>
              </div>
              <div className="divide-y divide-border">
                {notifications.slice(0, 3).map((notif) => (
                  <div key={notif.id} className={`p-3 flex gap-3 transition-colors ${notif.read ? "bg-card" : "bg-primary/5"}`}>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${notif.read ? "font-medium text-foreground" : "font-bold text-foreground"}`}>{notif.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed truncate">{notif.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border">
                <Button size="sm" className="w-full" asChild>
                  <a href="/app/inbox">View all</a>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Cyndi toggle */}
          <Button
            variant={cyndiOpen ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={onCyndiToggle}
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <CyndiCommandBar open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
};

export default AppTopBar;
