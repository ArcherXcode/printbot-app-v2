import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export default function QuickStat({ label, value }: { label: string; value: number }) {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";

  return (
    <View style={[styles.quickStat, { backgroundColor: colors[colorScheme].elevated, borderColor: colors[colorScheme].border }]}>
      <Text style={[styles.quickStatLabel, { color: colors[colorScheme].textSecondary }]}>{label}</Text>
      <Text style={[styles.quickStatValue, { color: colors[colorScheme].textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  quickStat: {
    minWidth: 126,
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  quickStatValue: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
  },
});
