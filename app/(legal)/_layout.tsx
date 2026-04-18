import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

export default function LegalLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme() as 'light' | 'dark';

  const commonHeaderOptions = {
    headerShown: true,
    headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colorScheme === 'dark' ? '#ffffff' : '#000000',
    },
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => router.back()}
      >
        <ChevronLeft
          size={24}
          color={colorScheme === 'dark' ? '#ffffff' : '#000000'}
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
            headerTitleAlign: 'center',
            title: "Privacy Policy",
          }}
        />
        <Stack.Screen
          name="terms-and-conditions"
          options={{
            ...commonHeaderOptions,
            headerTitleAlign: 'center',
            title: "Terms and Conditions",
          }}
        />
        <Stack.Screen
          name="shipping-policy"
          options={{
            ...commonHeaderOptions,
            headerTitleAlign: 'center',
            title: "Shipping Policy",
          }}
        />
        <Stack.Screen
          name="return-refund-exchange-policy"
          options={{
            ...commonHeaderOptions,
            headerTitleAlign: 'center',
            title: "Return, Refund & Exchange Policy",
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
