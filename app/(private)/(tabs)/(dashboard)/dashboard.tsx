import { StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '@/lib/store/auth-store';
import VendorDashboard from './vendorDashboard';
import UserDashboard from './userDashboard';

export default function DashboardScreen() {
  const role = useAuthStore((state) => state.role);
  const isVendor = role?.toUpperCase() === 'VENDOR';

  return (
    isVendor ? (
      <VendorDashboard />
    ) : (
      <UserDashboard />
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
