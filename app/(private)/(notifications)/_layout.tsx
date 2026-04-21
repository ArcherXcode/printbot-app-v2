import Header from '@/components/appLayout/header';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Platform, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

export default function NotificationsLayout() {
    const router = useRouter();
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const commonHeaderOptions = {
        headerShown: true,
        headerBackTitleVisible: true,
        headerBackVisible: true,
        headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
        headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold' as const,
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
        },
        headerLeft: () => (
            Platform.OS === 'ios' && (
                <TouchableOpacity
                    onPress={() => router.back()}
                >
                    <ChevronLeft
                        size={24}
                        color={colorScheme === 'dark' ? '#ffffff' : '#000000'}
                    />
                </TouchableOpacity>
            )
        ),
    };

    return (
        <Stack
            initialRouteName='notifications'
        >
            <Stack.Screen name="notifications"
                options={{
                    ...commonHeaderOptions,
                    headerTitleAlign: 'center',
                    headerTitle: 'Notifications'
                }}
            />
        </Stack>
    );
}