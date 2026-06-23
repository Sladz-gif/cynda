import { ShieldAlert, ArrowLeft, Home, Lock, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useIndustryStore } from "@/lib/industry-store";

const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { subscriptionTier } = useIndustryStore();
  const isTrial = subscriptionTier === "trial";

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-24 h-24 rounded-3xl ${isTrial ? 'bg-primary/10 border-primary/20' : 'bg-destructive/10 border-destructive/20'} flex items-center justify-center mb-8 border-2 relative`}
      >
        {isTrial ? <Sparkles className="w-10 h-10 text-primary" /> : <Lock className="w-10 h-10 text-destructive" />}
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 rounded-3xl ${isTrial ? 'bg-primary/5' : 'bg-destructive/5'}`}
        />
      </motion.div>
      
      <h2 className="font-display text-3xl font-black uppercase tracking-tight mb-4 text-foreground">
        {isTrial ? "Upgrade to Unlock Full Power" : "You don't have access to this."}
      </h2>

      <p className="text-muted-foreground max-w-sm mx-auto uppercase text-[10px] font-bold tracking-[0.2em] leading-relaxed mb-10">
        {isTrial 
          ? "As a trial user, you're only seeing a tiny bit of Cynda. Upgrade now to unlock all departments, advanced automations, and unlimited Cyndi AI."
          : "This section hasn't been opened up for you yet. Ask your admin to grant access."}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {isTrial ? (
          <>
            <Button 
              onClick={() => navigate("/billing/select-plan")}
              className="rounded-2xl shadow-glow h-14 px-10 uppercase font-black tracking-widest text-[11px] bg-primary text-white flex items-center gap-2"
            >
              Go Pro Now <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="rounded-2xl border-2 uppercase font-black tracking-widest text-[11px] h-14 px-10"
            >
              Maybe Later
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="rounded-xl border-2 uppercase font-black tracking-widest text-[10px] h-12 px-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
            <Button 
              onClick={() => navigate("/app/dashboard")}
              className="rounded-xl shadow-glow h-12 px-8 uppercase font-black tracking-widest text-[10px]"
            >
              <Home className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForbiddenPage;
