import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "USER" | "VENDOR" | "ADMIN";
export type VendorStatus = "approved" | "pending" | "rejected";

export type SessionUser = {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  vendor_status?: VendorStatus | null;
  business_name?: string | null;
  profile_image_url?: string | null;
  is_2fa_enabled?: boolean;
  two_factor_method?: string;
};

type SessionInput = {
  accessToken: string;
  role: UserRole | null;
  user?: SessionUser;
};

type AuthStore = {
  accessToken: string | null;
  role: UserRole | null;
  user: SessionUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  biometricsEnabled: boolean;
  pendingBiometricPrompt: boolean;
  lastLoginUsername: string | null;
  lastLoginPassword: string | null;
  setSession: (session: SessionInput) => void;
  clearSession: () => void;
  markHydrated: () => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setPendingBiometricPrompt: (pending: boolean) => void;
  setLastLoginCredentials: (username: string, password: string) => void;
  clearLastLoginCredentials: () => void;
};

export const authStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      biometricsEnabled: false,
      pendingBiometricPrompt: false,
      lastLoginUsername: null,
      lastLoginPassword: null,
      setSession: ({ accessToken, role, user }) =>
        set({
          accessToken,
          role,
          user: user ?? null,
          isAuthenticated: true,
        }),
      clearSession: () =>
        set({
          accessToken: null,
          role: null,
          user: null,
          isAuthenticated: false,
          pendingBiometricPrompt: false,
        }),
      markHydrated: () => set({ isHydrated: true }),
      setBiometricsEnabled: (enabled) => set({ biometricsEnabled: enabled }),
      setPendingBiometricPrompt: (pending) => set({ pendingBiometricPrompt: pending }),
      setLastLoginCredentials: (username, password) =>
        set({ lastLoginUsername: username, lastLoginPassword: password }),
      clearLastLoginCredentials: () =>
        set({ lastLoginUsername: null, lastLoginPassword: null }),
    }),
    {
      name: "printbot-auth-session",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        role: state.role,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        biometricsEnabled: state.biometricsEnabled,
        lastLoginUsername: state.lastLoginUsername,
        lastLoginPassword: state.lastLoginPassword,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

export const useAuthStore = authStore;
