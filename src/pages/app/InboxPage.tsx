import { motion } from "framer-motion";
import { Inbox, Archive, CheckCircle2, MessageSquare, Bell, Filter, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const InboxPage = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([
    { id: "1", type: "mention", title: "Sarah mentioned you in #design", detail: "Take a look at the new onboarding wireframes.", time: "5 min ago", read: false },
    { id: "2", type: "update", title: "Project update: Q2 Campaign", detail: "Campaign was moved from 'Todo' to 'In Progress'.", time: "1 hr ago", read: false },
    { id: "3", type: "task", title: "New task assigned: Client brief", detail: "Write the brief for the upcoming Acme Corp project.", time: "3 hrs ago", read: true },
    { id: "4", type: "comment", title: "New comment on 'Logo Refresh'", detail: "Alex: I think we should try a more vibrant orange.", time: "Yesterday", read: true },
  ]);
  const [activeTab, setActiveTab] = useState("All");

  // Scroll to top on tab change
  useEffect(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleArchive = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({ title: "Notification Archived" });
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    toast({ title: "Marked as Read" });
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({ title: "All Marked as Read" });
  };

  const handleArchiveAll = () => {
    setNotifications([]);
    toast({ title: "All Notifications Archived" });
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
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Inbox</h2>
          <p className="text-sm text-muted-foreground mt-1">Stay updated with task mentions and project changes.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleArchiveAll}><Archive className="w-4 h-4 mr-1.5" /> Archive All</Button>
          <Button size="sm" className="flex-1 sm:flex-none" onClick={handleMarkAllRead}><CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark All Read</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {["All", "Unread", "Mentions", "Assigned to me"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="divide-y divide-border/50 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filteredNotifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start gap-4 transition-all hover:bg-secondary/20 cursor-pointer active:bg-secondary/30 ${
              !notif.read ? "bg-primary/[0.02] border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
            }`}
            onClick={() => handleMarkRead(notif.id)}
          >
            <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                notif.type === 'mention' ? "bg-blue-500/10 text-blue-500" :
                notif.type === 'update' ? "bg-orange-500/10 text-orange-500" :
                notif.type === 'task' ? "bg-green-500/10 text-green-500" :
                "bg-purple-500/10 text-purple-500"
              }`}>
                {notif.type === 'mention' ? <MessageSquare className="w-5 h-5" /> :
                 notif.type === 'update' ? <Bell className="w-5 h-5" /> :
                 notif.type === 'task' ? <CheckCircle2 className="w-5 h-5" /> :
                 <Bell className="w-5 h-5" />}
              </div>
              <div className="sm:hidden flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{notif.time}</p>
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className={`text-sm sm:text-base tracking-tight uppercase ${!notif.read ? "font-black text-foreground" : "font-bold text-muted-foreground"}`}>
                  {notif.title}
                </h3>
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{notif.time}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2">
                {notif.detail}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto sm:self-center shrink-0">
              {!notif.read && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="flex-1 sm:flex-none h-9 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary"
                  onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                >
                  Mark Read
                </Button>
              )}
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => { e.stopPropagation(); handleArchive(notif.id); }}
              >
                <Archive className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
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
