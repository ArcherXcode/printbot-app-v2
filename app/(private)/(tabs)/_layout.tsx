import React, { useState } from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  View,
  Platform,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';

// ── Hook ────────────────────────────────────────────────────
function useLocation() {
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords(result.coords);
      console.log('Location:', result.coords); // Replace with your handler
    } catch (e) {
      console.error('Location error:', e);
    } finally {
      setLoading(false);
    }
  };

  return { fetchLocation, loading, coords };
}

// ── iOS Location Button (pill style) ────────────────────────
function IOSLocationButton({
  onPress,
  loading,
  colorScheme,
}: {
  onPress: () => void;
  loading: boolean;
  colorScheme: 'light' | 'dark';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iosButton,
        pressed && styles.iosButtonPressed,
        { backgroundColor: colors[colorScheme].primary },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          {/* SF Symbol rendered via Text — swap with your icon lib */}
          <FontAwesome name="location-arrow" size={22} color="#fff" />
        </>
      )}
    </Pressable>
  );
}

// ── Android FAB ──────────────────────────────────────────────
function AndroidFAB({
  onPress,
  loading,
  colorScheme,
}: {
  onPress: () => void;
  loading: boolean;
  colorScheme: 'light' | 'dark';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed, { backgroundColor: colors[colorScheme].tabPill },]}
      android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: true, radius: 28 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <FontAwesome name="location-arrow" size={24} color={colors[colorScheme].tabIconSelected} />
      )}
    </Pressable>
  );
}

// ── Layout ───────────────────────────────────────────────────
export default function TabLayout() {
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const role = useAuthStore((state) => state.role);
  const router = useRouter();
  const { fetchLocation, loading } = useLocation();

  const isVendor = role?.toUpperCase() === 'VENDOR';
  const isUser = !isVendor;

  return (
    <View style={styles.root}>
      <NativeTabs
        iconColor={{
          selected: colors[colorScheme].tabIconSelected,
          default: colors[colorScheme].tabIconDefault,
        }}
        indicatorColor={colors[colorScheme].tabPill}
        labelVisibilityMode="labeled"
        rippleColor="transparent"
        backgroundColor={colors[colorScheme].tabBarBackground}
        minimizeBehavior="automatic"
      >
        {/* ── SHARED ── */}
        <NativeTabs.Trigger name="(dashboard)">
          <NativeTabs.Trigger.Icon
            sf={{ default: isUser ? 'safari' : 'square.grid.2x2', selected: isUser ? 'safari.fill' : 'square.grid.2x2.fill' }}
            md={isUser ? 'explore' : 'browse'}
          />
          <NativeTabs.Trigger.Label>{isUser ? 'Discover' : 'Dashboard'}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {/* ── USER ── */}
        <NativeTabs.Trigger name="(orders)" hidden={!isUser}>
          <NativeTabs.Trigger.Icon sf={{ default: 'cube.box', selected: 'cube.box.fill' }} md="package_2" />
          <NativeTabs.Trigger.Label>Orders</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(payments)" hidden={!isUser}>
          <NativeTabs.Trigger.Icon sf={{ default: 'creditcard', selected: 'creditcard.fill' }} md="credit_card" />
          <NativeTabs.Trigger.Label>Payments</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {/* ── VENDOR ── */}
        <NativeTabs.Trigger name="(queue)" hidden={!isVendor}>
          <NativeTabs.Trigger.Icon sf={{ default: 'square.stack', selected: 'square.stack.fill' }} md="web_stories" />
          <NativeTabs.Trigger.Label>Queue</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(cataloge)" hidden={!isVendor}>
          <NativeTabs.Trigger.Icon sf={{ default: 'plus.app', selected: 'plus.app.fill' }} md="add_box" />
          <NativeTabs.Trigger.Label>Cataloge</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(history)" hidden={!isVendor}>
          <NativeTabs.Trigger.Icon sf={{ default: 'clock', selected: 'clock.fill' }} md="history" />
          <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {/* ── SHARED ── */}
        <NativeTabs.Trigger name="(account)">
          <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
          <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>

      {/* ── Platform location button overlay ── */}
      {Platform.OS === 'ios' && isUser ? (
        <IOSLocationButton onPress={fetchLocation} loading={loading} colorScheme={colorScheme} />
      ) : Platform.OS === 'android' && isUser ? (
        <AndroidFAB onPress={fetchLocation} loading={loading} colorScheme={colorScheme} />
      ) : null}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // iOS: pill button anchored above the tab bar, centred
  iosButton: {
    position: 'absolute',
    bottom: 95,
    right: 25,             // sits just above the native tab bar
    alignSelf: 'center',
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25
  },
  iosButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  iosButtonIcon: {
    fontSize: 16,
  },

  // Android: classic FAB — bottom-right
  fab: {
    position: 'absolute',
    bottom: 120,           // clears the Material tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
  fabIcon: {
    fontSize: 24,
  },
});