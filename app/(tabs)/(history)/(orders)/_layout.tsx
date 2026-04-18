import { Stack } from 'expo-router';
// import { useColorScheme } from '@/hooks/appHooks/useColorScheme';

export default function OrdersLayout() {
    //   const colorScheme = useColorScheme();

    return (
        <Stack
            initialRouteName='orders'
        >
            <Stack.Screen name="orders" options={{ headerShown: false }} />
        </Stack>
    );
}