import { apiFetch } from "@/lib/api/client";
import { toPaginatedResponse, type PaginatedResponse } from "@/lib/api/pagination";

export type NotificationRecord = Record<string, unknown>;
export type NotificationHistoryResponse = PaginatedResponse<NotificationRecord>;

export type NotificationFilters = {
  user_id?: string;
  type?: string;
  status?: string;
  unread_only?: "true" | "false";
  page?: string;
  limit?: string;
  from?: string;
  to?: string;
};

function toQueryString(filters: NotificationFilters) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export function getNotificationHistory(filters: NotificationFilters = {}) {
  const query = toQueryString(filters);
  return apiFetch<NotificationRecord[] | NotificationHistoryResponse>(`/notifications/history${query ? `?${query}` : ""}`).then(
    toPaginatedResponse,
  );
}

export function getNotificationById(notificationId: string) {
  return apiFetch<NotificationRecord>(`/notifications/${notificationId}`);
}

export function markNotificationRead(notificationId: string) {
  return apiFetch<Record<string, unknown>>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsRead() {
  return apiFetch<Record<string, unknown>>("/notifications/read-all", {
    method: "PATCH",
  });
}

export function deleteNotification(notificationId: string) {
  return apiFetch<Record<string, unknown>>(`/notifications/${notificationId}`, {
    method: "DELETE",
  });
}

export function deleteAllNotifications() {
  return apiFetch<Record<string, unknown>>("/notifications", {
    method: "DELETE",
  });
}
