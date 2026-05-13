import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Smartphone, 
  ArrowLeft, 
  ArrowRight,
  Check,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIndustryStore } from "@/lib/industry-store";
import { useToast } from "@/hooks/use-toast";
import PhoneInput from "@/components/ui/PhoneInput";
import { usePaystackPayment } from 'react-paystack';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { adminProfile, setSubscriptionTier } = useIndustryStore();
  
  const planId = searchParams.get('plan') || 'solo';
  const isAnnual = searchParams.get('annual') === 'true';
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo'>('card');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [cardholderName, setCardholderName] = useState(adminProfile?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingCountry, setBillingCountry] = useState('Ghana');
  const [saveCard, setSaveCard] = useState(false);
  
  const [momoNetwork, setMomoNetwork] = useState('mtn');
  const [momoPhone, setMomoPhone] = useState('');

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

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5')) return 'mastercard';
    if (cleaned.startsWith('506') || cleaned.startsWith('650')) return 'verve';
    return null;
  };

  const cardType = getCardType(cardNumber);

  // Paystack configuration
  const config = {
    reference: (new Date()).getTime().toString(),
    email: adminProfile?.email || "user@cyndawork.com",
    amount: Math.round(total * 100), // in pesewas/kobo
    publicKey: 'pk_test_dummy_key_replace_when_backend_ready', // Mock key
  };

  const initializePayment = usePaystackPayment(config);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For now simulate the integration with a mock since the real key isn't ready
      // In production, uncomment the below initialization to launch the popup
      /*
      initializePayment({
        onSuccess: (reference) => {
          toast({ title: "Payment successful", description: "Your subscription has been activated." });
          navigate('/billing/success');
        },
        onClose: () => {
          setIsLoading(false);
          toast({ title: "Payment cancelled", description: "You closed the payment popup." });
        }
      });
      */
      
      // Temporary simulated wrap while we await real key
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubscriptionTier("paid");
      toast({
        title: "Payment successful",
        description: "Your subscription has been activated.",
      });
      
      navigate('/billing/success');
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase tracking-tight">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Payment Method Tabs */}
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                    <div className="grid grid-cols-2 gap-4">
                      <Label
                        htmlFor="card"
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          paymentMethod === 'card' 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/20"
                        )}
                      >
                        <RadioGroupItem value="card" id="card" className="sr-only" />
                        <CreditCard className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Card</span>
                      </Label>
                      
                      <Label
                        htmlFor="momo"
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all",
                          paymentMethod === 'momo' 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/20"
                        )}
                      >
                        <RadioGroupItem value="momo" id="momo" className="sr-only" />
                        <Smartphone className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Mobile Money</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'card' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Cardholder Name</Label>
                        <Input
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          placeholder="John Doe"
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Card Number</Label>
                        <div className="relative">
                          <Input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            className="h-12 rounded-xl pl-16"
                            maxLength={19}
                            required
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
                            <CreditCard className={cn("w-6 h-4", cardType ? 'text-primary' : 'text-muted-foreground')} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Expiry Date</Label>
                          <Input
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                            placeholder="MM/YY"
                            className="h-12 rounded-xl"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1">CVV</Label>
                          <Input
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="123"
                            className="h-12 rounded-xl"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Billing Country</Label>
                        <select
                          value={billingCountry}
                          onChange={(e) => setBillingCountry(e.target.value)}
                          className="w-full h-12 rounded-xl border-2 border-border bg-background px-4 font-medium"
                          required
                        >
                          <option value="Ghana">Ghana</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="Kenya">Kenya</option>
                          <option value="South Africa">South Africa</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="save-card"
                          checked={saveCard}
                          onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                        />
                        <Label htmlFor="save-card" className="text-sm font-medium cursor-pointer">
                          Save this card for future payments
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Network</Label>
                        <RadioGroup value={momoNetwork} onValueChange={setMomoNetwork}>
                          <div className="grid grid-cols-3 gap-4">
                            <Label
                              htmlFor="mtn"
                              className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all",
                                momoNetwork === 'mtn' 
                                  ? "border-primary bg-primary/5" 
                                  : "border-border hover:border-primary/20"
                              )}
                            >
                              <RadioGroupItem value="mtn" id="mtn" className="sr-only" />
                              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-black text-yellow-900 mb-2">
                                MTN
                              </div>
                            </Label>
                            
                            <Label
                              htmlFor="vodafone"
                              className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all",
                                momoNetwork === 'vodafone' 
                                  ? "border-primary bg-primary/5" 
                                  : "border-border hover:border-primary/20"
                              )}
                            >
                              <RadioGroupItem value="vodafone" id="vodafone" className="sr-only" />
                              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-xs font-black text-white mb-2">
                                VDF
                              </div>
                            </Label>
                            
                            <Label
                              htmlFor="airteltigo"
                              className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all",
                                momoNetwork === 'airteltigo' 
                                  ? "border-primary bg-primary/5" 
                                  : "border-border hover:border-primary/20"
                              )}
                            >
                              <RadioGroupItem value="airteltigo" id="airteltigo" className="sr-only" />
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-black text-white mb-2">
                                AT
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <PhoneInput
                        label="Phone Number"
                        value={momoPhone}
                        onChange={setMomoPhone}
                        placeholder="Enter your MoMo number"
                        required
                      />
                      
                      <div className="p-4 rounded-2xl bg-muted/30 border-2 border-border/50">
                        <p className="text-sm font-medium mb-2">How it works:</p>
                        <ol className="space-y-1 text-sm text-muted-foreground">
                          <li>1. Click Pay below</li>
                          <li>2. Approve the prompt on your phone</li>
                          <li>3. Done! Your subscription activates</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-glow transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        Pay ${total.toFixed(2)}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Secured by Paystack</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
