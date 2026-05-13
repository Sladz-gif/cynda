import { X, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface CyndiPanelProps {
  onClose: () => void;
}

const CyndiPanel = ({ onClose }: CyndiPanelProps) => {
  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-card overflow-hidden relative">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-md shrink-0 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-black text-sm uppercase tracking-tight text-foreground truncate block">
              Cyndi AI
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">Training</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-secondary" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-card to-secondary/30 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center max-w-sm mx-auto"
        >
          <div className="w-24 h-24 mb-8 relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
            />
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-primary to-blue-500 shadow-glow-lg flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-foreground mb-4">
            Cyndi Coming Soon
          </h2>
          
          <p className="text-sm font-medium text-muted-foreground mb-8 leading-relaxed">
            Cyndi is currently in training. Soon, she'll understand your projects, deals, and daily workflows like a seasoned team member.
          </p>

          <div className="space-y-4 w-full">
            <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 flex items-start gap-3 w-full text-left">
              <Bot className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">Coming in V1.2</p>
                <p className="text-xs font-medium text-foreground">
                  Automated task creation, CRM intelligence, and natural language reporting.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-border bg-secondary/10 p-4 space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left ml-1">
                Notify me when she's ready
              </p>
              <Input
                placeholder="your@email.com"
                className="h-10 px-4 rounded-xl border-2 border-border bg-background text-xs font-bold focus:ring-0 focus:border-primary transition-all"
              />
              <Button className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-glow">
                Let me know when she's ready
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CyndiPanel;
