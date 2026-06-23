import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight,
  Check,
  Shield,
  CreditCard
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIndustryStore } from "@/lib/industry-store";
import { useToast } from "@/hooks/use-toast";
import { PaystackCheckout } from "@/components/app/PaystackCheckout";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { adminProfile, setSubscriptionTier, setUserType } = useIndustryStore();
  
  const planId = searchParams.get('plan') || 'solo';
  const isAnnual = searchParams.get('annual') === 'true';
  
  // Plan pricing
  const getPlanDetails = () => {
    const plans = {
      solo: { name: 'Solo', monthly: 12, yearly: 10 },
      team: { name: 'Team', monthly: 29, yearly: 24, seatPrice: 8, seatYearly: 6.50 },
      organisation: { name: 'Organisation', monthly: 199, yearly: 165, seatPrice: 6, seatYearly: 5 }
    };
    return plans[planId as keyof typeof plans] || plans.solo;
  };

  const plan = getPlanDetails();
  const monthlyPrice = isAnnual ? plan.yearly : plan.monthly;
  const seatPrice = isAnnual ? plan.seatYearly : plan.seatPrice;
  const billingCycle = isAnnual ? 'Annual' : 'Monthly';
  
  // Calculate total (mock calculation - in real app this would come from user's seat count)
  const seatCount = planId === 'solo' ? 0 : planId === 'team' ? 10 : 50;
  const seatTotal = seatCount * (seatPrice || 0);
  const subtotal = monthlyPrice + seatTotal;
  const tax = subtotal * 0.15; // 15% tax (mock)
  const total = subtotal + tax;

  const handlePaymentSuccess = async (reference: any) => {
    // TODO: Call a Supabase Edge Function here to VERIFY the payment with Paystack's secret key
    // For now, we'll simulate it:
    console.log("Payment reference:", reference);
    
    setSubscriptionTier("paid");
    setUserType(planId as any);
    toast({
      title: "Payment Successful!",
      description: `Your ${plan.name} plan is now active!`,
    });
    
    // Redirect back to where they came from
    const from = searchParams.get('from');
    if (from === 'settings') {
      navigate(`/app/settings?tab=billing`);
    } else {
      navigate('/billing/success');
    }
  };

  const handlePaymentClose = () => {
    toast({
      title: "Payment Cancelled",
      description: "You can try again anytime.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="gap-2">
              <Link to="/billing/select-plan">
                <ArrowLeft className="w-4 h-4" />
                Back to Plans
              </Link>
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-black uppercase tracking-tight">Checkout</h1>
              <p className="text-sm text-muted-foreground font-medium">Complete your subscription</p>
            </div>
            
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase tracking-tight">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Plan</span>
                    <span className="text-sm font-black">{plan.name} ({billingCycle})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Base Price</span>
                    <span className="text-sm font-black">${monthlyPrice}/month</span>
                  </div>
                  {seatCount > 0 && seatPrice && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Team Members ({seatCount})</span>
                      <span className="text-sm font-black">${seatTotal}/month</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Subtotal</span>
                    <span className="text-sm font-black">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tax</span>
                    <span className="text-sm font-black">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black">
                    <span>Total Due Today</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">What you get:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-primary" />
                      Full access to all {plan.name} features
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-primary" />
                      {billingCycle} billing cycle
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-primary" />
                      Cancel anytime
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Paystack Checkout */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase tracking-tight">Secure Checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Powered by Paystack — your payment info is encrypted and secure.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    We accept Visa, Mastercard, Verve, and more.
                  </p>
                </div>
                
                <PaystackCheckout
                  amount={total}
                  email={adminProfile?.email || ''}
                  planName={plan.name}
                  onSuccess={handlePaymentSuccess}
                  onClose={handlePaymentClose}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
