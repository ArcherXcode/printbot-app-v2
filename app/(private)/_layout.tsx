import { Stack } from 'expo-router';

export default function NotificationsLayout() {
    return (
        <Stack
            initialRouteName='(tabs)'
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(notifications)" options={{ headerShown: false }} />
            <Stack.Screen name="(support)" options={{ headerShown: false }} />
        </Stack>
    );
}
