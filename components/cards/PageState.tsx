import { StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { AlertCircle, PackageOpen } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export default function PageState({
  title,
  subtitle,
  loading,
  empty,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";

  return (
    <View style={[styles.stateCard, { backgroundColor: colors[colorScheme].elevated, borderColor: colors[colorScheme].border }]}>
      {loading ? <ActivityIndicator color={colors[colorScheme].primary} /> : empty ? <PackageOpen size={34} color={colors[colorScheme].textSecondary} /> : <AlertCircle size={34} color={colors[colorScheme].danger} />}
      <Text style={[styles.stateTitle, { color: colors[colorScheme].textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.stateSubtitle, { color: colors[colorScheme].textSecondary }]}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable style={({ pressed }) => [styles.stateAction, { backgroundColor: colors[colorScheme].primary, opacity: pressed ? 0.82 : 1 }]} onPress={onAction}>
          <Text style={styles.stateActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 9,
    minHeight: 320,
    padding: 24,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  stateSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  stateAction: {
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 4,
  },
  stateActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
});
