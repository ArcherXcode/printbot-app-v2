import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "@/lib/query/query-client";
import { POLLING } from "@/lib/constants/runtime";
import {
  deleteAllNotifications,
  deleteNotification,
  getNotificationHistory,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationFilters,
} from "./api";

export function useNotificationHistory(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: ["notifications", "history", filters],
    queryFn: () => getNotificationHistory(filters),
    // Poll notifications frequently so the UI stays up to date.
    refetchInterval: POLLING.operationalMs,
    refetchIntervalInBackground: false,
  });
}

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", "history"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", "history"] });
    },
  });
}

export function useDeleteNotification() {
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", "history"] });
    },
  });
}

export function useDeleteAllNotifications() {
  return useMutation({
    mutationFn: () => deleteAllNotifications(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications", "history"] });
    },
  });
}
