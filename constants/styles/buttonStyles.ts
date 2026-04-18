import { ViewStyle, TextStyle } from "react-native";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type Size = "default" | "sm" | "lg" | "icon";

export const useButtonStyles = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const base: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  };

  const textBase: TextStyle = {
    fontWeight: "600",
    fontSize: 14,
  };

  const variants: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
    default: {
      container: {
        backgroundColor: isDark ? "#2563eb" : "#2563eb",
      },
      text: {
        color: "#ffffff",
      },
    },

    destructive: {
      container: {
        backgroundColor: "#dc2626",
      },
      text: {
        color: "#ffffff",
      },
    },

    outline: {
      container: {
        borderWidth: 1,
        borderColor: isDark ? "#3f3f46" : "#d4d4d8",
        backgroundColor: "transparent",
      },
      text: {
        color: isDark ? "#ffffff" : "#000000",
      },
    },

    secondary: {
      container: {
        backgroundColor: isDark ? "#27272a" : "#f4f4f5",
      },
      text: {
        color: isDark ? "#ffffff" : "#000000",
      },
    },

    ghost: {
      container: {
        backgroundColor: "transparent",
      },
      text: {
        color: isDark ? "#ffffff" : "#000000",
      },
    },

    link: {
      container: {
        backgroundColor: "transparent",
      },
      text: {
        color: "#2563eb",
        textDecorationLine: "underline",
      },
    },
  };

  const sizes: Record<Size, ViewStyle> = {
    default: {
      height: 40,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    sm: {
      height: 36,
      paddingHorizontal: 12,
    },
    lg: {
      height: 44,
      paddingHorizontal: 32,
    },
    icon: {
      height: 40,
      width: 40,
      paddingHorizontal: 0,
    },
  };

  return {
    base,
    textBase,
    variants,
    sizes,
  };
};

export type ButtonVariant = Variant;
export type ButtonSize = Size;