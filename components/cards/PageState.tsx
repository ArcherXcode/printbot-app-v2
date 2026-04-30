import { StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { AlertCircle, Package } from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function PageState({
  title,
  subtitle,
  loading,
  empty,
  actionLabel,
  onAction,
  colorScheme,
}: {
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  colorScheme: "light" | "dark";
}) {

  return (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color={colors[colorScheme].primary} style={{ marginBottom: 16 }} />
      ) : empty ? (
        <Package size={40} color={colors[colorScheme].textSecondary || colors[colorScheme].border} style={{ marginBottom: 16 }} />
      ) : (
        <AlertCircle size={40} color={colors[colorScheme].textSecondary || colors[colorScheme].border} style={{ marginBottom: 16 }} />
      )}
      
      <Text style={[styles.emptyTitle, { color: colors[colorScheme].textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.emptySub, { color: colors[colorScheme].textSecondary }]}>{subtitle}</Text> : null}
      
      {actionLabel && onAction ? (
        <Pressable style={({ pressed }) => [styles.actionButton, { backgroundColor: colors[colorScheme].primary, opacity: pressed ? 0.82 : 1 }]} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
