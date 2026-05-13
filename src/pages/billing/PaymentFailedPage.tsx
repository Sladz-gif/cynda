import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, RefreshCw, CreditCard, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const reason = searchParams.get('reason') || 'unknown';
  const paymentMethod = searchParams.get('method') || 'card';

  const getErrorMessage = (reason: string) => {
    switch (reason) {
      case 'insufficient_funds':
        return "Insufficient funds in your account.";
      case 'card_declined':
        return "Your card was declined by the bank.";
      case 'expired_card':
        return "Your card has expired.";
      case 'invalid_cvv':
        return "Invalid CVV code.";
      case 'momo_timeout':
        return "Mobile Money transaction timed out.";
      case 'momo_declined':
        return "Mobile Money payment was declined.";
      case 'network_error':
        return "Network connection error.";
      default:
        return "Something went wrong with your payment.";
    }
  };

  const getErrorSolution = (reason: string) => {
    switch (reason) {
      case 'insufficient_funds':
        return "Check your account balance or use a different payment method.";
      case 'card_declined':
        return "Contact your bank or try a different card.";
      case 'expired_card':
        return "Use a different card or update your card details.";
      case 'invalid_cvv':
        return "Double-check your CVV code and try again.";
      case 'momo_timeout':
        return "Make sure your phone is ready and try again.";
      case 'momo_declined':
        return "Check your MoMo balance or contact your network provider.";
      case 'network_error':
        return "Check your internet connection and try again.";
      default:
        return "Try again or contact support if the problem persists.";
    }
  };

  const errorMessage = getErrorMessage(reason);
  const errorSolution = getErrorSolution(reason);

  const handleTryAgain = () => {
    navigate(`/billing/checkout?plan=${searchParams.get('plan')}&annual=${searchParams.get('annual')}`);
  };

  const handleSwitchMethod = () => {
    const newMethod = paymentMethod === 'card' ? 'momo' : 'card';
    navigate(`/billing/checkout?plan=${searchParams.get('plan')}&annual=${searchParams.get('annual')}&method=${newMethod}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="text-center p-8 shadow-lg border-2 border-destructive/20">
          <CardContent className="space-y-6">
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto"
            >
              <AlertCircle className="w-10 h-10 text-destructive" />
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">
                Payment didn't go through.
              </h1>
              <div className="space-y-2">
                <p className="text-lg text-destructive font-medium">
                  {errorMessage}
                </p>
                <p className="text-sm text-muted-foreground">
                  {errorSolution}
                </p>
              </div>
            </motion.div>

            {/* Payment Method Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="p-4 rounded-2xl bg-muted/30 border-2 border-border/50"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                {paymentMethod === 'card' ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Card payment failed</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile Money payment failed</span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={handleTryAgain}
                className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow transition-all"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try again
              </Button>
              
              <Button
                onClick={handleSwitchMethod}
                variant="outline"
                className="w-full h-14 rounded-2xl border-2 border-border font-black uppercase tracking-widest text-xs transition-all"
              >
                Use a different method
              </Button>
            </motion.div>

            {/* Support Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="pt-4"
            >
              <div className="flex items-center justify-center gap-6 text-xs">
                <Link to="/billing/support" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact support
                </Link>
                <Link to="/billing/select-plan" className="text-muted-foreground hover:text-primary transition-colors">
                  Change plan
                </Link>
              </div>
            </motion.div>

            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Button
                variant="ghost"
                asChild
                className="w-full gap-2"
              >
                <Link to="/billing/select-plan">
                  <ArrowLeft className="w-4 h-4" />
                  Back to plans
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentFailedPage;
