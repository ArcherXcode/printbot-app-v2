import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { StyleSheet, Text, View, Pressable, TextInput, Modal, Platform, Alert, ActivityIndicator, Animated, Easing, ScrollView, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { User, Building2, AlarmClockPlus, KeyRound, SmartphoneNfc, LogOut, ChevronRight, HelpCircle, X, Save, UserPen } from "lucide-react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useAuthStore } from "@/lib/store/auth-store";
import { defaultRouteForRole } from "@/routes/access";
import { useMe, useUpdateMe } from "@/lib/assetHooksApis/account/hooks";
import {
  useChangePasswordMutation,
  useDisableTwoFactorMutation,
  useEnableAuthenticatorTwoFactorMutation,
  useEnableEmailTwoFactorMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useSetupAuthenticatorTwoFactorMutation,
} from "@/lib/assetHooksApis/publicPages/hooks";
import { useUpdateMyVendorBusiness } from "@/lib/assetHooksApis/cataloge/hooks";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";
import PageState from "@/components/cards/PageState";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";

// --- Custom Animated Bottom Sheet ---
function BottomSheet({
  open,
  onClose,
  title,
  children,
  colorScheme,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  colorScheme: "light" | "dark";
}) {
  const [sheetVisible, setSheetVisible] = useState(open);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;

  const animateTo = useCallback(
    (toValue: 0 | 1, onFinished?: () => void) => {
      Animated.timing(progress, {
        toValue,
        duration: toValue === 1 ? 260 : 210,
        easing: toValue === 1 ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onFinished?.();
        }
      });
    },
    [progress],
  );

  const closeSheet = useCallback(() => {
    animateTo(0, () => {
      setSheetVisible(false);
      onClose();
    });
  }, [animateTo, onClose]);

  useEffect(() => {
    if (open) {
      setSheetVisible(true);
      requestAnimationFrame(() => animateTo(1));
      return;
    }

    if (sheetVisible) {
      animateTo(0, () => setSheetVisible(false));
    }
  }, [animateTo, open, sheetVisible]);

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const sheetTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal visible={sheetVisible} animationType="none" transparent onRequestClose={closeSheet}>
      <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        <Animated.View
          style={[
            styles.filterSheet,
            {
              backgroundColor: colors[colorScheme].elevated,
              borderColor: colors[colorScheme].border,
              paddingBottom: 28,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: colors[colorScheme].textPrimary }]}>{title}</Text>
            <View style={styles.filterHeaderActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={closeSheet}>
                <MaterialIcons name="close" size={24} color={colors[colorScheme].textPrimary} />
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default function AccountScreen() {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";
  const theme = colors[colorScheme];
  const router = useRouter();

  const { role, user } = useAuthStore();
  const isVendor = (role ?? "USER").toUpperCase() === "VENDOR";

  const meQuery = useMe();
  const updateMutation = useUpdateMe();
  const logoutMutation = useLogoutMutation();
  const logoutAllMutation = useLogoutAllMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const enableEmailTwoFactorMutation = useEnableEmailTwoFactorMutation();
  const setupAuthenticatorTwoFactorMutation = useSetupAuthenticatorTwoFactorMutation();
  const enableAuthenticatorTwoFactorMutation = useEnableAuthenticatorTwoFactorMutation();
  const disableTwoFactorMutation = useDisableTwoFactorMutation();
  const updateBusiness = useUpdateMyVendorBusiness();

  // Modal Visibility States
  const [isCompanyInfoModalOpen, setIsCompanyInfoModalOpen] = useState(false);
  const [isBusinessTimingsModalOpen, setIsBusinessTimingsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  // Form States
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const [businessForm, setBusinessForm] = useState({
    opening_time: "",
    closing_time: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [twoFactorMethod, setTwoFactorMethod] = useState<"email" | "authenticator">("email");
  const [authenticatorSetupData, setAuthenticatorSetupData] = useState<Record<string, unknown> | null>(null);
  const [authenticatorCode, setAuthenticatorCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [twoFactorMessage, setTwoFactorMessage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const screenSafeAreaStyle = useMemo(
    () => ({
      paddingTop: Platform.OS === "ios" ? insets.top + 55 : 0,
      paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 8,
    }),
    [insets.bottom, insets.left, insets.right, insets.top],
  );

  useEffect(() => {
    if (meQuery.data) {
      const data = meQuery.data as any;
      setProfileForm({
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        country: data.country || "",
      });

      if (data.vendor) {
        setBusinessForm({
          opening_time: data.vendor.opening_time || "",
          closing_time: data.vendor.closing_time || "",
        });
      }
    }
  }, [meQuery.data]);

  const handleProfileSubmit = async () => {
    try {
      const formData = new FormData();
      Object.entries(profileForm).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      await updateMutation.mutateAsync(formData);
      setIsProfileEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (e) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleBusinessSubmit = async () => {
    try {
      await updateBusiness.mutateAsync({
        opening_time: businessForm.opening_time || null,
        closing_time: businessForm.closing_time || null,
      });
      setIsBusinessTimingsModalOpen(false);
      Alert.alert("Success", "Business timings updated.");
    } catch (e) {
      Alert.alert("Error", "Failed to update business timings");
    }
  };

  const handleChangePassword = async () => {
    try {
      await changePasswordMutation.mutateAsync(passwordForm);
      setIsPasswordModalOpen(false);
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      Alert.alert("Success", "Password updated.");
    } catch (e) {
      Alert.alert("Error", "Failed to change password");
    }
  };

  const handleEnableEmail2FA = async () => {
    try {
      await enableEmailTwoFactorMutation.mutateAsync();
      setIs2FAModalOpen(false);
      Alert.alert("Success", "Email-based 2FA was enabled.");
      void meQuery.refetch();
    } catch (e) {
      Alert.alert("Error", "Failed to enable email 2FA");
    }
  };

  const handleSetupAuthenticator = async () => {
    try {
      const result = await setupAuthenticatorTwoFactorMutation.mutateAsync();
      setAuthenticatorSetupData(result as Record<string, unknown>);
      setTwoFactorMessage("Authenticator setup data is ready.");
    } catch (e) {
      Alert.alert("Error", "Failed to prepare authenticator");
    }
  };

  const handleEnableAuthenticator = async () => {
    try {
      await enableAuthenticatorTwoFactorMutation.mutateAsync({ code: authenticatorCode });
      setAuthenticatorCode("");
      setAuthenticatorSetupData(null);
      setIs2FAModalOpen(false);
      Alert.alert("Success", "Authenticator-based 2FA has been enabled.");
      void meQuery.refetch();
    } catch (e) {
      Alert.alert("Error", "Failed to enable authenticator");
    }
  };

  const handleDisable2FA = async () => {
    try {
      await disableTwoFactorMutation.mutateAsync({ password: disablePassword });
      setDisablePassword("");
      setAuthenticatorSetupData(null);
      setIs2FAModalOpen(false);
      Alert.alert("Success", "Two-factor authentication has been disabled.");
      void meQuery.refetch();
    } catch (e) {
      Alert.alert("Error", "Failed to disable 2FA");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => { } },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logoutMutation.mutateAsync();
            router.replace({
              pathname: "/(public)/login",
              params: {
                from: defaultRouteForRole(role, user),
              },
            });
          },
        },
      ]
    );
  };

  const handleLogoutAll = () => {
    Alert.alert(
      "Logout All Sessions",
      "Are you sure you want to end all active sign-ins across all devices?",
      [
        { text: "Cancel", style: "cancel", onPress: () => { } },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logoutAllMutation.mutateAsync();
            router.replace({
              pathname: "/(public)/login",
              params: {
                from: defaultRouteForRole(role, user),
              },
            });
          },
        },
      ]
    );
  };

  if (meQuery.isLoading) {
    return <View style={[styles.container, { backgroundColor: theme.background }]}><PageState loading title="Loading settings" colorScheme={colorScheme} /></View>;
  }

  if (meQuery.isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <PageState title="Unable to load settings" subtitle="Please retry to fetch your account details." onAction={() => void meQuery.refetch()} actionLabel="Retry" colorScheme={colorScheme} />
      </View>
    );
  }

  const profileRecord = (meQuery.data ?? user) as any;
  const is2FAEnabled = !!(profileRecord?.two_factor_enabled || profileRecord?.is_2fa_enabled || profileRecord?.is_two_factor_enabled);

  const displayName = profileForm.first_name ? `${profileForm.first_name} ${profileForm.last_name}` : user?.username || "User";
  const displayPhone = profileForm.phone || user?.phone || "No phone provided";

  // --- UI Renderers ---

  const renderSettingsItem = (icon: React.ReactNode, title: string, subtitle?: string, onPress?: () => void, isDestructive?: boolean, showChevron = true) => (
    <Pressable style={({ pressed }) => [styles.settingsItem, { backgroundColor: pressed ? theme.background : theme.elevated }]} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        {icon}
        <View style={styles.settingsItemText}>
          <Text style={[styles.settingsItemTitle, { color: isDestructive ? theme.danger : theme.textPrimary }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingsItemSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {showChevron && <ChevronRight color={theme.textSecondary} opacity={0.5} size={20} />}
    </Pressable>
  );

  const renderInput = (label: string, value: string, onChangeText: (text: string) => void, editable: boolean = true, options?: any) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.background,
            color: theme.textPrimary,
            borderColor: editable ? (colorScheme === "dark" ? "#52525B" : "#A1A1AA") : theme.border,
            opacity: editable ? 1 : 0.6,
            // @ts-ignore
            outlineStyle: "none",
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholderTextColor={theme.textSecondary}
        {...options}
      />
    </View>
  );

  // --- Main List Content ---

  const renderContent = () => (
    <View >
      {/* Profile Header Block */}
      <View style={[styles.profileHeader, { backgroundColor: theme.elevated }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + "20" }]}>
          <User size={40} color={theme.primary} />
        </View>
        <View style={styles.profileHeaderText}>
          <Text style={[styles.profileName, { color: theme.textPrimary }]}>{displayName}</Text>
          <Text style={[styles.profileSub, { color: theme.textSecondary }]}>{displayPhone}</Text>
        </View>
      </View>

      {/* Inline Profile Details */}
      <View style={[styles.sectionHeaderRow, { marginTop: 10 }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Profile Details</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {isProfileEditing && (
            <Pressable
              onPress={() => {
                const data = meQuery.data as any;
                if (data) {
                  setProfileForm({
                    first_name: data.first_name || "",
                    middle_name: data.middle_name || "",
                    last_name: data.last_name || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    city: data.city || "",
                    state: data.state || "",
                    pincode: data.pincode || "",
                    country: data.country || "",
                  });
                }
                setIsProfileEditing(false);
              }}
              style={[styles.editButton, { backgroundColor: theme.background, borderColor: theme.border }]}
            >
              <X size={14} color={theme.danger} />
              <Text style={{ color: theme.danger, fontSize: 13, fontWeight: "600", marginLeft: 6 }}>
                Cancel
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => isProfileEditing ? handleProfileSubmit() : setIsProfileEditing(true)}
            style={[styles.editButton, { backgroundColor: isProfileEditing ? theme.primary : theme.background, borderColor: theme.border }]}
          >
            {isProfileEditing ? <Save size={14} color="#fff" /> : <UserPen size={14} color={theme.textPrimary} />}
            <Text style={{ color: isProfileEditing ? "#fff" : theme.textPrimary, fontSize: 13, fontWeight: "600", marginLeft: 6 }}>
              {isProfileEditing ? "Save" : "Edit"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.groupContainer, { backgroundColor: theme.elevated, paddingVertical: 16, paddingHorizontal: 12, gap: 16 }]}>
        {renderInput("First Name", profileForm.first_name, (text) => setProfileForm({ ...profileForm, first_name: text }), isProfileEditing)}
        {renderInput("Last Name", profileForm.last_name, (text) => setProfileForm({ ...profileForm, last_name: text }), isProfileEditing)}
        {renderInput("Phone", profileForm.phone, (text) => setProfileForm({ ...profileForm, phone: text }), isProfileEditing, { keyboardType: "phone-pad" })}
        {renderInput("Address", profileForm.address, (text) => setProfileForm({ ...profileForm, address: text }), isProfileEditing)}
        {renderInput("City", profileForm.city, (text) => setProfileForm({ ...profileForm, city: text }), isProfileEditing)}
        {renderInput("State", profileForm.state, (text) => setProfileForm({ ...profileForm, state: text }), isProfileEditing)}
        {renderInput("Pincode", profileForm.pincode, (text) => setProfileForm({ ...profileForm, pincode: text }), isProfileEditing, { keyboardType: "number-pad" })}
        {renderInput("Country", profileForm.country, (text) => setProfileForm({ ...profileForm, country: text }), isProfileEditing)}
      </View>

      {/* Account Settings Group */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account Settings</Text>
      </View>
      <View style={[styles.groupContainer, { backgroundColor: theme.elevated }]}>
        {renderSettingsItem(<KeyRound color={theme.textSecondary} size={22} />, "Change Password", undefined, () => setIsPasswordModalOpen(true))}
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        {renderSettingsItem(<SmartphoneNfc color={theme.textSecondary} size={22} />, "Two-Step Verification", is2FAEnabled ? "Enabled" : "Off", () => setIs2FAModalOpen(true))}
      </View>

      {/* Vendor Group */}
      {isVendor && (
        <>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Business Settings</Text>
          </View>
          <View style={[styles.groupContainer, { backgroundColor: theme.elevated }]}>
            {renderSettingsItem(<Building2 color={theme.textSecondary} size={22} />, "Company Info", "View legal name and GSTIN", () => setIsCompanyInfoModalOpen(true))}
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            {renderSettingsItem(<AlarmClockPlus color={theme.textSecondary} size={22} />, "Business Timings", "Manage opening and closing hours", () => setIsBusinessTimingsModalOpen(true))}
          </View>
        </>
      )}

      {/* Help & Support Group */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Help</Text>
      </View>
      <View style={[styles.groupContainer, { backgroundColor: theme.elevated }]}>
        {renderSettingsItem(<HelpCircle color={theme.textSecondary} size={22} />, "Contact Support", "Need help? Reach out to us", () => router.push('/(private)/(support)/support'))}
      </View>

      {/* Danger Zone */}
      <View style={[styles.groupContainer, { backgroundColor: theme.elevated, marginTop: 20 }]}>
        {renderSettingsItem(
          logoutAllMutation.isPending ? <ActivityIndicator color={theme.danger} /> : <LogOut color={theme.danger} size={22} />,
          "Logout All Sessions",
          "End all active sign-ins across all devices",
          () => handleLogoutAll(),
          true,
          false
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <Stack.Screen options={{
        headerTitle: "Your Account",
        headerRight: () => (
          <TouchableOpacity onPress={() => {
            handleLogout();
          }}>
            <Feather name="log-out" size={20} color="red" />
          </TouchableOpacity>
        )
      }} />

      <FlashList
        data={[1] as const}
        // @ts-ignore
        estimatedItemSize={1200}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, Platform.OS === "ios" ? screenSafeAreaStyle : { paddingVertical: 12 }]}
        renderItem={renderContent}
      />

      {/* Company Info Bottom Sheet */}
      <BottomSheet open={isCompanyInfoModalOpen} onClose={() => setIsCompanyInfoModalOpen(false)} title="Company Info" colorScheme={colorScheme}>
        {(() => {
          const vendor = profileRecord?.vendor;
          return (
            <View style={{ gap: 16 }}>
              {renderInput("Business Name", vendor?.business_legal_name || "", () => { }, false)}
              {renderInput("Contact Phone", vendor?.phone_contact || profileRecord?.phone || "", () => { }, false)}
              {renderInput("GSTIN", vendor?.gstin || "", () => { }, false)}
              {renderInput("Status", vendor?.status || "", () => { }, false)}
            </View>
          );
        })()}
      </BottomSheet>

      {/* Business Timings Bottom Sheet */}
      <BottomSheet open={isBusinessTimingsModalOpen} onClose={() => setIsBusinessTimingsModalOpen(false)} title="Business Timings" colorScheme={colorScheme}>
        <View style={{ gap: 16 }}>
          <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>Set your operational hours for the print shop.</Text>
          {renderInput("Opening Time (HH:MM)", businessForm.opening_time, (text) => setBusinessForm({ ...businessForm, opening_time: text }))}
          {renderInput("Closing Time (HH:MM)", businessForm.closing_time, (text) => setBusinessForm({ ...businessForm, closing_time: text }))}

          <Pressable style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={handleBusinessSubmit} disabled={updateBusiness.isPending}>
            {updateBusiness.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save Timings</Text>}
          </Pressable>
        </View>
      </BottomSheet>

      {/* Password Bottom Sheet */}
      <BottomSheet open={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password" colorScheme={colorScheme}>
        <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>Enter your current password and a new secure passphrase.</Text>
        <PasswordInput
          label="Current Password"
          value={passwordForm.current_password}
          onChangeText={(t) => setPasswordForm({ ...passwordForm, current_password: t })}
          colorScheme={colorScheme}
        />
        <PasswordInput
          label="New Password"
          value={passwordForm.new_password}
          onChangeText={(t) => setPasswordForm({ ...passwordForm, new_password: t })}
          colorScheme={colorScheme}
        />
        <PasswordInput
          label="Confirm New Password"
          value={passwordForm.confirm_password}
          onChangeText={(t) => setPasswordForm({ ...passwordForm, confirm_password: t })}
          colorScheme={colorScheme}
        />

        <Pressable style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={handleChangePassword} disabled={changePasswordMutation.isPending}>
          {changePasswordMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save Password</Text>}
        </Pressable>
      </BottomSheet>

      {/* 2FA Bottom Sheet */}
      <BottomSheet open={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} title="Two-Step Verification" colorScheme={colorScheme}>
        {twoFactorMessage && (
          <View style={[styles.messageBox, { backgroundColor: theme.primary + "20", borderColor: theme.primary }]}>
            <Text style={[styles.messageText, { color: theme.primary }]}>{twoFactorMessage}</Text>
          </View>
        )}

        {!is2FAEnabled ? (
          <>
            <View style={styles.segmentControl}>
              <Pressable style={[styles.segmentBtn, twoFactorMethod === "email" && { backgroundColor: theme.primary }]} onPress={() => setTwoFactorMethod("email")}>
                <Text style={{ color: twoFactorMethod === "email" ? "#fff" : theme.textSecondary }}>Email</Text>
              </Pressable>
              <Pressable style={[styles.segmentBtn, twoFactorMethod === "authenticator" && { backgroundColor: theme.primary }]} onPress={() => setTwoFactorMethod("authenticator")}>
                <Text style={{ color: twoFactorMethod === "authenticator" ? "#fff" : theme.textSecondary }}>Authenticator App</Text>
              </Pressable>
            </View>

            {twoFactorMethod === "email" ? (
              <View style={{ gap: 16 }}>
                <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>Email TOTP sends a one-time code to your registered email.</Text>
                <Pressable style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={handleEnableEmail2FA} disabled={enableEmailTwoFactorMutation.isPending}>
                  {enableEmailTwoFactorMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Enable Email TOTP</Text>}
                </Pressable>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                {!authenticatorSetupData ? (
                  <>
                    <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>Use an authenticator app to generate codes.</Text>
                    <Pressable style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={handleSetupAuthenticator} disabled={setupAuthenticatorTwoFactorMutation.isPending}>
                      {setupAuthenticatorTwoFactorMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Prepare Authenticator</Text>}
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>Fallback Secret:</Text>
                    <View style={{ backgroundColor: theme.background, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.border }}>
                      <Text style={{ color: theme.textPrimary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>{String(authenticatorSetupData.secret || '')}</Text>
                    </View>
                    {renderInput("Enter generated code", authenticatorCode, setAuthenticatorCode, true, { keyboardType: "number-pad", maxLength: 6 })}
                    <Pressable style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={handleEnableAuthenticator} disabled={enableAuthenticatorTwoFactorMutation.isPending}>
                      {enableAuthenticatorTwoFactorMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Confirm Authenticator</Text>}
                    </Pressable>
                  </>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={{ gap: 16 }}>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>Enter your password to disable Two-Step Verification.</Text>
            {renderInput("Password", disablePassword, setDisablePassword, true, { secureTextEntry: true })}
            <Pressable style={[styles.primaryBtn, { backgroundColor: theme.danger }]} onPress={handleDisable2FA} disabled={disableTwoFactorMutation.isPending}>
              {disableTwoFactorMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Disable 2FA</Text>}
            </Pressable>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

function PasswordInput({
  label,
  value,
  onChangeText,
  colorScheme,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  colorScheme: "light" | "dark";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const theme = colors[colorScheme];

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.passwordInputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              color: theme.textPrimary,
              borderColor: colorScheme === "dark" ? "#52525B" : "#A1A1AA",
              outlineStyle: "none",
              paddingRight: 48,
            } as any
          ]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
          placeholderTextColor={theme.textSecondary}
        />
        <Pressable
          style={styles.eyeButton}
          onPress={() => setIsVisible(!isVisible)}
        >
          <Feather name={isVisible ? "eye" : "eye-off"} size={16} color={theme.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  profileHeaderText: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileSub: {
    fontSize: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  groupContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingsItemText: {
    marginLeft: 16,
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
  },
  settingsItemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 54, // Align with text
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  passwordInputWrapper: {
    justifyContent: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    height: '100%',
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  messageBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 13,
    fontWeight: "500",
  },
  segmentControl: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    minHeight: 300,
    maxHeight: "90%",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  filterHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  sheetContent: {
    padding: 24,
    paddingTop: 4,
    gap: 16,
  },
});