import { X, Bot, Send, User, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useIndustryStore } from "@/lib/industry-store";
import { callCyndi } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface CyndiPanelProps {
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const CyndiPanel = ({ onClose }: CyndiPanelProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hi, I'm Cyndi. I have access to your workspace data and can help you manage projects, deals, and daily operations. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const store = useIndustryStore();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Build context for Cyndi
      const workspaceContext = {
        currentUser: store.currentUser?.name,
        companyName: store.adminProfile?.companyName,
        activeProjects: store.projects.length,
        openTasks: store.tasks.filter(t => t.status !== 'completed').length,
        crmStats: {
          deals: store.crmDeals.length,
          contacts: store.crmContacts.length,
          companies: store.crmCompanies.length
        },
        recentNotifications: store.notifications.slice(0, 3)
      };

      const systemPrompt = `You are Cyndi, a high-performance AI assistant for Cynda, a business operating system. 
      Your tone is professional, concise, and helpful. 
      You have access to the user's workspace context provided in the query.
      Always try to provide actionable insights or offer to perform tasks (like creating projects or updating statuses).`;

      const response = await callCyndi(
        messages.map(m => ({ role: m.role, content: m.content })),
        workspaceContext,
        systemPrompt,
        input
      );

      const aiMessage: Message = {
        role: "assistant",
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Handle potential AI actions if implemented in the future
      if (response.actions && (response.actions as any[]).length > 0) {
        console.log("Cyndi actions triggered:", response.actions);
      }

    } catch (error) {
      console.error("Cyndi chat error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I encountered an issue processing that. Could you try again?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-card overflow-hidden relative">
      {/* Header */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-md shrink-0 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-black text-sm uppercase tracking-tight text-foreground truncate block">
              Cyndi AI
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-xl hover:bg-secondary" 
            onClick={() => setMessages([{ 
              role: "assistant", 
              content: "Chat cleared. How else can I help you?",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])}
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-secondary" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-background to-secondary/10"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                msg.role === "user" ? "bg-secondary" : "bg-primary"
              )}>
                {msg.role === "user" ? <User className="w-4 h-4 text-foreground" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={cn(
                "flex flex-col space-y-1 max-w-[85%]",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                  msg.role === "user" 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-card border border-border rounded-tl-none"
                )}>
                  {msg.content}
                </div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/50 backdrop-blur-md shrink-0">
        <div className="relative group">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Cyndi anything..."
            className="h-12 pl-4 pr-12 rounded-2xl border-2 border-border bg-card text-sm font-bold focus:border-primary transition-all shadow-sm"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-xl shadow-glow disabled:opacity-50 disabled:shadow-none"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[9px] font-black text-center text-muted-foreground uppercase tracking-[0.2em] mt-3">
          Cyndi uses <span className="text-primary">Gemini 2.0 Flash</span> · Workspace Context Active
        </p>
      </div>
    </div>
  );
};

export default CyndiPanel;
