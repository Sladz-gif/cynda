import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Check, Star, ArrowRight, Users, Building2, User, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  isPopular?: boolean;
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
      "No team features"
    ],
    icon: User,
    color: "text-primary"
  },
  {
    id: "team",
    name: "Team",
    tagline: "For businesses where everyone needs to stay on the same page.",
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
      "Priority support"
    ],
    isPopular: true,
    icon: Users,
    color: "text-primary"
  },
  {
    id: "organisation",
    name: "Organisation",
    tagline: "For companies that need real structure without slowing down.",
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
      "Dedicated account support"
    ],
    icon: Building2,
    color: "text-primary"
  }
];

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-32 relative overflow-hidden">

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            SIMPLE PRICING
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Pay in a currency you understand. Cancel anytime.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4">
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
              <Badge variant="secondary" className="text-xs font-bold text-white bg-gradient-to-r from-primary to-primary/80 border-0 shadow-sm px-2 py-0.5 animate-pulse-soft">
                Save 20% annually
              </Badge>
            </Label>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const displayPrice = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
            const displayExample = isAnnual && plan.exampleYearly ? plan.exampleYearly : plan.example;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                  "relative",
                  plan.isPopular && "md:-scale-105 md:z-10"
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-black uppercase tracking-wider">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={cn(
                  "h-full relative overflow-hidden transition-all",
                  plan.isPopular 
                    ? "border-0 bg-gradient-to-b from-primary/10 to-background ring-4 ring-primary/20"
                    : "border-2 border-border bg-background hover:border-primary/20"
                )}>
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center",
                        plan.isPopular ? "bg-gradient-to-br from-primary to-primary/80 text-white" : "bg-muted"
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
                      asChild
                      className={cn(
                        "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all",
                        plan.isPopular 
                          ? "bg-primary text-white" 
                          : "bg-muted text-foreground hover:bg-primary hover:text-white"
                      )}
                    >
                      <Link to={`/signup?tier=${plan.id}`} className="flex items-center justify-center gap-2">
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto mb-24"
        >
          <div className="rounded-3xl border-2 border-border bg-card p-8 md:p-12 overflow-hidden relative group hover:border-primary/20 transition-all">
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">Enterprise</h3>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">For massive scale & custom needs</p>
                  </div>
                </div>
                
                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                  Advanced governance, custom deployment options, dedicated account management, and unrestricted access to all current and future Cynda features.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Custom data residency",
                    "Single Sign-On (SAML/Okta)",
                    "Dedicated support engineer",
                    "Unlimited storage & history",
                    "Custom department logic",
                    "Early access to V1.2 features"
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-bold uppercase tracking-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-auto flex flex-col items-center gap-6">
                <div className="text-center lg:text-right">
                  <p className="text-sm text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">Starting at</p>
                  <div className="flex items-baseline justify-center lg:justify-end gap-2">
                    <span className="text-5xl font-black text-foreground">$999</span>
                    <span className="text-lg text-muted-foreground font-bold">/month</span>
                  </div>
                </div>
                <Button size="lg" className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest w-full sm:w-auto" asChild>
                  <a href="mailto:sales@cynda.co">Contact Sales</a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Below Pricing Cards - Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-20"
        >
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We accept card, bank transfer, and mobile money.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h3>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="change-plan" className="border-border/50 rounded-2xl px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Can I change my plan later?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, upgrade or downgrade anytime from your settings. Changes take effect at the next billing cycle, and we'll prorate any differences.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="after-trial" className="border-border/50 rounded-2xl px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                What happens after the trial?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You choose a plan and enter payment details. If you don't, your workspace pauses  nothing is deleted. Your data stays safe for 30 days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ai-training" className="border-border/50 rounded-2xl px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Do you train your AI on my data?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No. Your data is private and siloed. We never use your workspace information, client details, or communications to train our global AI models.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-safety" className="border-border/50 rounded-2xl px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Is my data safe?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Your data is encrypted, never sold, and yours to export at any time. We use industry-standard security practices and regular backups. Your privacy is our priority.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
