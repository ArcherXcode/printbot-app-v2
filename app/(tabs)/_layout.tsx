import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Platform, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

export default function TabLayout() {
  const colorScheme = useColorScheme() as 'light' | 'dark';

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
        <NativeTabs.Trigger name="(dashboard)">
          <NativeTabs.Trigger.Icon
            sf={{ default: 'house', selected: 'house.fill' }}
            md="dashboard"
          />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(queue)">
          <NativeTabs.Trigger.Icon
            sf={{ default: 'square.stack', selected: 'square.stack.fill' }}
            md="stacks"
          />
          <NativeTabs.Trigger.Label>Queue</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(cataloge)">
          <NativeTabs.Trigger.Icon
            sf={{ default: 'tray.full', selected: 'tray.full.fill' }}
            md="hard_drive"
          />
          <NativeTabs.Trigger.Label>Cataloge</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(history)">
          <NativeTabs.Trigger.Icon
            sf={{ default: 'clock', selected: 'clock.fill' }}
            md="history"
          />
          <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="(account)">
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person', selected: 'person.fill' }}
            md="person"
          />
          <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

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
        <Tabs.Screen
          name="(dashboard)"
          options={{
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              focused={focused}
            />,
            tabBarLabel: 'Home',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="(queue)"
          options={{
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'layers' : 'layers-outline'}
              color={color}
              focused={focused}
            />,
            tabBarLabel: 'Queue',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="(cataloge)"
          options={{
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'file-tray-full' : 'file-tray-full-outline'}
              color={color}
              focused={focused}
            />,
            tabBarLabel: 'Cataloge',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="(history)"
          options={{
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'time' : 'time-outline'}
              color={color}
              focused={focused}
            />,
            tabBarLabel: 'History',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="(account)"
          options={{
            tabBarIcon: ({ color, focused }) => <TabIcon
              name={focused ? 'person' : 'person-outline'}
              color={color}
              focused={focused}
              size={22} // Increase size when focused
            />,
            tabBarLabel: 'Account',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="(notifications)"
          options={{
            headerShown: false,
            href: null, // Disable deep linking for this screen
          }}
        />
      </Tabs>
    );
  }
}