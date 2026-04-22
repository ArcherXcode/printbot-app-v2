import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import { useUiStore } from '@/lib/store/ui-store';

export default function PublicLayout() {
    const colorScheme = useColorScheme();
    const isFirstLaunch = useUiStore((s) => s.isFirstLaunch);
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