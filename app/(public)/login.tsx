import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from "expo-haptics";
import { loginSchema, isTwoFactorChallenge, unwrapLoginResponse } from '@/lib/assetHooksApis/publicPages/types';
import type { LoginDto } from '@/lib/assetHooksApis/publicPages/types';
import { useLoginMutation } from '@/lib/assetHooksApis/publicPages/hooks';
import type { ApiError } from '@/lib/api/error-map';
import { useAuthStore } from '@/lib/store/auth-store';

/* ── Types ── */
type FormFields = 'username' | 'password' | 'form';
type FormErrors = Partial<Record<FormFields, string>>;

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const biometricsEnabled = useAuthStore((s) => s.biometricsEnabled);
  const setBiometricsEnabled = useAuthStore((s) => s.setBiometricsEnabled);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [bioTypes, setBioTypes] = useState<LocalAuthentication.AuthenticationType[]>([]);

  useEffect(() => {
    if (biometricsEnabled) {
      LocalAuthentication.supportedAuthenticationTypesAsync().then(types => {
        setBioTypes(types);
      });
    }
  }, [biometricsEnabled]);

  const loginMutation = useLoginMutation();

  /* ── Validation ── */
  const validate = (): LoginDto | null => {
    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as FormFields;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return null;
    }
    setErrors({});
    return result.data;
  };

  const handlePostLogin = async (payload: LoginDto) => {
    let currentBiometricsEnabled = biometricsEnabled;

    if (biometricsEnabled) {
      const storedUsername = await SecureStore.getItemAsync('bio_username');
      if (storedUsername && storedUsername !== payload.username) {
        // Logged into a different account; clear old credentials and prompt again
        await SecureStore.deleteItemAsync('bio_username');
        await SecureStore.deleteItemAsync('bio_password');
        setBiometricsEnabled(false);
        currentBiometricsEnabled = false;
      } else if (storedUsername && storedUsername === payload.username) {
        // Update password just in case it was changed
        await SecureStore.setItemAsync('bio_password', payload.password);
      }
    }

    if (!currentBiometricsEnabled) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        Alert.alert(
          'Enable Biometrics',
          'Would you like to enable Face ID / Touch ID for quicker login next time?',
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => router.replace('/(private)/(tabs)/(dashboard)/dashboard'),
            },
            {
              text: 'Enable',
              onPress: async () => {
                const result = await LocalAuthentication.authenticateAsync({
                  promptMessage: 'Enable Biometric Login',
                });
                if (result.success) {
                  await SecureStore.setItemAsync('bio_username', payload.username);
                  await SecureStore.setItemAsync('bio_password', payload.password);
                  setBiometricsEnabled(true);
                }
                router.replace('/(private)/(tabs)/(dashboard)/dashboard');
              },
            },
          ]
        );
        return;
      }
    }

    router.replace('/(private)/(tabs)/(dashboard)/dashboard');
  };

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Log in with Biometrics',
    });

    if (result.success) {
      const storedUsername = await SecureStore.getItemAsync('bio_username');
      const storedPassword = await SecureStore.getItemAsync('bio_password');

      if (storedUsername && storedPassword) {
        const payload = { username: storedUsername, password: storedPassword };
        loginMutation.mutate(payload, {
          onSuccess: (data) => {
            if (isTwoFactorChallenge(data)) {
              Alert.alert(
                'Two-Factor Authentication',
                'Your account has 2FA enabled. Please verify via the web portal for now — mobile 2FA support is coming soon.',
                [{ text: 'OK' }],
              );
              return;
            }
            handlePostLogin(payload);
          },
          onError: (error) => {
            const apiError = error as unknown as ApiError;
            setErrors({
              form: apiError.message || 'Invalid credentials. Please try again.',
            });
          },
        });
      } else {
        setErrors({ form: 'Biometric credentials not found. Please log in manually.' });
      }
    }
  };

  const handleLogin = async () => {
    const payload = validate();
    if (!payload) return;

    setErrors({});

    loginMutation.mutate(payload, {
      onSuccess: (data) => {
        if (isTwoFactorChallenge(data)) {
          Alert.alert(
            'Two-Factor Authentication',
            'Your account has 2FA enabled. Please verify via the web portal for now — mobile 2FA support is coming soon.',
            [{ text: 'OK' }],
          );
          return;
        }

        handlePostLogin(payload);
      },
      onError: (error) => {
        const apiError = error as unknown as ApiError;
        setErrors({
          form: apiError.message || 'Invalid credentials. Please try again.',
        });
      },
    });
  };

  const isLoading = loginMutation.isPending;

  /* ── Dynamic colors ── */
  const colors = {
    bg: isDark ? '#0a0e27' : '#f0f4ff',
    card: isDark ? '#12183a' : '#ffffff',
    cardBorder: isDark ? '#1e2a50' : '#dde3f5',
    label: isDark ? '#a0a8c8' : '#5a6080',
    input: isDark ? '#1a2240' : '#eef1fb',
    inputBorder: isDark ? '#2a3460' : '#cdd4ee',
    inputText: isDark ? '#ffffff' : '#0a0e27',
    placeholder: isDark ? '#4a5278' : '#9099ba',
    heading: isDark ? '#ffffff' : '#0a0e27',
    subheading: isDark ? '#a0a8c8' : '#5a6080',
    icon: isDark ? '#6b7194' : '#8890aa',
    termsText: isDark ? '#6b7194' : '#8890aa',
    termsLink: isDark ? '#8b93b8' : '#5986e7',
    error: '#e05c6a',
    forgotLink: isDark ? '#5986e7' : '#4a6fd4',
  };

  let bioIconName: keyof typeof MaterialCommunityIcons.glyphMap = "fingerprint";
  if (bioTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    bioIconName = "face-recognition";
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        style={styles.kavContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : "height"}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <View style={styles.logoSection}>
            <Image
              source={
                isDark
                  ? require('../../assets/images/icons/icon-light.png')
                  : require('../../assets/images/icons/icon-dark.png')
              }
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.heading }]}>
              Welcome Back!
            </Text>
            <Text style={[styles.subheading, { color: colors.subheading }]}>
              Login to your PrintBot account
            </Text>
          </View>

          {/* ── Card ── */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            {/* Form-level error */}
            {errors.form && (
              <View style={[styles.formError, { borderColor: colors.error }]}>
                <Feather name="alert-circle" size={14} color={colors.error} />
                <Text style={[styles.formErrorText, { color: colors.error }]}>
                  {errors.form}
                </Text>
              </View>
            )}

            {/* ── Username / Email ── */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.label }]}>
                Username or Email
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.input,
                    borderColor: errors.username
                      ? colors.error
                      : colors.inputBorder,
                  },
                ]}
              >
                <Feather
                  name="user"
                  size={18}
                  color={errors.username ? colors.error : colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="john@example.com"
                  placeholderTextColor={colors.placeholder}
                  value={username}
                  onChangeText={(t) => {
                    setUsername(t);
                    if (errors.username)
                      setErrors((e) => ({ ...e, username: undefined }));
                  }}
                  autoCapitalize="none"
                  returnKeyType="next"
                  accessibilityLabel="Username or Email"
                  autoComplete="email"
                />
              </View>
              {errors.username && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.username}
                </Text>
              )}
            </View>

            {/* ── Password ── */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.label }]}>
                  Password
                </Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(public)/requestResetPassword')
                  }}
                >
                  <Text style={[styles.forgotLink, { color: colors.forgotLink }]}>
                    Forgot password?
                  </Text>
                </Pressable>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.input,
                    borderColor: errors.password
                      ? colors.error
                      : colors.inputBorder,
                  },
                ]}
              >
                <Feather
                  name="lock"
                  size={18}
                  color={errors.password ? colors.error : colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password)
                      setErrors((e) => ({ ...e, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  autoComplete="password"
                  onSubmitEditing={handleLogin}
                  accessibilityLabel="Password"
                  textContentType="password"
                />
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPassword((v) => !v)
                  }}
                  style={styles.eyeButton}
                  hitSlop={8}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Feather
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={18}
                    color={colors.icon}
                  />
                </Pressable>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* ── Action Buttons ── */}
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleLogin()
                }}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Log In"
                style={({ pressed }) => [
                  styles.ctaButton,
                  pressed && styles.buttonPressed,
                  isLoading && styles.buttonDisabled,
                ]}
              >
                <LinearGradient
                  colors={['#5986e7', '#4a6fd4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.ctaText}>Log In</Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* ── Biometric Login button ── */}
              {biometricsEnabled && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleBiometricLogin()
                  }}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Log in with Biometrics"
                  style={({ pressed }) => [
                    styles.bioIconButton,
                    { borderColor: colors.cardBorder },
                    pressed && styles.buttonPressed,
                    isLoading && styles.buttonDisabled,
                  ]}
                >
                  <MaterialCommunityIcons name={bioIconName} size={26} color={colors.heading} />
                </Pressable>
              )}
            </View>
          </View>

          {/* ── Sign up row ── */}
          <View style={styles.signupRow}>
            <Text style={[styles.signupLabel, { color: colors.subheading }]}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(public)/signupSelect')
            }} accessibilityRole="link" accessibilityLabel="Sign Up">
              <Text
                style={[
                  styles.signupLink,
                  {
                    color: colors.heading,
                    borderBottomColor: colors.heading,
                  },
                ]}
              >
                Sign up
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Terms ── outside KAV so keyboard padding never shifts it */}
      <View style={[styles.termsSection, { bottom: Math.max(insets.bottom, 30) }]}>
        <Text style={[styles.termsText, { color: colors.termsText }]}>
          By continuing, you agree to PrintBot's
        </Text>
        <View style={styles.termsRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(legal)/terms-and-conditions')
            }}
            accessibilityRole="link"
            accessibilityLabel="Terms of Service"
          >
            <Text style={[styles.termsLink, { color: colors.termsLink }]}>
              Terms of Service
            </Text>
          </Pressable>
          <Text style={[styles.termsText, { color: colors.termsText }]}>
            {' '}and{' '}
          </Text>
          <Pressable onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(legal)/privacy-policy')
          }} accessibilityRole="link" accessibilityLabel="Privacy Policy">
            <Text style={[styles.termsLink, { color: colors.termsLink }]}>
              Privacy Policy
            </Text>
          </Pressable>
          <Text style={[styles.termsText, { color: colors.termsText }]}>
            .
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  kavContainer: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: '20%',
    paddingBottom: 40,
    justifyContent: 'center',
  },

  /* ── Logo ── */
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },

  /* ── Header ── */
  header: {
    marginBottom: 20,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
  },

  /* ── Card ── */
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 12,
  },

  /* ── Form error banner ── */
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(224, 92, 106, 0.08)',
  },
  formErrorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  /* ── Fields ── */
  fieldGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeButton: {
    paddingLeft: 10,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 2,
  },

  /* ── Forgot password ── */
  forgotLink: {
    fontSize: 13,
    fontWeight: '500',
  },

  /* ── Action Row ── */
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 6,
  },
  /* ── CTA button ── */
  ctaButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    height: 52,
  },
  ctaButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: '100%',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },

  /* ── Bio Icon Button ── */
  bioIconButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  /* ── Sign up row ── */
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signupLabel: {
    fontSize: 16,
  },
  signupLink: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  /* ── Terms ── */
  termsSection: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    lineHeight: 18,
  },
  termsLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
});