import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { Hash, Send, Paperclip, Smile, Search, Plus, Bot, Pin, Reply, MoreHorizontal, Mic, AtSign, X, ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const channels: { name: string; unread: number; pinned: boolean }[] = [];

const directMessages: { name: string; status: string; avatar: string; lastMsg: string }[] = [];

type Message = {
  id: string;
  user: string;
  avatar: string;
  time: string;
  content: string;
  reactions?: string[];
  pinned?: boolean;
  thread?: { count: number; avatars: string[] };
  file?: { name: string; size: string };
};

const messages: Message[] = [];

const statusColor: Record<string, string> = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  offline: "bg-muted-foreground/30",
};

const MessagesPage = () => {
  const isMobile = useIsMobile();
  const [activeChannel, setActiveChannel] = useState("general");
  const [input, setInput] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [threadOpen, setThreadOpen] = useState<string | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
    else setIsSidebarOpen(true);
  }, [isMobile]);

  const handleSend = () => {
    if (!input.trim()) return;
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-6 border-t border-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-border bg-card/90 shrink-0 flex-wrap">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">Chat</span>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="rounded-xl gap-2 h-9 text-[10px] font-black uppercase tracking-widest shadow-glow"
        >
          <MessageSquare className="w-4 h-4" /> Chat
        </Button>
        <Badge variant="outline" className="ml-auto text-[8px] font-black uppercase tracking-widest border-primary/30">
          v1.2 preview
        </Badge>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
      {/* Channel sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={isMobile ? { x: -280 } : { width: 0 }}
            animate={isMobile ? { x: 0 } : { width: 256 }}
            exit={isMobile ? { x: -280 } : { width: 0 }}
            className={cn(
              "border-r border-border flex flex-col bg-card z-30",
              isMobile ? "absolute inset-y-0 left-0 w-[280px] shadow-2xl" : "relative"
            )}
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center gap-2 flex-1 h-8 px-2 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:border-primary/30 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search chat</span>
              </button>
              {isMobile && (
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {/* Channels */}
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Channels</span>
                <button className="text-muted-foreground hover:text-foreground transition-colors"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              {channels.map((ch) => (
                <button
                  key={ch.name}
                  onClick={() => {
                    setActiveChannel(ch.name);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    activeChannel === ch.name ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="flex-1 text-left truncate">{ch.name}</span>
                  {ch.pinned && <Pin className="w-2.5 h-2.5 text-muted-foreground/50" />}
                  {ch.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                      {ch.unread}
                    </span>
                  )}
                </button>
              ))}

              {/* DMs */}
              <div className="flex items-center justify-between px-2 py-1.5 mt-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Direct Messages</span>
                <button className="text-muted-foreground hover:text-foreground transition-colors"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              {directMessages.map((dm) => (
                <button
                  key={dm.name}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-accent-foreground">
                      {dm.avatar}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${statusColor[dm.status]}`} />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <span className="text-sm block truncate">{dm.name}</span>
                    <span className="text-[10px] text-muted-foreground/60 block truncate">{dm.lastMsg}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
        />
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel header */}
        <div className="h-12 px-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={() => setIsSidebarOpen(true)}>
                <MessageSquare className="w-4 h-4" />
              </Button>
            )}
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="font-display font-semibold text-sm">#{activeChannel}</span>
            <span className="hidden sm:inline text-xs text-muted-foreground">24 members</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Pin className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <AtSign className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Pinned message banner */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 mb-4">
            <Pin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <p className="text-xs text-foreground truncate flex-1">
              <span className="font-semibold">Sarah Chen</span>: The new brand guidelines are ready for review.
            </p>
            <button className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMsg(msg.id)}
              onMouseLeave={() => setHoveredMsg(null)}
              className="flex gap-3 group px-2 py-2 rounded-lg hover:bg-secondary/30 transition-colors relative"
            >
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground flex-shrink-0 mt-0.5">
                {msg.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{msg.user}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                  {msg.pinned && <Pin className="w-2.5 h-2.5 text-primary" />}
                </div>
                <p className="text-sm text-foreground/90 mt-0.5 leading-relaxed">{msg.content}</p>

                {/* File attachment */}
                {msg.file && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary/50 cursor-pointer transition-colors">
                    <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{msg.file.name}</span>
                    <span className="text-[10px] text-muted-foreground">{msg.file.size}</span>
                  </div>
                )}

                {/* Reactions */}
                {msg.reactions && (
                  <div className="flex gap-1.5 mt-2">
                    {msg.reactions.map((r) => (
                      <button key={r} className="text-xs px-2 py-0.5 rounded-full border border-border bg-card cursor-pointer hover:bg-secondary transition-colors">
                        {r}
                      </button>
                    ))}
                    <button className="text-xs px-2 py-0.5 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary/30 transition-colors">+</button>
                  </div>
                )}

                {/* Thread indicator */}
                {msg.thread && (
                  <button
                    onClick={() => setThreadOpen(msg.id)}
                    className="mt-2 flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <div className="flex -space-x-1.5">
                      {msg.thread.avatars.map((a) => (
                        <div key={a} className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-[7px] font-semibold text-accent-foreground border border-background">
                          {a}
                        </div>
                      ))}
                    </div>
                    <span>{msg.thread.count} replies</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Hover actions */}
              <AnimatePresence>
                {hoveredMsg === msg.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-1 right-2 flex items-center gap-0.5 bg-card border border-border rounded-lg shadow-sm px-1 py-0.5"
                  >
                    <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setThreadOpen(msg.id)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:border-primary/30 transition-colors">
            <button className="text-muted-foreground hover:text-foreground transition-colors"><Paperclip className="w-4 h-4" /></button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Message #${activeChannel}`}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button className="text-muted-foreground hover:text-primary transition-colors"><Bot className="w-4 h-4" /></button>
            <button className="text-muted-foreground hover:text-foreground transition-colors"><AtSign className="w-4 h-4" /></button>
            <button className="text-muted-foreground hover:text-foreground transition-colors"><Smile className="w-4 h-4" /></button>
            <button className="text-muted-foreground hover:text-foreground transition-colors"><Mic className="w-4 h-4" /></button>
            <Button size="icon" className="h-7 w-7 rounded-lg" onClick={handleSend}><Send className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </div>

      {/* Thread panel */}
      <AnimatePresence>
        {threadOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l border-border bg-card flex flex-col overflow-hidden flex-shrink-0"
          >
            <div className="h-12 px-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <span className="font-display font-semibold text-sm">Thread</span>
              <button onClick={() => setThreadOpen(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Original message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground">SC</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Sarah Chen</span>
                    <span className="text-[10px] text-muted-foreground">10:23 AM</span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5">The new brand guidelines are ready for review.</p>
                </div>
              </div>
              <div className="border-t border-border" />
              {/* Thread replies */}
              {[
                { user: "Mike Johnson", avatar: "MJ", time: "10:30 AM", content: "Looks great! The typography choices are solid." },
                { user: "Emily Davis", avatar: "ED", time: "10:34 AM", content: "Agreed. The spacing system is very clean." },
              ].map((reply, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-accent-foreground">{reply.avatar}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{reply.user}</span>
                      <span className="text-[10px] text-muted-foreground">{reply.time}</span>
                    </div>
                    <p className="text-xs text-foreground/90 mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5">
                <input placeholder="Reply in thread..." className="flex-1 bg-transparent text-xs focus:outline-none" />
                <Button size="icon" className="h-6 w-6 rounded"><Send className="w-3 h-3" /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};

export default MessagesPage;
