import { StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';

type ThemeTint = {
  background: string;
  surface: string;
  elevated: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  danger: string;
  success: string;
};

export default function VendorDashboardScreen() {

  const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";
    const tint = useMemo<ThemeTint>(
      () => ({
        background: colors[colorScheme].background,
        surface: colorScheme === "dark" ? "#161719" : "#ffffff",
        elevated: colorScheme === "dark" ? "#1e1f20" : "#f7f9fc",
        text: colors[colorScheme].textPrimary,
        muted: colors[colorScheme].textSecondary,
        border: colorScheme === "dark" ? "#2b2d31" : "#d6dde6",
        primary: colors[colorScheme].primary,
        danger: colors[colorScheme].tabBadgeBackground,
        success: colorScheme === "dark" ? "#8fd6a4" : "#1c7f3a",
      }),
      [colorScheme],
    );
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={[styles.headerActions, { paddingHorizontal: 0, gap: Platform.OS === "ios" ? 16 : 20 }]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="View notifications"
                onPress={() => router.push("/(private)/(notifications)/notifications")}
              >
                <MaterialIcons name="notifications-none" size={24} color={tint.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Text style={styles.title}>Vendor Dashboard</Text>
      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
