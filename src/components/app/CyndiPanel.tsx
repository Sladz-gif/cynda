import { X, Bot, Send, User, Sparkles, Loader2, RefreshCw, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useIndustryStore } from "@/lib/industry-store";
import { callCyndi } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CyndiPanelProps {
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const TRIAL_LIMIT = 3;

const CyndiPanel = ({ onClose }: CyndiPanelProps) => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const store = useIndustryStore();
  
  const isTrial = store.subscriptionTier === "trial";
  const hasReachedLimit = isTrial && store.trialMessageCount >= TRIAL_LIMIT;

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: isTrial 
        ? "Hi, I'm Cyndi. As a trial user, you can ask me a few questions to see how I can help your business. Upgrade anytime for full access!"
        : "Hi, I'm Cyndi. I have access to your workspace data and can help you manage projects, deals, and daily operations. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    
    if (hasReachedLimit) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "You've reached your trial limit for Cyndi AI. Upgrade to a paid plan to unlock my full potential and keep our conversation going!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }

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
      Always try to provide actionable insights or offer to perform tasks (like creating projects or updating statuses).
      ${isTrial ? "IMPORTANT: This is a trial user. Keep your answers slightly shorter but extremely impressive to encourage them to upgrade." : ""}`;

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
      
      if (isTrial) {
        store.incrementTrialMessageCount();
      }

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
              Cyndi AI {isTrial && <span className="text-[10px] text-primary">(Trial)</span>}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {isTrial && (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex h-8 border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg mr-2 hover:bg-primary hover:text-white transition-all"
              onClick={() => navigate("/billing/select-plan")}
            >
              Upgrade
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-xl hover:bg-secondary" 
            onClick={() => {
              setMessages([{ 
                role: "assistant", 
                content: isTrial 
                  ? "Chat cleared. Ask me something else before your trial limit!" 
                  : "Chat cleared. How else can I help you?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]);
              // Don't reset trial count on clear
            }}
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

          {hasReachedLimit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border-2 border-primary/20 p-6 rounded-3xl space-y-4 text-center mt-4"
            >
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-sm uppercase tracking-tight">Unlock Full Potential</h3>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-80 leading-relaxed">
                  You've seen a glimpse of Cyndi's power. Upgrade now to get unlimited assistance, advanced analytics, and full workspace control.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/billing/select-plan")}
                className="w-full bg-primary text-white font-black uppercase tracking-widest text-[10px] py-6 rounded-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                Get Full Access <ArrowRight className="w-3 h-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-background/50 backdrop-blur-md border-t border-border shrink-0">
        <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
          {isTrial && (
            <div className="absolute -top-10 left-0 right-0 flex justify-center">
              <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(TRIAL_LIMIT)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-2 h-2 rounded-full",
                        i < store.trialMessageCount ? "bg-muted-foreground/30" : "bg-primary animate-pulse"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                  {TRIAL_LIMIT - store.trialMessageCount} messages left
                </span>
              </div>
            </div>
          )}
          
          <div className="relative flex-1 group">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={hasReachedLimit ? "Trial limit reached..." : "Ask Cyndi anything..."}
              disabled={isTyping || hasReachedLimit}
              className={cn(
                "h-14 pl-5 pr-14 rounded-2xl bg-card border-2 border-transparent transition-all font-medium text-sm",
                !hasReachedLimit && "group-hover:border-primary/20 focus-visible:border-primary focus-visible:ring-0",
                hasReachedLimit && "bg-muted/50 cursor-not-allowed"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isTyping || hasReachedLimit}
                className={cn(
                  "h-10 w-10 rounded-xl transition-all",
                  input.trim() && !isTyping && !hasReachedLimit 
                    ? "bg-primary text-white shadow-glow hover:scale-105" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
            Cyndi can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CyndiPanel;
