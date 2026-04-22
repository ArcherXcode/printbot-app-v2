import { StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '@/lib/store/auth-store';
import VendorAccount from './vendorAccount';
import UserAccount from './userAccount';

export default function AccountScreen() {
  const role = useAuthStore((state) => state.role);
  const isVendor = role?.toUpperCase() === 'VENDOR';
  return (
    isVendor ? (
      <VendorAccount />
    ) : (
      <UserAccount />
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
