import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, ArrowLeft, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailOk = validateEmail(email);
  const canSubmit = emailOk && !isLoading && !isSent;

  // Auto-focus first field
  useEffect(() => {
    const emailInput = document.getElementById("email-input");
    if (emailInput) {
      (emailInput as HTMLInputElement).focus();
    }
  }, []);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Validate field on blur
  const validateField = (value: string) => {
    if (!value.trim()) {
      setErrors({ email: "Email is required" });
    } else if (!validateEmail(value)) {
      setErrors({ email: "Enter a valid email address" });
    } else {
      setErrors({});
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (canSubmit) {
        // Simulate API call
        setTimeout(() => {
          setIsSent(true);
          toast({
            title: "Reset link sent",
            description: `Check your inbox. We've sent a reset link to ${email}. It expires in 30 minutes.`,
          });
          setIsLoading(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Reset error:", error);
      setErrors({ general: "Something went wrong on our end. Try again — your information is safe." });
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown === 0) {
      setResendCooldown(60); // 60 second cooldown
      toast({
        title: "Reset link resent",
        description: `Another reset link has been sent to ${email}.`,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Brand Side */}
      <div className="hidden md:flex md:w-1/2 bg-muted/30 relative items-center justify-center p-12 border-r border-border/50">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative max-w-md space-y-8">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-glow mb-12">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-none">
            Secure Your <span className="text-primary">Enterprise</span> Workspace.
          </h1>
          <p className="text-lg text-muted-foreground font-medium uppercase tracking-widest opacity-60">
            Professional password recovery for all team members.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight">Reset your password</h2>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60">Enter your email and we'll send you a reset link.</p>
          </div>

          {!isSent ? (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="email-input"
                      type="email" 
                      placeholder="ada@company.com" 
                      className={cn(
                        "pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold",
                        errors.email && "border-destructive/40"
                      )}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => validateField(email)}
                      required
                    />
                  </div>
                  <div className="min-h-[18px]">
                    {errors.email && (
                      <p className="text-[11px] font-bold text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="p-4 rounded-2xl bg-destructive/10 border-2 border-destructive/20">
                  <p className="text-[11px] font-bold text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.general}
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow transition-all active:scale-95 disabled:opacity-50"
                disabled={!canSubmit}
              >
                {isLoading ? (
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    Send reset link <Send className="w-4 h-4" />
                  </div>
                )}
              </Button>

              <div className="text-center pt-4">
                <Link to="/signin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-2">
                  Check your inbox
                </p>
                <p className="text-sm font-medium text-emerald-700">
                  We've sent a reset link to <span className="font-black">{email}</span>. It expires in 30 minutes.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Didn't get it? Check your spam folder or 
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className={cn(
                      "ml-1 text-primary font-black hover:underline transition-colors",
                      resendCooldown > 0 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {resendCooldown > 0 ? `resend (${resendCooldown}s)` : "resend"}
                  </button>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
