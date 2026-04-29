import { Canvas, Group, Line, Path, Skia, vec } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

export type ChartPoint = {
  label: string;
  value: number;
};

export default function LineChart({ points, width, height, color }: { points: ChartPoint[]; width: number; height: number; color: string }) {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";

  const path = useMemo(() => {
    const p = Skia.Path.Make();
    const safePoints = points.length > 0 ? points : [{ label: "", value: 0 }];
    const values = safePoints.map((point) => point.value);
    const max = Math.max(...values, 1);
    const left = 8;
    const right = width - 8;
    const top = 18;
    const bottom = height - 24;
    const xStep = safePoints.length > 1 ? (right - left) / (safePoints.length - 1) : 0;

    safePoints.forEach((point, index) => {
      const x = safePoints.length > 1 ? left + index * xStep : width / 2;
      const y = bottom - (Math.max(point.value, 0) / max) * (bottom - top);

      if (index === 0) {
        p.moveTo(x, y);
      } else {
        p.lineTo(x, y);
      }
    });

    return p;
  }, [height, points, width]);

  return (
    <View style={[styles.canvasShell, { backgroundColor: colors[colorScheme].elevated, borderColor: colors[colorScheme].border }]}>
      <Canvas style={{ width, height }}>
        <Group>
          {[0.25, 0.5, 0.75].map((position) => (
            <Line
              key={position}
              p1={vec(8, height * position)}
              p2={vec(width - 8, height * position)}
              color={colors[colorScheme].grid}
              strokeWidth={1}
            />
          ))}
          <Path path={path} color={color} style="stroke" strokeWidth={3} strokeCap="round" strokeJoin="round" />
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  canvasShell: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
});
