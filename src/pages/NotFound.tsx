import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Ghost } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 font-sans selection:bg-primary/20">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex p-4 rounded-3xl bg-secondary/50 border-2 border-border/50 shadow-glow">
              <Ghost className="w-12 h-12 text-primary animate-bounce" />
            </div>
            <h1 className="text-8xl font-black tracking-tighter text-foreground select-none">404</h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold uppercase tracking-tight">You've hit a dead end</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            The page you are looking for doesn't exist or has been moved to a new workspace.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
        >
          <Button variant="outline" size="lg" className="rounded-2xl w-full sm:w-auto h-14 px-8 border-2" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Link>
          </Button>
          <Button size="lg" className="rounded-2xl w-full sm:w-auto h-14 px-8 shadow-glow" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </motion.div>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pt-12 opacity-40">
          Error Logged: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
