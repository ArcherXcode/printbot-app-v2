import { Stack, useRouter } from 'expo-router';

export default function NotificationsLayout() {
    const router = useRouter();
    return (
        <Stack
            initialRouteName='(tabs)'
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(notifications)" options={{ headerShown: false }} />
        </Stack>
    );
}