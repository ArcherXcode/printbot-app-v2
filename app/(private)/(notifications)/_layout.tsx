import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Platform, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import * as Haptics from "expo-haptics";

export default function NotificationsLayout() {
    const router = useRouter();
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const commonHeaderOptions = {
        headerShown: true,
        headerBackTitleVisible: true,
        headerBackVisible: true,
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
        headerLeft: () => (
            Platform.OS === 'ios' && (
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back()
                    }}
                >
                    <ChevronLeft
                        size={24}
                        color={colors[colorScheme].headerText}
                    />
                </TouchableOpacity>
            )
        ),
    };

    return (
        <>
            <Stack
                initialRouteName='notifications'
            >
                <Stack.Screen name="notifications"
                    options={{
                        ...commonHeaderOptions,
                        headerTitleAlign: 'left',
                        headerTitle: 'Notifications'
                    }}
                />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </>
    );
}