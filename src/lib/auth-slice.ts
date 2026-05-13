import { StateCreator } from 'zustand';

export type UserType = "solo" | "small-business" | "large-business" | "enterprise";
export type SubscriptionTier = "trial" | "paid";

export interface AdminProfile {
  name: string;
  email: string;
  companyName?: string;
  role: string;
  logo?: string;
  password?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  tools: string[];
  department?: string;
  role: "Director" | "Manager" | "Employee";
  status?: string;
}

export interface AuthSlice {
  userType: UserType;
  subscriptionTier: SubscriptionTier;
  adminProfile: AdminProfile | null;
  currentUser: Staff | AdminProfile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  trialStartedAt: string | null;
  setUserType: (type: UserType) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setAdminProfile: (profile: AdminProfile) => void;
  setCurrentUser: (user: Staff | AdminProfile | null) => void;
  setAuthenticated: (status: boolean) => void;
  setOnboarded: (status: boolean) => void;
  setTrialStartedAt: (date: string | null) => void;
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
  logout: () =>
    set({
      currentUser: null,
      isAuthenticated: false,
      adminProfile: null,
      isOnboarded: false,
      trialStartedAt: null,
    }),
});
