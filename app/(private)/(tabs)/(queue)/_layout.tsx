import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function QueueLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const commonHeaderOptions = {
        headerShown: true,
        headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold' as const,
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        },
        headerRight: () => (
            <TouchableOpacity
                onPress={() => router.push('/(private)/(notifications)/notifications')}
            >
                <Feather name="bell" size={22} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
        )
    };
    return (
        <Stack
            initialRouteName='queue'>
            <Stack.Screen name="queue"
                options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Order Queue'
                }}
            />
        </Stack>
    );
}