import { X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useIndustryStore } from "@/lib/industry-store";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CyndiComingSoonPanelProps {
  onClose: () => void;
}

const CyndiComingSoonPanel = ({ onClose }: CyndiComingSoonPanelProps) => {
  const { toast } = useToast();
  const { currentUser, adminProfile } = useIndustryStore();
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedWhatsapp = whatsapp.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call since we don't have real backend
      setTimeout(() => {
        setIsSuccess(true);
        toast({
          title: "Added to list",
          description: "We'll let you know when Cyndi is ready.",
        });
      }, 1000);
    } catch (err: any) {
      console.error("Waitlist error:", err);
      setIsSuccess(true);
      toast({
        title: "Added to list (Local)",
        description: "Your request has been noted for Cyndi.",
      });
    } finally {
      setIsLoading(false);
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
          </div>
          <div className="min-w-0">
            <span className="font-display font-black text-sm uppercase tracking-tight text-foreground truncate block">
              Cyndi AI
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-secondary" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-background to-secondary/10">
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-primary/25 bg-primary/5 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Coming soon
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Join the list for launch day access.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cyndi is your workspace copilot, built to understand how African businesses run.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">
                  Email
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="h-12 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">
                  WhatsApp number <span className="text-muted-foreground font-bold">(optional)</span>
                </Label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  type="tel"
                  placeholder="+233 24 000 0000"
                  className="h-12 rounded-xl text-sm font-bold"
                />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed opacity-70">
                  Get notified faster  WhatsApp messages go out before emails on launch day
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-destructive font-bold">{error}</p>}

            <Button
              type="submit"
              disabled={isSuccess || isLoading}
              className="w-full h-14 rounded-xl font-black uppercase tracking-[0.15em] shadow-glow"
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : isSuccess ? (
                "Added to list"
              ) : (
                "Let me know when it's ready"
              )}
            </Button>

            {isSuccess && (
              <p className="text-sm font-bold text-foreground">
                You're on the list. We'll reach out the moment Cyndi is live.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CyndiComingSoonPanel;
