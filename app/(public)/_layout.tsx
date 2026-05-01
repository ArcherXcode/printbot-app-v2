import { Redirect, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import { useUiStore } from '@/lib/store/ui-store';
import { useAuthStore } from '@/lib/store/auth-store';

export default function PublicLayout() {
    const colorScheme = useColorScheme();
    const isFirstLaunch = useUiStore((s) => s.isFirstLaunch);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const pendingBiometricPrompt = useAuthStore((s) => s.pendingBiometricPrompt);

    // Keep login screen mounted while biometric enable prompt is pending.
    if (isAuthenticated && !pendingBiometricPrompt) {
        return <Redirect href='/(private)/(tabs)/(dashboard)/dashboard' />;
    }

    return (
        <>
            <Stack initialRouteName={isFirstLaunch ? 'gettingStarted' : 'login'} screenOptions={{ headerShown: false }}>
                <Stack.Screen name='gettingStarted' options={{ headerShown: false }} />
                <Stack.Screen name='login' options={{ headerShown: false }} />
                <Stack.Screen name='signupSelect' options={{ headerShown: false }} />
                <Stack.Screen name='signupUser' options={{ headerShown: false }} />
                <Stack.Screen name='signupVendor' options={{ headerShown: false }} />
                <Stack.Screen name='requestResetPassword' options={{ headerShown: false }} />
                <Stack.Screen name='confirmResetPassword' options={{ headerShown: false }} />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </>
    );
}
