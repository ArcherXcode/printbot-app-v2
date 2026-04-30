import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';


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
        }
    };

    return (
        <>
            <Stack
                initialRouteName='support'
            >
                <Stack.Screen name="support"
                    options={{
                        ...commonHeaderOptions,
                        headerTitleAlign: 'left',
                        headerTitle: 'Ticket Center'
                    }}
                />
                <Stack.Screen name="create"
                    options={{
                        ...commonHeaderOptions,
                        headerBackVisible: Platform.OS === 'ios' ? false : true,
                        headerTitleAlign: 'left',
                        headerTitle: 'Create a Ticket'
                    }}
                />

            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </>
    );
}