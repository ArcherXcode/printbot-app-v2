import { Redirect } from 'expo-router';
import { useUiStore } from '@/lib/store/ui-store';
import { useAuthStore } from '@/lib/store/auth-store';

export default function RootIndex() {
  const isFirstLaunch = useUiStore((s) => s.isFirstLaunch);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isFirstLaunch) {
    return <Redirect href='/(public)/gettingStarted' />;
  }

  if (isAuthenticated) {
    return <Redirect href='/(private)/(tabs)/(dashboard)/dashboard' />;
  }

  return <Redirect href='/(public)/login' />;
}