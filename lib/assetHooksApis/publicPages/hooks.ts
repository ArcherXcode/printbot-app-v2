import { useMutation } from "@tanstack/react-query";

import { normalizeApiError } from "@/lib/api/error-map";
import { queryClient } from "@/lib/query/query-client";
import { queryKeys } from "@/lib/query/query-keys";
import { useAuthStore, type UserRole } from "@/lib/store/auth-store";
import * as SecureStore from 'expo-secure-store';
import {
  changePassword,
  confirmPasswordReset,
  enableEmailTwoFactor,
  enableAuthenticatorTwoFactor,
  disableTwoFactor,
  login,
  logout,
  logoutAll,
  requestPasswordReset,
  setupAuthenticatorTwoFactor,
  signupUser,
  signupVendor,
  verifyTwoFactor,
} from "./api";
import { deriveRoleFromToken, isTwoFactorChallenge } from "./types";
import type {
  AuthTokens,
  AuthUserSummary,
  ChangePasswordDto,
  ConfirmPasswordResetDto,
  Disable2FADto,
  EnableAuthenticator2FADto,
  LoginDto,
  LoginTwoFactorChallenge,
  RequestPasswordResetDto,
  SignupUserPayload,
  SignupVendorPayload,
  VerifyTwoFactorDto,
} from "./types";

function extractTokenPair(payload: unknown): { accessToken: string } {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};

  const accessToken = typeof record.access_token === "string"
    ? record.access_token
    : typeof record["access-token"] === "string"
      ? record["access-token"]
      : typeof record.accessToken === "string"
        ? record.accessToken
        : null;

  if (!accessToken) {
    throw new Error("Auth token payload is missing access token.");
  }

  return { accessToken };
}

function extractAccessToken(payload: unknown): string | null {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};

  const accessToken = typeof record.access_token === "string"
    ? record.access_token
    : typeof record["access-token"] === "string"
      ? record["access-token"]
      : typeof record.accessToken === "string"
        ? record.accessToken
        : null;

  return accessToken;
}

function resolveRole(accessToken: string, user?: AuthUserSummary): UserRole {
  if (user?.role === "ADMIN" || user?.role === "VENDOR" || user?.role === "USER") {
    return user.role;
  }

  return deriveRoleFromToken(accessToken);
}

function persistSession(
  accessToken: string,
  setSession: ReturnType<typeof useAuthStore.getState>["setSession"],
  user?: AuthUserSummary,
) {
  const role = resolveRole(accessToken, user);
  setSession({
    accessToken,
    role,
    user,
  });
}

function unwrapLoginResult(payload: unknown): AuthTokens | LoginTwoFactorChallenge {
  if (typeof payload === "object" && payload !== null && "success" in payload && "data" in payload) {
    return (payload as { data: AuthTokens | LoginTwoFactorChallenge }).data;
  }

  return payload as AuthTokens | LoginTwoFactorChallenge;
}

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (payload: LoginDto) => {
      try {
        return await login(payload);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onSuccess: (data) => {
      const payload = unwrapLoginResult(data);
      if (isTwoFactorChallenge(payload)) {
        return;
      }

      const authPayload = payload as AuthTokens;
      const { accessToken } = extractTokenPair(authPayload);
      persistSession(accessToken, setSession, authPayload.user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    },
  });
}

export function useVerifyTwoFactorMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (payload: VerifyTwoFactorDto) => {
      try {
        return await verifyTwoFactor(payload);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onSuccess: (data) => {
      const payload = unwrapLoginResult(data);
      const authPayload = payload as AuthTokens;
      const { accessToken } = extractTokenPair(authPayload);
      persistSession(accessToken, setSession, authPayload.user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    },
  });
}

export function useSignupUserMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (payload: SignupUserPayload | FormData) => {
      try {
        return await signupUser(payload);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onSuccess: (data) => {
      const accessToken = extractAccessToken(data);
      if (accessToken) {
        persistSession(accessToken, setSession);
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    },
  });
}

export function useSignupVendorMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (payload: SignupVendorPayload | FormData) => {
      try {
        return await signupVendor(payload);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onSuccess: (data) => {
      const accessToken = extractAccessToken(data);
      if (accessToken) {
        persistSession(accessToken, setSession);
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    },
  });
}

export function useLogoutMutation() {
  const clearSession = useAuthStore((state) => state.clearSession);
  return useMutation({
    mutationFn: () => logout(),
    onSettled: async () => {
      clearSession();
      queryClient.clear();
      await SecureStore.deleteItemAsync('bio_username');
      await SecureStore.deleteItemAsync('bio_password');
    },
  });
}

export function useLogoutAllMutation() {
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: () => logoutAll(),
    onSettled: async () => {
      clearSession();
      queryClient.clear();
      await SecureStore.deleteItemAsync('bio_username');
      await SecureStore.deleteItemAsync('bio_password');
    },
  });
}

export function useChangePasswordMutation() {
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async (payload: ChangePasswordDto) => {
      try {
        return await changePassword(payload);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onSuccess: () => {
      // Align with backend security policy: password change revokes sessions.
      clearSession();
      queryClient.clear();
    },
  });
}

export function useEnableEmailTwoFactorMutation() {
  return useMutation({
    mutationFn: async () => {
      try {
        return await enableEmailTwoFactor();
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
  });
}

export function useSetupAuthenticatorTwoFactorMutation() {
  return useMutation({
    mutationFn: async () => {
      try {
        return await setupAuthenticatorTwoFactor();
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
  });
}

export function useEnableAuthenticatorTwoFactorMutation() {
  return useMutation({
    mutationFn: async (payload: EnableAuthenticator2FADto) => {
      try {
        return await enableAuthenticatorTwoFactor(payload);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
  });
}

export function useDisableTwoFactorMutation() {
  return useMutation({
    mutationFn: async (payload: Disable2FADto) => {
      try {
        return await disableTwoFactor(payload);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
  });
}

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: async (payload: RequestPasswordResetDto) => {
      try {
        return await requestPasswordReset(payload);
      } catch {
        // Backend always returns 200 for valid email submissions (user enumeration defense).
        // Swallow any unexpected network-level errors gracefully.
        return { code_sent: false, message: "", email: "" };
      }
    },
  });
}

export function useConfirmPasswordResetMutation() {
  return useMutation({
    mutationFn: async (payload: ConfirmPasswordResetDto) => {
      try {
        return await confirmPasswordReset(payload);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    // Note: password reset no longer clears the session — the user stays logged in
    // and receives fresh tokens via the change-password flow.
  });
}
