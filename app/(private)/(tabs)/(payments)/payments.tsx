import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Pressable, Modal, Animated, Easing, Platform, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput, ScrollView, KeyboardAvoidingView } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useAuthStore } from "@/lib/store/auth-store";
import { useVendorPayments } from "@/lib/assetHooksApis/payments/hooks";
import { useUserPayments } from "@/lib/assetHooksApis/account/hooks";
import PageState from "@/components/cards/PageState";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, CreditCard } from "lucide-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

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
    const listenerId = progress.addListener(() => { });
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
    outputRange: [800, 0],
  });

  return (
    <Modal visible={sheetVisible} animationType="none" transparent onRequestClose={closeSheet}>
      <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ justifyContent: "flex-end", flex: 1 }} pointerEvents="box-none">
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

            <ScrollView style={{ maxHeight: '80%' }}>
              <View style={styles.sheetContent}>
                {children}
                <Pressable style={({ pressed }) => [styles.doneButton, { backgroundColor: colors[colorScheme].primary, opacity: pressed ? 0.82 : 1 }]} onPress={applyAndClose}>
                  <Text style={styles.primaryButtonText}>Apply filters</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

export default function PaymentsScreen() {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";
  const theme = colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const role = useAuthStore((state) => state.role);
  const isVendor = role === "VENDOR";

  const [statusFilter, setStatusFilter] = useState("all");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [minAmountFilter, setMinAmountFilter] = useState("");
  const [maxAmountFilter, setMaxAmountFilter] = useState("");

  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const [tempFromFilter, setTempFromFilter] = useState("");
  const [tempToFilter, setTempToFilter] = useState("");
  const [tempMinAmountFilter, setTempMinAmountFilter] = useState("");
  const [tempMaxAmountFilter, setTempMaxAmountFilter] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = "20";

  useEffect(() => {
    if (filtersOpen) {
      setTempStatusFilter(statusFilter);
      setTempFromFilter(fromFilter);
      setTempToFilter(toFilter);
      setTempMinAmountFilter(minAmountFilter);
      setTempMaxAmountFilter(maxAmountFilter);
    }
  }, [filtersOpen]);

  const filters = useMemo(
    () => ({
      status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
      from: fromFilter || undefined,
      to: toFilter || undefined,
      min_amount: minAmountFilter || undefined,
      max_amount: maxAmountFilter || undefined,
      page: String(page),
      limit,
    }),
    [statusFilter, fromFilter, toFilter, minAmountFilter, maxAmountFilter, page, limit]
  );

  const userPaymentsQuery = useUserPayments(filters);
  const vendorPaymentsQuery = useVendorPayments(filters);
  const activeQuery = isVendor ? vendorPaymentsQuery : userPaymentsQuery;

  const [accumulatedItems, setAccumulatedItems] = useState<any[]>([]);
  const [refreshCooling, setRefreshCooling] = useState(false);

  // Reset accumulation when filter changes
  useEffect(() => {
    setPage(1);
    setAccumulatedItems([]);
  }, [statusFilter, fromFilter, toFilter, minAmountFilter, maxAmountFilter]);

  const refreshPayments = useCallback(() => {
    if (activeQuery.isFetching || refreshCooling) {
      return;
    }

    setRefreshCooling(true);
    setPage(1);

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
        setAccumulatedItems((prev) => {
          const newItems = activeQuery.data.items.filter(
            (item: any) => !prev.some((p) => (p.id ?? p.payment_id ?? p.order_id) === (item.id ?? item.payment_id ?? item.order_id))
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [activeQuery.data?.items, page]);

  const loadMore = () => {
    const total = activeQuery.data?.total ?? 0;
    if (accumulatedItems.length < total && !activeQuery.isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "pending":
        return { bg: "#FEF3C7", text: "#D97706" }; // Amber
      case "paid":
      case "success":
      case "completed":
        return { bg: "#D1FAE5", text: "#059669" }; // Green
      case "failed":
      case "cancelled":
        return { bg: "#FEE2E2", text: "#DC2626" }; // Red
      case "refunded":
        return { bg: "#E0E7FF", text: "#4338CA" }; // Indigo
      default:
        return { bg: theme.elevated, text: theme.textSecondary };
    }
  };

  const renderPaymentCard = ({ item, index }: { item: any, index: number }) => {
    const paymentId = asString(item.id ?? item.payment_id ?? item.order_id, `payment-${index + 1}`);
    const orderId = asString(item.order_id ?? item.orderId);
    const vendorId = asString(item.vendor_id ?? item.vendorId);
    const amount = asString(item.amount ?? item.total_amount);
    const status = asString(item.status, "unknown");
    const createdAt = asString(item.created_at ?? item.createdAt);

    const statusColors = getStatusColor(status);

    return (
      <TouchableOpacity
        style={[styles.paymentCard, { backgroundColor: theme.elevated, borderColor: theme.border }]}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.paymentId, { color: theme.textPrimary }]} numberOfLines={1}>{paymentId}</Text>
            <Text style={[styles.orderRef, { color: theme.textSecondary }]}>Order: {orderId}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MaterialIcons name="storefront" size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1}>Vendor: {vendorId}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="attach-money" size={16} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>{amount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={14} color={theme.textSecondary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>{formatTimestamp(createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => {
    if (isListRefreshing) return null;

    if (activeQuery.isLoading && accumulatedItems.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 16 }}>Loading payments...</Text>
        </View>
      );
    }

    if (activeQuery.isError && accumulatedItems.length === 0) {
      const errorStr = String(activeQuery.error);
      const isUnavailable = errorStr.includes("403") || errorStr.includes("404");

      if (isUnavailable) {
        return (
          <View style={styles.emptyContainer}>
            <CreditCard size={40} color={theme.textSecondary || theme.border} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Payment history unavailable</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Payment history endpoint is currently unavailable for your role.</Text>
          </View>
        );
      }

      return (
        <View style={styles.emptyContainer}>
          <PageState
            title="Unable to load payments"
            subtitle="Please retry loading payment records."
            onAction={() => void activeQuery.refetch()}
            actionLabel="Retry"
            colorScheme={colorScheme}
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <CreditCard size={40} color={theme.textSecondary || theme.border} style={{ marginBottom: 16 }} />
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No payment history</Text>
        <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Payment records matching your filters will appear here.</Text>
      </View>
    );
  };

  const screenSafeAreaStyle = useMemo(
    () => ({
      paddingTop: Platform.OS === "ios" ? insets.top + 60 : 0,
      paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 8,
    }),
    [insets.bottom, insets.left, insets.right, insets.top],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }, screenSafeAreaStyle]}>
      <Stack.Screen
        options={{
          headerTitle: "Payment History",
          headerRight: () => (
            <View style={[styles.headerActions, { paddingHorizontal: 10, gap: Platform.OS === "ios" ? 16 : 20 }]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Open filters"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFiltersOpen(true)
                }}
              >
                <MaterialIcons name="filter-list" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="View notifications"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(private)/(notifications)/notifications" as any)
                }}
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
          renderItem={renderPaymentCard}
          // @ts-ignore
          estimatedItemSize={140}
          contentContainerStyle={styles.listContent}
          bounces
          alwaysBounceVertical
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isListRefreshing}
              onRefresh={refreshPayments}
              tintColor={theme.textPrimary}
              colors={[theme.textPrimary]}
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
        onClose={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setFiltersOpen(false)
        }}
        onApply={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setStatusFilter(tempStatusFilter);
          setFromFilter(tempFromFilter);
          setToFilter(tempToFilter);
          setMinAmountFilter(tempMinAmountFilter);
          setMaxAmountFilter(tempMaxAmountFilter);
          setFiltersOpen(false);
        }}
        onClear={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTempStatusFilter("all");
          setTempFromFilter("");
          setTempToFilter("");
          setTempMinAmountFilter("");
          setTempMaxAmountFilter("");
        }}
        title="Payment filters"
        colorScheme={colorScheme}
      >
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Status</Text>
        <View style={{ gap: 8, flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {[{ label: 'All', value: 'all' }, ...statusOptions].map(option => {
            const isSelected = tempStatusFilter === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chipOption,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.background,
                    borderColor: isSelected ? theme.primary : theme.border
                  }
                ]}
                onPress={() => setTempStatusFilter(option.value)}
              >
                <Text style={{
                  color: isSelected ? '#fff' : theme.textPrimary,
                  fontWeight: isSelected ? '600' : '400',
                  fontSize: 14
                }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Date Range (YYYY-MM-DD)</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="From"
              placeholderTextColor={theme.textSecondary}
              value={tempFromFilter}
              onChangeText={setTempFromFilter}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="To"
              placeholderTextColor={theme.textSecondary}
              value={tempToFilter}
              onChangeText={setTempToFilter}
            />
          </View>
        </View>

        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Amount Range</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Min amount"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={tempMinAmountFilter}
              onChangeText={setTempMinAmountFilter}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Max amount"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={tempMaxAmountFilter}
              onChangeText={setTempMaxAmountFilter}
            />
          </View>
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
  paymentCard: {
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
  paymentId: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderRef: {
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
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chipOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  doneButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
