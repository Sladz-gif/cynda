import React, { useState } from "react";
import { User, Bell, Shield, Palette, Globe, CreditCard, Users, Building2, Download, Plus, Search, Mail, Phone, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const SettingsPage = () => {
  const [active, setActive] = useState("profile");
  const { toast } = useToast();

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
                  <span className="text-3xl font-display font-black text-primary tracking-tighter">JD</span>
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight">Your Profile</h3>
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
                    <input defaultValue="John Doe" className="w-full h-12 px-5 rounded-2xl border border-border bg-secondary/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Email Address</label>
                    <input defaultValue="john@cynda.io" className="w-full h-12 px-5 rounded-2xl border border-border bg-secondary/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Job Role</label>
                    <input defaultValue="Super Admin" className="w-full h-12 px-5 rounded-2xl border border-border bg-secondary/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">Time Zone</label>
                    <input defaultValue="UTC-8 (Pacific)" className="w-full h-12 px-5 rounded-2xl border border-border bg-secondary/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                  </div>
                </div>
                <div className="pt-6 flex justify-end border-t border-border/50 mt-4">
                  <Button onClick={() => toast({ title: "Settings Saved" })} className="rounded-2xl h-12 px-8 font-black uppercase text-[11px] tracking-[0.15em] shadow-glow">Save Changes</Button>
                </div>
              </div>
            </motion.div>
          )}
          {active !== "profile" && (
            <motion.div 
              key={active}
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }}
              className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/5"
            >
              <h3 className="text-lg font-bold mb-2 uppercase tracking-widest">{active} Module</h3>
              <p className="text-sm text-muted-foreground">This module is being updated to the new horizontal navigation layout.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsPage;
