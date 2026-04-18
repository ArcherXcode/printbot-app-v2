import { apiFetch } from "@/lib/api/client";

export type VendorQueueItem = Record<string, unknown>;
export type VendorQueueMetrics = Record<string, unknown>;

export type VendorQueueFilters = {
  status?: "waiting" | "processing" | "completed";
  order_id?: string;
  from?: string;
  to?: string;
  sort?: "position_asc" | "position_desc" | "created_at_asc" | "created_at_desc";
  page?: string;
  limit?: string;
};

export type VendorQueueResponse = {
  items: VendorQueueItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

function toQueryString(filters: VendorQueueFilters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.append(key, String(value));
    }
  });

  return params.toString() ? `?${params.toString()}` : "";
}

export function getVendorQueue(filters: VendorQueueFilters = {}) {
  const query = toQueryString(filters);
  return apiFetch<VendorQueueResponse>(`/vendor/queue${query}`);
}

export function getVendorQueueMetrics() {
  return apiFetch<VendorQueueMetrics>("/vendor/queue/metrics");
}
