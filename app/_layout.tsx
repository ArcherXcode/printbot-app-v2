import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { queryClient } from '@/lib/query/query-client';
import { useUiStore } from '@/lib/store/ui-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { validateToken } from '@/lib/assetHooksApis/publicPages/api';
import { PermissionsGate } from '@/components/PermissionsGate';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(public)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    InterRegular: require('../assets/fonts/InterRegular.ttf'),
    InterItalic: require('../assets/fonts/InterItalic.ttf'),
    ...FontAwesome.font,
    ...MaterialIcons.font,
    ...FontAwesome5.font,
  });

  const isFirstLaunch = useUiStore((s) => s.isFirstLaunch);
  const setIsFirstLaunch = useUiStore((s) => s.setIsFirstLaunch);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function checkFirstLaunch() {
      try {
        const hasOpened = await SecureStore.getItemAsync('has_opened_before');
        if (!hasOpened) {
          await SecureStore.setItemAsync('has_opened_before', new Date().toISOString());
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (e) {
        setIsFirstLaunch(false);
      }
    }
    checkFirstLaunch();
  }, [setIsFirstLaunch]);

  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [isValidatingToken, setIsValidatingToken] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkToken() {
      if (!isHydrated || isFirstLaunch === null) return;
      
      if (isFirstLaunch === true) {
        if (mounted) setIsValidatingToken(false);
        return;
      }
      
      const currentToken = useAuthStore.getState().accessToken;
      
      if (!currentToken) {
        useAuthStore.getState().clearSession();
        await SecureStore.deleteItemAsync('bio_username');
        await SecureStore.deleteItemAsync('bio_password');
        if (mounted) setIsValidatingToken(false);
        return;
      }
      
      try {
        await validateToken(currentToken);
      } catch (error) {
        useAuthStore.getState().clearSession();
        await SecureStore.deleteItemAsync('bio_username');
        await SecureStore.deleteItemAsync('bio_password');
      }
      if (mounted) setIsValidatingToken(false);
    }
    
    checkToken();

    return () => { mounted = false; };
  }, [isHydrated, isFirstLaunch]);

  useEffect(() => {
    if (loaded && isFirstLaunch !== null && !isValidatingToken) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isFirstLaunch, isValidatingToken]);

  if (!loaded || isFirstLaunch === null || isValidatingToken) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PermissionsGate>
        <Stack initialRouteName='(public)' screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(legal)" options={{ headerShown: false }} />
          <Stack.Screen name="(private)" options={{ headerShown: false }} />
          <Stack.Screen name="(public)" options={{ headerShown: false }} />
          <Stack.Screen name="notFound" options={{ title: 'Oops!' }} />
        </Stack>
      </PermissionsGate>
    </ThemeProvider>
  );
}
