import { motion } from "framer-motion";
import { Inbox, Archive, CheckCircle2, MessageSquare, Bell, Filter, Search, MoreHorizontal, ExternalLink, Trash2, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIndustryStore } from "@/lib/industry-store";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const InboxPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { notifications = [], markNotificationRead, deleteNotification, seedNotifications, resetStore } = useIndustryStore();
  const [activeTab, setActiveTab] = useState("All");

  // Scroll to top on tab change
  useEffect(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleNotificationClick = (n: any) => {
    markNotificationRead(n.id);
    if (n.actionUrl) {
      navigate(n.actionUrl);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    switch (activeTab) {
      case "Unread":
        return !n.read;
      case "Mentions":
        return n.type === "mention";
      case "Assigned to me":
        return n.type === "task";
      default:
        return true;
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">Inbox</h2>
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-60">Stay updated with task mentions and project changes.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="h-10 rounded-xl font-black uppercase text-[10px] tracking-widest border-destructive/20 text-destructive hover:bg-destructive/10" onClick={resetStore}>
            Reset All Data
          </Button>
          {notifications.length === 0 && (
            <Button variant="outline" size="sm" className="h-10 rounded-xl font-black uppercase text-[10px] tracking-widest" onClick={seedNotifications}>
              Seed Test Data
            </Button>
          )}
          <Button size="sm" className="flex-1 sm:flex-none h-10 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-glow" onClick={() => {
            notifications.forEach(n => markNotificationRead(n.id));
            toast({ title: "Inbox Cleared", description: "All notifications marked as read." });
          }}>
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark All Read
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {["All", "Unread", "Mentions", "Assigned to me"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
              activeTab === tab 
                ? "bg-primary border-primary text-primary-foreground shadow-glow" 
                : "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="divide-y divide-border/50 bg-card/50 rounded-[2rem] border-2 border-border shadow-sm overflow-hidden">
        {filteredNotifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`group relative px-6 py-6 flex flex-col sm:flex-row items-start gap-6 transition-all hover:bg-muted/50 cursor-pointer ${
              !notif.read ? "bg-primary/[0.02]" : ""
            }`}
            onClick={() => handleNotificationClick(notif)}
          >
            <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-transform group-hover:scale-105 ${
                notif.type === 'share' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                notif.type === 'form' ? "bg-purple-500/10 border-purple-500/20 text-purple-500" :
                notif.type === 'mention' ? "bg-primary/10 border-primary/20 text-primary" :
                "bg-primary/10 border-primary/20 text-primary"
              }`}>
                {notif.type === 'share' ? <ExternalLink className="w-6 h-6" /> :
                 notif.type === 'form' ? <Users className="w-6 h-6" /> :
                 notif.type === 'mention' ? <MessageSquare className="w-6 h-6" /> :
                 <Bell className="w-6 h-6" />}
              </div>
              <div className="sm:hidden flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 tabular-nums">
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  !notif.read ? "text-primary" : "text-muted-foreground/60"
                )}>
                  {notif.source}
                </span>
                <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 tabular-nums">
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className={cn(
                "text-base tracking-tight uppercase leading-snug mb-2",
                !notif.read ? "font-black text-foreground" : "font-bold text-muted-foreground/80"
              )}>
                {notif.title}
              </h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                {notif.message}
              </p>
              {!notif.read && (
                <div className="mt-4 flex items-center gap-1.5 text-primary">
                  <span className="text-[10px] font-black uppercase tracking-widest">Click to open</span>
                  <ArrowRight className="w-3 h-3 animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary border-2 border-transparent hover:border-primary/20">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-2 p-2 shadow-2xl">
                  {!notif.read && (
                    <DropdownMenuItem 
                      onClick={() => markNotificationRead(notif.id)}
                      className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-3 h-11"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Mark as read
                    </DropdownMenuItem>
                  )}
                  {notif.actionUrl && (
                    <DropdownMenuItem 
                      onClick={() => handleNotificationClick(notif)}
                      className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-3 h-11"
                    >
                      <ExternalLink className="h-4 w-4 text-primary" /> Open Source
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem 
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-3 h-11 text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => deleteNotification(notif.id)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete Alert
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        {filteredNotifications.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center text-muted-foreground/30">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Inbox is empty</p>
              <p className="text-xs font-bold text-muted-foreground/60 uppercase mt-1">You're all caught up!</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InboxPage;
