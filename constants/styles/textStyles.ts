import { TextStyle } from "react-native";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";
import { colors } from "@/constants/colors";

export const useTextStyles = () => {
  const scheme = (useColorScheme() as "light" | "dark") ?? "light";

  const base: TextStyle = {
    color: colors[scheme].textPrimary,
  };

  return {
    bigTitle: {
      ...base,
      fontSize: 20,
      fontWeight: "700",
    } as TextStyle,

    title: {
      ...base,
      fontSize: 16,
      fontWeight: "700",
    } as TextStyle,

    header: {
      ...base,
      fontSize: 20,
      fontWeight: "700",
    } as TextStyle,

    subtitle: {
      ...base,
      fontSize: 14,
      color: colors[scheme].textSecondary,
      fontWeight: "500",
    } as TextStyle,

    body: {
      ...base,
      fontSize: 12,
      color: colors[scheme].textSecondary,
      fontWeight: "400",
    } as TextStyle,

    label: {
      fontSize: 12,
      color: colors[scheme].textSecondary,
    } as TextStyle,

    value: {
      fontSize: 22,
      fontWeight: "600",
      color: colors[scheme].textPrimary,
      marginTop: 4,
    } as TextStyle,

    hint: {
      fontSize: 11,
      color: colors[scheme].textSecondary,
      marginTop: 4,
    } as TextStyle,

    empty: {
      fontSize: 12,
      color: colors[scheme].textSecondary,
      marginTop: 8,
    } as TextStyle,

    footer: {
      fontSize: 11,
      color: colors[scheme].textSecondary,
      marginTop: 6,
    } as TextStyle,
  };
};
