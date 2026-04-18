import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useCardStyles } from "@/constants/styles/cardStyles";
import { useTextStyles } from "@/constants/styles/textStyles";

/* =========================
   TYPES (unchanged)
========================= */

type MetricCardProps = {
  label: string;
  value: number;
  hint?: string;
  emphasize?: boolean;
};

type ChartPoint = {
  label: string;
  value: number;
};

type TrendChartCardProps = {
  title: string;
  description: string;
  points: ChartPoint[];
  tone?: "primary" | "secondary";
  valueFormatter?: (value: number) => string;
};

type StatusBarsCardProps = {
  title: string;
  description: string;
  entries: Array<{ label: string; value: number }>;
};

/* =========================
   FORMATTERS (unchanged)
========================= */

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/* =========================
   METRIC CARD
========================= */

export function MetricCard({
  label,
  value,
  hint,
  emphasize = false,
}: MetricCardProps) {
  const cardStyles = useCardStyles();
  const textStyles = useTextStyles();

  return (
    <View style={[cardStyles.card, emphasize && cardStyles.emphasized]}>
      <Text style={textStyles.label}>{label}</Text>
      <Text style={textStyles.value}>{formatCompact(value)}</Text>
      {hint ? <Text style={textStyles.hint}>{hint}</Text> : null}
    </View>
  );
}

/* =========================
   TREND CHART CARD
========================= */

const screenWidth = Dimensions.get("window").width;

export function TrendChartCard({
  title,
  description,
  points,
  tone = "primary",
  valueFormatter = formatCompact,
}: TrendChartCardProps) {
  const data = {
    labels: points.map((p) => p.label),
    datasets: [{ data: points.map((p) => p.value) }],
  };

  const latestPoint = points[points.length - 1];
  const cardStyles = useCardStyles();
    const textStyles = useTextStyles();

  return (
    <View style={cardStyles.card}>
      <Text style={textStyles.title}>{title}</Text>
      <Text style={textStyles.body}>{description}</Text>

      {points.length > 0 ? (
        <LineChart
          data={data}
          width={screenWidth - 32}
          height={180}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          chartConfig={{
            backgroundGradientFrom: "#111",
            backgroundGradientTo: "#111",
            decimalPlaces: 0,
            color: () => (tone === "primary" ? "#4f46e5" : "#22c55e"),
            labelColor: () => "#888",
          }}
          bezier
          style={{
            marginTop: 12,
            borderRadius: 12,
          }}
        />
      ) : (
        <Text style={textStyles.empty}>
          No trend data available.
        </Text>
      )}

      {latestPoint ? (
        <Text style={textStyles.footer}>
          Latest: {latestPoint.label} -{" "}
          {valueFormatter(latestPoint.value)}
        </Text>
      ) : null}
    </View>
  );
}

/* =========================
   STATUS BARS CARD
========================= */

export function StatusBarsCard({
  title,
  description,
  entries,
}: StatusBarsCardProps) {
  const max = Math.max(1, ...entries.map((entry) => entry.value));
  const cardStyles = useCardStyles();
    const textStyles = useTextStyles();

  return (
    <View style={cardStyles.card}>
      <Text style={textStyles.title}>{title}</Text>
      <Text style={textStyles.body}>{description}</Text>

      {entries.length > 0 ? (
        entries.map((entry) => {
          const pct = (entry.value / max) * 100;

          return (
            <View key={entry.label} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={textStyles.body}>
                  {entry.label}
                </Text>
                <Text style={textStyles.body}>
                  {formatCompact(entry.value)}
                </Text>
              </View>

              <View style={cardStyles.barBg}>
                <View
                  style={[
                    cardStyles.barFill,
                    { width: `${pct}%` },
                  ]}
                />
              </View>
            </View>
          );
        })
      ) : (
        <Text style={textStyles.empty}>
          No status data available.
        </Text>
      )}
    </View>
  );
}