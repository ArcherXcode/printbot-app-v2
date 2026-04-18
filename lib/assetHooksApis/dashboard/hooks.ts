import { useQuery } from "@tanstack/react-query";

import { normalizeApiError } from "@/lib/api/error-map";
import type { PaginatedResponse } from "@/lib/api/pagination";
import { authStore } from "@/lib/store/auth-store";
import { getNotificationHistory } from "../notifications/api";
import { getUserOrders, getUserPayments, UserProfile } from "../account/api";
import { getMe } from "../account/api";

type SectionResult<T> = {
  data: T;
  available: boolean;
};

type UserDashboardData = {
  profile: Awaited<ReturnType<typeof getMe>> | null;
  orders: Awaited<ReturnType<typeof getUserOrders>>;
  payments: Awaited<ReturnType<typeof getUserPayments>>;
  notifications: Awaited<ReturnType<typeof getNotificationHistory>>;
  availability: {
    profile: boolean;
    orders: boolean;
    payments: boolean;
    notifications: boolean;
  };
};

async function loadSection<T>(request: () => Promise<T>, fallback: T): Promise<SectionResult<T>> {
  try {
    return {
      data: await request(),
      available: true,
    };
  } catch (error) {
    const mapped = normalizeApiError(error);

    if (mapped.code === "HTTP_403" || mapped.code === "HTTP_404") {
      return {
        data: fallback,
        available: false,
      };
    }

    throw error;
  }
}

export function useUserDashboard() {
  return useQuery({
    queryKey: ["dashboard", "user"],
    queryFn: async (): Promise<UserDashboardData> => {
      const sessionUser = authStore.getState().user;
      const profileFallback: UserProfile | null = sessionUser
    ? ({
        id: sessionUser.id,
        username: sessionUser.username,
        first_name: sessionUser.first_name,
        middle_name: sessionUser.middle_name ?? undefined,
        last_name: sessionUser.last_name,
        email: sessionUser.email,
        phone: sessionUser.phone,
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        vendor: (sessionUser as any).vendor ?? null,
      } as UserProfile)
    : null;

      const [profile, orders, payments, notifications] = await Promise.all([
        loadSection(() => getMe(), profileFallback),
        loadSection(() => getUserOrders(), { page: 1, limit: 20, total: 0, items: [] } as PaginatedResponse<Record<string, unknown>>),
        loadSection(() => getUserPayments(), { page: 1, limit: 20, total: 0, items: [] } as PaginatedResponse<Record<string, unknown>>),
        loadSection(() => getNotificationHistory(), { page: 1, limit: 20, total: 0, items: [] } as PaginatedResponse<Record<string, unknown>>),
      ]);

      return {
        profile: profile.data,
        orders: orders.data,
        payments: payments.data,
        notifications: notifications.data,
        availability: {
          profile: profile.available,
          orders: orders.available,
          payments: payments.available,
          notifications: notifications.available,
        },
      };
    },
  });
}
