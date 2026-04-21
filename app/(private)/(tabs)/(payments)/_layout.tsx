import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function PaymentsLayout() {
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
                <Feather name="bell" size={24} color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
        )
    };

    return (
        <Stack
            initialRouteName='payments'
        >
            <Stack.Screen name="payments" options={{
                ...commonHeaderOptions,
                headerTitleAlign: 'center',
                headerTitle: 'Your Payments',
            }} />
        </Stack>
    );
}