import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Check,
  Shield,
  CreditCard,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useIndustryStore } from "@/lib/industry-store";
import { useToast } from "@/hooks/use-toast";
import { PaystackCheckout } from "@/components/app/PaystackCheckout";
import { countries } from "@/components/ui/PhoneInput";
import { useCurrency } from "@/lib/useCurrency";
import { supabase } from "@/lib/supabase";

// Paystack supported currencies
const PAYSTACK_SUPPORTED_CURRENCIES = ['GHS', 'NGN', 'USD', 'ZAR', 'KES', 'UGX', 'TZS', 'RWF'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { adminProfile, setSubscriptionTier, setUserType, countryCode } = useIndustryStore();
  const { 
    convertFromUSD, 
    calculateCredits, 
    USD_TO_CREDIT_RATE,
    isLoading,
    error
  } = useCurrency();
  
  const planId = searchParams.get('plan') || 'solo';
  const isAnnual = searchParams.get('annual') === 'true';
  
  // Get currency info
  const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];
  const userCurrency = selectedCountry.currency;
  const userCurrencySymbol = selectedCountry.currencySymbol;
  let finalCurrency = selectedCountry.currency;
  let finalCurrencySymbol = selectedCountry.currencySymbol;
  if (!PAYSTACK_SUPPORTED_CURRENCIES.includes(finalCurrency)) {
    finalCurrency = 'GHS';
    finalCurrencySymbol = 'GH₵';
  }
  
  // Plan pricing (base prices are in USD)
  const getPlanDetails = () => {
    const plans = {
      solo: { name: 'Solo', monthly: 12, yearly: 10 },
      team: { name: 'Team', monthly: 29, yearly: 24, seatPrice: 8, seatYearly: 6.50 },
      organisation: { name: 'Organisation', monthly: 199, yearly: 165, seatPrice: 6, seatYearly: 5 }
    };
    return plans[planId as keyof typeof plans] || plans.solo;
  };

  const plan = getPlanDetails();
  const monthlyPriceUSD = isAnnual ? plan.yearly : plan.monthly;
  const seatPriceUSD = isAnnual ? plan.seatYearly : plan.seatPrice;
  const billingCycle = isAnnual ? 'Annual' : 'Monthly';
  
  // Calculate totals in USD
  const seatCount = planId === 'solo' ? 0 : planId === 'team' ? 10 : 50;
  const seatTotalUSD = seatCount * (seatPriceUSD || 0);
  const subtotalUSD = monthlyPriceUSD + seatTotalUSD;
  const taxUSD = subtotalUSD * 0.15; // 15% tax (mock)
  const totalUSD = subtotalUSD + taxUSD;
  
  // Convert to user's currency
  const monthlyPriceUser = convertFromUSD(monthlyPriceUSD, userCurrency);
  const seatTotalUser = convertFromUSD(seatTotalUSD, userCurrency);
  const subtotalUser = convertFromUSD(subtotalUSD, userCurrency);
  const taxUser = convertFromUSD(taxUSD, userCurrency);
  const totalUser = convertFromUSD(totalUSD, userCurrency);
  
  // Calculate Credits
  const totalCredits = calculateCredits(totalUSD);

  const handlePaymentSuccess = async (reference: any) => {
    try {
      console.log("Payment reference:", reference);
      
      // Calculate expiry date
      const now = new Date();
      const expiryDate = isAnnual 
        ? new Date(now.setFullYear(now.getFullYear() + 1)) 
        : new Date(now.setMonth(now.getMonth() + 1));
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user");
      }
      
      // 1. Update profile in Supabase
      if (adminProfile) {
        const updatedProfile = {
          ...adminProfile,
          subscriptionExpiresAt: expiryDate.toISOString()
        };
        
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'paid',
            user_type: planId,
            subscription_expires_at: expiryDate.toISOString()
          })
          .eq('id', user.id);
        
        // Update local store
        setAdminProfile(updatedProfile);
      }
      
      // 2. Save transaction history
      await supabase
        .from('transactions')
        .insert({
          profile_id: user.id,
          paystack_reference: reference?.reference || reference,
          amount: totalUSD,
          currency: 'USD',
          plan_name: plan.name,
          billing_cycle: isAnnual ? 'Annual' : 'Monthly',
          credits_awarded: totalCredits,
          status: 'success'
        });
      
      // 3. Update store
      setSubscriptionTier("paid");
      setUserType(planId as any);
      
      toast({
        title: "Payment Successful!",
        description: `Your ${plan.name} plan is now active!`,
      });
      
      // 4. Redirect appropriately
      const from = searchParams.get('from');
      if (from === 'settings') {
        navigate(`/app/settings?tab=billing`);
      } else {
        navigate('/app/dashboard');
      }
    } catch (error) {
      console.error("Payment success processing error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please contact support.",
        variant: "destructive"
      });
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
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading exchange rates...</p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-sm text-red-600">Failed to load exchange rates. Showing USD prices.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Plan</span>
                        <span className="text-sm font-black">{plan.name} ({billingCycle})</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-medium">Base Price</span>
                        <div className="text-right">
                          <span className="text-sm font-black">${monthlyPriceUSD}/month</span>
                          {userCurrency !== 'USD' && (
                            <p className="text-xs text-muted-foreground">
                              ~{userCurrencySymbol}{monthlyPriceUser.toFixed(2)}/month
                            </p>
                          )}
                        </div>
                      </div>
                      {seatCount > 0 && seatPriceUSD && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-medium">Team Members ({seatCount})</span>
                          <div className="text-right">
                            <span className="text-sm font-black">${seatTotalUSD}/month</span>
                            {userCurrency !== 'USD' && (
                              <p className="text-xs text-muted-foreground">
                                ~{userCurrencySymbol}{seatTotalUser.toFixed(2)}/month
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-medium">Subtotal</span>
                        <div className="text-right">
                          <span className="text-sm font-black">${subtotalUSD.toFixed(2)}</span>
                          {userCurrency !== 'USD' && (
                            <p className="text-xs text-muted-foreground">
                              ~{userCurrencySymbol}{subtotalUser.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-medium">Tax</span>
                        <div className="text-right">
                          <span className="text-sm font-black">${taxUSD.toFixed(2)}</span>
                          {userCurrency !== 'USD' && (
                            <p className="text-xs text-muted-foreground">
                              ~{userCurrencySymbol}{taxUser.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-baseline text-lg font-black">
                        <span>Total Due Today (USD)</span>
                        <div className="text-right">
                          <span className="text-primary">${totalUSD.toFixed(2)}</span>
                          {userCurrency !== 'USD' && (
                            <p className="text-xs text-muted-foreground font-normal">
                              ~{userCurrencySymbol}{totalUser.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Currency & CDEIS Info */}
                    <div className="space-y-4 bg-muted/30 rounded-xl p-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Your Currency</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            {userCurrency} ({userCurrencySymbol})
                          </span>
                          <span className="text-sm font-medium">
                            *Prices displayed in USD for Paystack processing
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Credit <span className="text-purple-600 font-bold">(Internal Platform Credit)</span></p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            1 USD = {USD_TO_CREDIT_RATE} Credits
                          </span>
                          <span className="text-lg font-black text-purple-600">
                            {totalCredits.toLocaleString()} Credits
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          This purchase unlocks {totalCredits.toLocaleString()} Credits for your workspace
                        </p>
                      </div>
                    </div>
                  </>
                )}
                
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
                    We accept Visa, Mastercard, Verve, and mobile money (Ghanaians).
                  </p>
                </div>
                
                <PaystackCheckout
                  amount={totalUSD}
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
