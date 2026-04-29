import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/lib/store/auth-store';


export default function DashboardLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const role = useAuthStore((state) => state.role);
    // Default to USER if no role is set or it's not explicitly VENDOR
    const isVendor = role?.toUpperCase() === 'VENDOR';
    const isUser = !isVendor;

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
        }
    };

    return (
        <>
            <Stack
                initialRouteName='dashboard'
                screenOptions={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: isUser ? 'Discover Shops' : 'Dashboard',
                }}
            >
                <Stack.Screen name="dashboard" />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </>
    );
}
