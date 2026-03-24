import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Quote, Sparkles, BookOpen, Brain, Briefcase, Users, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";

const BUSINESS_WISDOM = [
  // 48 Laws of Power (Business Context)
  { type: "Quote", source: "48 Laws of Power", content: "Never outshine the master. In business, ensure those above you feel superior to avoid insecurity-driven roadblocks.", category: "Business Management" },
  { type: "Quote", source: "48 Laws of Power", content: "Win through your actions, never through argument. Let results speak; words are often misinterpreted in corporate politics.", category: "Leadership" },
  { type: "Quote", source: "48 Laws of Power", content: "Conceal your intentions. In negotiations, keeping your true goals hidden prevents competitors from preparing a counter-strategy.", category: "Sales" },
  
  // Art of War (Business Context)
  { type: "Quote", source: "The Art of War", content: "Supreme excellence consists in breaking the enemy's resistance without fighting. Win market share through innovation, not price wars.", category: "Marketing" },
  { type: "Quote", source: "The Art of War", content: "Know yourself and know your enemy. Thorough market research and internal audits are the foundation of any successful project.", category: "Project Management" },
  { type: "Quote", source: "The Art of War", content: "In the midst of chaos, there is also opportunity. Market volatility is the best time for agile businesses to pivot.", category: "Business Psychology" },

  // Diary of a CEO / Modern MBA
  { type: "Fun Fact", source: "Diary of a CEO", content: "Employee burnout is often caused by 'unclear expectations' rather than 'too much work'. Ambiguity is the silent killer of productivity.", category: "HR" },
  { type: "Fun Fact", source: "MBA Insights", content: "Customer acquisition costs (CAC) are 5x higher than customer retention costs. Focus on your existing base for sustainable growth.", category: "Customer Relations" },
  { type: "Quote", source: "Diary of a CEO", content: "Your network is your net worth. The quality of your business relationships determines the ceiling of your success.", category: "Networking" },

  // Business Psychology & Management
  { type: "Fun Fact", source: "Psychology Today", content: "The 'Zeigarnik Effect' states that people remember uncompleted tasks better than completed ones. This is why 'to-do' lists can cause stress if not managed.", category: "IT" },
  { type: "Fun Fact", source: "Business Management", content: "Micromanagement is the #1 reason high-performing employees quit. Autonomy is the greatest driver of innovation.", category: "Business Management" },
  { type: "Quote", source: "MBA Handbook", content: "Accounting is the language of business. If you can't read the scoreboard, you don't know the score.", category: "Accounting" },
  
  // Project Management & IT
  { type: "Quote", source: "The Mythical Man-Month", content: "Adding manpower to a late software project makes it later. Brooks's Law reminds us that communication overhead scales faster than coding speed.", category: "IT" },
  { type: "Fun Fact", source: "Project Management", content: "The 'Planning Fallacy' means we naturally underestimate how long a project will take. Always add a 20% buffer to your estimates.", category: "Project Management" },
];

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(() => Math.floor(Math.random() * BUSINESS_WISDOM.length));

  const currentWisdom = BUSINESS_WISDOM[index];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % BUSINESS_WISDOM.length);
  };

  const categoryIcon = useMemo(() => {
    switch (currentWisdom.category) {
      case "Marketing": return <TrendingUp className="w-5 h-5" />;
      case "Sales": return <Briefcase className="w-5 h-5" />;
      case "Leadership": return <Sparkles className="w-5 h-5" />;
      case "HR": return <Users className="w-5 h-5" />;
      case "IT": return <Brain className="w-5 h-5" />;
      case "Project Management": return <BookOpen className="w-5 h-5" />;
      default: return <Quote className="w-5 h-5" />;
    }
  }, [currentWisdom.category]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-6xl md:text-8xl font-black text-primary/10 select-none">404</h1>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">You've found a placeholder...</h2>
          <p className="text-sm md:text-base text-muted-foreground">This feature is currently under construction, but here's some wisdom while you wait.</p>
        </motion.div>

        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative p-8 rounded-3xl border-2 border-primary/20 bg-card shadow-glow overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Quote className="w-24 h-24" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 gap-2 bg-primary/10 text-primary border-none uppercase tracking-widest text-[10px] font-black">
                {categoryIcon}
                {currentWisdom.category}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 uppercase tracking-widest text-[10px] font-black">
                {currentWisdom.type}
              </Badge>
            </div>

            <p className="text-xl md:text-2xl font-medium italic leading-relaxed text-foreground">
              "{currentWisdom.content}"
            </p>

            <div className="pt-4 border-t border-border">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Source: <span className="text-foreground">{currentWisdom.source}</span>
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate(-1)}
            className="rounded-full px-8 gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
          <Button 
            size="lg" 
            onClick={handleNext}
            className="rounded-full px-8 gap-2 bg-primary text-primary-foreground shadow-glow"
          >
            <Sparkles className="w-4 h-4" />
            Next Fact
          </Button>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, variant = "default", className = "" }: any) => {
  const variants: any = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border text-foreground",
  };
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default NotFoundPage;
