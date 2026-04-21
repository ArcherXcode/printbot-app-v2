import { useState, useEffect, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Network from 'expo-network';
import { AppState, AppStateStatus } from 'react-native';

export type PermissionStatusDetails = {
  granted: boolean;
  canAskAgain: boolean;
};

export type AppPermissionsState = {
  media: PermissionStatusDetails;
  location: PermissionStatusDetails;
  notifications: PermissionStatusDetails;
  network: { connected: boolean };
};

const defaultPermission: PermissionStatusDetails = { granted: false, canAskAgain: true };

export function useAppPermissions() {
  const [permissions, setPermissions] = useState<AppPermissionsState>({
    media: defaultPermission,
    location: defaultPermission,
    notifications: defaultPermission,
    network: { connected: true }, // Optimistic default
  });

  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [mediaStatus, locationStatus, notificationStatus, networkStatus] = await Promise.all([
        MediaLibrary.getPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
        Notifications.getPermissionsAsync(),
        Network.getNetworkStateAsync(),
      ]);

      setPermissions({
        media: {
          granted: mediaStatus.granted,
          canAskAgain: mediaStatus.canAskAgain,
        },
        location: {
          granted: locationStatus.granted,
          canAskAgain: locationStatus.canAskAgain,
        },
        notifications: {
          granted: notificationStatus.granted || notificationStatus.status === 'granted',
          canAskAgain: notificationStatus.canAskAgain,
        },
        network: {
          connected: networkStatus.isConnected ?? true,
        },
      });
    } catch (e) {
      console.warn('Failed to check permissions', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermissions();

    // Re-check when app comes to foreground (in case user changed settings)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermissions();
      }
    });

    return () => subscription.remove();
  }, [checkPermissions]);

  const requestMedia = async () => {
    const res = await MediaLibrary.requestPermissionsAsync();
    setPermissions(prev => ({
      ...prev,
      media: { granted: res.granted, canAskAgain: res.canAskAgain }
    }));
    return res;
  };

  const requestLocation = async () => {
    const res = await Location.requestForegroundPermissionsAsync();
    setPermissions(prev => ({
      ...prev,
      location: { granted: res.granted, canAskAgain: res.canAskAgain }
    }));
    return res;
  };

  const requestNotifications = async () => {
    const res = await Notifications.requestPermissionsAsync();
    setPermissions(prev => ({
      ...prev,
      notifications: { granted: res.granted || res.status === 'granted', canAskAgain: res.canAskAgain }
    }));
    return res;
  };

  // Notification is optional, but Media, Location and Network are required for the core app
  const hasAllRequiredPermissions = permissions.media.granted && permissions.location.granted && permissions.network.connected;

  return {
    permissions,
    isLoading,
    checkPermissions,
    requestMedia,
    requestLocation,
    requestNotifications,
    hasAllRequiredPermissions,
  };
}
