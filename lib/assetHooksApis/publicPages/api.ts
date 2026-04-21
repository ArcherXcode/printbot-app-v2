import { apiFetch } from "@/lib/api/client";

import type {
  AuthTokens,
  ChangePasswordDto,
  ChangePasswordResponse,
  ConfirmPasswordResetDto,
  ConfirmPasswordResetResponse,
  Disable2FADto,
  EnableAuthenticator2FADto,
  LoginDto,
  LoginResponse,
  RefreshDto,
  RequestPasswordResetDto,
  RequestPasswordResetResponse,
  SignupRegistrationResponse,
  SignupUserPayload,
  SignupVendorPayload,
  VerifyTwoFactorDto,
} from "./types";

export async function login(payload: LoginDto): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function verifyTwoFactor(payload: VerifyTwoFactorDto): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function signupUser(payload: SignupUserPayload | FormData): Promise<AuthTokens | SignupRegistrationResponse> {
  return apiFetch<AuthTokens | SignupRegistrationResponse>("/auth/signup/user", {
    method: "POST",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    credentials: "include",
  });
}

export async function signupVendor(payload: SignupVendorPayload | FormData): Promise<AuthTokens | SignupRegistrationResponse> {
  return apiFetch<AuthTokens | SignupRegistrationResponse>("/auth/signup/vendor", {
    method: "POST",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    credentials: "include",
  });
}

export async function refresh(): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
}

export async function validateToken(accessToken: string): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>("/auth/validate-token", {
    method: "POST",
    body: JSON.stringify({ accessToken }),
    credentials: "include",
  });
}

export async function logout(): Promise<unknown> {
  return apiFetch<unknown>("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function changePassword(payload: ChangePasswordDto): Promise<ChangePasswordResponse> {
  return apiFetch<ChangePasswordResponse>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function logoutAll(): Promise<unknown> {
  return apiFetch<unknown>("/auth/logout-all", {
    method: "POST",
    credentials: "include",
  });
}

export async function enableEmailTwoFactor(): Promise<unknown> {
  return apiFetch<unknown>("/auth/2fa/email/enable", {
    method: "POST",
    credentials: "include",
  });
}

export async function setupAuthenticatorTwoFactor(): Promise<unknown> {
  return apiFetch<unknown>("/auth/2fa/authenticator/setup", {
    method: "POST",
    credentials: "include",
  });
}

export async function enableAuthenticatorTwoFactor(payload: EnableAuthenticator2FADto): Promise<unknown> {
  return apiFetch<unknown>("/auth/2fa/authenticator/enable", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function disableTwoFactor(payload: Disable2FADto): Promise<unknown> {
  return apiFetch<unknown>("/auth/2fa/disable", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function requestPasswordReset(payload: RequestPasswordResetDto): Promise<RequestPasswordResetResponse> {
  return apiFetch<RequestPasswordResetResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
  });
}

export async function confirmPasswordReset(payload: ConfirmPasswordResetDto): Promise<ConfirmPasswordResetResponse> {
  return apiFetch<ConfirmPasswordResetResponse>("/auth/confirm-password", {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
  });
}
