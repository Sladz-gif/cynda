import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useIndustryStore } from "@/lib/industry-store";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type VerificationStatus = "loading" | "success" | "failed" | "already_processed";

const PaymentCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { setSubscriptionTier, setUserType, setAdminProfile, adminProfile } = useIndustryStore();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from Paystack callback
        const reference = searchParams.get("reference");
        if (!reference) {
          setStatus("failed");
          toast({
            title: "Payment Failed",
            description: "No payment reference found.",
            variant: "destructive",
          });
          return;
        }

        // Get current session token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.access_token) {
          throw new Error("Not authenticated");
        }

        // Verify payment with our Edge Function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ reference }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          console.error("Verification failed:", result);
          setStatus("failed");
          toast({
            title: "Payment Verification Failed",
            description: result.error || "Unable to verify payment.",
            variant: "destructive",
          });
          return;
        }

        if (result.success) {
          // Update local store
          if (result.transaction) {
            setSubscriptionTier("paid");
            if (result.transaction.user_type) {
              setUserType(result.transaction.user_type);
            }
            if (adminProfile) {
              setAdminProfile({
                ...adminProfile,
                subscriptionExpiresAt: result.subscription_expires_at,
              });
            }
            setTransactionData(result.transaction);
          }
          
          if (result.message === "Transaction already processed") {
            setStatus("already_processed");
          } else {
            setStatus("success");
            toast({
              title: "Payment Successful!",
              description: "Your subscription is now active.",
            });
          }
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
        toast({
          title: "Verification Error",
          description: "Something went wrong while verifying payment.",
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [searchParams, navigate, toast, setSubscriptionTier, setUserType, setAdminProfile, adminProfile]);

  const handleContinue = () => {
    navigate("/app/dashboard");
  };

  const handleRetry = () => {
    navigate("/billing/select-plan");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="text-center p-8 shadow-glow border-2 border-border">
          <CardContent className="space-y-6">
            {/* Status Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                status === "loading"
                  ? "bg-primary/10"
                  : status === "success" || status === "already_processed"
                  ? "bg-emerald-100"
                  : "bg-red-100"
              }`}
            >
              {status === "loading" ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : status === "success" || status === "already_processed" ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </motion.div>

            {/* Status Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-4"
            >
              {status === "loading" ? (
                <>
                  <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">
                    Verifying payment...
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium">
                    Please wait while we confirm your payment.
                  </p>
                </>
              ) : status === "success" || status === "already_processed" ? (
                <>
                  <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">
                    {status === "already_processed"
                      ? "Already Activated!"
                      : "You're all set!"}
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium">
                    {status === "already_processed"
                      ? "Your subscription was already activated."
                      : "Your subscription has been activated. Let's get to work!"}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">
                    Payment Not Verified
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium">
                    We couldn't verify your payment. Please try again or contact support.
                  </p>
                </>
              )}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {status === "loading" ? (
                <Button
                  disabled
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </Button>
              ) : status === "success" || status === "already_processed" ? (
                <Button
                  onClick={handleContinue}
                  className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow transition-all"
                >
                  Continue to workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={handleRetry}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow transition-all"
                  >
                    Try again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                  >
                    Back to home
                  </Button>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentCallbackPage;
