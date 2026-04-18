import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';

export default function DashboardLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const commonHeaderOptions = {
        headerShown: true,
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold' as const,
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        }
    };

    return (
        <Stack
            initialRouteName='account'
        >
            <Stack.Screen name="account"
                options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Account'
                }}
            />
            <Stack.Screen name="support"
                options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Support'
                }}
            />
        </Stack>
    );
}