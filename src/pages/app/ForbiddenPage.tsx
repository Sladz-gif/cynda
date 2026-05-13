import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-3xl bg-destructive/10 flex items-center justify-center mb-8 border-2 border-destructive/20 relative"
      >
        <Lock className="w-10 h-10 text-destructive" />
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-3xl bg-destructive/5"
        />
      </motion.div>
      
      <h2 className="font-display text-3xl font-black uppercase tracking-tight mb-4 text-foreground">You don't have access to this.</h2>
      
      <p className="text-muted-foreground max-w-sm mx-auto uppercase text-[10px] font-bold tracking-[0.2em] leading-relaxed mb-10">
        This module hasn't been assigned to you. <br />
        If you think that's wrong, reach out to your admin.
      </p>
      
      <div className="flex gap-4">
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
      </div>
    </div>
  );
};

export default ForbiddenPage;
