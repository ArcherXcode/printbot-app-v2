import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/lib/store/auth-store';

// ── Layout ───────────────────────────────────────────────────
export default function TabLayout() {
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const role = useAuthStore((state) => state.role);
  const isVendor = role?.toUpperCase() === 'VENDOR';
  const isUser = !isVendor;

  return (
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
  );
}