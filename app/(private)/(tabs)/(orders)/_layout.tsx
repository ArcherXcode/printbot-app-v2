import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import { Platform, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';

export default function OrdersLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const commonHeaderOptions = {
        headerShown: true,
        headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold' as const,
            color: colors[colorScheme].headerText,
        },
        headerTransparent: Platform.OS === 'ios' ? true : false,
        headerShadowVisible: false,
        headerStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors[colorScheme].headerBackground,
        },
        headerRight: () => (
            <TouchableOpacity
                onPress={() => router.push('/(private)/(notifications)/notifications')}
            >
                <Feather name="bell" size={22} color={colors[colorScheme].headerText} />
            </TouchableOpacity>
        )
    };

    return (
        <>
            <Stack
                initialRouteName='orders'
            >
                <Stack.Screen name="orders" options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Past Orders',
                }} />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </>
    );
}