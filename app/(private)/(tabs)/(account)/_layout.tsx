import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLogoutMutation } from '@/lib/assetHooksApis/publicPages/hooks';
import { defaultRouteForRole } from '@/routes/access';
import { useAuthStore } from '@/lib/store/auth-store';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { colors } from '@/constants/colors';


export default function DashboardLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const { role, user } = useAuthStore();
    const logoutMutation = useLogoutMutation();
    const naviagtion = useNavigation();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel', onPress: () => {} },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logoutMutation.mutateAsync();
                        router.replace({
                            pathname: "/(public)/login",
                            params: {
                                from: defaultRouteForRole(role, user),
                            },
                        });
                    },
                },
            ]
        );
    };

    const commonHeaderOptions = {
        headerShown: true,
        headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold' as const,
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        },
        headerTransparent: Platform.OS === 'ios' ? true : false,
        headerShadowVisible: false,
        headerStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors[colorScheme].headerBackground,
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
        <>
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
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </>
    );
}