import { useMutation, useQuery } from "@tanstack/react-query";

import { normalizeApiError } from "@/lib/api/error-map";
import { CACHE } from "@/lib/constants/runtime";
import { queryClient } from "@/lib/query/query-client";
import {
  createSupportTicket,
  getSupportTicketById,
  getSupportTickets,
  replySupportTicket,
  updateSupportTicketStatus,
  type CreateSupportTicketPayload,
  type UpdateSupportTicketStatusPayload,
} from "./api";

export function useSupportTickets(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["support", "tickets", params],
    queryFn: () => getSupportTickets(params),
    staleTime: CACHE.defaultStaleMs,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      const mapped = normalizeApiError(error);
      if (mapped.code === "HTTP_403" || mapped.code === "HTTP_404") {
        return false;
      }

      return failureCount < 2;
    },
  });
}

export function useSupportTicketById(ticketId: string) {
  return useQuery({
    queryKey: ["support", "tickets", ticketId],
    queryFn: () => getSupportTicketById(ticketId),
    enabled: ticketId.length > 0,
  });
}

export function useCreateSupportTicket() {
  return useMutation({
    mutationFn: (payload: CreateSupportTicketPayload) => createSupportTicket(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
    },
  });
}

export function useReplySupportTicket() {
  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) => replySupportTicket(ticketId, message),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
      void queryClient.invalidateQueries({ queryKey: ["support", "tickets", variables.ticketId] });
    },
  });
}

export function useUpdateSupportTicketStatus() {
  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: UpdateSupportTicketStatusPayload }) =>
      updateSupportTicketStatus(ticketId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["support", "tickets"] });
      void queryClient.invalidateQueries({ queryKey: ["support", "tickets", variables.ticketId] });
    },
  });
}
