import { apiFetch } from "@/lib/api/client";
import { toPaginatedResponse, type PaginatedResponse } from "@/lib/api/pagination";

export type OrderRecord = Record<string, unknown>;
export type OrderHistoryFilters = {
  user_id?: string;
  status?: string;
  page?: string;
  limit?: string;
};
export type OrderHistoryResponse = PaginatedResponse<OrderRecord>;

function toQueryString(filters: OrderHistoryFilters) {
  return Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
}

export function getOrderById(orderId: string) {
  return apiFetch<OrderRecord>(`/orders/${orderId}`);
}

export function getOrderHistory(filters: OrderHistoryFilters = {}) {
  const query = toQueryString(filters);
  return apiFetch<OrderRecord[] | OrderHistoryResponse>(`/orders/history${query ? `?${query}` : ""}`).then(toPaginatedResponse);
}

export function verifyOrderOtp(orderId: string, otp: string) {
  return apiFetch<Record<string, unknown>>(`/orders/${orderId}/verify-otp`, {
    method: "POST",
    body: JSON.stringify({ otp }),
  });
}

export function getVendorOrders() {
  return getVendorOrdersWithFilters();
}

export function getVendorOrdersWithFilters(filters: OrderHistoryFilters = {}) {
  const query = toQueryString(filters);
  return apiFetch<OrderRecord[] | OrderHistoryResponse>(`/vendor/orders${query ? `?${query}` : ""}`).then(toPaginatedResponse);
}

export function acceptVendorOrder(orderId: string) {
  return apiFetch<Record<string, unknown>>(`/vendor/orders/${orderId}/accept`, {
    method: "POST",
  });
}

export function startPrintVendorOrder(orderId: string) {
  return apiFetch<Record<string, unknown>>(`/vendor/orders/${orderId}/start-print`, {
    method: "POST",
  });
}

export function markReadyVendorOrder(orderId: string) {
  return apiFetch<Record<string, unknown>>(`/vendor/orders/${orderId}/mark-ready`, {
    method: "POST",
  });
}
