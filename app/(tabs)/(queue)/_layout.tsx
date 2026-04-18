import Header from '@/components/appLayout/header';
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
            initialRouteName='queue'>
            <Stack.Screen name="queue"
                options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Queue'
                }}
            />
        </Stack>
    );
}