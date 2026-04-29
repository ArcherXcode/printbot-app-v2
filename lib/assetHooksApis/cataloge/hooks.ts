import { useMutation, useQuery } from "@tanstack/react-query";

import { normalizeApiError } from "@/lib/api/error-map";
import { CACHE } from "@/lib/constants/runtime";
import { queryClient } from "@/lib/query/query-client";
import {
  adjustMyStationeryStock,
  createMyStationeryItem,
  createVendorQuote,
  getMyVendorServiceOptions,
  getMyVendorServiceSettings,
  getVendorCatalogServices,
  getVendorDashboard,
  getVendorPricing,
  getVendorStationeryItems,
  getVendors,
  listMyStationeryItems,
  updateMyVendorServiceOptions,
  updateMyVendorServiceSettings,
  updateMyStationeryItem,
  updateMyVendorBusiness,
  updateVendorPricing,
  getServiceTemplates,
  updateCatalogGroup,
} from "./api";
import type {
  ServiceTemplates,
  VendorStationeryItem,
  VendorStationeryItemFilters,
  VendorServiceOptionPrice,
  VendorStationeryItemsResponse,
} from "./api";
import type { VendorListResponse, VendorPricing, VendorQueryParams, VendorQuotePayload } from "./api";
import type {
  AdjustVendorStationeryStockPayload,
  CreateVendorStationeryItemPayload,
  ServiceType,
  UpsertVendorServiceOptionsPayload,
  UpdateVendorServiceSettingsPayload,
  UpdateVendorStationeryItemPayload,
} from "./api";

export function useVendors(params: VendorQueryParams) {
  return useQuery({
    queryKey: ["vendors", "list", params],
    queryFn: async () => {
      try {
        return await getVendors(params);
      } catch (error) {
        const mapped = normalizeApiError(error);

        if (mapped.code === "HTTP_400" || mapped.code === "HTTP_403" || mapped.code === "HTTP_404") {
          return {
            page: 1,
            limit: 0,
            total: 0,
            items: [],
          } satisfies VendorListResponse;
        }

        throw error;
      }
    },
    staleTime: CACHE.defaultStaleMs,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      const mapped = normalizeApiError(error);
      if (mapped.code === "HTTP_400" || mapped.code === "HTTP_403" || mapped.code === "HTTP_404") {
        return false;
      }

      return failureCount < 2;
    },
  });
}

export function useVendorPricing() {
  return useQuery({
    queryKey: ["vendor", "pricing"],
    queryFn: getVendorPricing,
    staleTime: CACHE.stableStaleMs,
  });
}

export function useVendorDashboard() {
  return useQuery({
    queryKey: ["dashboard", "vendor"],
    queryFn: getVendorDashboard,
    staleTime: CACHE.defaultStaleMs,
  });
}

export function useUpdateVendorPricing() {
  return useMutation({
    mutationFn: (payload: VendorPricing) => updateVendorPricing(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor", "pricing"] });
    },
  });
}

export function useVendorCatalogServices(vendorId: string) {
  return useQuery({
    queryKey: ["vendors", vendorId, "catalog", "services"],
    queryFn: () => getVendorCatalogServices(vendorId),
    enabled: vendorId.length > 0,
    staleTime: CACHE.defaultStaleMs,
  });
}

export function useVendorStationeryItems(filters: VendorStationeryItemFilters = {}) {
  return useQuery<VendorStationeryItemsResponse>({
    queryKey: ["vendor", "catalog", "stationery", "mine", filters],
    queryFn: () => getVendorStationeryItems(filters),
    staleTime: CACHE.defaultStaleMs,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateVendorQuote(vendorId: string) {
  return useMutation({
    mutationFn: (payload: VendorQuotePayload) => createVendorQuote(vendorId, payload),
  });
}

export function useMyVendorServiceSettings() {
  return useQuery({
    queryKey: ["vendor", "catalog", "services", "mine"],
    queryFn: getMyVendorServiceSettings,
    staleTime: CACHE.defaultStaleMs,
  });
}

export function useUpdateMyVendorServiceSettings() {
  return useMutation({
    mutationFn: (payload: UpdateVendorServiceSettingsPayload) => updateMyVendorServiceSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor", "catalog", "services", "mine"] });
    },
  });
}

export function useMyVendorServiceOptions(serviceType: ServiceType) {
  return useQuery({
    queryKey: ["vendor", "catalog", "services", serviceType, "options", "mine"],
    queryFn: () => getMyVendorServiceOptions(serviceType),
    enabled: serviceType.length > 0,
    staleTime: CACHE.defaultStaleMs,
  });
}

export function useUpdateMyVendorServiceOptions(serviceType: ServiceType) {
  return useMutation({
    mutationFn: (payload: UpsertVendorServiceOptionsPayload) => updateMyVendorServiceOptions(serviceType, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor", "catalog", "services", serviceType, "options", "mine"] });
      void queryClient.invalidateQueries({ queryKey: ["vendor", "catalog", "services", "mine"] });
    },
  });
}

export function useMyStationeryItems() {
  return useQuery<VendorStationeryItem[] | VendorStationeryItemsResponse>({
    queryKey: ["vendor", "catalog", "stationery", "mine"],
    queryFn: listMyStationeryItems,
    staleTime: CACHE.defaultStaleMs,
  });
}

export function useServiceTemplates() {
  return useQuery({
    queryKey: ["vendor", "catalog", "templates"],
    queryFn: getServiceTemplates,
    staleTime: CACHE.stableStaleMs,
  });
}

export function useUpdateCatalogGroup() {
  return useMutation({
    mutationFn: ({ group, payload }: { group: string; payload: VendorServiceOptionPrice[] }) =>
      updateCatalogGroup(group, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor", "catalog", "templates"] });
    },
  });
}

export function useCreateMyStationeryItem() {
  return useMutation({
    mutationFn: (payload: CreateVendorStationeryItemPayload | FormData) => createMyStationeryItem(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor", "catalog", "stationery", "mine"] });
    },
  });
}

export function useUpdateMyStationeryItem() {
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateVendorStationeryItemPayload | FormData }) =>
      updateMyStationeryItem(itemId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor", "catalog", "stationery", "mine"] });
    },
  });
}

export function useAdjustMyStationeryStock() {
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: AdjustVendorStationeryStockPayload }) =>
      adjustMyStationeryStock(itemId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["vendor", "catalog", "stationery", "mine"] });
    },
  });
}

export function useUpdateMyVendorBusiness() {
  return useMutation({
    mutationFn: (payload: { business_legal_name?: string; opening_time?: string | null; closing_time?: string | null }) =>
      updateMyVendorBusiness(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
}
