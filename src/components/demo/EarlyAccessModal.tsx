import { useState } from "react";
import { X, Check, ArrowRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import PaystackPop from "@paystack/inline-js";

interface EarlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  scrollToDonate?: boolean;
}

export const EarlyAccessModal = ({
  isOpen,
  onClose,
  scrollToDonate = false
}: EarlyAccessModalProps) => {
  const [step, setStep] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    industry: ""
  });
  const [donationAmount, setDonationAmount] = useState<number | "custom">(10);
  const [customAmount, setCustomAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Just store in localStorage for demo purposes
    localStorage.setItem("waitlist", JSON.stringify(formData));
    setStep("success");
  };

  const handleDonate = () => {
    const amount = typeof donationAmount === "number" 
      ? donationAmount 
      : parseInt(customAmount || "0");
    
    if (amount <= 0) return;

    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_yourkey",
      email: formData.email || "demo@cynda.com",
      amount: amount * 100, // convert to pesewas
      currency: "GHS",
      callback: (response) => {
        console.log("Payment successful!", response);
      },
      onClose: () => {
        console.log("Payment window closed");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 max-h-[80vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-black tracking-tight mb-2">
                    🚀 Be First. Get Cynda Free.
                  </h2>
                  <p className="text-muted-foreground">
                    Cynda is launching soon and the first 500 businesses get 6 months free. Lock in your spot now.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Business Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@company.com"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your Company Ltd"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(v) => setFormData({ ...formData, industry: v })}
                    >
                      <SelectTrigger id="industry" className="mt-1">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full h-12 mt-6 font-black uppercase tracking-widest">
                    ✅ Join the Waitlist — It's Free
                  </Button>
                </form>

                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="text-xl font-black tracking-tight mb-2">
                    ❤️ Help Us Launch Faster
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We're a small team building something big. Every cedi helps us ship faster and serve you better.
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[10, 25, 50].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setDonationAmount(amt)}
                        className={`py-3 px-4 rounded-xl font-bold border-2 transition-all ${
                          donationAmount === amt
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        GHS {amt}
                      </button>
                    ))}
                  </div>

                  {donationAmount === "custom" && (
                    <Input
                      type="number"
                      placeholder="Enter custom amount (GHS)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="mb-4"
                    />
                  )}

                  <button
                    onClick={() => setDonationAmount("custom")}
                    className="text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
                  >
                    Or enter a custom amount
                  </button>

                  <Button
                    onClick={handleDonate}
                    className="w-full h-12 font-black uppercase tracking-widest"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Donate via Paystack
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-4">
                  🎉 You're on the list!
                </h2>
                <p className="text-muted-foreground mb-8">
                  You're #247 in line. We'll email you the moment we launch.
                </p>

                <div className="pt-8 border-t border-border">
                  <h3 className="text-xl font-black tracking-tight mb-4">
                    Want to help us build faster?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Consider a small donation below.
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[10, 25, 50].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setDonationAmount(amt);
                          handleDonate();
                        }}
                        className="py-3 px-4 rounded-xl font-bold border-2 border-border hover:border-primary/50 transition-all"
                      >
                        GHS {amt}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="mt-8"
                >
                  Continue exploring demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
