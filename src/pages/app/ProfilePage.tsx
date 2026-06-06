import React, { useState } from "react";
import { useIndustryStore, Staff } from "@/lib/industry-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Mail, Briefcase, Shield, Key, Camera, 
  CheckCircle2, AlertCircle, Save, LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { currentUser, adminProfile, setAdminProfile, logout } = useIndustryStore();
  const { toast } = useToast();
  
  const activeUser = currentUser || adminProfile;
  const isAdmin = activeUser?.role === 'Super Admin' || !('tools' in (activeUser || {}));

  const [formData, setFormData] = useState({
    name: activeUser?.name || "",
    email: activeUser?.email || "",
    chatName: activeUser?.chatName || "",
    role: activeUser?.role || "",
    jobTitle: isAdmin ? "Administrator" : (activeUser as Staff).role
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Update store with new values
    if (isAdmin && adminProfile) {
      setAdminProfile({
        ...adminProfile,
        name: formData.name,
        email: formData.email,
        role: formData.role, // Allow role update for demo/admin
      });
    }
    
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">My Profile</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">Manage your identity and security settings</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl border-2 uppercase font-black tracking-widest text-[10px] h-12 px-6"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl shadow-glow h-12 px-8 uppercase font-black tracking-widest text-[10px]"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Identity Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-8 rounded-[32px] border-2 border-border bg-card text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-primary/5" />
            <div className="relative pt-4">
              <div className="relative inline-block mx-auto mb-6">
                <Avatar className="h-28 w-28 border-4 border-card shadow-2xl">
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                    {formData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-glow border-2 border-card hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">{formData.name}</h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2">{formData.role}</p>
              
              <div className="mt-8 pt-8 border-t border-border/50 space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Account Verified
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Shield className="w-3.5 h-3.5 text-primary" /> Multi-Factor Auth
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed Settings */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[32px] border-2 border-border bg-card space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Identity Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Full Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-12 rounded-xl border-2 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Work Email</Label>
                <Input 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-12 rounded-xl border-2 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Cynda Username</Label>
                <Input 
                  readOnly
                  value={formData.chatName}
                  className="h-12 rounded-xl border-2 bg-muted/30 font-bold text-muted-foreground"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Cynda mail (v1.2)</Label>
                <Input
                  readOnly
                  value={`${(formData.name || "user").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "user"}@cynda.xyz`}
                  className="h-12 rounded-xl border-2 border-primary/20 bg-primary/5 font-bold"
                />
                <p className="text-[10px] text-muted-foreground font-medium">
                  Your permanent <span className="text-foreground font-bold">@cynda.xyz</span> inbox address (preview). Open <span className="text-foreground font-semibold">Messenger → Email · @cynda.xyz</span> to explore the v1.2 client.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Job Title</label>
                <Input 
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  className="h-12 rounded-xl border-2 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Workspace Role</label>
                <Input 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="h-12 rounded-xl border-2 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all font-bold"
                  readOnly={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Department</Label>
                <div className="h-12 px-4 rounded-xl border-2 bg-muted/30 flex items-center font-bold text-sm text-muted-foreground">
                  {isAdmin ? "Executive" : (activeUser as Staff).department}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-[32px] border-2 border-border bg-card space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Security & Access</h3>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">Change Password</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Last updated 14 days ago</p>
                  </div>
                </div>
                <Button variant="ghost" className="rounded-lg text-[10px] font-black uppercase tracking-widest h-8">Update</Button>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">Two-Factor Auth</p>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">Currently Enabled</p>
                  </div>
                </div>
                <Button variant="ghost" className="rounded-lg text-[10px] font-black uppercase tracking-widest h-8 text-destructive hover:bg-destructive/5">Disable</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
