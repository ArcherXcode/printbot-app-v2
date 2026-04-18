import { z } from "zod";

import type { UserRole, VendorStatus } from "@/lib/store/auth-store";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type LoginDto = z.infer<typeof loginSchema>;

export type AuthUserSummary = {
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
  two_factor_method?: TwoFactorMethod;
};

export type AuthTokens = {
  access_token: string;
  refresh_token?: string;
  user?: AuthUserSummary;
};

export type SignupRegistrationResponse = {
  user_id: string;
  vendor_id?: string;
  status?: string;
};

export type TwoFactorMethod = "off" | "email_totp" | "authenticator";

export type LoginTwoFactorChallenge = {
  requires_2fa: true;
  is_2fa_enabled: true;
  two_factor_method: Exclude<TwoFactorMethod, "off">;
  method: Exclude<TwoFactorMethod, "off">;
  challenge_id: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type LoginResponse = AuthTokens | LoginTwoFactorChallenge | ApiResponse<AuthTokens | LoginTwoFactorChallenge>;

export const verifyTwoFactorSchema = z.object({
  challenge_id: z.string().min(1, "Challenge id is required."),
  code: z.string().min(6, "TOTP code is required."),
});

export type VerifyTwoFactorDto = z.infer<typeof verifyTwoFactorSchema>;

const signupUserBaseSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  middle_name: z.string().optional().or(z.literal("")),
  last_name: z.string().min(1, "Last name is required."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Provide a valid email address."),
  phone: z.string().min(8, "Phone is required."),
  address: z.string().min(3, "Address is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  pincode: z.string().min(4, "Pincode is required."),
  country: z.string().min(2, "Country is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirm_password: z.string().min(8, "Confirm password must be at least 8 characters."),
});

export const signupUserSchema = signupUserBaseSchema.refine((values) => values.password === values.confirm_password, {
  path: ["confirm_password"],
  message: "Passwords do not match.",
});

export type SignupUserDto = z.infer<typeof signupUserSchema>;
export type SignupUserPayload = Omit<SignupUserDto, "confirm_password">;

export const signupVendorSchema = signupUserBaseSchema.extend({
  business_legal_name: z.string().min(2, "Business legal name is required."),
  email_legal: z.string().email("Provide a valid legal email."),
  email_contact: z.string().email("Provide a valid contact email."),
  phone_legal: z.string().min(8, "Legal phone is required."),
  phone_contact: z.string().min(8, "Contact phone is required."),
  bank_ifsc_code: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i, "Invalid IFSC format (e.g. SBIN0001234)."),
  bank_swift_code: z.string().optional().or(z.literal("")).refine((value) => !value || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(value), "Invalid SWIFT format (8 or 11 characters)." ),
  bank_account_number: z.string().min(6, "Account number is required."),
  bank_account_holder_name: z.string().min(2, "Account holder name is required."),
  bank_branch_address: z.string().min(3, "Bank branch address is required."),
  address_line_1: z.string().min(3, "Address line 1 is required."),
  address_line_2: z.string().optional().or(z.literal("")),
  latitude: z.string().min(1, "Location latitude is required."),
  longitude: z.string().min(1, "Location longitude is required."),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5).", ),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. AAAAA0000A).", ),
}).refine((values) => values.password === values.confirm_password, {
  path: ["confirm_password"],
  message: "Passwords do not match.",
});

export type SignupVendorDto = z.infer<typeof signupVendorSchema>;
export type SignupVendorPayload = Omit<SignupVendorDto, "confirm_password">;

// Left primarily for structural representation, payload is empty
export type RefreshDto = Record<string, never>;

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Provide a valid email address."),
});

export type RequestPasswordResetDto = z.infer<typeof requestPasswordResetSchema>;

const confirmPasswordResetBaseSchema = z.object({
  email: z.string().email("Provide a valid account email."),
  code: z.string().min(4, "Reset code is required."),
  password: z.string().min(8, "New password must be at least 8 characters."),
  confirm_password: z.string().min(8, "Confirm password must be at least 8 characters."),
});

export const confirmPasswordResetSchema = confirmPasswordResetBaseSchema.refine(
  (values) => values.password === values.confirm_password,
  {
    path: ["confirm_password"],
    message: "Passwords do not match.",
  },
);

export type ConfirmPasswordResetDto = z.infer<typeof confirmPasswordResetSchema>;

export type RequestPasswordResetResponse = {
  code_sent: boolean;
  message: string;
  email: string;
};

export type ConfirmPasswordResetResponse = {
  reset: boolean;
  message: string;
  email: string;
};

const changePasswordBaseSchema = z.object({
  current_password: z.string().min(8, "Current password must be at least 8 characters."),
  new_password: z.string().min(8, "New password must be at least 8 characters."),
  confirm_password: z.string().min(8, "Confirm password must be at least 8 characters."),
});

export const changePasswordSchema = changePasswordBaseSchema.refine(
  (values) => values.new_password === values.confirm_password,
  {
    path: ["confirm_password"],
    message: "Passwords do not match.",
  },
);

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

export type ChangePasswordResponse = {
  changed: boolean;
  access_token?: string;
};

export const enableAuthenticator2FASchema = z.object({
  code: z.string().min(6, "TOTP code is required."),
});
export type EnableAuthenticator2FADto = z.infer<typeof enableAuthenticator2FASchema>;

export const disable2FASchema = z.object({
  password: z.string().min(8, "Password is required to disable 2FA."),
});
export type Disable2FADto = z.infer<typeof disable2FASchema>;

export type TwoFactorSetupResponse = {
  success: boolean;
  data: Record<string, unknown>;
};

export function deriveRoleFromToken(accessToken: string): UserRole {
  try {
    const payloadPart = accessToken.split(".")[1];

    if (!payloadPart) {
      return "USER";
    }

    const decoded = JSON.parse(atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))) as {
      role?: string;
      user_role?: string;
      roles?: string[];
    };

    const candidate = decoded.role ?? decoded.user_role ?? decoded.roles?.[0];

    if (candidate === "ADMIN" || candidate === "VENDOR" || candidate === "USER") {
      return candidate;
    }

    return "USER";
  } catch {
    return "USER";
  }
}

export function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
  return typeof data === "object" && data !== null &&
    typeof (data as Record<string, unknown>).success === "boolean" &&
    "data" in (data as Record<string, unknown>);
}

export function unwrapLoginResponse(data: LoginResponse): AuthTokens | LoginTwoFactorChallenge {
  return isApiResponse<LoginTwoFactorChallenge | AuthTokens>(data)
    ? data.data
    : data;
}

export function isTwoFactorChallenge(data: LoginResponse): data is LoginTwoFactorChallenge {
  const payload = unwrapLoginResponse(data);
  return typeof (payload as LoginTwoFactorChallenge).challenge_id === "string" &&
    (payload as LoginTwoFactorChallenge).requires_2fa === true;
}
