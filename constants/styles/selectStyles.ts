import { ViewStyle, TextStyle } from "react-native";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export const useSelectStyles = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return {
    trigger: {
      height: 40,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#292929" : "#d4d4d8",
      backgroundColor: isDark ? "#121212" : "#ffffff",
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    } as ViewStyle,

    triggerText: {
      fontSize: 14,
      color: isDark ? "#ffffff" : "#000000",
    } as TextStyle,

    placeholder: {
      color: isDark ? "#9ca3af" : "#6b7280",
    } as TextStyle,

    content: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#292929" : "#e5e7eb",
      backgroundColor: isDark ? "#18181b" : "#ffffff",
      overflow: "hidden",
      maxHeight: 250,
    } as ViewStyle,

    item: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    } as ViewStyle,

    itemText: {
      fontSize: 14,
      color: isDark ? "#ffffff" : "#000000",
    } as TextStyle,

    selectedItem: {
      backgroundColor: isDark ? "#27272a" : "#f4f4f5",
    } as ViewStyle,

    separator: {
      height: 1,
      backgroundColor: isDark ? "#292929" : "#e5e7eb",
    } as ViewStyle,
  };
};