import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIndustryStore } from "@/lib/industry-store";
import { countries } from "@/components/ui/PhoneInput";
import { supabase } from "@/lib/supabase";

// Paystack supported currencies as of now
const PAYSTACK_SUPPORTED_CURRENCIES = ['GHS', 'NGN', 'USD', 'ZAR', 'KES', 'UGX', 'TZS', 'RWF'];

interface PaystackCheckoutProps {
  amount: number;
  email: string;
  planName: string;
  billingCycle: "Monthly" | "Annual";
  userType: "solo" | "team" | "organisation" | "enterprise";
  creditsAwarded: number;
}

export const PaystackCheckout: React.FC<PaystackCheckoutProps> = ({
  amount,
  email,
  planName,
  billingCycle,
  userType,
  creditsAwarded,
}) => {
  const { toast } = useToast();
  const { currentUser, adminProfile, countryCode } = useIndustryStore();
  const [isLoading, setIsLoading] = useState(false);

  const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];
  
  // Fallback to USD if currency not supported by Paystack
  let finalCurrency = selectedCountry.currency;
  let finalCurrencySymbol = selectedCountry.currencySymbol;
  if (!PAYSTACK_SUPPORTED_CURRENCIES.includes(finalCurrency)) {
    finalCurrency = 'USD';
    finalCurrencySymbol = '$';
  }

  const handleSubscribe = async () => {
    setIsLoading(true);

    try {
      // Get current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error("Not authenticated");
      }

      // Initialize payment with our Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: email || currentUser?.email || adminProfile?.email || "user@example.com",
            amount: amount,
            currency: finalCurrency,
            plan_name: planName,
            billing_cycle: billingCycle,
            user_type: userType,
            credits_awarded: creditsAwarded,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to initialize payment:", errorData);
        throw new Error(errorData.error || "Failed to initialize payment");
      }

      const { authorization_url } = await response.json();

      // Redirect to Paystack hosted checkout
      window.location.href = authorization_url;
    } catch (error) {
      console.error("Error starting payment:", error);
      toast({
        title: "Payment Failed to Start",
        description: (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      className="h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]"
    >
      {isLoading ? "Redirecting..." : `Pay Now (${finalCurrencySymbol})`}
    </Button>
  );
};
