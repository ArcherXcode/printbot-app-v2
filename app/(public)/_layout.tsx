import { Stack } from 'expo-router';
// import { useColorScheme } from '@/hooks/appHooks/useColorScheme';

export default function PublicLayout() {
    //   const colorScheme = useColorScheme();
    return (
        <Stack initialRouteName='gettingStarted' screenOptions={{ headerShown: false }}>
            <Stack.Screen name='gettingStarted' options={{ headerShown: false }} />
            <Stack.Screen name='login' options={{ headerShown: false }} />
            <Stack.Screen name='signupSelect' options={{ headerShown: false }} />
            <Stack.Screen name='signupUser' options={{ headerShown: false }} />
            <Stack.Screen name='signupVendor' options={{ headerShown: false }} />
            <Stack.Screen name='requestResetPassword' options={{ headerShown: false }} />
            <Stack.Screen name='confirmResetPassword' options={{ headerShown: false }} />
        </Stack>
    );
}