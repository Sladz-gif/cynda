import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Bell, User, Shield, Users, LogOut, Settings, HelpCircle, ChevronDown, Sparkles, MoreHorizontal, Trash2, ExternalLink, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import CyndiCommandBar from "@/components/app/CyndiCommandBar";
import { useIndustryStore, Staff } from "@/lib/industry-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AppTopBarProps {
  title: string;
}

const AppTopBar = ({ title }: AppTopBarProps) => {
  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { 
    userType = 'solo', 
    adminProfile, 
    currentUser, 
    setCurrentUser,
    staffList = [],
    setAuthenticated,
    setCyndiDraft,
    setCyndiOpen,
    notifications = [],
    markNotificationRead,
    deleteNotification,
  } = useIndustryStore();

  const activeUser = currentUser || adminProfile;
  const isStaff = !!(currentUser && 'tools' in currentUser);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    setAuthenticated(false);
    setCurrentUser(null);
  };

  const handleNotificationClick = (n: any) => {
    markNotificationRead(n.id);
    setNotificationsOpen(false);
    if (n.actionUrl) {
      navigate(n.actionUrl);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm flex-shrink-0 z-10">
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

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 gap-1 px-2 sm:px-3 rounded-lg uppercase font-black text-[9px] tracking-widest border border-border/80 bg-secondary/80 hover:bg-secondary"
            onClick={() => {
              setCyndiDraft(
                `I'm in ${title}. Help me with a task in this part of Cynda — suggest steps, draft content, or break the work down.`
              );
              setCyndiOpen(true);
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary sm:mr-0.5" />
            <span className="hidden sm:inline">Ask Cyndi</span>
            <span className="sm:hidden">Cyndi</span>
          </Button>

          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary border-2 border-background" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0 rounded-2xl shadow-2xl border-2 border-border overflow-hidden" align="end">
              <div className="bg-muted/30 p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground">Notifications</h3>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Stay updated with your workspace</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{unreadCount} NEW</span>
                </div>
              </div>
              
              <ScrollArea className="max-h-[420px]">
                <div className="divide-y divide-border/50">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={cn(
                          "group relative transition-all duration-200",
                          !notif.read ? "bg-primary/[0.02]" : "bg-transparent"
                        )}
                      >
                        <div className="flex w-full text-left">
                          <button 
                            className="flex-1 p-4 flex gap-3 hover:bg-muted/50 transition-colors"
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-105",
                              notif.type === 'share' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                              notif.type === 'form' ? "bg-purple-500/10 border-purple-500/20 text-purple-500" :
                              notif.type === 'system' ? "bg-primary/10 border-primary/20 text-primary" :
                              "bg-secondary border-border text-muted-foreground"
                            )}>
                              {notif.type === 'share' ? <ExternalLink className="w-5 h-5" /> :
                               notif.type === 'form' ? <Users className="w-5 h-5" /> :
                               <Bell className="w-5 h-5" />}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  !notif.read ? "text-primary" : "text-muted-foreground"
                                )}>
                                  {notif.source}
                                </span>
                                <span className="text-[9px] font-bold text-muted-foreground/40 tabular-nums">
                                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className={cn(
                                "text-xs leading-snug line-clamp-2",
                                !notif.read ? "font-black text-foreground" : "font-medium text-muted-foreground/80"
                              )}>
                                {notif.title || notif.message}
                              </p>
                              {!notif.read && (
                                <div className="mt-2 flex items-center gap-1 text-primary">
                                  <span className="text-[9px] font-black uppercase tracking-widest">Click to view</span>
                                  <ArrowRight className="w-2.5 h-2.5 animate-pulse" />
                                </div>
                              )}
                            </div>
                          </button>

                          <div className="pr-2 pt-4" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl border-2 p-1.5">
                                {!notif.read && (
                                  <DropdownMenuItem 
                                    onClick={() => markNotificationRead(notif.id)}
                                    className="rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" /> Mark as read
                                  </DropdownMenuItem>
                                )}
                                {notif.actionUrl && (
                                  <DropdownMenuItem 
                                    onClick={() => handleNotificationClick(notif)}
                                    className="rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" /> View Source
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="my-1.5" />
                                <DropdownMenuItem 
                                  className="rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                  onClick={() => deleteNotification(notif.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete Alert
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-1">All Caught Up</h4>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">No new alerts at the moment</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-3 bg-muted/30 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/5 hover:text-primary transition-all" 
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate("/app/inbox");
                  }}
                >
                  Enter Notification Center
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-xl p-0 border-2 border-transparent hover:border-primary/20 transition-all overflow-hidden group bg-primary/10">
                <User className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{activeUser?.name}</p>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                    {activeUser?.chatName || "username.cynda"}
                  </p>
                  <p className="text-[10px] leading-none text-muted-foreground uppercase tracking-widest pt-1">{isStaff ? 'Staff' : 'Admin'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/app/settings" className="cursor-pointer w-full flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CyndiCommandBar open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
};

export default AppTopBar;
