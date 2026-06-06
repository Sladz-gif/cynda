import { StateCreator } from 'zustand';

export type UserType = "solo" | "team" | "organisation" | "enterprise";
export type SubscriptionTier = "trial" | "paid";

export interface AdminProfile {
  name: string;
  email: string;
  chatName?: string;
  companyName?: string;
  role: string;
  logo?: string;
  password?: string;
  needsPasswordReset?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  chatName?: string;
  tools: string[];
  department?: string;
  role: "Director" | "Manager" | "Employee";
  status?: string;
  needsPasswordReset?: boolean;
}

export interface AuthSlice {
  userType: UserType;
  subscriptionTier: SubscriptionTier;
  adminProfile: AdminProfile | null;
  currentUser: Staff | AdminProfile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  trialStartedAt: string | null;
  needsPasswordReset: boolean;
  setUserType: (type: UserType) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setAdminProfile: (profile: AdminProfile) => void;
  setCurrentUser: (user: Staff | AdminProfile | null) => void;
  setAuthenticated: (status: boolean) => void;
  setOnboarded: (status: boolean) => void;
  setTrialStartedAt: (date: string | null) => void;
  setNeedsPasswordReset: (status: boolean) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  userType: "solo",
  subscriptionTier: "trial",
  adminProfile: null,
  currentUser: null,
  isAuthenticated: false,
  isOnboarded: false,
  trialStartedAt: null,
  needsPasswordReset: false,
  setUserType: (type) => set({ userType: type }),
  setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),
  setAdminProfile: (profile) =>
    set((state) => ({
      adminProfile: profile,
      currentUser: state.currentUser || profile,
    })),
  setCurrentUser: (user) => set({ currentUser: user }),
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  setOnboarded: (status) => set({ isOnboarded: status }),
  setTrialStartedAt: (date) => set({ trialStartedAt: date }),
  setNeedsPasswordReset: (status) => set({ needsPasswordReset: status }),
  logout: () =>
    set({
      currentUser: null,
      isAuthenticated: false,
      adminProfile: null,
      isOnboarded: false,
      trialStartedAt: null,
      needsPasswordReset: false,
    }),
});
