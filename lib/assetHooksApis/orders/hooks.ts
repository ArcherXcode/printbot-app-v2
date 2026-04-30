import { useMutation, useQuery } from "@tanstack/react-query";

import { normalizeApiError } from "@/lib/api/error-map";
import { POLLING } from "@/lib/constants/runtime";
import { queryClient } from "@/lib/query/query-client";
import {
  acceptVendorOrder,
  getOrderById,
  getOrderHistory,
  getVendorOrdersWithFilters,
  markReadyVendorOrder,
  startPrintVendorOrder,
  type OrderHistoryFilters,
  verifyOrderOtp,
} from "./api";

export function useOrderHistory(filters: OrderHistoryFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ["orders", "history", filters],
    queryFn: () => getOrderHistory(filters),
    enabled,
    retry: (failureCount, error) => {
      const mapped = normalizeApiError(error);
      if (mapped.code === "HTTP_403" || mapped.code === "HTTP_404") {
        return false;
      }

      return failureCount < 2;
    },
  });
}

export function useOrderById(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrderById(orderId),
    enabled: orderId.length > 0,
  });
}

export function useVerifyOrderOtp() {
  return useMutation({
    mutationFn: ({ orderId, otp }: { orderId: string; otp: string }) => verifyOrderOtp(orderId, otp),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["orders", "history"] });
      void queryClient.invalidateQueries({ queryKey: ["orders", variables.orderId] });
    },
  });
}

export function useVendorOrders() {
  return useVendorOrdersWithFilters();
}

export function useVendorOrdersWithFilters(filters: OrderHistoryFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ["orders", "vendor", "list", filters],
    queryFn: () => getVendorOrdersWithFilters(filters),
    enabled,
    // Vendor orders should not poll automatically; explicit refresh is provided
    // by the UI via the pagination refresh button.
    placeholderData: (previousData) => previousData,
  });
}

function invalidateVendorOrderDependencies(orderId: string) {
  void queryClient.invalidateQueries({ queryKey: ["orders", "vendor", "list"] });
  void queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
  void queryClient.invalidateQueries({ queryKey: ["queue", "vendor", "list"] });
  void queryClient.invalidateQueries({ queryKey: ["queue", "vendor", "metrics"] });
  void queryClient.invalidateQueries({ queryKey: ["dashboard", "vendor"] });
}

export function useAcceptVendorOrder() {
  return useMutation({
    mutationFn: (orderId: string) => acceptVendorOrder(orderId),
    onSuccess: (_, orderId) => {
      invalidateVendorOrderDependencies(orderId);
    },
  });
}

export function useStartPrintVendorOrder() {
  return useMutation({
    mutationFn: (orderId: string) => startPrintVendorOrder(orderId),
    onSuccess: (_, orderId) => {
      invalidateVendorOrderDependencies(orderId);
    },
  });
}

export function useMarkReadyVendorOrder() {
  return useMutation({
    mutationFn: (orderId: string) => markReadyVendorOrder(orderId),
    onSuccess: (_, orderId) => {
      invalidateVendorOrderDependencies(orderId);
    },
  });
}
