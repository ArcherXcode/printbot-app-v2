import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function OrdersLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const commonHeaderOptions = {
        headerShown: true,
        headerTitleStyle: {
            fontSize: 18,
            fontWeight: 'bold' as const,
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        },
        headerRight: () => (
            <TouchableOpacity
                onPress={() => router.push('/(tabs)/(notifications)/notifications')}
            >
                <Feather name="bell" size={24} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
        )
    };

    return (
        <Stack
            initialRouteName='orders'
        >
            <Stack.Screen name="orders" options={{
                ...commonHeaderOptions,
                headerTitle: 'Orders',
            }} />
        </Stack>
    );
}