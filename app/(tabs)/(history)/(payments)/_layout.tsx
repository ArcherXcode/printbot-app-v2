import { Stack } from 'expo-router';
// import { useColorScheme } from '@/hooks/appHooks/useColorScheme';

export default function PaymentsLayout() {
//   const colorScheme = useColorScheme();
  
  return (
    <Stack
        initialRouteName='payments'
    >
        <Stack.Screen name="payments" options={{ headerShown: false }} />
    </Stack>
    );
}