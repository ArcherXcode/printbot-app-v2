import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { PackageOpen, Star } from "lucide-react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";

import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";
import { useVendors } from "@/lib/assetHooksApis/cataloge/hooks";
import type { VendorQueryParams } from "@/lib/assetHooksApis/cataloge/api";
import { useDebouncedValue } from "@/hooks/queryHooks/useDebouncedValue";
import { usePaginationParams } from "@/hooks/queryHooks/usePaginationParams";

type LocationState = {
  lat: number;
  lng: number;
  source: "device" | "fallback";
  error?: string;
};

type VendorCardItem = {
  id?: string;
  name: string;
  address: string;
  distance?: number;
  rating?: number;
  isOpen: boolean;
};

const FALLBACK_LOCATION: LocationState = {
  lat: 12.9716,
  lng: 77.5946,
  source: "fallback",
};

function numberOrUndefined(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function stringFromKeys(item: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

export default function UserDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";
  const screenSafeAreaStyle = useMemo(
    () => ({
      paddingTop: Platform.OS === "ios" ? insets.top + 55 : 0,
      paddingBottom: Platform.OS === "ios" ? insets.bottom + 82 : 8,
    }),
    [insets.bottom, insets.left, insets.right, insets.top],
  );

  const [search, setSearch] = useState("");
  const [radiusKm, setRadiusKm] = useState("10");
  const [minRating, setMinRating] = useState("3.5");
  const [isOpenOnly, setIsOpenOnly] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshCooling, setRefreshCooling] = useState(false);
  const [location, setLocation] = useState<LocationState>(FALLBACK_LOCATION);
  const [loadedVendors, setLoadedVendors] = useState<VendorCardItem[]>([]);
  const lastAppliedPageRef = useRef(0);

  const debouncedSearch = useDebouncedValue(search, 350);
  const { page, limit, setPage } = usePaginationParams();
  const filtersKey = useMemo(
    () => [debouncedSearch, location.lat, location.lng, radiusKm, minRating, isOpenOnly, limit].join("|"),
    [debouncedSearch, location.lat, location.lng, radiusKm, minRating, isOpenOnly, limit],
  );

  const loadLocation = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocation((previous) => ({
          ...previous,
          source: "fallback",
          error: "Location permission denied. Showing shops near Bengaluru.",
        }));
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        source: "device",
      });
    } catch (error) {
      setLocation((previous) => ({
        ...previous,
        source: "fallback",
        error: "Unable to detect location. Showing shops near Bengaluru.",
      }));
    }
  }, []);

  useEffect(() => {
    void loadLocation();
  }, [loadLocation]);

  const params = useMemo<VendorQueryParams>(
    () => ({
      q: debouncedSearch,
      page: String(page),
      limit: String(limit),
      lat: location.lat,
      lng: location.lng,
      radius_km: Number(radiusKm),
      sort: "nearest",
      min_rating: minRating,
      is_open: isOpenOnly ? "true" : "false",
    }),
    [debouncedSearch, page, limit, location.lat, location.lng, radiusKm, minRating, isOpenOnly],
  );

  const vendorsQuery = useVendors(params);
  const vendorHistory = vendorsQuery.data;
  const total = vendorHistory?.total ?? 0;
  const items = vendorHistory?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  const vendors = useMemo<VendorCardItem[]>(
    () =>
      items.map((item) => {
        const id = stringFromKeys(item, ["id", "vendor_id", "vendorId", "_id"]);
        const name = stringFromKeys(item, ["business_legal_name", "name", "vendor_name"]) ?? "Unnamed vendor";
        const address = stringFromKeys(item, ["address", "address_line_1", "location"]) ?? "Address unavailable";
        const distance = numberOrUndefined(item.distance_km ?? item.distance);
        const rating = numberOrUndefined(item.rating ?? item.average_rating ?? item.avg_rating);
        const isOpen = item.is_open === true || item.isOpen === true || item.open === true;

        return { id, name, address, distance, rating, isOpen };
      }),
    [items],
  );
  const hasNextPage = page < totalPages;

  useEffect(() => {
    setLoadedVendors([]);
    lastAppliedPageRef.current = 0;
    if (page !== 1) {
      setPage(1);
    }
  }, [filtersKey]);

  useEffect(() => {
    if (!vendorHistory || vendorsQuery.isPlaceholderData || lastAppliedPageRef.current === vendorHistory.page) {
      return;
    }

    setLoadedVendors((previous) => {
      if (vendorHistory.page <= 1) {
        return vendors;
      }

      const knownKeys = new Set(previous.map((vendor, index) => vendor.id ?? `${vendor.name}-${index}`));
      const nextVendors = vendors.filter((vendor, index) => !knownKeys.has(vendor.id ?? `${vendor.name}-${index}`));
      return [...previous, ...nextVendors];
    });
    lastAppliedPageRef.current = vendorHistory.page;
  }, [vendorHistory, vendors, vendorsQuery.isPlaceholderData]);

  const loadNextPage = useCallback(() => {
    if (!hasNextPage || vendorsQuery.isFetching) {
      return;
    }

    setPage(page + 1);
  }, [hasNextPage, page, setPage, vendorsQuery.isFetching]);

  const refreshVendors = useCallback(() => {
    if (vendorsQuery.isFetching || refreshCooling) {
      return;
    }

    setRefreshCooling(true);
    setLoadedVendors([]);
    lastAppliedPageRef.current = 0;

    if (page === 1) {
      void vendorsQuery.refetch().finally(() => {
        setTimeout(() => setRefreshCooling(false), 1200);
      });
      return;
    }

    setPage(1);
    setTimeout(() => setRefreshCooling(false), 1200);
  }, [page, refreshCooling, setPage, vendorsQuery]);

  const isListRefreshing = refreshCooling || (vendorsQuery.isFetching && page === 1);

  const clearFilters = () => {
    setSearch("");
    setRadiusKm("10");
    setMinRating("3.5");
    setIsOpenOnly(true);
    setPage(1);
  };

  const renderVendor = ({ item }: { item: VendorCardItem }) => (
    <View style={[styles.vendorCard, { backgroundColor: colors[colorScheme].elevated, borderColor: colors[colorScheme].border }]}>
      <View style={styles.vendorTopRow}>
        <View style={styles.vendorTitleWrap}>
          <Text style={[styles.vendorName, { color: colors[colorScheme].textPrimary }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.vendorAddress, { color: colors[colorScheme].textSecondary }]} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              borderColor: item.isOpen ? colors[colorScheme].success : colors[colorScheme].border,
              backgroundColor: item.isOpen ? `${colors[colorScheme].success}16` : "transparent",
            },
          ]}
        >
          <Text style={[styles.statusText, { color: item.isOpen ? colors[colorScheme].success : colors[colorScheme].textSecondary }]}>
            {item.isOpen ? "Open" : "Closed"}
          </Text>
        </View>
      </View>

      <View style={styles.vendorMetaRow}>
        <View style={[styles.infoPill, { borderColor: colors[colorScheme].border }]}>
          <Star size={14} color={colors[colorScheme].primary} />
          <Text style={[styles.infoPillText, { color: colors[colorScheme].textPrimary }]}>{item.rating?.toFixed(1) ?? "N/A"}</Text>
        </View>
        <View style={[styles.infoPill, { borderColor: colors[colorScheme].border }]}>
          <Text style={[styles.infoPillText, { color: colors[colorScheme].textPrimary }]}>
            {item.distance ? `${item.distance.toFixed(1)} km` : "Distance N/A"}
          </Text>
        </View>
      </View>

      <Pressable
        disabled={!item.id}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: item.id ? colors[colorScheme].primary : colors[colorScheme].border, opacity: pressed ? 0.82 : 1 },
        ]}
        onPress={() => {
          if (!item.id) {
            return;
          }

          Alert.alert("Print shop selected", "The vendor options route is not available yet.", [
            { text: "OK" },
            {
              text: "View orders",
              onPress: () =>
                router.push({
                  pathname: "/(private)/(tabs)/(orders)/orders",
                  params: { vendorId: item.id },
                }),
            },
          ]);
        }}
      >
        <Text style={styles.primaryButtonText}>Open print shop options</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: Platform.OS === "android" ? colors[colorScheme].background : undefined }, screenSafeAreaStyle]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={[styles.headerActions, { paddingHorizontal: 10, gap: Platform.OS === "ios" ? 16 : 20 }]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Open filters"
                onPress={() => setFiltersOpen(true)}
              >
                <MaterialIcons name="filter-list" size={24} color={colors[colorScheme].textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="View notifications"
                onPress={() => router.push("/(private)/(notifications)/notifications")}
              >
                <MaterialIcons name="notifications-none" size={24} color={colors[colorScheme].textPrimary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <View style={[styles.dashboardCard]}>
        {location.error ? <Text style={[styles.locationError, { color: colors[colorScheme].danger }]}>{location.error}</Text> : null}

        <View style={styles.listShell}>
          <FlashList
            data={loadedVendors}
            keyExtractor={(item, index) => `${item.id ?? "missing"}-${index}`}
            renderItem={renderVendor}
            contentContainerStyle={styles.listContent}
            bounces
            alwaysBounceVertical
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isListRefreshing}
                onRefresh={refreshVendors}
                tintColor={colors[colorScheme].primary}
                colors={[colors[colorScheme].primary]}
                progressBackgroundColor={colors[colorScheme].surface}
                progressViewOffset={Platform.OS === "ios" ? insets.top + 55 : 0}
              />
            }
            ItemSeparatorComponent={() => <View style={styles.itemGap} />}
            onEndReached={loadNextPage}
            onEndReachedThreshold={0.55}
            ListEmptyComponent={
              vendorsQuery.isLoading ? (
                <PageState title="Loading vendors" colorScheme={colorScheme} loading />
              ) : vendorsQuery.isError ? (
                <PageState title="Unable to load print shops" subtitle="Please retry print shop discovery." colorScheme={colorScheme} />
              ) : (
                <PageState title="No print shops found" subtitle="Try adjusting your search criteria." colorScheme={colorScheme} icon />
              )
            }
            ListFooterComponent={
              loadedVendors.length > 0 ? (
                <InfiniteListFooter
                  isLoading={vendorsQuery.isFetching && hasNextPage}
                  hasNextPage={hasNextPage}
                  colorScheme={colorScheme}
                />
              ) : null
            }
          />
        </View>
      </View>

      <FiltersModal
        open={filtersOpen}
        colorScheme={colorScheme}
        search={search}
        radiusKm={radiusKm}
        minRating={minRating}
        isOpenOnly={isOpenOnly}
        onClose={() => setFiltersOpen(false)}
        onClear={clearFilters}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRadiusChange={(value) => {
          setRadiusKm(value);
          setPage(1);
        }}
        onRatingChange={(value) => {
          setMinRating(value);
          setPage(1);
        }}
        onOpenOnlyChange={(value) => {
          setIsOpenOnly(value);
          setPage(1);
        }}
      />
    </View>
  );
}

function PageState({
  title,
  subtitle,
  loading,
  icon,
  colorScheme,
}: {
  title: string;
  subtitle?: string;
  loading?: boolean;
  icon?: boolean;
  colorScheme: "light" | "dark";
}) {
  return (
    <View style={[styles.stateCard, { backgroundColor: colors[colorScheme].elevated, borderColor: colors[colorScheme].border }]}>
      {loading ? <ActivityIndicator color={colors[colorScheme].primary} /> : null}
      {icon && !loading ? <PackageOpen size={34} color={colors[colorScheme].textSecondary} strokeWidth={1.9} /> : null}
      <Text style={[styles.stateTitle, { color: colors[colorScheme].textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.stateSubtitle, { color: colors[colorScheme].textSecondary }]}>{subtitle}</Text> : null}
    </View>
  );
}

function InfiniteListFooter({
  isLoading,
  hasNextPage,
  colorScheme,
}: {
  isLoading: boolean;
  hasNextPage: boolean;
  colorScheme: "light" | "dark";
}) {
  return (
    <View style={styles.infiniteFooter}>
      {isLoading ? <ActivityIndicator size="small" color={colors[colorScheme].textPrimary} /> : null}
      <Text style={[styles.infiniteFooterText, { color: colors[colorScheme].textSecondary }]}>
        {isLoading ? "Loading more shops" : hasNextPage ? "Scroll for more" : "All shops loaded"}
      </Text>
    </View>
  );
}

function FiltersModal({
  open,
  colorScheme,
  search,
  radiusKm,
  minRating,
  isOpenOnly,
  onClose,
  onClear,
  onSearchChange,
  onRadiusChange,
  onRatingChange,
  onOpenOnlyChange,
}: {
  open: boolean;
  colorScheme: "light" | "dark";
  search: string;
  radiusKm: string;
  minRating: string;
  isOpenOnly: boolean;
  onClose: () => void;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onRadiusChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onOpenOnlyChange: (value: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = useState(open);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;

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
    outputRange: [420, 0],
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
            <Text style={[styles.filterTitle, { color: colors[colorScheme].textPrimary }]}>Filter Shops</Text>
            <View style={[styles.filterHeaderActions, { gap: Platform.OS === "ios" ? 14 : 18 }]}>
              <Pressable onPress={onClear}>
                <MaterialIcons name="filter-list-off" size={24} color={colors[colorScheme].textPrimary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close filters"
                onPress={closeSheet}
              >
                <MaterialIcons name="close" size={24} color={colors[colorScheme].textPrimary} />
              </Pressable>
            </View>
          </View>

          <FilterInput label="Search" value={search} placeholder="Search print shops" colorScheme={colorScheme} onChangeText={onSearchChange} />
          <FilterInput
            label="Radius (km)"
            value={radiusKm}
            placeholder="10"
            keyboardType="number-pad"
            colorScheme={colorScheme}
            onChangeText={onRadiusChange}
          />
          <FilterInput
            label="Min rating"
            value={minRating}
            placeholder="3.5"
            keyboardType="decimal-pad"
            colorScheme={colorScheme}
            onChangeText={onRatingChange}
          />

          <View style={[styles.switchRow, { borderColor: colors[colorScheme].border }]}>
            <View>
              <Text style={[styles.switchTitle, { color: colors[colorScheme].textPrimary }]}>Open now only</Text>
              <Text style={[styles.switchHint, { color: colors[colorScheme].textSecondary }]}>Hide shops that are currently closed.</Text>
            </View>
            <Switch value={isOpenOnly} onValueChange={onOpenOnlyChange} />
          </View>

          <Pressable style={({ pressed }) => [styles.doneButton, { backgroundColor: colors[colorScheme].primary, opacity: pressed ? 0.82 : 1 }]} onPress={closeSheet}>
            <Text style={styles.primaryButtonText}>Apply filters</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function FilterInput({
  label,
  value,
  placeholder,
  keyboardType,
  colorScheme,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad";
  colorScheme: "light" | "dark";
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.filterField}>
      <Text style={[styles.filterLabel, { color: colors[colorScheme].textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors[colorScheme].textSecondary}
        keyboardType={keyboardType}
        style={[styles.filterInput, { color: colors[colorScheme].textPrimary, borderColor: colors[colorScheme].border, backgroundColor: colors[colorScheme].surface }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
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
  listShell: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  locationError: {
    paddingHorizontal: 16,
    paddingTop: 10,
    fontSize: 12,
    lineHeight: 17,
  },
  infiniteFooter: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  infiniteFooterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  stateCard: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
    minHeight: 258,
    padding: 24,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  stateSubtitle: {
    fontSize: 12,
    textAlign: "center",
  },
  itemGap: {
    height: 12,
  },
  vendorCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  vendorTopRow: {
    flexDirection: "row",
    gap: 12,
  },
  vendorTitleWrap: {
    flex: 1,
    gap: 5,
  },
  vendorName: {
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
  },
  vendorAddress: {
    fontSize: 12,
    lineHeight: 17,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  vendorMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  infoPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  primaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  filterSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 18,
    paddingBottom: 28,
    gap: 16,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  filterField: {
    gap: 7,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  filterInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  switchHint: {
    marginTop: 3,
    fontSize: 11,
  },
  doneButton: {
    minHeight: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  }
});
