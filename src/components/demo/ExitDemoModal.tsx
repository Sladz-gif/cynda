import { X, ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ExitDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeave: () => void;
  onJoinWaitlist: () => void;
}

export const ExitDemoModal = ({
  isOpen,
  onClose,
  onLeave,
  onJoinWaitlist
}: ExitDemoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Rocket className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight mb-2">
              👋 Before you go...
            </h2>
            <p className="text-muted-foreground">
              You've seen what Cynda can do for businesses like yours. Don't let this tab close without locking in your early access.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => {
                onClose();
                onJoinWaitlist();
              }}
              className="w-full h-12 font-black uppercase tracking-widest"
            >
              🚀 Join the Waitlist — 2 minutes
            </Button>
            <button
              onClick={onLeave}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground font-medium"
            >
              Leave anyway →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
