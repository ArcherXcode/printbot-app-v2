import { apiFetch } from "@/lib/api/client";
import { toPaginatedResponse, type PaginatedResponse } from "@/lib/api/pagination";

export type VendorListItem = Record<string, unknown>;
export type VendorListResponse = PaginatedResponse<VendorListItem>;
export type ServiceType =
  | "NORMAL_PRINT"
  | "ARCHITECTURAL_DESIGN_PRINT"
  | "PASSPORT_PHOTOS"
  | "STATIONERY_ITEMS"
  | "HARD_BINDING";

export type VendorQueryParams = {
  lat?: number;
  lng?: number;
  radius?: string;
  radius_km?: number;
  sort?: string;
  page?: string;
  limit?: string;
  min_rating?: string;
  is_open?: "true" | "false";
  q?: string;
};

export type VendorPricing = {
  page_bw_price: number;
  page_color_price: number;
  image_price: number;
};

export type DashboardDailyPoint = {
  date: string;
  count: number;
};

export type DashboardRevenuePoint = {
  date: string;
  amount: number;
};

export type DashboardHourlyPoint = {
  hour: number;
  count: number;
};

export type DashboardStatusPoint = {
  status: string;
  count: number;
};

export type VendorDashboardSummary = {
  today_orders: number;
  monthly_orders: number;
  new_orders_count: number;
  processed_orders_count: number;
  accepted_orders_count: number;
  completed_orders_count: number;
  total_orders: number;
  today_revenue: number;
  monthly_revenue: number;
  queue_waiting: number;
  queue_processing: number;
};

export type VendorDashboardGraphs = {
  orders_last_30_days: DashboardDailyPoint[];
  revenue_last_30_days: DashboardRevenuePoint[];
  orders_today_by_hour: DashboardHourlyPoint[];
  orders_by_status: DashboardStatusPoint[];
};

export type VendorDashboardResponse = {
  summary: VendorDashboardSummary;
  graphs: VendorDashboardGraphs;
};

export type VendorServiceInfo = {
  service_type: ServiceType;
  is_enabled: boolean;
  options?: Array<{
    option_group: string;
    option_key: string;
    unit_price: number;
    metadata?: Record<string, unknown>;
  }>;
};

export type VendorServiceSetting = {
  service_type: ServiceType;
  is_enabled: boolean;
};

export type UpdateVendorBusinessPayload = {
  business_legal_name?: string;
  opening_time?: string | null;
  closing_time?: string | null;
};

export type UpdateVendorServiceSettingsPayload = {
  services: VendorServiceSetting[];
};

export type VendorServiceOptionPrice = {
  option_group: string;
  option_key: string;
  unit_price: number;
  metadata?: Record<string, unknown>;
};

export type CatalogItem = {
  key: string;
  label: string;
  prices: Record<string, number>;
  metadata?: Record<string, unknown>;
};

export type CatalogGroup = {
  group: string;
  label: string;
  config?: Record<string, unknown>;
  items: CatalogItem[];
};

export type ServiceTemplates = CatalogGroup[];

export type UpsertVendorServiceOptionsPayload = {
  options: VendorServiceOptionPrice[];
};

export type StationeryCategory = "FILE" | "PEN" | "COPY" | "REGISTER" | "OTHER";

export type VendorStationeryItem = {
  id: string;
  category: StationeryCategory;
  name: string;
  photo_url?: string;
  unit_price: number;
  stock_qty: number;
  is_active: boolean;
};

export type VendorStationeryItemFilters = {
  page?: string;
  limit?: string;
  active_only?: "true" | "false";
  category?: StationeryCategory;
};

export type VendorStationeryItemsResponse = PaginatedResponse<VendorStationeryItem>;

export type CreateVendorStationeryItemPayload = {
  category: StationeryCategory;
  name: string;
  photo_url?: string;
  unit_price: number;
  stock_qty: number;
  is_active?: boolean;
};

export type UpdateVendorStationeryItemPayload = Partial<CreateVendorStationeryItemPayload>;

export type AdjustVendorStationeryStockPayload = {
  delta: number;
  reason?: string;
};

export type QuoteStationeryItem = {
  item_id: string;
  quantity: number;
};

export type VendorQuotePayload = {
  service_type: ServiceType;
  color?: string;
  copies?: number;
  binding_type?: string;
  page_size?: string;
  passport_sets?: number;
  paper_type?: string;
  cover_color?: string;
  golden_border?: boolean;
  stationery_items?: QuoteStationeryItem[];
};

export function getVendors(params: VendorQueryParams) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();

  return apiFetch<VendorListItem[] | VendorListResponse>(`/vendors${queryString ? `?${queryString}` : ""}`).then(toPaginatedResponse);
}

export function getVendorPricing() {
  return apiFetch<VendorPricing>("/vendor/pricing");
}

export function updateVendorPricing(payload: VendorPricing) {
  return apiFetch<VendorPricing>("/vendor/pricing", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getVendorDashboard() {
  return apiFetch<VendorDashboardResponse>("/vendor/dashboard");
}

export function getMyVendorServiceSettings() {
  return apiFetch<VendorServiceSetting[]>("/vendor/catalog/services");
}

export function updateMyVendorServiceSettings(payload: UpdateVendorServiceSettingsPayload) {
  // Ensure is_enabled values are boolean (API validation requires boolean type).
  const normalized = {
    services: (payload.services ?? []).map((s) => ({
      ...s,
      is_enabled: Boolean((s as Record<string, unknown>).is_enabled),
    })),
  } satisfies UpdateVendorServiceSettingsPayload;

  return apiFetch<VendorServiceSetting[]>("/vendor/catalog/services", {
    method: "PUT",
    body: JSON.stringify(normalized),
  });
}

export function getMyVendorServiceOptions(serviceType: ServiceType) {
  return apiFetch<VendorServiceOptionPrice[]>(`/vendor/catalog/services/${serviceType}/options`);
}

export function updateMyVendorServiceOptions(serviceType: ServiceType, payload: UpsertVendorServiceOptionsPayload) {
  return apiFetch<VendorServiceOptionPrice[]>(`/vendor/catalog/services/${serviceType}/options`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getVendorCatalogServices(vendorId: string) {
  return apiFetch<VendorServiceInfo[]>(`/vendors/${vendorId}/catalog/services`);
}

export function getServiceTemplates() {
  return apiFetch<ServiceTemplates>(`/vendor/catalog/templates`);
}

export function updateCatalogGroup(group: string, payload: VendorServiceOptionPrice[]) {
  return apiFetch<VendorServiceOptionPrice[]>(`/vendor/catalog/templates/${group}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getVendorStationeryItems(filters: VendorStationeryItemFilters = {}) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return apiFetch<VendorStationeryItemsResponse>(`/vendor/catalog/stationery/items${queryString ? `?${queryString}` : ""}`).then(
    toPaginatedResponse,
  );
}

export function createVendorQuote(vendorId: string, payload: VendorQuotePayload) {
  return apiFetch<Record<string, unknown>>(`/vendors/${vendorId}/catalog/quote`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listMyStationeryItems() {
  return apiFetch<VendorStationeryItem[]>("/vendor/catalog/stationery/items");
}

export function createMyStationeryItem(payload: CreateVendorStationeryItemPayload | FormData) {
  return apiFetch<Record<string, unknown>>("/vendor/catalog/stationery/items", {
    method: "POST",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
}

export function updateMyStationeryItem(itemId: string, payload: UpdateVendorStationeryItemPayload | FormData) {
  return apiFetch<Record<string, unknown>>(`/vendor/catalog/stationery/items/${itemId}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
  });
}

export function adjustMyStationeryStock(itemId: string, payload: AdjustVendorStationeryStockPayload) {
  return apiFetch<Record<string, unknown>>(`/vendor/catalog/stationery/items/${itemId}/stock`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMyVendorBusiness(payload: UpdateVendorBusinessPayload) {
  return apiFetch<Record<string, unknown>>(`/vendor`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
