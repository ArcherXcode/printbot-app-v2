import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Pressable, Modal, Animated, Easing, Platform, ActivityIndicator, TouchableOpacity, RefreshControl, KeyboardAvoidingView, ScrollView } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useAuthStore } from "@/lib/store/auth-store";
import { useSupportTickets } from "@/lib/assetHooksApis/support/hooks";
import PageState from "@/components/cards/PageState";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, HelpCircle } from "lucide-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

// --- Helpers ---
function formatTimestamp(raw: string): string {
  if (!raw || raw === "-") return "-";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function toSentenceCase(value: string): string {
  const normalized = value.replaceAll("_", " ").trim();
  if (normalized.length === 0) return value;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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
  applyText = "Apply",
  showApply = true,
}: {
  open: boolean;
  onClose: () => void;
  onApply?: () => void;
  onClear?: () => void;
  title: string;
  children: React.ReactNode;
  colorScheme: "light" | "dark";
  applyText?: string;
  showApply?: boolean;
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
      onApply?.();
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
                {onClear && (
                  <Pressable onPress={onClear}>
                    <MaterialIcons name="filter-list-off" size={24} color={colors[colorScheme].textPrimary} />
                  </Pressable>
                )}
                <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={closeSheet}>
                  <MaterialIcons name="close" size={24} color={colors[colorScheme].textPrimary} />
                </Pressable>
              </View>
            </View>

            <ScrollView style={{ maxHeight: '80%' }}>
              <View style={styles.sheetContent}>
                {children}
                {showApply && (
                  <Pressable style={({ pressed }) => [styles.doneButton, { backgroundColor: colors[colorScheme].primary, opacity: pressed ? 0.82 : 1 }]} onPress={applyAndClose}>
                    <Text style={styles.primaryButtonText}>{applyText}</Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const statusOptions = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

function IOSCreateButton({
  onPress,
  colorScheme,
}: {
  onPress: () => void;
  colorScheme: 'light' | 'dark';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iosButton,
        pressed && styles.iosButtonPressed,
        { backgroundColor: colors[colorScheme].primary },
      ]}
    >
      <MaterialIcons name="add" size={28} color="#fff" />
    </Pressable>
  );
}

function AndroidCreateFAB({
  onPress,
  colorScheme,
}: {
  onPress: () => void;
  colorScheme: 'light' | 'dark';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed, { backgroundColor: colors[colorScheme].tabPill },]}
      android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: true, radius: 28 }}
    >
      <MaterialIcons name="add" size={32} color={colors[colorScheme].tabIconSelected} />
    </Pressable>
  );
}

export default function SupportScreen() {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";
  const theme = colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = "10";

  const queryParams = useMemo(() => ({
    page,
    limit: Number(limit),
    status: statusFilter === "all" ? undefined : statusFilter,
  }), [page, limit, statusFilter]);

  const ticketsQuery = useSupportTickets(queryParams);

  const ticketsError = ticketsQuery.error ? String(ticketsQuery.error) : null;
  const ticketsAccessLimited = ticketsError?.includes("403") || ticketsError?.includes("404");

  const [accumulatedItems, setAccumulatedItems] = useState<any[]>([]);
  const [refreshCooling, setRefreshCooling] = useState(false);

  useEffect(() => {
    if (filtersOpen) {
      setTempStatusFilter(statusFilter);
    }
  }, [filtersOpen]);

  useEffect(() => {
    setPage(1);
    setAccumulatedItems([]);
  }, [statusFilter]);

  const refreshTickets = useCallback(() => {
    if (ticketsQuery.isFetching || refreshCooling) return;
    setRefreshCooling(true);
    setPage(1);

    void ticketsQuery.refetch().finally(() => {
      setTimeout(() => setRefreshCooling(false), 1200);
    });
  }, [ticketsQuery, refreshCooling]);

  const isListRefreshing = refreshCooling || (ticketsQuery.isFetching && page === 1 && accumulatedItems.length > 0);

  useEffect(() => {
    if (ticketsQuery.data?.items) {
      if (page === 1) {
        setAccumulatedItems(ticketsQuery.data.items);
      } else {
        setAccumulatedItems((prev) => {
          const newItems = ticketsQuery.data.items.filter(
            (item: any) => !prev.some((p) => p.id === item.id)
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [ticketsQuery.data?.items, page]);

  const loadMore = () => {
    const total = ticketsQuery.data?.total ?? 0;
    if (accumulatedItems.length < total && !ticketsQuery.isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "open":
        return { bg: "#FEF3C7", text: "#D97706" }; // Amber
      case "in_progress":
        return { bg: "#DBEAFE", text: "#2563EB" }; // Blue
      case "resolved":
      case "closed":
        return { bg: "#D1FAE5", text: "#059669" }; // Green
      default:
        return { bg: theme.elevated, text: theme.textSecondary };
    }
  };

  const renderTicketCard = ({ item }: { item: any }) => {
    const ticketId = item.id;
    const subjectLine = item.subject || "Support ticket";
    const status = item.status || "unknown";
    const createdAt = item.created_at;

    const statusColors = getStatusColor(status);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.elevated, borderColor: theme.border }]}
        activeOpacity={0.8}
        onPress={() => router.push(`/(private)/(support)/${ticketId}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.ticketId, { color: theme.textPrimary }]} numberOfLines={1}>{ticketId}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{toSentenceCase(status)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.subjectText, { color: theme.textPrimary }]} numberOfLines={2}>{subjectLine}</Text>
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

    if (ticketsQuery.isLoading && accumulatedItems.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 16 }}>Loading tickets...</Text>
        </View>
      );
    }

    if (ticketsQuery.isError && accumulatedItems.length === 0) {
      if (ticketsAccessLimited) {
        return (
          <View style={styles.emptyContainer}>
            <HelpCircle size={40} color={theme.textSecondary || theme.border} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Ticket history unavailable</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>You can create tickets, but ticket history is currently restricted for this role.</Text>
          </View>
        );
      }

      return (
        <View style={styles.emptyContainer}>
          <PageState
            title="Unable to load tickets"
            subtitle="Retry to refresh support history."
            onAction={() => void ticketsQuery.refetch()}
            actionLabel="Retry"
            colorScheme={colorScheme}
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <HelpCircle size={40} color={theme.textSecondary || theme.border} style={{ marginBottom: 16 }} />
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No support tickets</Text>
        <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Create your first ticket when you need help.</Text>
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
          headerTitle: "Support History",

          headerLeft: () => (
            Platform.OS === 'ios' && (
              <TouchableOpacity
                onPress={() => router.back()}
              >
                <ChevronLeft
                  size={24}
                  color={colors[colorScheme].headerText}
                />
              </TouchableOpacity>
            )
          ),
          headerRight: () => (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open filters"
              onPress={() => setFiltersOpen(true)}
            >
              <MaterialIcons name="filter-list" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.dashboardCard}>
        <FlashList
          data={accumulatedItems}
          renderItem={renderTicketCard}
          // @ts-ignore
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          bounces
          alwaysBounceVertical
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isListRefreshing}
              onRefresh={refreshTickets}
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
            ticketsQuery.isFetching && accumulatedItems.length > 0 ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color={theme.primary} />
            ) : null
          }
        />
      </View>

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={() => {
          setStatusFilter(tempStatusFilter);
          setFiltersOpen(false);
        }}
        onClear={() => {
          setTempStatusFilter("all");
        }}
        title="Ticket filters"
        colorScheme={colorScheme}
      >
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Status</Text>
        <View style={{ gap: 8, flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {[{ label: 'All Status', value: 'all' }, ...statusOptions].map(option => {
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
      </BottomSheet>

      {/* FAB Overlay */}
      {Platform.OS === 'ios' ? (
        <IOSCreateButton onPress={() => router.push("/(private)/(support)/create" as any)} colorScheme={colorScheme} />
      ) : (
        <AndroidCreateFAB onPress={() => router.push("/(private)/(support)/create" as any)} colorScheme={colorScheme} />
      )}
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
  card: {
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
    paddingBottom: 8,
  },
  ticketId: {
    fontSize: 15,
    fontWeight: '700',
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
  subjectText: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
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
  iosButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    alignSelf: 'center',
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  iosButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
});
