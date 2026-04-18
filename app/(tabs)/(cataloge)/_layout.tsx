import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';

export default function QueueLayout() {
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
            initialRouteName='cataloge'
        >
            <Stack.Screen name="cataloge"
                options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Cataloge'
                }}
            />
        </Stack>
    );
}