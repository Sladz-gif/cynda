import React, { useState, useMemo, useEffect } from "react";
import { 
  User, Bell, Shield, Palette, CreditCard, Users, Building2, 
  Download, Check,
  ChevronDown, ChevronRight, LayoutGrid, Info, Moon, Sun, Monitor,
  Type, Layout, Eye, Sparkles, Sliders, Contrast, ArrowRight, AlertCircle, Keyboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIndustryStore, DEPARTMENTS } from "@/lib/industry-store";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";

const sections = [
  { id: "profile", label: "Your profile", icon: User },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "billing", label: "Plan & billing", icon: CreditCard },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
];

const ThemeSection = () => {
  const { themeSettings, setThemeSettings } = useIndustryStore();

  const accents = [
    { name: 'Cynda Orange (Default)', color: '#FF6600' },
    { name: 'Electric Blue', color: '#0066FF' },
    { name: 'Deep Purple', color: '#6600FF' },
    { name: 'Emerald', color: '#00FF66' },
    { name: 'Ruby', color: '#FF0066' },
  ];

  return (
    <div className="space-y-12 pb-10">
      {/* Mode Selection */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase tracking-tight">Interface Mode</h3>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Choose how Cynda looks on your screen.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'light', label: 'Light Mode', icon: Sun },
            { id: 'dark', label: 'Dark Mode', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setThemeSettings({ mode: mode.id as any })}
              className={cn(
                "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group",
                themeSettings.mode === mode.id ? "border-primary bg-primary/5 shadow-glow-sm" : "border-border bg-card hover:bg-secondary/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                themeSettings.mode === mode.id ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground group-hover:bg-secondary/80"
              )}>
                <mode.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase tracking-tight">Accent Color</h3>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">
            Current: <span className="text-primary">{accents.find(a => a.color === themeSettings.accentColor)?.name || 'Custom'}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-4 p-6 rounded-[32px] border-2 border-border bg-secondary/10">
          {accents.map((acc) => (
            <button
              key={acc.color}
              onClick={() => setThemeSettings({ accentColor: acc.color })}
              className={cn(
                "w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110 relative",
                themeSettings.accentColor === acc.color ? "border-white shadow-2xl scale-110" : "border-transparent opacity-60 hover:opacity-100"
              )}
              style={{ backgroundColor: acc.color }}
            >
              {themeSettings.accentColor === acc.color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white drop-shadow-md" />
                </div>
              )}
            </button>
          ))}
          <div className="h-12 w-px bg-border mx-2" />
          <button className="h-12 px-6 rounded-2xl border-2 border-dashed border-border text-[9px] font-black uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all">
            Custom Hex
          </button>
        </div>
      </div>

      {/* Advanced UI Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase tracking-tight">UI Behavior</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Tweak the feel of the interface.</p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => setThemeSettings({ glassmorphism: !themeSettings.glassmorphism })}
              className={cn(
                "w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between",
                themeSettings.glassmorphism ? "border-primary/20 bg-primary/5" : "border-border bg-card"
              )}
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-2.5 rounded-xl bg-secondary">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">Glassmorphism</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Frosted glass effects & blurs</p>
                </div>
              </div>
              <div className={cn(
                "w-12 h-6 rounded-full p-1 transition-colors relative",
                themeSettings.glassmorphism ? "bg-primary" : "bg-secondary"
              )}>
                <motion.div 
                  animate={{ x: themeSettings.glassmorphism ? 24 : 0 }}
                  className="w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </div>
            </button>

            <div className="p-5 rounded-2xl border-2 border-border bg-card space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-secondary">
                  <Type className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-black uppercase tracking-tight">Text Scale</p>
                    <span className="text-[10px] font-black text-primary">{themeSettings.fontScale}%</span>
                  </div>
                  <input 
                    type="range" min="80" max="120" step="5"
                    value={themeSettings.fontScale}
                    onChange={(e) => setThemeSettings({ fontScale: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-secondary rounded-full appearance-none accent-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase tracking-tight">Layout Density</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Control information density.</p>
          </div>
          <div className="flex flex-col p-1.5 rounded-[24px] bg-secondary/30 border-2 border-border gap-1.5">
            {[
              { id: 'compact', label: 'Compact', desc: 'Maximum data, minimum whitespace', icon: Sliders },
              { id: 'comfortable', label: 'Comfortable', desc: 'The classic Cynda experience', icon: Layout },
              { id: 'spacious', label: 'Spacious', desc: 'Extra room for focus', icon: Eye },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setThemeSettings({ density: d.id as any })}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl text-left transition-all",
                  themeSettings.density === d.id ? "bg-card text-foreground shadow-sm ring-2 ring-primary/20" : "text-muted-foreground hover:bg-secondary/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  themeSettings.density === d.id ? "bg-primary/10 text-primary" : "bg-secondary"
                )}>
                  <d.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">{d.label}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{d.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Persistence Note */}
      <div className="p-6 rounded-3xl bg-primary/5 border-2 border-primary/20 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Contrast className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-tight text-primary">Advanced Theme Engine</p>
          <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed uppercase tracking-widest">
            These settings are synced to your account. Your personalized Cynda environment follows you across every device you use.
          </p>
        </div>
      </div>
    </div>
  );
};

const ShortcutsSection = () => {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tight">Keyboard Shortcuts</h3>
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Manage your workspace keyboard shortcuts.</p>
      </div>

      <div className="p-8 rounded-[32px] border-2 border-primary bg-primary/5 shadow-glow-sm flex flex-col md:flex-row gap-6 items-center text-center md:text-left">
        <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center shrink-0 shadow-glow">
          <Keyboard className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-lg font-black uppercase tracking-tight text-foreground">View Active Shortcuts</h4>
          <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">Press <kbd className="px-2 py-1 mx-1 rounded bg-background border font-mono text-xs">Cmd / Ctrl</kbd> + <kbd className="px-2 py-1 mx-1 rounded bg-background border font-mono text-xs">/</kbd> anywhere in Cynda to view all available commands.</p>
          <Button onClick={() => window.dispatchEvent(new CustomEvent('toggle-shortcuts'))} variant="outline" className="border-primary/20 hover:bg-primary/10 transition-colors">
            Show Shortcuts Panel
          </Button>
        </div>
      </div>

      <div className="p-6 rounded-3xl border-2 border-border bg-card opacity-50 cursor-not-allowed">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h4 className="font-black uppercase tracking-tight flex items-center gap-2">Custom Bindings <Badge variant="secondary">Coming v1.2</Badge></h4>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Override default shortcuts</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/30">
            <span className="text-sm font-bold">Toggle Cyndi</span>
            <span className="text-sm font-mono bg-background border rounded px-2 py-1">Cmd + K</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillingSection = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { userType = 'solo', adminProfile } = useIndustryStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  // Update Billing Cycle from Query Param
  useEffect(() => {
    const cycle = searchParams.get('cycle');
    if (cycle === 'monthly' || cycle === 'yearly') {
      setBillingCycle(cycle as any);
    }
  }, [searchParams]);

  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'cancelled'>('active');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false);

  const tiers = [
    { 
      id: 'solo', 
      name: 'Solo', 
      price: billingCycle === 'monthly' ? 12 : 10,
      description: 'For the one-person operation that means business.',
      features: ['All tools included', '3-day free trial', 'No seat fees']
    },
    { 
      id: 'small-business', 
      name: 'Team', 
      price: billingCycle === 'monthly' ? 29 : 24,
      seatPrice: billingCycle === 'monthly' ? 8 : 6.50,
      description: 'For businesses where everyone needs to be on the same page.',
      features: ['Admin controls', 'Staff assignment', 'Per-person tool assignment']
    },
    { 
      id: 'large-business', 
      name: 'Organisation', 
      price: billingCycle === 'monthly' ? 199 : 165,
      seatPrice: billingCycle === 'monthly' ? 6 : 5,
      description: 'For companies that need structure without slowing down.',
      features: ['Multi-department', 'Surveillance layer', 'Custom departments']
    }
  ];

  // Mock billing history data
  const billingHistory = [
    { id: '1', date: '2024-03-15', description: 'Team Plan - Monthly', amount: 101.00, status: 'Paid', type: 'subscription' },
    { id: '2', date: '2024-02-15', description: 'Team Plan - Monthly', amount: 101.00, status: 'Paid', type: 'subscription' },
    { id: '3', date: '2024-01-15', description: 'Team Plan - Monthly', amount: 101.00, status: 'Paid', type: 'subscription' },
    { id: '4', date: '2023-12-15', description: 'Team Plan - Monthly', amount: 101.00, status: 'Paid', type: 'subscription' },
    { id: '5', date: '2023-11-15', description: 'Initial Setup', amount: 0.00, status: 'Paid', type: 'setup' },
  ];

  const currentTier = tiers.find(t => t.id === userType) || tiers[0];
  const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const seatCount = userType === 'solo' ? 0 : userType === 'small-business' ? 10 : 50;
  const seatTotal = seatCount * (currentTier.seatPrice || 0);
  const monthlyTotal = currentTier.price + seatTotal;

  return (
    <div className="space-y-10">
      {/* Current Plan Card */}
      <div className="p-8 rounded-[32px] border-2 border-primary bg-primary/5 shadow-glow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 flex gap-2">
          {subscriptionStatus === 'cancelled' && (
            <Badge variant="destructive" className="font-black uppercase tracking-widest px-4 py-1 rounded-full animate-pulse-soft">Cancelling Soon</Badge>
          )}
          <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-4 py-1 rounded-full">Current Plan</Badge>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tight">{currentTier.name}</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest max-w-md">{currentTier.description}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Billing cycle:</span>
                <span className="font-black uppercase">{billingCycle}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Team members:</span>
                <span className="font-black uppercase">{seatCount}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Next billing:</span>
                <span className="font-black uppercase">{nextBillingDate}</span>
              </div>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-5xl font-black tracking-tighter text-foreground">${monthlyTotal.toFixed(2)}<span className="text-lg text-muted-foreground font-bold tracking-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
              ${currentTier.price} base + ${seatTotal.toFixed(2)} seats
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-black uppercase tracking-tight">Payment Method</h4>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Manage your payment preferences</p>
          </div>
          <Button onClick={() => setShowUpdatePaymentModal(true)} className="gap-2">
            Update Payment Method
          </Button>
        </div>
        
        <div className="p-6 rounded-3xl border-2 border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                <span className="text-white font-black text-xs">VISA</span>
              </div>
              <div>
                <p className="font-black uppercase">•••• 4242</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Expires 12/25</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="space-y-6">
        <div>
          <h4 className="text-xl font-black uppercase tracking-tight">Billing History</h4>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">View your past transactions</p>
        </div>
        
        <div className="border-2 border-border rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((item) => (
                  <tr key={item.id} className="border-t border-border/50">
                    <td className="p-4 text-sm font-medium">{item.date}</td>
                    <td className="p-4 text-sm">{item.description}</td>
                    <td className="p-4 text-sm font-black">${item.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <Badge className={cn(
                        "text-xs",
                        item.status === 'Paid' ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      )}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Change Plan */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-xl font-black uppercase tracking-tight">Change Plan</h4>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Upgrade or downgrade your subscription</p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/billing/select-plan?from=settings">
              View All Plans
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Manage Subscription (Cancel/Reactivate) */}
      <div className="space-y-6">
        <div>
          <h4 className="text-xl font-black uppercase tracking-tight">Manage Subscription</h4>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Control your billing status</p>
        </div>
        
        <div className="p-6 rounded-3xl border-2 border-border bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {subscriptionStatus === 'active' ? (
                <>
                  <p className="font-black uppercase mb-1">Cancel your subscription</p>
                  <p className="text-sm text-muted-foreground">
                    Your workspace will remain active until {nextBillingDate}. After that, you'll lose access to premium features.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-black uppercase mb-1 text-destructive">Subscription scheduled to cancel</p>
                  <p className="text-sm text-muted-foreground">
                    You have cancelled your subscription. You will lose access to premium features on {nextBillingDate}.
                  </p>
                </>
              )}
            </div>
            
            {subscriptionStatus === 'active' ? (
              <Button 
                variant="destructive" 
                onClick={() => setShowCancelModal(true)}
                className="gap-2 shrink-0"
              >
                Cancel Subscription
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setSubscriptionStatus('active');
                  toast({
                    title: "Subscription Reactivated",
                    description: "Your workspace is now active and secure.",
                  });
                }}
                className="gap-2 shrink-0 bg-green-600 hover:bg-green-700 text-white"
              >
                Reactivate Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-3xl border-2 border-border p-8 max-w-md w-full"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Are you sure?</h3>
                  <p className="text-sm text-muted-foreground">
                    Cancelling will deactivate your subscription at the end of your current billing period.
                  </p>
                </div>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>What you'll lose:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Access to all premium features</li>
                    <li>• Team collaboration tools</li>
                    <li>• Priority support</li>
                    <li>• Advanced analytics and reporting</li>
                  </ul>
                  <p className="pt-2">
                    Your data will be safely stored for 30 days after cancellation.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 order-2 sm:order-1"
                  >
                    Keep my subscription
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setShowCancelModal(false);
                      setSubscriptionStatus('cancelled');
                      toast({
                        title: "Subscription Cancelled",
                        description: "You'll have access until the end of the billing period.",
                        variant: "destructive"
                      });
                    }}
                    className="flex-1 order-1 sm:order-2"
                  >
                    Cancel anyway
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Payment Modal - Placeholder */}
      <AnimatePresence>
        {showUpdatePaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
            onClick={() => setShowUpdatePaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-3xl border-2 border-border p-8 max-w-md w-full"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Update Payment Method</h3>
                  <p className="text-sm text-muted-foreground">
                    Add a new payment method to your account
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Button asChild className="w-full">
                    <Link to="/billing/checkout">
                      Add New Card
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowUpdatePaymentModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingsPage = () => {
  const [active, setActive] = useState("profile");
  const { toast } = useToast();
  const { 
    userType = 'solo', 
    selectedModules = [], 
    setSelectedModules,
    adminProfile,
    currentUser
  } = useIndustryStore();

  const activeUser = currentUser || adminProfile;
  const isAdmin = activeUser?.role === 'Super Admin' || userType === 'solo';

  const [expandedDepts, setExpandedDepts] = useState<string[]>(Object.keys(DEPARTMENTS));

  const toggleDept = (deptKey: string) => {
    setExpandedDepts(prev => 
      prev.includes(deptKey) ? prev.filter(d => d !== deptKey) : [...prev, deptKey]
    );
  };

  const isToolSelected = (toolId: string) => selectedModules.includes(toolId);

  const toggleTool = (toolId: string) => {
    if (isToolSelected(toolId)) {
      setSelectedModules(selectedModules.filter(id => id !== toolId));
    } else {
      setSelectedModules([...selectedModules, toolId]);
    }
  };

  const toggleEntireDept = (deptKey: string) => {
    const deptTools = DEPARTMENTS[deptKey as keyof typeof DEPARTMENTS].tools.map(t => t.id);
    const allSelected = deptTools.every(id => selectedModules.includes(id));
    
    if (allSelected) {
      setSelectedModules(selectedModules.filter(id => !deptTools.includes(id)));
    } else {
      const newModules = [...new Set([...selectedModules, ...deptTools])];
      setSelectedModules(newModules);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your account and workspace configuration.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast({ title: "Backup Started" })}>
              <Download className="w-4 h-4 mr-1.5" /> Export Data
            </Button>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto scrollbar-hide">
          {sections.map((item) => {
            const Icon = item.icon;
            // Hide Team and Billing for Solo if desired, but keeping for now as they might have placeholders
            if (item.id === 'team' && userType === 'solo') return null;
            
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                  active === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {item.label}
                {active === item.id && (
                  <motion.div layoutId="activeSettingsTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {active === "profile" && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              className="max-w-3xl space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8 rounded-3xl border border-border bg-card shadow-sm group hover:shadow-md transition-all">
                <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-glow shrink-0 transition-transform group-hover:scale-105">
                  <span className="text-3xl font-display font-black text-primary tracking-tighter">
                    {activeUser?.name?.split(' ').map(n => n[0]).join('') || "U"}
                  </span>
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight">{activeUser?.name || "Your Profile"}</h3>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Update your photo and personal details.</p>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="rounded-xl h-9 px-6 font-black uppercase text-[10px] tracking-widest border-primary/20 text-primary hover:bg-primary/5">Change Avatar</Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 md:p-8 rounded-3xl border border-border bg-card shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Full Name</label>
                    <input defaultValue={activeUser?.name} className="w-full h-12 px-5 rounded-2xl border border-border bg-secondary/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Email Address</label>
                    <input defaultValue={activeUser?.email} className="w-full h-12 px-5 rounded-2xl border border-border bg-secondary/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Job Role</label>
                    <input defaultValue={activeUser?.role} className="w-full h-12 px-5 rounded-2xl border border-border bg-secondary/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                  </div>
                </div>
                <div className="pt-6 flex justify-end border-t border-border/50 mt-4">
                  <Button onClick={() => toast({ title: "Settings Saved" })} className="rounded-2xl h-12 px-8 font-black uppercase text-[11px] tracking-[0.15em] shadow-glow">Save Changes</Button>
                </div>
              </div>
            </motion.div>
          )}

          {active === "workspace" && (
            <motion.div 
              key="workspace"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              className="max-w-4xl space-y-8"
            >
              {!isAdmin ? (
                <div className="p-12 text-center border-2 border-dashed border-border rounded-[32px] bg-secondary/5">
                  <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-black uppercase tracking-tight mb-2">Restricted Access</h3>
                  <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest leading-relaxed">Only workspace admins can modify tools and modules.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black uppercase tracking-tight">Active Modules</h3>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">Add or remove tools from your workspace.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl border-2 uppercase font-black tracking-widest text-[10px] h-10 px-4"
                      onClick={() => {
                        const allTools = Object.values(DEPARTMENTS).flatMap(d => d.tools.map(t => t.id));
                        setSelectedModules(allTools);
                      }}
                    >
                      Activate All
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(DEPARTMENTS).map(([key, dept]) => {
                      const deptTools = dept.tools.map(t => t.id);
                      const allSelected = deptTools.every(id => selectedModules.includes(id));
                      const someSelected = deptTools.some(id => selectedModules.includes(id)) && !allSelected;
                      const isExpanded = expandedDepts.includes(key);

                      return (
                        <div key={key} className="border-2 border-border rounded-2xl overflow-hidden bg-card shadow-sm">
                          <div className={cn(
                            "flex items-center justify-between p-4 sm:p-5 cursor-pointer transition-colors active:bg-secondary/80",
                            allSelected ? 'bg-primary/5' : 'bg-card hover:bg-secondary/50'
                          )} onClick={() => toggleDept(key)}>
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-secondary/50">
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                              </div>
                              <div>
                                <span className="text-xs sm:text-sm font-black uppercase tracking-widest block">{dept.label}</span>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{dept.tools.length} Tools available</span>
                              </div>
                            </div>
                            <button 
                              className={cn(
                                "w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all",
                                allSelected ? "border-primary bg-primary shadow-glow" : 
                                someSelected ? "border-primary bg-primary/30" : "border-border bg-background"
                              )}
                              onClick={(e) => { e.stopPropagation(); toggleEntireDept(key); }}
                            >
                              {allSelected && <Check className="w-5 h-5 text-primary-foreground" />}
                              {someSelected && <div className="w-3 h-1 bg-primary-foreground rounded-full" />}
                            </button>
                          </div>
                          
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: "auto", opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }} 
                                className="overflow-hidden bg-background/50 border-t border-border/50"
                              >
                                <div className="p-4 flex flex-col gap-3">
                                  {dept.tools.map((tool) => {
                                    const selected = isToolSelected(tool.id);
                                    const ToolIcon = tool.icon;
                                    return (
                                      <button
                                        key={tool.id}
                                        onClick={() => toggleTool(tool.id)}
                                        className={cn(
                                          "flex items-start gap-4 p-5 rounded-[1.5rem] text-left transition-all w-full border-2",
                                          selected ? "bg-primary/5 border-primary/20 text-primary shadow-sm" : "border-transparent bg-card hover:bg-secondary"
                                        )}
                                      >
                                        <div className={cn("p-2.5 rounded-xl shrink-0", selected ? 'bg-primary/20' : 'bg-secondary')}>
                                          <ToolIcon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-black uppercase tracking-tight">{tool.label}</p>
                                          <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-relaxed opacity-80">{tool.description}</p>
                                        </div>
                                        <div className={cn(
                                          "ml-2 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors mt-1",
                                          selected ? "border-primary bg-primary shadow-glow" : "border-border bg-background"
                                        )}>
                                          {selected && <Check className="w-4 h-4 text-primary-foreground" />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-6 rounded-3xl bg-secondary/20 border-2 border-border flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Info className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-foreground">Real-time Workspace Updates</p>
                      <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed uppercase tracking-widest">
                        Modules added or removed here will reflect immediately in the sidebar and dashboard for all relevant users.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {active === "theme" && (
            <motion.div 
              key="theme"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              className="max-w-4xl"
            >
              <ThemeSection />
            </motion.div>
          )}

          {active === "billing" && (
            <motion.div 
              key="billing"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              className="max-w-4xl space-y-8"
            >
              <BillingSection />
            </motion.div>
          )}

          {active === "shortcuts" && (
            <motion.div 
              key="shortcuts"
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              className="max-w-4xl space-y-8"
            >
              <ShortcutsSection />
            </motion.div>
          )}

          {active !== "profile" && active !== "workspace" && active !== "billing" && active !== "theme" && active !== "shortcuts" && (
            <motion.div 
              key={active}
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }}
              className="p-12 text-center border-2 border-dashed border-border rounded-[32px] bg-secondary/5"
            >
              <h3 className="text-lg font-black uppercase tracking-tight mb-2">{active} Settings</h3>
              <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest leading-relaxed">This section is being updated to support dynamic rendering.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsPage;
