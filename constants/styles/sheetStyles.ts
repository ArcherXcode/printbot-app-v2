import { ViewStyle, TextStyle } from "react-native";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export const useSheetStyles = () => {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    return {
        backdrop: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
        } as ViewStyle,

        container: {
            flex: 1,
        } as ViewStyle,

        panel: {
            position: "absolute",
            backgroundColor: isDark ? "#121212" : "#ffffff",
            borderColor: isDark ? "#292929" : "#e5e7eb",
        } as ViewStyle,

        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#292929" : "#e5e7eb",
        } as ViewStyle,

        title: {
            fontSize: 16,
            fontWeight: "600",
            color: isDark ? "#ffffff" : "#000000",
        } as TextStyle,

        content: {
            flex: 1,
            padding: 16,
        } as ViewStyle,

        footer: {
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#292929" : "#e5e7eb",
        } as ViewStyle,

        footerActions: {
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 8,
        } as ViewStyle,
    };
};