import { useCallback, useMemo, useState } from "react";
import {
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
  useWindowDimensions,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";
import { useVendorDashboard } from "@/lib/assetHooksApis/cataloge/hooks";
import type { VendorDashboardResponse } from "@/lib/assetHooksApis/cataloge/api";
import { formatCurrency } from "@/lib/hooks/formatCurrency";
import type { ChartPoint } from "@/components/charts/LineCharts";
import PageState from "@/components/cards/PageState";
import TodayCard from "@/components/cards/TodayCard";
import TrendChartCard from "@/components/cards/TrendChartCard";
import MetricCard from "@/components/cards/MetricCard";
import StatusBarsCard, { StatusEntry } from "@/components/cards/StatusBarsCard";

type DashboardSection =
  | { key: "hero"; type: "hero" }
  | { key: "metrics"; type: "metrics" }
  | { key: "ordersTrend"; type: "lineChart"; title: string; description: string; points: ChartPoint[]; tone: "primary" | "secondary" }
  | {
    key: "revenueTrend";
    type: "lineChart";
    title: string;
    description: string;
    points: ChartPoint[];
    tone: "primary" | "secondary";
    valueFormatter: (value: number) => string;
  }
  | { key: "ordersByHour"; type: "lineChart"; title: string; description: string; points: ChartPoint[]; tone: "primary" | "secondary" }
  | { key: "status"; type: "statusBars"; title: string; description: string; entries: StatusEntry[] };

export default function VendorDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";
  const [cooling, setCooling] = useState(false);
  const dashboardQuery = useVendorDashboard();

  const screenSafeAreaStyle = useMemo<ViewStyle>(
    () => ({
      paddingTop: Platform.OS === "ios" ? insets.top + 55 : 0,
      paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 8,
    }),
    [insets.bottom, insets.top],
  );

  const handleRefresh = useCallback(() => {
    if (dashboardQuery.isFetching || cooling) {
      return;
    }

    setCooling(true);
    void dashboardQuery.refetch().finally(() => {
      setTimeout(() => setCooling(false), 1200);
    });
  }, [cooling, dashboardQuery]);

  const data = dashboardQuery.data;
  const isRefreshing = cooling || (dashboardQuery.isFetching && !dashboardQuery.isLoading);
  const activeTasks = data
    ? data.summary.new_orders_count + data.summary.processed_orders_count + data.summary.accepted_orders_count
    : 0;

  const sections = useMemo<DashboardSection[]>(() => {
    if (!data) {
      return [];
    }

    return [
      { key: "hero", type: "hero" },
      { key: "metrics", type: "metrics" },
      {
        key: "ordersTrend",
        type: "lineChart",
        title: "Orders trend",
        description: "Daily orders for the last 30 days",
        points: data.graphs.orders_last_30_days.map((point) => ({ label: point.date, value: point.count })),
        tone: "primary",
      },
      {
        key: "revenueTrend",
        type: "lineChart",
        title: "Revenue trend",
        description: "Daily revenue for the last 30 days",
        points: data.graphs.revenue_last_30_days.map((point) => ({ label: point.date, value: point.amount })),
        tone: "secondary",
        valueFormatter: formatCurrency,
      },
      {
        key: "ordersByHour",
        type: "lineChart",
        title: "Orders by hour",
        description: "How demand is distributed through today",
        points: data.graphs.orders_today_by_hour.map((point) => ({ label: `${point.hour}:00`, value: point.count })),
        tone: "primary",
      },
      {
        key: "status",
        type: "statusBars",
        title: "Orders by status",
        description: "Current status mix",
        entries: data.graphs.orders_by_status.map((entry) => ({ label: entry.status, value: entry.count })),
      },
    ];
  }, [data]);

  const renderSection = useCallback(
    ({ item }: { item: DashboardSection }) => {
      if (!data) {
        return null;
      }

      switch (item.type) {
        case "hero":
          return <TodayCard activeTasks={activeTasks} data={data} />;
        case "metrics":
          return <MetricsGrid data={data} />;
        case "lineChart":
          return (
            <TrendChartCard
              title={item.title}
              description={item.description}
              points={item.points}
              tone={item.tone}
              valueFormatter={"valueFormatter" in item ? item.valueFormatter : undefined}
              width={width}
            />
          );
        case "statusBars":
          return <StatusBarsCard title={item.title} description={item.description} entries={item.entries} width={width} />;
        default:
          return null;
      }
    },
    [activeTasks, data, width],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors[colorScheme].background }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="View notifications"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(private)/(notifications)/notifications")
              }}
            >
              <MaterialIcons name="notifications-none" size={24} color={colors[colorScheme].textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlashList
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderSection}
        contentContainerStyle={[styles.listContent, Platform.OS === "ios" ? screenSafeAreaStyle : { paddingVertical: 8 }]}
        bounces
        alwaysBounceVertical
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors[colorScheme].textPrimary}
            colors={[colors[colorScheme].textPrimary]}
            progressBackgroundColor={colors[colorScheme].surface}
            progressViewOffset={Platform.OS === "ios" ? insets.top + 55 : 0}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.sectionGap} />}
        ListEmptyComponent={
          isRefreshing ? null : dashboardQuery.isLoading ? (
            <PageState title="Loading vendor dashboard" loading colorScheme={colorScheme} />
          ) : dashboardQuery.isError ? (
            <PageState
              title="Unable to load vendor dashboard"
              subtitle="Retry to refresh your operational dashboard."
              actionLabel="Retry"
              onAction={() => void dashboardQuery.refetch()}
              colorScheme={colorScheme}
            />
          ) : (
            <PageState title="No vendor data" subtitle="Vendor dashboard data is currently unavailable." empty colorScheme={colorScheme} />
          )
        }
      />
    </View>
  );
}

function MetricsGrid({ data }: { data: VendorDashboardResponse }) {
  const metrics = [
    { label: "Monthly revenue", value: formatCurrency(data.summary.monthly_revenue), hint: "Last 30 days", emphasize: true },
    { label: "Monthly orders", value: String(data.summary.monthly_orders) },
    { label: "Total orders", value: String(data.summary.total_orders) },
    { label: "Completed", value: String(data.summary.completed_orders_count) },
    { label: "Accepted", value: String(data.summary.accepted_orders_count) },
  ];

  return (
    <View style={styles.metricsGrid}>
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  sectionGap: {
    height: 14,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
