import { ViewStyle } from "react-native";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export const useCardStyles = () => {
  const scheme = useColorScheme();

  return {
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: scheme === "dark" ? "#292929" : "#cecece",
      backgroundColor: scheme === "dark" ? "#121212" : "#ffffff",
      shadowColor: scheme === "dark" ? "#252525" : "#000",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    } as ViewStyle,

    header: {
      padding: 16,
      gap: 6,
    } as ViewStyle,

    emphasized: {
      borderColor: "#4f46e5",
      backgroundColor: "rgba(79,70,229,0.1)",
    } as ViewStyle,

    content: {
      padding: 16,
      paddingTop: 0,
    } as ViewStyle,

    footer: {
      padding: 16,
      paddingTop: 0,
      borderTopWidth: 1,
      borderTopColor: scheme === "dark" ? "#292929" : "#cecece",
      marginTop: 16,
    } as ViewStyle,

    barBg: {
      height: 6,
      backgroundColor: scheme === "dark" ? "#333" : "#ccc",
      borderRadius: 6,
      marginTop: 4,
      overflow: "hidden",
    } as ViewStyle,

    barFill: {
      height: "100%",
      backgroundColor: scheme === "dark" ? "#4f46e5" : "#4f46e5",
      borderRadius: 6,
    } as ViewStyle,
  };
};