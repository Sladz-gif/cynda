import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useIndustryStore, UserType, USER_TYPES } from "@/lib/industry-store";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, Lock, User, ArrowRight, Bot, CheckCircle2, Eye, EyeOff, AlertCircle, Zap, Sparkles } from "lucide-react";
import { cn, generateChatName } from "@/lib/utils";
import { PhoneInput } from "@/components/ui/PhoneInput";

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

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateName(name: string): boolean {
  return name.trim().length >= 2 && !/\d/.test(name);
}

const SignUpPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuthenticated, setAdminProfile, setUserType, setSubscriptionTier, setOnboarded, setTrialStartedAt, isAuthenticated, setCountryCode } = useIndustryStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [subscriptionChoice, setSubscriptionChoice] = useState<"trial" | "paid">("trial");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const [nameError, setNameError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  const strength = getStrength(password);
  const passwordOk = strength.score === 4;
  const matchOk = confirmPassword.length > 0 && confirmPassword === password;
  const emailOk = validateEmail(email);
  const nameOk = validateName(name);
  const phoneOk = phone.length > 0;
  const canSubmit = nameOk && emailOk && passwordOk && matchOk && phoneOk && termsAccepted && !isLoading;
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Auto-focus first field
  useEffect(() => {
    const nameInput = document.getElementById("name-input");
    if (nameInput) {
      (nameInput as HTMLInputElement).focus();
    }
  }, []);

  // Validate fields on blur
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case "name":
        if (!value.trim()) {
           setNameError("Your name is required");
           newErrors.name = "Your name is required";
        } else if (value.trim().length < 2) {
           setNameError("Name must be at least 2 characters");
           newErrors.name = "Name must be at least 2 characters";
        } else if (/\d/.test(value)) {
           setNameError("Name cannot contain numbers");
           newErrors.name = "Name cannot contain numbers";
        } else {
           setNameError("");
           delete newErrors.name;
        }
        break;
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!validateEmail(value)) {
          newErrors.email = "Enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (!value) {
          newErrors.password = "Password is required";
          setPasswordErrors(["Password is required"]);
        } else if (strength.score < 4) {
          const pErrs = [];
          if (value.length < 8) pErrs.push("Password must be at least 8 characters");
          if (!/[A-Z]/.test(value)) pErrs.push("Include at least one uppercase letter");
          if (!/[0-9]/.test(value)) pErrs.push("Include at least one number");
          if (!/[^A-Za-z0-9]/.test(value)) pErrs.push("Include at least one special character (!@#$%^&*)");
          setPasswordErrors(pErrs);
          newErrors.password = pErrs[0]; // show just the first one or all
        } else {
          setPasswordErrors([]);
          delete newErrors.password;
        }
        break;
      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== password) {
          newErrors.confirmPassword = "Passwords don't match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (canSubmit) {
        // No Supabase, just use store
        setAuthenticated(true);
        setOnboarded(false);
        
        setSubscriptionTier(subscriptionChoice);
        if (subscriptionChoice === "trial") {
          setTrialStartedAt(new Date().toISOString());
        }
        
        setAdminProfile({
          name: name,
          email: email,
          chatName: generateChatName(name),
          role: "Super Admin",
          phone: phone,
        });
        
        // Navigate to onboarding
        navigate('/onboarding');
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "Something went wrong on our end. Your information is safe  try again.",
        variant: "destructive"
      });
      setErrors({ general: "Something went wrong on our end. Your information is safe  try again." });
    } finally {
      setIsLoading(false);
    }
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

          <p className="text-lg text-muted-foreground font-medium uppercase tracking-widest opacity-60 text-center pt-8">
            No credit card required.
          </p>
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
            <h2 className="text-3xl font-black uppercase tracking-tight">Your business, one workspace.</h2>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-60">No credit card required.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-4">
              {/* Subscription Choice */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setSubscriptionChoice("trial")}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all text-left",
                    subscriptionChoice === "trial" 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-border bg-muted/20 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Zap className={cn("w-5 h-5", subscriptionChoice === "trial" ? "text-primary" : "text-muted-foreground")} />
                    {subscriptionChoice === "trial" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Trial</p>
                  <p className="text-[12px] font-bold leading-tight">Free Access</p>
                  <p className="text-[8px] font-medium opacity-60 mt-1 uppercase">Tiny bit of Cynda AI</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSubscriptionChoice("paid")}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all text-left overflow-hidden",
                    subscriptionChoice === "paid" 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-border bg-muted/20 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Sparkles className={cn("w-5 h-5", subscriptionChoice === "paid" ? "text-primary" : "text-muted-foreground")} />
                    {subscriptionChoice === "paid" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Go Pro</p>
                  <p className="text-[12px] font-bold leading-tight">Pay Now</p>
                  <p className="text-[8px] font-medium opacity-60 mt-1 uppercase">Full Cynda AI Power</p>
                  <div className="absolute -right-2 -bottom-1 rotate-12 opacity-10">
                    <Sparkles className="w-12 h-12" />
                  </div>
                </button>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Full name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="name-input"
                    type="text" 
                    placeholder="Ada Mensah" 
                    className={cn(
                      "pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold",
                      errors.name && "border-destructive/40"
                    )}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => validateField("name", name)}
                    required
                  />
                </div>
                <div className="min-h-[18px]">
                  {errors.name && (
                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Work email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
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
                    <div className="text-[11px] font-bold text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email.includes("Want to sign in instead?") ? (
                        <span>
                          An account with this email already exists. <Link to="/signin" className="underline hover:text-primary">Want to sign in instead?</Link>
                        </span>
                      ) : (
                        <span>{errors.email}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Create a password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters" 
                    className={cn(
                      "pl-12 pr-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold",
                      errors.password && "border-destructive/40"
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
                
                {/* Password Strength Indicator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strength</p>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      strength.score <= 1 ? "text-destructive" : 
                      strength.score === 2 ? "text-amber-500" : 
                      strength.score === 3 ? "text-primary" : "text-emerald-500"
                    )}>
                      {strength.strength}
                    </p>
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
                  <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest opacity-70">
                    Must be at least 8 characters, include one uppercase letter, one number, and one special character
                  </p>
                </div>
                
                <div className="min-h-[18px]">
                  {passwordErrors.length > 0 && (
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
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Type your password again" 
                    className={cn(
                      "pl-12 pr-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/30 transition-all font-bold",
                      confirmPassword.length > 0 && !matchOk && "border-destructive/40"
                    )}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => validateField("confirmPassword", confirmPassword)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-secondary/60 text-muted-foreground"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 mx-auto" /> : <Eye className="w-4 h-4 mx-auto" />}
                  </button>
                </div>
                <div className="min-h-[18px]">
                  {confirmPassword.length > 0 && !matchOk && (
                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Passwords don't match
                    </p>
                  )}
                  {errors.confirmPassword && (
                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              
              <PhoneInput
                label="Phone number"
                value={phone}
                onChange={setPhone}
                placeholder="Enter phone number"
                required
                error={errors.phone}
                onCountryChange={(country) => {
                  setCountryCode(country.code);
                }}
              />
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between ml-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Choose your starting path</p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest animate-pulse">Cancel anytime</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSubscriptionChoice("trial")}
                    className={cn(
                      "p-5 rounded-2xl border-2 transition-all text-left space-y-3 group",
                      subscriptionChoice === "trial" 
                        ? "border-primary bg-primary/5 shadow-glow-sm ring-2 ring-primary/10" 
                        : "border-border bg-muted/30 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        subscriptionChoice === "trial" ? "bg-primary text-white shadow-glow" : "bg-muted text-muted-foreground"
                      )}>
                        <Bot className="w-5 h-5" />
                      </div>
                      {subscriptionChoice === "trial" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight mb-1">Free Trial</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight opacity-60">
                        3 days • Limited tools<br/>
                        Explore the basics
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubscriptionChoice("paid")}
                    className={cn(
                      "p-5 rounded-2xl border-2 transition-all text-left space-y-3 relative overflow-hidden group",
                      subscriptionChoice === "paid" 
                        ? "border-primary bg-primary/5 shadow-glow-sm ring-2 ring-primary/10" 
                        : "border-border bg-muted/30 hover:border-primary/30"
                    )}
                  >
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-[8px] font-black text-white uppercase px-3 py-1 rounded-bl-xl tracking-tighter shadow-sm">
                        Recommended
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        subscriptionChoice === "paid" ? "bg-primary text-white shadow-glow" : "bg-muted text-muted-foreground"
                      )}>
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      {subscriptionChoice === "paid" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight mb-1">Go Pro</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight opacity-60">
                        Instant Full Access<br/>
                        Unlock every module
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor="terms" 
                    className="text-[11px] font-medium text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    By creating an account you agree to our <Link to="/terms" className="text-primary font-black hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary font-black hover:underline">Privacy Policy</Link>. We wrote them in plain English  they're worth a read.
                  </Label>
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
              className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow transition-all active:scale-95 disabled:opacity-50 mt-4"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Setting up...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Create My Workspace <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Already have a workspace?{" "}
              <Link to="/signin" className="text-primary font-black hover:underline ml-1">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
