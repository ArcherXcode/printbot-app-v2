import { useMutation, useQuery } from "@tanstack/react-query";

import { normalizeApiError } from "@/lib/api/error-map";
import { queryClient } from "@/lib/query/query-client";
import { getMe, getUserOrders, getUserPayments, getUserPaymentsWithFilters, updateMe } from "./api";
import type { UpdateUserPayload, UserPaymentFilters } from "./api";

function shouldRetryQuery(error: unknown, failureCount: number): boolean {
  const mapped = normalizeApiError(error);
  if (mapped.code === "HTTP_403" || mapped.code === "HTTP_404") {
    return false;
  }

  return failureCount < 2;
}

export function useMe() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: getMe,
    retry: (failureCount, error) => shouldRetryQuery(error, failureCount),
  });
}

export function useUpdateMe() {
  return useMutation({
    mutationFn: (payload: UpdateUserPayload | FormData) => updateMe(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
}

export function useUserOrders() {
  return useQuery({
    queryKey: ["users", "orders"],
    queryFn: () => getUserOrders(),
    retry: (failureCount, error) => shouldRetryQuery(error, failureCount),
  });
}

export function useUserPayments(filters?: UserPaymentFilters) {
  return useQuery({
    queryKey: ["users", "payments", filters ?? {}],
    queryFn: () => (filters ? getUserPaymentsWithFilters(filters) : getUserPayments()),
    retry: (failureCount, error) => shouldRetryQuery(error, failureCount),
  });
}
