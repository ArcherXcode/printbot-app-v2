import { StyleSheet, Text, View } from "react-native";
import LineChart, { type ChartPoint } from "../charts/LineCharts";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

const CHART_HEIGHT = 176;

export default function TrendChartCard({
  title,
  description,
  points,
  tone,
  valueFormatter,
  width,
}: {
  title: string;
  description: string;
  points: ChartPoint[];
  tone: "primary" | "secondary";
  valueFormatter?: (value: number) => string;
  width: number;
}) {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";
  const values = points.map((point) => point.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = Math.max(...values, 0);
  const accent = tone === "secondary" ? colors[colorScheme].secondary : colors[colorScheme].primary;
  const cardWidth = Math.max(280, width - 32);
  const startLabel = points[0]?.label ?? "";
  const endLabel = points[points.length - 1]?.label ?? "";

  return (
    <View style={[styles.card, { backgroundColor: colors[colorScheme].surface, borderColor: colors[colorScheme].border }]}>
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleWrap}>
          <Text style={[styles.cardTitle, { color: colors[colorScheme].textPrimary }]}>{title}</Text>
          <Text style={[styles.cardDescription, { color: colors[colorScheme].textSecondary }]}>{description}</Text>
        </View>
        <View style={[styles.chartBadge, { backgroundColor: tone === "secondary" ? colors[colorScheme].secondarySoft : colors[colorScheme].primarySoft, borderColor: accent }]}>
          <Text style={[styles.chartBadgeText, { color: accent }]} numberOfLines={1} adjustsFontSizeToFit>
            {valueFormatter ? valueFormatter(total) : total}
          </Text>
        </View>
      </View>

      <LineChart points={points} width={cardWidth - 34} height={CHART_HEIGHT} color={accent} />

      <View style={styles.chartFooter}>
        <Text style={[styles.axisText, { color: colors[colorScheme].textSecondary }]} numberOfLines={1}>
          {startLabel}
        </Text>
        <Text style={[styles.axisText, { color: colors[colorScheme].textSecondary }]}>Max {valueFormatter ? valueFormatter(max) : max}</Text>
        <Text style={[styles.axisText, { color: colors[colorScheme].textSecondary }]} numberOfLines={1}>
          {endLabel}
        </Text>
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
  cardTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  chartTitleWrap: {
    flex: 1,
    gap: 3,
  },
  chartBadge: {
    maxWidth: 126,
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  chartBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  chartFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  axisText: {
    maxWidth: "34%",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
});
