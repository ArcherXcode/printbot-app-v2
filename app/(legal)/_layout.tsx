import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Platform } from 'react-native';
import * as Haptics from "expo-haptics";

export default function LegalLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme() as 'light' | 'dark';

  const commonHeaderOptions = {
    headerShown: true,
    headerTitleStyle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: colors[colorScheme].headerText,
    },
    headerTransparent: Platform.OS === 'ios' ? true : false,
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors[colorScheme].headerBackground,
    },
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back()
        }}
      >
        <ChevronLeft
          size={24}
          color={colors[colorScheme].headerText}
        />
      </TouchableOpacity>
    )
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="privacy-policy"
          options={{
            ...commonHeaderOptions,
            headerTitleAlign: 'left',
            title: "Privacy Policy",
          }}
        />
        <Stack.Screen
          name="terms-and-conditions"
          options={{
            ...commonHeaderOptions,
            headerTitleAlign: 'left',
            title: "Terms and Conditions",
          }}
        />
        <Stack.Screen
          name="shipping-policy"
          options={{
            ...commonHeaderOptions,
            headerTitleAlign: 'left',
            title: "Shipping Policy",
          }}
        />
        <Stack.Screen
          name="return-refund-exchange-policy"
          options={{
            ...commonHeaderOptions,
            headerTitleAlign: 'left',
            title: "Return, Refund & Exchange Policy",
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
