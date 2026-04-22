import { Stack, useRouter, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useLogoutMutation } from '@/lib/assetHooksApis/publicPages/hooks';
import { useAuthStore } from '@/lib/store/auth-store';

export default function NotificationsLayout() {
    const router = useRouter();
    const navigation = useNavigation();
    const logoutMutation = useLogoutMutation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            const isAuth = useAuthStore.getState().isAuthenticated;
            if (!isAuth) {
                return;
            }

            e.preventDefault();
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
                            navigation.dispatch(e.data.action);
                        },
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation, logoutMutation]);

    return (
        <Stack
            initialRouteName='(tabs)'
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(notifications)" options={{ headerShown: false }} />
        </Stack>
    );
}