import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export default function MetricCard({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
}) {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";

  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: emphasize ? colors[colorScheme].primarySoft : colors[colorScheme].surface,
          borderColor: emphasize ? colors[colorScheme].primary : colors[colorScheme].border,
        },
      ]}
    >
      <Text style={[styles.metricLabel, { color: colors[colorScheme].textSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors[colorScheme].textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint ? <Text style={[styles.metricHint, { color: colors[colorScheme].textSecondary }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    width: "48.5%",
    minWidth: 150,
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 5,
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  metricValue: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  metricHint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
});
