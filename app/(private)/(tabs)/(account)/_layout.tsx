import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLogoutMutation } from '@/lib/assetHooksApis/publicPages/hooks';
import { defaultRouteForRole } from '@/routes/access';
import { useAuthStore } from '@/lib/store/auth-store';
import { useNavigation } from '@react-navigation/native';

export default function DashboardLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const { role, user } = useAuthStore();
    const logoutMutation = useLogoutMutation();
    const naviagtion = useNavigation();

    const handleLogout = async () => {
        await logoutMutation.mutateAsync();
        router.replace({
            pathname: "/(public)/login",
            params: {
                from: defaultRouteForRole(role, user),
            },
        });
    };

    const commonHeaderOptions = {
        headerShown: true,
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold' as const,
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        },
        headerRight: () => (
            <TouchableOpacity
                onPress={() => handleLogout()}
            >
                <Feather name="log-out" size={22} color={'red'} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
        )
    };

    return (
        <Stack
            initialRouteName='account'
        >
            <Stack.Screen name="account"
                options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Your Account'
                }}
            />
            <Stack.Screen name="support"
                options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Support Center'
                }}
            />
        </Stack>
    );
}