import { StyleSheet, Text, View } from "react-native";
import QuickStat from "./QuickStat";
import { formatCurrency } from "../../lib/hooks/formatCurrency";
import type { VendorDashboardResponse } from "@/lib/assetHooksApis/cataloge/api";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export default function TodayCard({ data, activeTasks }: { data: VendorDashboardResponse; activeTasks: number }) {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";

  return (
    <View style={[styles.card, { backgroundColor: colors[colorScheme].surface, borderColor: colors[colorScheme].border }]}>
      <Text style={[styles.cardDescription, { color: colors[colorScheme].textSecondary }]}>Today at a glance</Text>
      <Text style={[styles.heroValue, { color: colors[colorScheme].textPrimary }]}>
        {data.summary.today_orders} orders • {formatCurrency(data.summary.today_revenue)}
      </Text>
      <View style={styles.quickStatsGrid}>
        <QuickStat label="Awaiting work" value={data.summary.queue_waiting} />
        <QuickStat label="In progress" value={data.summary.queue_processing} />
        <QuickStat label="Active tasks" value={activeTasks} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  heroValue: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "800",
  },
  quickStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
