import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useIndustryStore } from "@/lib/industry-store";
import { motion, AnimatePresence } from "framer-motion";

const SuperAdminAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const setAdminProfile = useIndustryStore((state) => state.setAdminProfile);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate Auth Logic
    setTimeout(() => {
      if (isLogin) {
        // Simple mock login for admin
        if (formData.email.includes("admin") && formData.password.length >= 6) {
          setAdminProfile({
            name: "Super Administrator",
            email: formData.email,
            role: "Super Admin",
            chatName: "admin.cynda"
          });
          toast({ title: "Welcome back, Admin", description: "Authentication successful." });
          navigate("/super-admin");
        } else {
          toast({ 
            title: "Access Denied", 
            description: "Invalid admin credentials.", 
            variant: "destructive" 
          });
        }
      } else {
        // Signup simulation with the 5-account limit check
        // In a real app, this would be a Supabase call handled by the SQL trigger
        const mockExistingAdmins = 4; // Mocking current count
        if (mockExistingAdmins >= 5) {
          toast({ 
            title: "Signup Restricted", 
            description: "Maximum number of Super Admin accounts (5) reached. Contact system owner.", 
            variant: "destructive" 
          });
        } else {
          setAdminProfile({
            name: formData.name,
            email: formData.email,
            role: "Super Admin",
            chatName: "admin.cynda"
          });
          toast({ title: "Account Created", description: "Super Admin privileges granted." });
          navigate("/super-admin");
        }
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-primary selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px] relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.3)] mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Admin Gateway</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-2 opacity-60">
            Secure Platform Control & Management
          </p>
        </div>

        <Card className="rounded-[2.5rem] border-2 border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
          <CardHeader className="pt-10 pb-6 text-center">
            <CardTitle className="text-xl font-black uppercase tracking-tight text-white">
              {isLogin ? "Authenticate" : "Register Admin"}
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {isLogin ? "Enter your secure admin credentials" : "Create a new administrative profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleAuth} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/70">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input 
                        placeholder="e.g. System Controller"
                        className="h-14 pl-12 rounded-2xl bg-white/[0.03] border-2 border-white/5 focus-visible:border-primary/50 text-white font-bold transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/70">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input 
                    type="email"
                    placeholder="admin@cynda.ai"
                    className="h-14 pl-12 rounded-2xl bg-white/[0.03] border-2 border-white/5 focus-visible:border-primary/50 text-white font-bold transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/70">Security Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    className="h-14 pl-12 rounded-2xl bg-white/[0.03] border-2 border-white/5 focus-visible:border-primary/50 text-white font-bold transition-all"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-[0_10px_30px_rgba(var(--primary),0.2)] hover:shadow-[0_15px_40px_rgba(var(--primary),0.3)] transition-all flex items-center justify-center gap-2 group"
                disabled={isLoading}
              >
                {isLoading ? "Validating..." : (
                  <>
                    {isLogin ? "Unlock Access" : "Grant Privileges"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin ? "Need new admin account? Register" : "Already have access? Authenticate"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {!isLogin && (
          <div className="mt-8 p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              Administrative registration is strictly limited to <span className="text-white">5 accounts</span> globally. Exceeding this limit will result in automatic rejection by the core security system.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SuperAdminAuthPage;
