import { TextStyle } from "react-native";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export const useTextStyles = () => {
  const scheme = useColorScheme();

  const base: TextStyle = {
    color: scheme === "dark" ? "#fff" : "#000",
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
      color: scheme === "dark" ? "#d1d5db" : "#4b5563",
      fontWeight: "500",
    } as TextStyle,

    body: {
      ...base,
      fontSize: 12,
      color: scheme === "dark" ? "#d1d5db" : "#4b5563",
      fontWeight: "400",
    } as TextStyle,

    label: {
      fontSize: 12,
      color: scheme === "dark" ? "#aaa" : "#4b5563",
    } as TextStyle,

    value: {
      fontSize: 22,
      fontWeight: "600",
      color: scheme === "dark" ? "#fff" : "#000",
      marginTop: 4,
    } as TextStyle,

    hint: {
      fontSize: 11,
      color: scheme === "dark" ? "#888" : "#4b5563",
      marginTop: 4,
    } as TextStyle,

    empty: {
      fontSize: 12,
      color: scheme === "dark" ? "#888" : "#4b5563",
      marginTop: 8,
    } as TextStyle,

    footer: {
      fontSize: 11,
      color: scheme === "dark" ? "#888" : "#4b5563",
      marginTop: 6,
    } as TextStyle,
  };
};