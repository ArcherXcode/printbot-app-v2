import { apiFetch } from "@/lib/api/client";
import { toPaginatedResponse, type PaginatedResponse } from "@/lib/api/pagination";

export type VendorInfo = {
  id: string;
  user_id: string;
  business_legal_name: string;
  email_contact: string;
  phone_contact: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  status: "approved" | "pending" | "rejected";
  is_open: 0 | 1;
  opening_time: string | null;
  closing_time: string | null;
  rating: number;
  total_orders: number;
  gstin: string;
  created_at: string; // or Date
  updated_at: string | null;
};

export type UserProfile = {
  id: string;
  username: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  profile_image_url?: string | null;
  vendor: VendorInfo | null;
};

export type UserOrderSummary = Record<string, unknown>;
export type UserOrderFilters = {
  user_id?: string;
  status?: string;
  page?: string;
  limit?: string;
};
export type UserPaymentSummary = Record<string, unknown>;
export type UserPaymentsResponse = PaginatedResponse<UserPaymentSummary>;

export type UserPaymentFilters = {
  user_id?: string;
  vendor_id?: string;
  status?: string;
  page?: string;
  limit?: string;
  from?: string;
  to?: string;
  min_amount?: string;
  max_amount?: string;
};

export type UpdateUserPayload = Partial<
  Pick<
    UserProfile,
    "first_name" | "middle_name" | "last_name" | "phone" | "address" | "city" | "state" | "pincode" | "country"
  >
>;

export function getMe() {
  return apiFetch<UserProfile>("/users/me");
}

export function updateMe(payload: UpdateUserPayload | FormData) {
  return apiFetch<UserProfile>("/users/me", {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
}

export function getUserOrders(filters: UserOrderFilters = {}) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return apiFetch<UserOrderSummary[] | PaginatedResponse<UserOrderSummary>>(`/users/orders${queryString ? `?${queryString}` : ""}`).then(
    toPaginatedResponse,
  );
}

export function getUserPayments() {
  return getUserPaymentsWithFilters();
}

export function getUserPaymentsWithFilters(filters: UserPaymentFilters = {}) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return apiFetch<UserPaymentsResponse | UserPaymentSummary[]>(`/users/payments${queryString ? `?${queryString}` : ""}`).then(
    toPaginatedResponse,
  );
}
