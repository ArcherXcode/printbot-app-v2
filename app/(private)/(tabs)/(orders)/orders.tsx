import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Pressable, Modal, Animated, Easing, Platform, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  useAcceptVendorOrder,
  useMarkReadyVendorOrder,
  useOrderHistory,
  useStartPrintVendorOrder,
  useVendorOrdersWithFilters,
} from "@/lib/assetHooksApis/orders/hooks";
import PageState from "@/components/cards/PageState";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, Package } from "lucide-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

// --- Helpers ---
function asString(value: unknown, fallback = "-"): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function formatTimestamp(raw: string): string {
  if (!raw || raw === "-") return "-";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

// --- Custom Animated Bottom Sheet ---
function BottomSheet({
  open,
  onClose,
  onApply,
  onClear,
  title,
  children,
  colorScheme,
}: {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  title: string;
  children: React.ReactNode;
  colorScheme: "light" | "dark";
}) {
  const [sheetVisible, setSheetVisible] = useState(open);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    const listenerId = progress.addListener(() => {});
    return () => {
      progress.removeListener(listenerId);
    };
  }, [progress]);

  const animateTo = useCallback(
    (toValue: 0 | 1, onFinished?: () => void) => {
      Animated.timing(progress, {
        toValue,
        duration: toValue === 1 ? 260 : 210,
        easing: toValue === 1 ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onFinished?.();
        }
      });
    },
    [progress],
  );

  const closeSheet = useCallback(() => {
    animateTo(0, () => {
      setSheetVisible(false);
      onClose();
    });
  }, [animateTo, onClose]);

  const applyAndClose = useCallback(() => {
    animateTo(0, () => {
      setSheetVisible(false);
      onApply();
    });
  }, [animateTo, onApply]);

  useEffect(() => {
    if (open) {
      setSheetVisible(true);
      requestAnimationFrame(() => animateTo(1));
      return;
    }
    if (sheetVisible) {
      animateTo(0, () => setSheetVisible(false));
    }
  }, [animateTo, open, sheetVisible]);

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const sheetTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal visible={sheetVisible} animationType="none" transparent onRequestClose={closeSheet}>
      <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        <Animated.View
          style={[
            styles.filterSheet,
            {
              backgroundColor: colors[colorScheme].elevated,
              borderColor: colors[colorScheme].border,
              paddingBottom: 28,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: colors[colorScheme].textPrimary }]}>{title}</Text>
            <View style={[styles.filterHeaderActions, { gap: Platform.OS === "ios" ? 14 : 18 }]}>
              <Pressable onPress={onClear}>
                <MaterialIcons name="filter-list-off" size={24} color={colors[colorScheme].textPrimary} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={closeSheet}>
                <MaterialIcons name="close" size={24} color={colors[colorScheme].textPrimary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.sheetContent}>
            {children}
            <Pressable style={({ pressed }) => [styles.doneButton, { backgroundColor: colors[colorScheme].primary, opacity: pressed ? 0.82 : 1 }]} onPress={applyAndClose}>
              <Text style={styles.primaryButtonText}>Apply filters</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Printing", value: "printing" },
  { label: "Ready", value: "ready" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function OrdersScreen() {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";
  const theme = colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const role = useAuthStore((state) => state.role);
  const isVendor = role === "VENDOR";

  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [tempStatusFilters, setTempStatusFilters] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = "20";

  useEffect(() => {
    if (filtersOpen) {
      setTempStatusFilters(statusFilters);
    }
  }, [filtersOpen, statusFilters]);

  function mapStatusToApi(value: string) {
    const s = value?.toLowerCase?.() ?? "";
    switch (s) {
      case "pending": return "CREATED";
      case "accepted": return "ACCEPTED";
      case "printing": return "PRINTING";
      case "ready": return "READY";
      case "completed": return "COMPLETED";
      case "cancelled": return "EXPIRED";
      default: return value?.toUpperCase?.() ?? value;
    }
  }

  const userFilters = useMemo(
    () => ({
      status: statusFilters.length > 0 ? statusFilters.map(mapStatusToApi).join(",") : undefined,
      page: String(page),
      limit,
    }),
    [statusFilters, page, limit],
  );

  const userHistoryQuery = useOrderHistory(userFilters);
  const vendorOrdersQuery = useVendorOrdersWithFilters(userFilters, isVendor);

  const activeQuery = isVendor ? vendorOrdersQuery : userHistoryQuery;

  const acceptMutation = useAcceptVendorOrder();
  const startMutation = useStartPrintVendorOrder();
  const readyMutation = useMarkReadyVendorOrder();

  const [accumulatedItems, setAccumulatedItems] = useState<any[]>([]);
  const [refreshCooling, setRefreshCooling] = useState(false);

  // Reset accumulation when filter changes
  useEffect(() => {
    setPage(1);
    setAccumulatedItems([]);
  }, [statusFilters]);

  const refreshOrders = useCallback(() => {
    if (activeQuery.isFetching || refreshCooling) {
      return;
    }

    setRefreshCooling(true);
    setPage(1);
    setAccumulatedItems([]);

    void activeQuery.refetch().finally(() => {
      setTimeout(() => setRefreshCooling(false), 1200);
    });
  }, [activeQuery, refreshCooling]);

  const isListRefreshing = refreshCooling || (activeQuery.isFetching && page === 1 && accumulatedItems.length > 0);

  // Accumulate items when query succeeds
  useEffect(() => {
    if (activeQuery.data?.items) {
      if (page === 1) {
        setAccumulatedItems(activeQuery.data.items);
      } else {
        setAccumulatedItems(prev => {
          // simple deduplication based on ID just in case
          const newItems = activeQuery.data.items.filter(
            (item: any) => !prev.some(p => (p.id ?? p.order_id) === (item.id ?? item.order_id))
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [activeQuery.data?.items, page]);

  const loadMore = () => {
    const total = activeQuery.data?.total ?? 0;
    if (accumulatedItems.length < total && !activeQuery.isFetching) {
      setPage(prev => prev + 1);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "created":
      case "pending":
        return { bg: "#FEF3C7", text: "#D97706" }; // Amber
      case "accepted":
      case "printing":
        return { bg: "#DBEAFE", text: "#2563EB" }; // Blue
      case "ready":
      case "completed":
        return { bg: "#D1FAE5", text: "#059669" }; // Green
      case "expired":
      case "cancelled":
        return { bg: "#FEE2E2", text: "#DC2626" }; // Red
      default:
        return { bg: theme.elevated, text: theme.textSecondary };
    }
  };

  const renderOrderCard = ({ item }: { item: any }) => {
    const orderId = asString(item.id ?? item.order_id ?? item.orderId);
    const vendorName = asString(item.vendor_name ?? item.vendorName ?? item.shop_name ?? item.shopName);
    const userName = asString(item.user_name ?? item.userName ?? item.username);
    const party = isVendor ? userName : vendorName;
    const service = asString(item.service_type ?? item.serviceType);
    const status = asString(item.status, "unknown");
    const createdAt = asString(item.created_at ?? item.createdAt);

    const statusColors = getStatusColor(status);

    const detailBase = isVendor ? "/(private)/(tabs)/(orders)" : "/(private)/(tabs)/(history)";

    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: theme.elevated, borderColor: theme.border }]}
        onPress={() => router.push(`${detailBase}/${orderId}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.orderId, { color: theme.textPrimary }]} numberOfLines={1}>{orderId}</Text>
            <Text style={[styles.serviceType, { color: theme.textSecondary }]}>{service}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MaterialIcons name={isVendor ? "person" : "storefront"} size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1}>{party}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={14} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>{formatTimestamp(createdAt)}</Text>
          </View>
        </View>

        {isVendor && (
          <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
            <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 8 }}>
              <Pressable
                style={[styles.actionBtn, { borderColor: theme.border }]}
                onPress={() => void acceptMutation.mutateAsync(orderId)}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? <ActivityIndicator size="small" color={theme.primary} /> : <Text style={[styles.actionText, { color: theme.textPrimary }]}>Accept</Text>}
              </Pressable>

              <Pressable
                style={[styles.actionBtn, { borderColor: theme.border }]}
                onPress={() => void startMutation.mutateAsync(orderId)}
                disabled={startMutation.isPending}
              >
                {startMutation.isPending ? <ActivityIndicator size="small" color={theme.primary} /> : <Text style={[styles.actionText, { color: theme.textPrimary }]}>Start Print</Text>}
              </Pressable>

              <Pressable
                style={[styles.actionBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                onPress={() => void readyMutation.mutateAsync(orderId)}
                disabled={readyMutation.isPending}
              >
                {readyMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={[styles.actionText, { color: "#fff" }]}>Mark Ready</Text>}
              </Pressable>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => {
    if (activeQuery.isLoading && accumulatedItems.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 16 }}>Loading orders...</Text>
        </View>
      );
    }

    if (activeQuery.isError && accumulatedItems.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <PageState
            title="Unable to load orders"
            subtitle="Please retry loading order history."
            onAction={() => void activeQuery.refetch()}
            actionLabel="Retry"
            colorScheme={colorScheme}
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Package size={40} color={theme.textSecondary || theme.border} style={{ marginBottom: 16 }} />
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No orders found</Text>
        <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Order history matching your filters will appear here.</Text>
      </View>
    );
  };

  const screenSafeAreaStyle = useMemo(
    () => ({
      paddingTop: Platform.OS === "ios" ? insets.top + 55 : 0,
      paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 8,
    }),
    [insets.bottom, insets.left, insets.right, insets.top],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }, screenSafeAreaStyle]}>
      <Stack.Screen
        options={{
          headerTitle: isVendor ? "Orders Queue" : "Past Orders",
          headerRight: () => (
            <View style={[styles.headerActions, { paddingHorizontal: 10, gap: Platform.OS === "ios" ? 16 : 20 }]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Open filters"
                onPress={() => setFiltersOpen(true)}
              >
                <MaterialIcons name="filter-list" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="View notifications"
                onPress={() => router.push("/(private)/(notifications)/notifications" as any)}
              >
                <MaterialIcons name="notifications-none" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.dashboardCard}>
        <FlashList
          data={accumulatedItems}
          renderItem={renderOrderCard}
          // @ts-ignore
          estimatedItemSize={160}
          contentContainerStyle={styles.listContent}
          bounces
          alwaysBounceVertical
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isListRefreshing}
              onRefresh={refreshOrders}
              tintColor={theme.primary}
              colors={[theme.primary]}
              progressBackgroundColor={theme.surface}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.itemGap} />}
          ListEmptyComponent={ListEmptyComponent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            activeQuery.isFetching && accumulatedItems.length > 0 ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color={theme.primary} />
            ) : null
          }
        />
      </View>

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={() => {
          setStatusFilters(tempStatusFilters);
          setFiltersOpen(false);
        }}
        onClear={() => {
          setTempStatusFilters([]);
        }}
        title="Order filters"
        colorScheme={colorScheme}
      >
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Status</Text>
        <View style={{ gap: 8 }}>
          {statusOptions.map(option => {
            const isSelected = tempStatusFilters.includes(option.value);
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOptionRow,
                  { backgroundColor: isSelected ? (colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5') : theme.background, borderColor: isSelected ? theme.textSecondary : theme.border }
                ]}
                onPress={() => {
                  setTempStatusFilters((prev) =>
                    prev.includes(option.value)
                      ? prev.filter((v) => v !== option.value)
                      : [...prev, option.value]
                  );
                }}
              >
                <Text style={{ 
                  color: theme.textPrimary,
                  fontWeight: '400' 
                }}>
                  {option.label}
                </Text>
                {isSelected ? (
                  <MaterialIcons name="check" size={20} color={theme.textPrimary} />
                ) : (
                  <View style={{ width: 20, height: 20 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dashboardCard: {
    flex: 1,
    overflow: "hidden",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  itemGap: {
    height: 12,
  },
  orderCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  cardActions: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    minHeight: 300,
    maxHeight: "90%",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  filterHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  sheetContent: {
    padding: 24,
    paddingTop: 4,
    gap: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statusOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    height: 52,
  },
  doneButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
