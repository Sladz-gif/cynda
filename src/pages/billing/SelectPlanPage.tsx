import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Check, Users, Building2, User, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIndustryStore } from "@/lib/industry-store";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  basePrice: number;
  seatPrice?: number;
  seatPriceYearly?: number;
  example: string;
  exampleYearly?: string;
  features: string[];
  icon: React.ElementType;
  color: string;
}

const plans: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    tagline: "For the one-person operation that means business.",
    monthlyPrice: 12,
    yearlyPrice: 10,
    basePrice: 12,
    features: [
      "All selected departments and tools",
      "Cynda workspace personalised to your needs",
      "Notes, Files, Forms included",
      "Messaging and email coming soon",
      "3-day free trial",
      "No team features",
      "No data export/download during free trial"
    ],
    icon: User,
    color: "text-blue-600"
  },
  {
    id: "team",
    name: "Team",
    tagline: "For businesses where everyone needs to be on the same page.",
    monthlyPrice: 29,
    yearlyPrice: 24,
    basePrice: 29,
    seatPrice: 8,
    seatPriceYearly: 6.50,
    example: "10 people = $101/month",
    exampleYearly: "10 people = $89/month",
    features: [
      "Everything in Solo",
      "Super admin control panel",
      "Staff onboarding via document upload",
      "Per-person tool assignment",
      "Activity surveillance for admins",
      "Priority support",
      "Data export/download available after trial"
    ],
    icon: Users,
    color: "text-primary"
  },
  {
    id: "organisation",
    name: "Organisation",
    tagline: "For companies that need structure without slowing down.",
    monthlyPrice: 199,
    yearlyPrice: 165,
    basePrice: 199,
    seatPrice: 6,
    seatPriceYearly: 5,
    example: "50 people = $499/month",
    exampleYearly: "50 people = $415/month",
    features: [
      "Everything in Team",
      "All modules active by default",
      "HR-led onboarding and org management",
      "Hierarchical surveillance and activity logs",
      "Custom department creation",
      "Dedicated account support",
      "Data export/download available after trial"
    ],
    icon: Building2,
    color: "text-purple-600"
  }
];

const SelectPlanPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { 
    userType, 
    setUserType, 
    setAuthenticated, 
    setAdminProfile, 
    setSubscriptionTier 
  } = useIndustryStore();
  
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setUserType(planId as any);
    setSubscriptionTier("paid");
    
    // Check if we came from settings
    if (searchParams.get('from') === 'settings') {
      navigate(`/app/settings?tab=billing&cycle=${isAnnual ? 'yearly' : 'monthly'}`);
      toast({
        title: "Plan Updated",
        description: `Your workspace has been successfully moved to the ${planId} plan.`,
      });
    } else {
      navigate(`/billing/checkout?plan=${planId}&annual=${isAnnual}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="gap-2">
              <Link to="/app/settings">
                <ArrowLeft className="w-4 h-4" />
                Back to Settings
              </Link>
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-black uppercase tracking-tight">Select Your Plan</h1>
              <p className="text-sm text-muted-foreground font-medium">Choose the perfect plan for your business</p>
            </div>
            
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-16">
        {/* Annual/Monthly Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Label htmlFor="billing-toggle" className={cn("text-sm font-medium", !isAnnual && "text-foreground")}>
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label htmlFor="billing-toggle" className={cn("text-sm font-medium flex items-center gap-2", isAnnual && "text-foreground")}>
            Annual
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
              Save 20%
            </Badge>
          </Label>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const displayPrice = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
            const displayExample = isAnnual && plan.exampleYearly ? plan.exampleYearly : plan.example;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                  "relative",
                  isSelected && "md:-scale-105 md:z-10"
                )}
              >
                {isSelected && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-black uppercase tracking-wider">
                      Current Plan
                    </Badge>
                  </div>
                )}
                
                <Card className={cn(
                  "h-full relative overflow-hidden border-2 transition-all cursor-pointer",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border bg-background hover:border-primary/20"
                )}>
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center",
                        isSelected ? "bg-primary text-white" : "bg-muted"
                      )}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-muted-foreground">
                      {plan.tagline}
                    </CardDescription>
                    
                    <div className="pt-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-black text-foreground">
                          ${displayPrice}
                        </span>
                        <span className="text-sm text-muted-foreground font-medium">
                          /month
                        </span>
                      </div>
                      
                      {plan.seatPrice && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            + ${isAnnual ? plan.seatPriceYearly : plan.seatPrice} per team member
                          </p>
                          <p className="text-xs text-muted-foreground font-medium mt-1">
                            {displayExample}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex flex-col flex-1">
                    <div className="flex-1 space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                    onClick={() => handlePlanSelect(plan.id)}
                    className={cn(
                      "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                      isSelected 
                        ? "bg-primary text-white" 
                        : "bg-muted text-foreground hover:bg-primary hover:text-white"
                    )}
                  >
                      {isSelected ? "Continue with this plan" : "Select this plan"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Not sure which plan is right for you?{" "}
            <Link to="/contact" className="text-primary font-black hover:underline">
              Talk to our sales team
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SelectPlanPage;
