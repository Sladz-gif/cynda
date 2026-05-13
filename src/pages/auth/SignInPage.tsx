import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIndustryStore } from "@/lib/industry-store";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, ArrowRight, Bot, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import * as bcrypt from 'bcryptjs';

function getTimeBasedGreeting(): { greeting: string; message: string } {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return {
      greeting: "Good morning",
      message: "Let's have a productive day."
    };
  } else if (hour <= 17) {
    return {
      greeting: "Good afternoon", 
      message: "Back at it."
    };
  } else {
    return {
      greeting: "Good evening",
      message: "Working late — we've got you."
    };
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const SignInPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuthenticated, adminProfile, staffList, isAuthenticated } = useIndustryStore();
  const timeGreeting = getTimeBasedGreeting();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Carousel messages
  const carouselMessages = [
    "One workspace. 100% of your business.",
    "Stop paying for five tools to do one job.",
    "Built for businesses that actually work."
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % carouselMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const emailOk = validateEmail(email);
  const canSubmit = emailOk && password.length > 0 && !isLoading && !isBlocked;

  // Auto-focus first field
  useEffect(() => {
    const emailInput = document.getElementById("email-input");
    if (emailInput) {
      (emailInput as HTMLInputElement).focus();
    }
  }, []);

  // Handle block timer
  useEffect(() => {
    if (isBlocked && blockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setBlockTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isBlocked && blockTimeRemaining === 0) {
      setIsBlocked(false);
      setAttemptCount(0);
    }
  }, [isBlocked, blockTimeRemaining]);

  // Validate fields on blur
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    if (field === "email") {
      if (!value.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(value)) {
        newErrors.email = "Enter a valid email address";
      } else {
        delete newErrors.email;
      }
    }
    
    if (field === "password") {
       if (!value) {
         newErrors.password = "Password is required";
       } else {
         delete newErrors.password;
       }
    }
    
    setErrors(newErrors);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Free Access Bypass
    setAuthenticated(true);
    useIndustryStore.getState().setOnboarded(true);
    
    // Set a default admin profile if none exists
    if (!adminProfile) {
      useIndustryStore.getState().setAdminProfile({
        name: "Demo Admin",
        email: email || "demo@cynda.ai",
        role: "Super Admin",
        password: "demo",
        phone: "000-000-0000"
      });
    }
    
    navigate("/app/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Brand Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted/30 relative justify-center p-12 lg:pt-12 border-r border-border/50">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="relative max-w-md space-y-10">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-glow mb-12">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          
          {/* Rotating Carousel */}
          <div className="min-h-[180px] flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentCarouselIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-4xl lg:text-6xl font-black text-foreground uppercase tracking-tighter leading-none text-center w-full"
              >
                {carouselMessages[currentCarouselIndex].split(" ").map((word, index) => (
                  <span key={index} className="inline-block whitespace-nowrap">
                    {word === "100%" ? (
                      <span className="text-primary">{word} </span>
                    ) : (
                      <span>{word} </span>
                    )}
                  </span>
                ))}
              </motion.h1>
            </AnimatePresence>
          </div>
          
          {/* Subtle animated background */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          <div className="space-y-4 pt-12">
            {[
              "High-Fidelity CRM & Deals",
              "Enterprise Finance & Payroll",
              "Advanced HR & Surveillance",
              "Cyndi AI Assistant Included"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-sm font-black uppercase tracking-widest opacity-80">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border/50 hidden">
            <div className="flex items-center gap-3 text-primary">
              <Bot className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">Powered by Cyndi AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8 my-auto"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60">Your workspace is waiting.</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
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
                    onBlur={() => validateField("email", email)}
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
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password" 
                    className={cn(
                      "pl-12 pr-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold",
                      (errors.password || errors.general) && "border-destructive/40"
                    )}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => validateField("password", password)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-secondary/60 text-muted-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 mx-auto" /> : <Eye className="w-4 h-4 mx-auto" />}
                  </button>
                </div>
                <div className="min-h-[18px]">
                  {errors.password && (
                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-4 rounded-2xl bg-destructive/10 border-2 border-destructive/20">
                <p className="text-[11px] font-bold text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.general}
                </p>
                {errors.general.includes("create one") && (
                  <Link to="/signup" className="text-[11px] font-bold text-primary hover:underline mt-2 inline-block">
                    Create an account
                  </Link>
                )}
              </div>
            )}
            
            {/* Block warning */}
            {isBlocked && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
                <p className="text-[11px] font-bold text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Too many failed attempts. Try again in {Math.ceil(blockTimeRemaining / 60)} minutes {blockTimeRemaining % 60} seconds.
                </p>
                <Link to="/forgot-password" className="text-[11px] font-bold text-amber-600 hover:underline mt-2 inline-block">
                  Reset your password instead
                </Link>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow transition-all active:scale-95 disabled:opacity-50"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Take me in <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Don't have a workspace yet?{" "}
              <Link to="/signup" className="text-primary font-black hover:underline ml-1">Create one</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPage;
