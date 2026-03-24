import { useState, useEffect } from "react";
import { X, Sparkles, Send, Zap, MessageSquare, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIndustryStore, USER_TYPES } from "@/lib/industry-store";
import { motion, AnimatePresence } from "framer-motion";

interface CyndiPanelProps {
  onClose: () => void;
}

type Message = { role: "user" | "assistant"; content: string };

const CyndiPanel = ({ onClose }: CyndiPanelProps) => {
  const { userType } = useIndustryStore();
  const userConfig = USER_TYPES[userType] || USER_TYPES.solo;
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: `Hi! I'm Cyndi, your AI assistant for the ${userConfig.name} workspace. How can I help you optimize your workflow today?` 
    },
  ]);
  const [input, setInput] = useState("");

  // Reset messages when userType changes to reflect new behavior
  useEffect(() => {
    setMessages([
      { 
        role: "assistant", 
        content: `Workspace mode: ${userConfig.name}. I'm ready to assist with your specific ${userType} tasks.` 
      },
    ]);
  }, [userType, userConfig.name]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: input },
      { role: "assistant" as const, content: `Processing "${input}"... I'll have those insights ready in a moment.` },
    ]);
    setInput("");
  };

  const quickActions = [
    { label: "Create task", icon: List },
    { label: "Summarize", icon: Zap },
    { label: "Draft email", icon: MessageSquare },
  ];

  return (
    <div className="w-full h-full border-l border-border bg-card/95 backdrop-blur-md flex flex-col shadow-2xl">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border bg-background/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display font-black text-sm uppercase tracking-tight">Cyndi AI</span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-secondary" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-bold shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-glow"
                    : "bg-secondary/80 text-foreground border border-border/50 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick actions */}
      <div className="px-4 py-3 flex gap-2 flex-wrap bg-secondary/20">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => setInput(action.label)}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-secondary transition-all active:scale-95 shadow-sm"
            >
              <Icon className="w-3 h-3 text-primary" />
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2 bg-secondary/50 p-1 rounded-2xl border border-border/50">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Cyndi anything..."
            className="flex-1 h-10 px-4 bg-transparent text-xs font-bold focus:outline-none placeholder:text-muted-foreground/50 placeholder:uppercase placeholder:tracking-widest"
          />
          <Button size="icon" className="h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-glow shrink-0" onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CyndiPanel;
