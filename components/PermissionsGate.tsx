import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Linking, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppPermissions } from '@/lib/hooks/useAppPermissions';
import { useUiStore } from '@/lib/store/ui-store';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';

type PermissionsGateProps = {
  children: React.ReactNode;
};

export function PermissionsGate({ children }: PermissionsGateProps) {
  const {
    permissions,
    isLoading,
    requestMedia,
    requestLocation,
    requestNotifications,
    hasAllRequiredPermissions,
    checkPermissions,
  } = useAppPermissions();

  const isFirstLaunch = useUiStore((s) => s.isFirstLaunch);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [requesting, setRequesting] = useState(false);

  // Poll for permission changes if user goes to settings and back
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  if (hasAllRequiredPermissions) {
    return <>{children}</>;
  }

  // If we get here, we need to show the permission gate overlay.
  // We MUST render the children (the Stack) behind the overlay to prevent Expo Router from crashing.
  const renderOverlay = () => {
    if (isLoading || isFirstLaunch === null) {
      return (
        <View style={[styles.absoluteOverlay, styles.center, { backgroundColor: isDark ? '#0a0e27' : '#f0f4ff' }]}>
          <ActivityIndicator size="large" color="#5986e7" />
        </View>
      );
    }

  const handleGrantPermissions = async () => {
    setRequesting(true);
    
    // Sequence the requests nicely
    if (!permissions.media.granted && permissions.media.canAskAgain) {
      await requestMedia();
    }
    
    if (!permissions.location.granted && permissions.location.canAskAgain) {
      await requestLocation();
    }
    
    if (!permissions.notifications.granted && permissions.notifications.canAskAgain) {
      await requestNotifications();
    }

    setRequesting(false);
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const needsSettings = 
    (!permissions.media.granted && !permissions.media.canAskAgain) ||
    (!permissions.location.granted && !permissions.location.canAskAgain);

  const isNetworkOffline = !permissions.network.connected;

  const colors = {
    bg: isDark ? '#0a0e27' : '#f0f4ff',
    card: isDark ? '#12183a' : '#ffffff',
    cardBorder: isDark ? '#1e2a50' : '#dde3f5',
    heading: isDark ? '#ffffff' : '#0a0e27',
    subheading: isDark ? '#a0a8c8' : '#5a6080',
    icon: isDark ? '#6b7194' : '#8890aa',
    success: '#34c759',
    error: '#e05c6a',
  };

    return (
      <View style={[styles.absoluteOverlay, { backgroundColor: colors.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Feather name="shield" size={40} color="#5986e7" />
            </View>
            <Text style={[styles.title, { color: colors.heading }]}>
              {isFirstLaunch ? 'Welcome to PrintBot' : 'Permissions Required'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.subheading }]}>
              {isFirstLaunch 
                ? "To get started, we need a few permissions to ensure the app works seamlessly for you."
                : "PrintBot needs certain permissions to function correctly. Please enable them in your settings."}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Media Permission */}
            <PermissionItem
              icon="image"
              title="Photos & Storage"
              description="Required to upload and save documents."
              granted={permissions.media.granted}
              colors={colors}
            />
            
            {/* Network Connection */}
            <PermissionItem
              icon="wifi"
              title="Internet Access"
              description="Required to connect to PrintBot servers."
              granted={permissions.network.connected}
              colors={colors}
            />

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            {/* Location Permission */}
            <PermissionItem
              icon="map-pin"
              title="Location"
              description="Required to find nearby printing locations."
              granted={permissions.location.granted}
              colors={colors}
            />

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            {/* Notifications Permission */}
            <PermissionItem
              icon="bell"
              title="Notifications"
              description="Optional. Used to send order updates."
              granted={permissions.notifications.granted}
              colors={colors}
              optional
            />
          </View>

          <View style={styles.footer}>
            {isNetworkOffline ? (
              <Pressable
                onPress={() => checkPermissions()}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              >
                <LinearGradient
                  colors={['#5986e7', '#4a6fd4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Check Connection</Text>
                </LinearGradient>
              </Pressable>
            ) : needsSettings ? (
              <Pressable
                onPress={handleOpenSettings}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              >
                <LinearGradient
                  colors={['#5986e7', '#4a6fd4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Open Settings</Text>
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleGrantPermissions}
                disabled={requesting}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, requesting && styles.buttonDisabled]}
              >
                <LinearGradient
                  colors={['#5986e7', '#4a6fd4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {requesting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Continue</Text>
                  )}
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {children}
      {renderOverlay()}
    </View>
  );
}

function PermissionItem({ 
  icon, 
  title, 
  description, 
  granted, 
  colors,
  optional = false 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  granted: boolean, 
  colors: any,
  optional?: boolean
}) {
  return (
    <View style={styles.itemRow}>
      <View style={[styles.itemIcon, { backgroundColor: colors.bg }]}>
        <Feather name={icon} size={20} color={colors.icon} />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, { color: colors.heading }]}>{title}</Text>
          {optional && <Text style={[styles.optionalBadge, { color: colors.subheading }]}>Optional</Text>}
        </View>
        <Text style={[styles.itemDesc, { color: colors.subheading }]}>{description}</Text>
      </View>
      <View style={styles.statusIcon}>
        {granted ? (
          <Feather name="check-circle" size={24} color={colors.success} />
        ) : (
          <Feather name="x-circle" size={24} color={optional ? colors.icon : colors.error} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  absoluteOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: '15%',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(89, 134, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  itemRow: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionalBadge: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
  itemDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusIcon: {
    marginLeft: 12,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
