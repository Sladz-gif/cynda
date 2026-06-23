import React from "react";
import { usePaystackPayment } from "react-paystack";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIndustryStore } from "@/lib/industry-store";
import { countries } from "@/components/ui/PhoneInput";

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
  
  const config = {
    reference: new Date().getTime().toString(),
    email: email || (currentUser?.email as string) || (adminProfile?.email as string),
    amount: amount * 100,
    currency: selectedCountry.currency,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
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
        initializePayment(onPaymentSuccess, onPaymentClose);
      }}
      className="h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]"
    >
      Pay Now ({selectedCountry.currencySymbol})
    </Button>
  );
};
