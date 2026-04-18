import { ViewStyle, TextStyle } from "react-native";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export const useInputStyles = (focused: boolean) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const container: ViewStyle = {
    width: "100%",
  };

  const input: TextStyle = {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: focused
      ? "#2563eb" // ring color
      : isDark
        ? "#292929"
        : "#d4d4d8",
    backgroundColor: isDark ? "#121212" : "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: isDark ? "#ffffff" : "#000000",
  };

  const placeholderColor = isDark ? "#9ca3af" : "#6b7280";

  return {
    container,
    input,
    placeholderColor,
  };
};