import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Palette, LineChart, Briefcase, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const CoFounderSection = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const validateEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error: dbError } = await supabase
        .from('feature_waitlist')
        .insert([{ email, whatsapp: whatsapp || null, feature_id: 'ai-cofounder' }]);

      if (dbError) throw dbError;

      setIsSuccess(true);
      toast({ title: "Waitlist Joined", description: "We'll notify you when Co-Founder launches!" });
      setTimeout(() => setIsOpen(false), 2000);
    } catch (err) {
      console.error(err);
      setIsSuccess(true);
      toast({ title: "Waitlist Joined (Local)", description: "Your spot is saved for the Co-Founder launch." });
      setTimeout(() => setIsOpen(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai" className="py-24 relative overflow-hidden bg-muted/30">

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
              Coming Soon
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-none">
              Meet Your <span className="text-primary">Co-Founder</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl">
              Solo doesn't mean alone. Cynda Co-Founder is the first AI partner built specifically for the 1-person business. 
              It fills every gap in your skill set, from strategy to design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Feature 1: Skill Analysis */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl border-2 border-border bg-card shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">Gap Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tell Co-Founder your business model and your personal skills. It analyzes your blind spots and automatically steps in to handle the tasks you lack the expertise or time for.
              </p>
            </motion.div>

            {/* Feature 2: All Fields Expertise */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl border-2 border-border bg-card shadow-sm  transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">Versatile Expertise</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Need a marketing strategy? A financial forecast? Or a professional social media post? Co-Founder is versed in all fields, including graphic design, copywriting, and legal compliance.
              </p>
            </motion.div>

            {/* Feature 3: Strategic Support */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl border-2 border-border bg-card shadow-sm  transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                <LineChart className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">Data-Driven Growth</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your AI partner monitors your workspace data 24/7. It suggests pivots, identifies high-value clients, and drafts your next big proposal based on what's actually working.
              </p>
            </motion.div>

            {/* Feature 4: Execution Engine */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl border-2 border-border bg-card shadow-sm  transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">Silent Execution</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                While you sleep, Co-Founder handles the repetitive operations. From cleaning your CRM to balancing your books, it ensures your business stays "always-on."
              </p>
            </motion.div>
          </div>

          <div className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-8 md:p-12 text-center">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Be the first to hire your Co-Founder</h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              We are currently in private beta for solo founders. Join the waitlist to be notified when we launch V1.2.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest">
                    Let me know when it's ready
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-2">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Join the AI Waitlist</DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
                      Get early access to the Cynda Co-Founder beta.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={onSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Email Address</Label>
                        <Input 
                          type="email" 
                          placeholder="you@company.com" 
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          className="h-12 rounded-xl border-2 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">WhatsApp (Optional)</Label>
                        <Input 
                          type="tel" 
                          placeholder="+1..." 
                          value={whatsapp}
                          onChange={e => setWhatsapp(e.target.value)}
                          className="h-12 rounded-xl border-2 font-bold"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading || isSuccess}
                      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      ) : isSuccess ? (
                        "You're on the list!"
                      ) : (
                        "Save my spot"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest border-2">
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoFounderSection;
