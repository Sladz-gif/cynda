import React from "react";
import { usePaystackPayment } from "react-paystack";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIndustryStore } from "@/lib/industry-store";
import { countries } from "@/components/ui/PhoneInput";

// Paystack supported currencies as of now
const PAYSTACK_SUPPORTED_CURRENCIES = ['GHS', 'NGN', 'USD', 'ZAR', 'KES', 'UGX', 'TZS', 'RWF'];

interface PaystackCheckoutProps {
  amount: number;
  email: string;
  planName: string;
  onSuccess?: (reference: any) => void;
  onClose?: () => void;
}

export const PaystackCheckout: React.FC<PaystackCheckoutProps> = ({
  amount,
  email,
  planName,
  onSuccess,
  onClose,
}) => {
  const { toast } = useToast();
  const { currentUser, adminProfile, countryCode } = useIndustryStore();
  
  const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];
  
  // Fallback to GHS if currency not supported by Paystack
  let finalCurrency = selectedCountry.currency;
  let finalCurrencySymbol = selectedCountry.currencySymbol;
  if (!PAYSTACK_SUPPORTED_CURRENCIES.includes(finalCurrency)) {
    finalCurrency = 'GHS';
    finalCurrencySymbol = 'GH₵';
  }
  
  const config = {
    reference: new Date().getTime().toString(),
    email: email || (currentUser?.email as string) || (adminProfile?.email as string) || 'user@example.com', // Fallback email
    amount: amount * 100,
    currency: finalCurrency,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    metadata: {
      planName: planName,
      custom_fields: [
        {
          display_name: "Plan",
          variable_name: "plan",
          value: planName
        }
      ]
    },
    // Enable Paystack features
    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'], // Include all supported payment methods
  };

  const onPaymentSuccess = (reference: any) => {
    console.log("Payment successful!", reference);
    toast({
      title: "Payment Successful!",
      description: `Your ${planName} plan is now active!`,
    });
    onSuccess?.(reference);
  };

  const onPaymentClose = () => {
    console.log("Payment closed");
    onClose?.();
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <Button
      onClick={() => {
        if (!config.email) {
          toast({
            title: "Email Required",
            description: "Please provide your email to continue.",
            variant: "destructive"
          });
          return;
        }
        if (!config.publicKey) {
          toast({
            title: "Configuration Error",
            description: "Payment is not configured. Please contact support.",
            variant: "destructive"
          });
          return;
        }
        initializePayment(onPaymentSuccess, onPaymentClose);
      }}
      className="h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]"
    >
      Pay Now ({finalCurrencySymbol})
    </Button>
  );
};
