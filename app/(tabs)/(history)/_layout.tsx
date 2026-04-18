import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';

export default function QueueLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const commonHeaderOptions = {
        headerShown: true,
        headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold' as const,
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        },
    };

    return (
        <Stack
            initialRouteName='(orders)'
        >
            <Stack.Screen name="(orders)"
                options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Orders'
                }}
            />
            <Stack.Screen name="(payments)"
                options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Payments'
                }}
            />
        </Stack>
    );
}