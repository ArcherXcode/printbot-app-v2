import { apiFetch } from "@/lib/api/client";
import { toPaginatedResponse, type PaginatedResponse } from "@/lib/api/pagination";
import type { ServiceType } from "../cataloge/api";

export type PaymentFileSettingsDto = {
  file_id: string;
  type: "document" | "image";
  settings: Record<string, unknown>;
};

export type CreatePaymentDto = {
  vendor_id: string;
  service_type?: ServiceType;
  files?: PaymentFileSettingsDto[];
  customizations?: Record<string, unknown>;
  stationery_items?: Array<{
    item_id: string;
    quantity: number;
  }>;
};

export type PaymentStatus = Record<string, unknown>;

export type PaymentHistoryFilters = {
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

function toQueryString(filters: PaymentHistoryFilters) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export function createPayment(payload: CreatePaymentDto, idempotencyKey: string) {
  return apiFetch<Record<string, unknown>>(
    "/payments/create",
    {
      method: "POST",
      headers: {
        "idempotency-key": idempotencyKey,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    },
  );
}

export function getPaymentStatus(orderId: string) {
  return apiFetch<PaymentStatus>(`/payments/${orderId}`);
}

export function getVendorPayments(filters: PaymentHistoryFilters = {}) {
  const query = toQueryString(filters);
  return apiFetch<Record<string, unknown>[] | PaginatedResponse<Record<string, unknown>>>(
    `/vendor/payments${query ? `?${query}` : ""}`,
  ).then(toPaginatedResponse);
}

export function refundPayment(orderId: string, reason: string) {
  return apiFetch<Record<string, unknown>>(`/payments/${orderId}/refund`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
