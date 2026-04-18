import { TextStyle } from "react-native";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export const useLabelStyles = () => {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    return {
        base: {
            fontSize: 14,
            fontWeight: "500",
            lineHeight: 18,
            color: isDark ? "#ffffff" : "#000000",
        } as TextStyle,

        disabled: {
            opacity: 0.7,
        } as TextStyle,

        required: {
            color: "#ef4444",
            marginLeft: 4,
        } as TextStyle,
    };
};