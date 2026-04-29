import { StyleSheet, Text, View } from "react-native";
import { Canvas, Group, Rect } from "@shopify/react-native-skia";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export type StatusEntry = {
  label: string;
  value: number;
};

export default function StatusBarsCard({
  title,
  description,
  entries,
  width,
}: {
  title: string;
  description: string;
  entries: StatusEntry[];
  width: number;
}) {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  const max = Math.max(...entries.map((entry) => entry.value), 1);
  const cardWidth = Math.max(280, width - 32);
  const chartHeight = Math.max(150, entries.length * 42 + 12);

  return (
    <View style={[styles.card, { backgroundColor: colors[colorScheme].surface, borderColor: colors[colorScheme].border }]}>
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleWrap}>
          <Text style={[styles.cardTitle, { color: colors[colorScheme].textPrimary }]}>{title}</Text>
          <Text style={[styles.cardDescription, { color: colors[colorScheme].textSecondary }]}>{description}</Text>
        </View>
        <View style={[styles.chartBadge, { backgroundColor: colors[colorScheme].primarySoft, borderColor: colors[colorScheme].primary }]}>
          <Text style={[styles.chartBadgeText, { color: colors[colorScheme].primary }]}>{total}</Text>
        </View>
      </View>

      <View style={[styles.canvasShell, { backgroundColor: colors[colorScheme].elevated, borderColor: colors[colorScheme].border }]}>
        <Canvas style={{ width: cardWidth - 34, height: chartHeight }}>
          {entries.map((entry, index) => {
            const y = 18 + index * 42;
            const barWidth = ((cardWidth - 82) * Math.max(entry.value, 0)) / max;
            return (
              <Group key={`${entry.label}-${index}`}>
                <Rect x={8} y={y} width={cardWidth - 82} height={14} color={colors[colorScheme].grid} />
                <Rect x={8} y={y} width={barWidth} height={14} color={index % 2 === 0 ? colors[colorScheme].primary : colors[colorScheme].secondary} />
              </Group>
            );
          })}
        </Canvas>
      </View>

      <View style={styles.statusLegend}>
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <View key={`${entry.label}-legend-${index}`} style={[styles.statusRow, { borderColor: colors[colorScheme].border }]}>
              <View style={[styles.legendDot, { backgroundColor: index % 2 === 0 ? colors[colorScheme].primary : colors[colorScheme].secondary }]} />
              <Text style={[styles.statusLabel, { color: colors[colorScheme].textPrimary }]} numberOfLines={1}>
                {entry.label}
              </Text>
              <Text style={[styles.statusValue, { color: colors[colorScheme].textSecondary }]}>{entry.value}</Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyChartText, { color: colors[colorScheme].textSecondary }]}>No status data yet</Text>
        )}
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
  canvasShell: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  statusLegend: {
    gap: 8,
  },
  statusRow: {
    minHeight: 34,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 9,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  statusLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  statusValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  emptyChartText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "700",
  },
});
