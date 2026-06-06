import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useIndustryStore } from "@/lib/industry-store";

type Strength = "Weak" | "Fair" | "Strong" | "Very Strong";

function getStrength(password: string): { strength: Strength; score: number; meets: Record<string, boolean> } {
  const meets = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(meets).filter(Boolean).length;
  const strength: Strength = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Strong" : "Very Strong";
  return { strength, score, meets };
}

const ForcePasswordResetPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { adminProfile, currentUser, setNeedsPasswordReset, setAuthenticated } = useIndustryStore();
  
  const user = currentUser || adminProfile;
  const firstName = user?.name?.split(" ")?.[0] || "there";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const strength = useMemo(() => getStrength(password), [password]);
  const passwordOk = strength.score === 4;
  const matchOk = confirm.length > 0 && confirm === password;
  const canSubmit = passwordOk && matchOk && !isLoading;

  useEffect(() => {
    if (password) {
      if (strength.score < 4) {
        const pErrs = [];
        if (password.length < 8) pErrs.push("Password must be at least 8 characters");
        if (!/[A-Z]/.test(password)) pErrs.push("Include at least one uppercase letter");
        if (!/[0-9]/.test(password)) pErrs.push("Include at least one number");
        if (!/[^A-Za-z0-9]/.test(password)) pErrs.push("Include at least one special character (!@#$%^&*)");
        setPasswordErrors(pErrs);
      } else {
        setPasswordErrors([]);
      }
    }
  }, [password, strength]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setNeedsPasswordReset(false);
      setAuthenticated(true);
      toast({
        title: "Password Updated",
        description: "Your new password has been set. Welcome to your workspace!",
      });
      navigate("/app/dashboard");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Brand Side */}
      <div className="hidden md:flex md:w-1/2 bg-muted/30 relative items-center justify-center p-12 border-r border-border/50">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative max-w-md space-y-10">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-glow mb-12">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-none">
            Secure your account.
          </h1>
          <p className="text-lg text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            You were provided with a temporary password. For your security, please create a new one to continue.
          </p>
          
          <div className="space-y-4 pt-12">
            {[
              "Enhanced security protocols",
              "Individual workspace protection",
              "Encrypted credential storage"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest opacity-80">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8 my-auto"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight">Create Password</h2>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60">
              Welcome {firstName}, let's get you set up.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type={showPw ? "text" : "password"} 
                    placeholder="Min. 8 characters" 
                    className="pl-12 pr-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-secondary/60 text-muted-foreground"
                  >
                    {showPw ? <EyeOff className="w-4 h-4 mx-auto" /> : <Eye className="w-4 h-4 mx-auto" />}
                  </button>
                </div>
                
                {/* Strength Meter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strength</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">{strength.strength}</p>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        strength.score <= 1 ? "bg-destructive" : 
                        strength.score === 2 ? "bg-amber-500" : 
                        strength.score === 3 ? "bg-primary" : "bg-emerald-500"
                      )}
                      style={{ width: `${(strength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="min-h-[18px]">
                  {password && passwordErrors.length > 0 && (
                    <div className="space-y-1">
                      {passwordErrors.map((err, i) => (
                        <p key={i} className="text-[11px] font-bold text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {err}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type={showConfirm ? "text" : "password"} 
                    placeholder="Repeat new password" 
                    className={cn(
                      "pl-12 pr-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold",
                      confirm.length > 0 && !matchOk && "border-destructive/40"
                    )}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-secondary/60 text-muted-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4 mx-auto" /> : <Eye className="w-4 h-4 mx-auto" />}
                  </button>
                </div>
                {confirm.length > 0 && !matchOk && (
                  <p className="text-[11px] font-bold text-destructive">Passwords do not match</p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow transition-all active:scale-95 disabled:opacity-50"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                "Save & Continue to Dashboard"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ForcePasswordResetPage;
