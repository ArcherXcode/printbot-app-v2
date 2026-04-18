import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "@/lib/query/query-client";
import { createPayment, getPaymentStatus, getVendorPayments, refundPayment } from "./api";
import type { CreatePaymentDto, PaymentHistoryFilters } from "./api";

export function useCreatePayment() {
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: CreatePaymentDto; idempotencyKey: string }) =>
      createPayment(payload, idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users", "payments"] });
    },
  });
}

export function usePaymentStatus(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ["payments", "status", orderId],
    queryFn: () => getPaymentStatus(orderId),
    enabled: enabled && orderId.length > 0,
    refetchInterval: 5000,
  });
}

export function useRefundPayment() {
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) => refundPayment(orderId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users", "payments"] });
    },
  });
}

export function useVendorPayments(filters: PaymentHistoryFilters = {}) {
  return useQuery({
    queryKey: ["payments", "vendor", "history", filters],
    queryFn: () => getVendorPayments(filters),
  });
}
