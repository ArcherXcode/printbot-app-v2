import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';

export default function DashboardLayout() {
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
            initialRouteName='dashboard'
            screenOptions={{
                ...commonHeaderOptions,
                headerTitleAlign: 'center',
                headerTitle: 'Dashboard'
            }}
        >
            <Stack.Screen name="dashboard" />
        </Stack>
    );
}