import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
import { Platform, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';

export default function QueueLayout() {
    const colorScheme = useColorScheme() as 'light' | 'dark';

    const commonHeaderOptions = {
        headerShown: true,
        headerTintColor: colors[colorScheme].headerText,
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
                initialRouteName='cataloge'
            >
                <Stack.Screen name="cataloge"
                    options={{
                        ...commonHeaderOptions,
                        headerTitleAlign: 'left',
                        headerTitle: 'Shop Management'
                    }}
                />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </>
    );
}