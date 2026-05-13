import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Submission = {
  email: string;
  whatsapp?: string;
  submittedAt: number;
};

const FEATURE_COPY =
  "See who is leading the pack. Real-time rankings for individuals, teams, departments, and companies — local, continental, and global. Powered by verified work data from inside your workspace.";

const PerformanceComingSoonPage = () => {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedWhatsapp = whatsapp.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      setIsSuccess(false);
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      setIsSuccess(false);
      return;
    }

    const next: Submission = {
      email: trimmedEmail,
      whatsapp: trimmedWhatsapp ? trimmedWhatsapp : undefined,
      submittedAt: Date.now(),
    };

    setSubmissions((prev) => [next, ...prev]);
    setIsSuccess(true);
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-[1000px] mx-auto pb-24"
    >
      <div className="rounded-2xl border-2 border-primary/25 bg-primary/5 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Coming soon</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-4xl">Join the list for launch day access.</p>
      </div>

      <div className="rounded-3xl border-2 border-border bg-card p-8 space-y-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-glow">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <div className="min-w-[240px]">
            <h1 className="font-display text-3xl font-black uppercase tracking-tight">Performance</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{FEATURE_COPY}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl border-2 border-border bg-secondary/10 p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Notify me when it's ready
              </p>
              <p className="text-sm text-muted-foreground">
                Save your spot now. We will only contact you when this launches.
              </p>
            </div>
            <div
              className={cn(
                "text-[9px] font-black uppercase tracking-widest rounded-full border px-3 py-1",
                isSuccess ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background"
              )}
            >
              {isSuccess ? "Submitted" : "Local preview"}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@company.com"
                className="h-11 rounded-xl text-sm font-medium"
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
                placeholder="+1 555 123 4567"
                className="h-11 rounded-xl text-sm font-medium"
              />
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed opacity-70">
                Get notified faster — WhatsApp messages go out before emails on launch day
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-destructive font-bold">{error}</p>}

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              type="submit"
              className="rounded-2xl h-12 px-8 font-black uppercase tracking-[0.15em] shadow-glow"
            >
              Let me know when it's ready
            </Button>

            {isSuccess && (
              <p className="text-sm font-bold text-foreground">
                You're on the list. We'll reach out the moment it's live.
              </p>
            )}
          </div>

          {/* local state only (no network). */}
          <div className="hidden" aria-hidden="true">
            {submissions.length}
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default PerformanceComingSoonPage;

