import type { SessionUser, UserRole, VendorStatus } from "@/lib/store/auth-store";

export function normalizeVendorStatus(status?: string | null): VendorStatus | null {
  if (!status) {
    return null;
  }

  const normalized = status.toLowerCase();
  if (normalized === "approved" || normalized === "pending" || normalized === "rejected") {
    return normalized;
  }

  return null;
}

export function isVendorAccessBlocked(status?: string | null): boolean {
  const normalized = normalizeVendorStatus(status);
  return normalized === "pending" || normalized === "rejected";
}

export function defaultRouteForRole(role: UserRole | null, user?: SessionUser | null): string {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }

  if (role === "VENDOR") {
    if (isVendorAccessBlocked(user?.vendor_status)) {
      return "/vendor/status";
    }
    return "/vendor/dashboard";
  }

  return "/app/dashboard";
}
