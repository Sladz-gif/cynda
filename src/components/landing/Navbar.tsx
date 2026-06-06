import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  { name: "Features", id: "features" },
  { name: "How it Works", id: "how" },
  { name: "AI Partner", id: "ai" },
  { name: "Pricing", id: "pricing" }
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">C</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">Cynda</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="font-bold uppercase tracking-widest text-[10px]"><Link to="/signin">Sign in</Link></Button>
          <Button variant="hero" size="sm" asChild className="font-black uppercase tracking-widest text-[10px]"><Link to="/signup" className="flex items-center justify-center">Start free trial</Link></Button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border bg-background"
        >
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a 
                key={link.id} 
                href={`#${link.id}`} 
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-muted-foreground py-2"
              >
                {link.name}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="sm" className="flex-1 font-bold uppercase tracking-widest text-[10px]" asChild><Link to="/signin">Sign in</Link></Button>
              <Button variant="hero" size="sm" className="flex-1 font-black uppercase tracking-widest text-[10px]" asChild><Link to="/signup" className="flex items-center justify-center">Start free trial</Link></Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
