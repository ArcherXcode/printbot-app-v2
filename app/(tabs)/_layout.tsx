import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/lib/store/auth-store';

export default function TabLayout() {
  const colorScheme = useColorScheme() as 'light' | 'dark';
  const role = useAuthStore((state) => state.role);

  // Default to USER if no role is set or it's not explicitly VENDOR
  const isVendor = role?.toUpperCase() === 'VENDOR';
  const isUser = !isVendor;

  const TabIcon = ({ name, color, focused, size }: any) => {
    const iconSize = size ? size : 24; // Increase size when focused 
    return (
      <Ionicons
        name={name}
        size={iconSize}
        color={focused ? colors[colorScheme].primary : color}
        style={{ marginTop: size === 22 ? 1 : 0 }}
      />
    );
  };

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        {/* ── SHARED TABS ── */}
        <NativeTabs.Trigger name="(dashboard)">
          <NativeTabs.Trigger.Icon
            sf={{ default: 'house', selected: 'house.fill' }}
            md="dashboard"
          />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {/* ── USER TABS ── */}
        <NativeTabs.Trigger name="(orders)" hidden={!isUser}>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }}
            md="receipt"
          />
          <NativeTabs.Trigger.Label>Orders</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(payments)" hidden={!isUser}>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'creditcard', selected: 'creditcard.fill' }}
            md="credit_card"
          />
          <NativeTabs.Trigger.Label>Payments</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {/* ── VENDOR TABS ── */}
        <NativeTabs.Trigger name="(queue)" hidden={!isVendor}>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'square.stack', selected: 'square.stack.fill' }}
            md="stacks"
          />
          <NativeTabs.Trigger.Label>Queue</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(cataloge)" hidden={!isVendor}>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'tray.full', selected: 'tray.full.fill' }}
            md="hard_drive"
          />
          <NativeTabs.Trigger.Label>Cataloge</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(history)" hidden={!isVendor}>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'clock', selected: 'clock.fill' }}
            md="history"
          />
          <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {/* ── SHARED TABS ── */}
        <NativeTabs.Trigger name="(account)">
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person', selected: 'person.fill' }}
            md="person"
          />
          <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {/* Hidden internal tabs */}
        <NativeTabs.Trigger name="(notifications)" hidden />
      </NativeTabs>
    );
  } else {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors[colorScheme].primary,
          tabBarStyle: {
            height: 90,
          }
        }}
      >
        {/* ── SHARED TABS ── */}
        <Tabs.Screen
          name="(dashboard)"
          options={{
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              focused={focused}
            />,
            tabBarLabel: 'Home',
          }}
        />

        {/* ── USER TABS ── */}
        <Tabs.Screen
          name="(orders)"
          options={{
            href: isUser ? undefined : null,
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'receipt' : 'receipt-outline'}
              color={color}
              focused={focused}
            />,
            tabBarLabel: 'Orders',
          }}
        />
        <Tabs.Screen
          name="(payments)"
          options={{
            href: isUser ? undefined : null,
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'card' : 'card-outline'}
              color={color}
              focused={focused}
            />,
            tabBarLabel: 'Payments',
          }}
        />

        {/* ── VENDOR TABS ── */}
        <Tabs.Screen
          name="(queue)"
          options={{
            href: isVendor ? undefined : null,
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'layers' : 'layers-outline'}
              color={color}
              focused={focused}
            />,
            tabBarLabel: 'Queue',
          }}
        />
        <Tabs.Screen
          name="(cataloge)"
          options={{
            href: isVendor ? undefined : null,
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'file-tray-full' : 'file-tray-full-outline'}
              color={color}
              focused={focused}
            />,
            tabBarLabel: 'Cataloge',
          }}
        />
        <Tabs.Screen
          name="(history)"
          options={{
            href: isVendor ? undefined : null,
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'time' : 'time-outline'}
              color={color}
              focused={focused}
            />,
            tabBarLabel: 'History',
          }}
        />

        {/* ── SHARED TABS ── */}
        <Tabs.Screen
          name="(account)"
          options={{
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'person' : 'person-outline'}
              color={color}
              focused={focused}
              size={22}
            />,
            tabBarLabel: 'Account',
          }}
        />

        {/* Hidden internal tabs */}
        <Tabs.Screen
          name="(notifications)"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }
}