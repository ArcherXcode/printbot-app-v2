import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/pagination";

export type SupportTicket = {
  id: string;
  user_id: string;
  user_name?: string;
  vendor_id?: string;
  vendor_name?: string;
  order_id?: string;
  payment_id?: string;
  category: SupportCategory;
  subcategory: string;
  priority: SupportPriority;
  status: SupportTicketStatus;
  subject?: string;
  message: string;
  created_at: string;
  updated_at: string;
  replies?: Array<{
    id: string;
    user_id: string;
    user_name: string;
    message: string;
    created_at: string;
  }>;
};

export type SupportCategory =
  | "print_quality"
  | "payment_refund"
  | "vendor_service"
  | "delivery_pickup"
  | "technical_issue"
  | "other";

export type SupportPriority = "low" | "medium" | "high" | "critical";

export type SupportTicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed" | "reopened";

export type CreateSupportTicketPayload = {
  order_id?: string;
  payment_id?: string;
  category: SupportCategory;
  subcategory: string;
  priority?: SupportPriority;
  subject?: string;
  message: string;
};

export type UpdateSupportTicketStatusPayload = {
  status: SupportTicketStatus;
  note?: string;
};

export type GetSupportTicketsParams = {
  page?: number;
  limit?: number;
  status?: string;
};

export function getSupportTickets(params?: GetSupportTicketsParams) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.status) query.append("status", params.status);
  
  const queryString = query.toString();
  const endpoint = queryString ? `/support/tickets?${queryString}` : "/support/tickets";
  
  return apiFetch<PaginatedResponse<SupportTicket>>(endpoint);
}

export function getSupportTicketById(ticketId: string) {
  return apiFetch<SupportTicket>(`/support/tickets/${ticketId}`);
}

export function createSupportTicket(payload: CreateSupportTicketPayload) {
  return apiFetch<SupportTicket>("/support/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function replySupportTicket(ticketId: string, message: string) {
  return apiFetch<SupportTicket>(`/support/tickets/${ticketId}/reply`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function updateSupportTicketStatus(ticketId: string, payload: UpdateSupportTicketStatusPayload) {
  return apiFetch<SupportTicket>(`/support/tickets/${ticketId}/status`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
