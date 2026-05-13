import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Mail, Calendar, DollarSign } from "lucide-react";
import { useIndustryStore } from "@/lib/industry-store";
import { Link } from "react-router-dom";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { adminProfile } = useIndustryStore();
  
  const firstName = adminProfile?.name?.split(" ")[0] || "there";
  const email = adminProfile?.email || "your email";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="text-center p-8 shadow-glow border-2 border-primary/20">
          <CardContent className="space-y-6">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">
                You're all set, {firstName}!
              </h1>
              <p className="text-lg text-muted-foreground font-medium">
                Your workspace is active. Let's get to work.
              </p>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4 p-6 rounded-2xl bg-muted/30 border-2 border-border/50"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Plan
                  </span>
                  <span className="font-black uppercase">Team (Monthly)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Next billing
                  </span>
                  <span className="font-black">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Amount paid
                  </span>
                  <span className="font-black text-primary">$101.00</span>
                </div>
              </div>
            </motion.div>

            {/* Email Confirmation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="p-4 rounded-2xl bg-primary/5 border-2 border-primary/20"
            >
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  A receipt has been sent to <span className="font-black text-foreground">{email}</span>
                </span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button
                asChild
                className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow transition-all"
              >
                <Link to="/app/dashboard">
                  Go to my workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            {/* Additional Options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="pt-4"
            >
              <div className="flex items-center justify-center gap-6 text-xs">
                <Link to="/billing/settings" className="text-muted-foreground hover:text-primary transition-colors">
                  Manage Billing
                </Link>
                <Link to="/app/settings" className="text-muted-foreground hover:text-primary transition-colors">
                  Account Settings
                </Link>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
