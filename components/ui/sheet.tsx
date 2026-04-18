import React, { useEffect } from "react";
import {
    View,
    Text,
    Modal,
    Pressable,
    Dimensions,
    ScrollView,
} from "react-native";

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from "react-native-reanimated";

import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

import { useSheetStyles } from "@/constants/styles/sheetStyles";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react-native";

type Side = "right" | "left" | "bottom";

type SheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    children?: React.ReactNode;
    onApply?: () => void;
    onClear?: () => void;
    side?: Side;
};

export function Sheet({
    open,
    onOpenChange,
    title = "Filters",
    children,
    onApply,
    onClear,
    side = "right",
}: SheetProps) {
    const styles = useSheetStyles();
    const { width, height } = Dimensions.get("window");

    /* ---------------- Animation ---------------- */

    const translate = useSharedValue(
        side === "bottom" ? height : width
    );

    useEffect(() => {
        translate.value = withTiming(open ? 0 : (side === "bottom" ? height : width), {
            duration: 250,
        });
    }, [open, side]);

    /* ---------------- Gesture ---------------- */

    const gesture = Gesture.Pan()
        .onUpdate((e) => {
            if (side === "right") {
                translate.value = Math.max(0, e.translationX);
            } else if (side === "left") {
                translate.value = Math.min(0, e.translationX);
            } else {
                translate.value = Math.max(0, e.translationY);
            }
        })
        .onEnd((e) => {
            const shouldClose =
                side === "bottom"
                    ? e.translationY > 100
                    : Math.abs(e.translationX) > 100;

            if (shouldClose) {
                translate.value = withTiming(
                    side === "bottom" ? height : width,
                    { duration: 200 },
                    () => runOnJS(onOpenChange)(false)
                );
            } else {
                translate.value = withTiming(0);
            }
        });

    /* ---------------- Animated Style ---------------- */

    const animatedStyle = useAnimatedStyle(() => {
        if (side === "right") {
            return { transform: [{ translateX: translate.value }] };
        }
        if (side === "left") {
            return { transform: [{ translateX: translate.value }] };
        }
        return { transform: [{ translateY: translate.value }] };
    });

    /* ---------------- Layout ---------------- */

    const panelStyle = [
        styles.panel,
        side === "right"
            ? {
                right: 0,
                top: 0,
                height: height,
                width: Math.min(420, width),
                borderLeftWidth: 1,
            }
            : null,
        side === "left"
            ? {
                left: 0,
                top: 0,
                height: height,
                width: Math.min(420, width),
                borderRightWidth: 1,
            }
            : null,
        side === "bottom"
            ? {
                bottom: 0,
                width: width,
                height: height * 0.6,
                borderTopWidth: 1,
            }
            : null,
    ].filter(Boolean);

    if (!open) return null;

    return (
        <Modal transparent animationType="none">
            {/* Backdrop */}
            <Pressable
                style={styles.backdrop}
                onPress={() => onOpenChange(false)}
            >
                <View style={styles.container}>
                    <GestureDetector gesture={gesture}>
                        <Animated.View style={[panelStyle, animatedStyle]}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>

                                <Button
                                    variant="ghost"
                                    onPress={() => onOpenChange(false)}
                                >
                                    <X size={16} />
                                </Button>
                            </View>

                            {/* Scrollable Content */}
                            <ScrollView style={styles.content}>
                                {children}
                            </ScrollView>

                            {/* Footer */}
                            <View style={styles.footer}>
                                <View style={styles.footerActions}>
                                    <Button variant="outline" onPress={() => onClear?.()}>
                                        Clear
                                    </Button>

                                    <Button
                                        onPress={() => {
                                            onApply?.();
                                            onOpenChange(false);
                                        }}
                                    >
                                        Apply
                                    </Button>
                                </View>
                            </View>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </Pressable>
        </Modal>
    );
}

export default Sheet;