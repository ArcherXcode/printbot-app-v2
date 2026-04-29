import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { colors } from '@/constants/colors';


export default function AccountLayout() {
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
        }
    };

    return (
        <>
            <Stack
                initialRouteName='settings'
            >
                <Stack.Screen name="settings"
                    options={{
                        ...commonHeaderOptions,
                        headerTitleAlign: 'left',
                        headerTitle: 'Your Account'
                    }}
                />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </>
    );
}