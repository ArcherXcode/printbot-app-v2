import { ViewStyle, TextStyle } from "react-native";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export const useAccordionStyles = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return {
    item: {
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#292929" : "#e5e7eb",
    } as ViewStyle,

    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
    } as ViewStyle,

    title: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#ffffff" : "#000000",
    } as TextStyle,

    contentWrapper: {
      overflow: "hidden",
    } as ViewStyle,

    content: {
      paddingBottom: 16,
    } as ViewStyle,

    contentText: {
      fontSize: 14,
      color: isDark ? "#9ca3af" : "#6b7280",
    } as TextStyle,
  };
};