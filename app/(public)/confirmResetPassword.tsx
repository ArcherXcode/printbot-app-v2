import { useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { confirmPasswordResetSchema } from '@/lib/assetHooksApis/publicPages/types';
import { useConfirmPasswordResetMutation } from '@/lib/assetHooksApis/publicPages/hooks';
import type { ApiError } from '@/lib/api/error-map';

/* ── Types ── */
type FormData = { email: string; code: string; password: string; confirm_password: string };
type FormErrors = Partial<Record<keyof FormData | 'form', string>>;

/* ── Color builder ── */
function buildColors(isDark: boolean) {
  return {
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
    error: '#e05c6a',
  };
}

export default function ConfirmResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const colors = buildColors(isDark);

  const [form, setForm] = useState<FormData>({
    email: params.email ?? '',
    code: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const confirmMutation = useConfirmPasswordResetMutation();
  const isLoading = confirmMutation.isPending;

  const set = (field: keyof FormData) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const result = confirmPasswordResetSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    confirmMutation.mutate(form, {
      onSuccess: () => {
        Alert.alert(
          'Password Reset',
          'Your password has been reset successfully. Please log in with your new password.',
          [{ text: 'Log In', onPress: () => router.replace('/(public)/login') }],
        );
      },
      onError: (error) => {
        const apiError = error as unknown as ApiError;
        setErrors({ form: apiError.message || 'Failed to reset password. Please try again.' });
      },
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        style={styles.kavContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Back ── */}
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <Feather name="arrow-left" size={22} color={colors.heading} />
          </Pressable>

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
              New Password
            </Text>
            <Text style={[styles.subheading, { color: colors.subheading }]}>
              Enter the code we sent to your email and choose a new password.
            </Text>
          </View>

          {/* ── Card ── */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>

            {errors.form && (
              <View style={[styles.formError, { borderColor: colors.error }]}>
                <Feather name="alert-circle" size={14} color={colors.error} />
                <Text style={[styles.formErrorText, { color: colors.error }]}>{errors.form}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.label }]}>Email Address</Text>
              <View style={[styles.inputWrapper, {
                backgroundColor: colors.input,
                borderColor: errors.email ? colors.error : colors.inputBorder,
              }]}>
                <Feather name="mail" size={18} color={errors.email ? colors.error : colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="john@example.com"
                  placeholderTextColor={colors.placeholder}
                  value={form.email}
                  onChangeText={set('email')}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>}
            </View>

            {/* Reset Code */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.label }]}>Reset Code</Text>
              <View style={[styles.inputWrapper, {
                backgroundColor: colors.input,
                borderColor: errors.code ? colors.error : colors.inputBorder,
              }]}>
                <Feather name="key" size={18} color={errors.code ? colors.error : colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="Enter reset code"
                  placeholderTextColor={colors.placeholder}
                  value={form.code}
                  onChangeText={set('code')}
                  autoCapitalize="none"
                  autoComplete="one-time-code"
                />
              </View>
              {errors.code && <Text style={[styles.errorText, { color: colors.error }]}>{errors.code}</Text>}
            </View>

            {/* New Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.label }]}>New Password</Text>
              <View style={[styles.inputWrapper, {
                backgroundColor: colors.input,
                borderColor: errors.password ? colors.error : colors.inputBorder,
              }]}>
                <Feather name="lock" size={18} color={errors.password ? colors.error : colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.placeholder}
                  value={form.password}
                  onChangeText={set('password')}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton} hitSlop={8}>
                  <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color={colors.icon} />
                </Pressable>
              </View>
              {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.label }]}>Confirm Password</Text>
              <View style={[styles.inputWrapper, {
                backgroundColor: colors.input,
                borderColor: errors.confirm_password ? colors.error : colors.inputBorder,
              }]}>
                <Feather name="lock" size={18} color={errors.confirm_password ? colors.error : colors.icon} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.placeholder}
                  value={form.confirm_password}
                  onChangeText={set('confirm_password')}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <Pressable onPress={() => setShowConfirmPassword((v) => !v)} style={styles.eyeButton} hitSlop={8}>
                  <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={18} color={colors.icon} />
                </Pressable>
              </View>
              {errors.confirm_password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirm_password}</Text>}
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
                isLoading && styles.ctaButtonDisabled,
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
                  <Text style={styles.ctaText}>Reset Password</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* ── Back to login ── */}
          <View style={styles.loginRow}>
            <Text style={[styles.loginLabel, { color: colors.subheading }]}>
              Remember your password?{' '}
            </Text>
            <Pressable onPress={() => router.replace('/(public)/login')}>
              <Text style={[styles.loginLink, { color: colors.heading }]}>Log in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  kavContainer: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },

  backButton: { marginBottom: 16, alignSelf: 'flex-start' },

  logoSection: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 80, height: 80, borderRadius: 20 },

  header: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 2 },
  heading: { fontSize: 28, fontWeight: '700', letterSpacing: 0.3, marginBottom: 6 },
  subheading: { fontSize: 15, fontWeight: '400', textAlign: 'center', lineHeight: 22 },

  card: { borderRadius: 20, borderWidth: 1, padding: 24, marginBottom: 12 },

  formError: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16,
    backgroundColor: 'rgba(224, 92, 106, 0.08)',
  },
  formErrorText: { fontSize: 13, fontWeight: '500', flex: 1 },

  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  eyeButton: { paddingLeft: 10 },
  errorText: { fontSize: 12, fontWeight: '500', marginTop: 6, marginLeft: 2 },

  ctaButton: { width: '100%', borderRadius: 12, overflow: 'hidden', marginTop: 6, height: 52 },
  ctaButtonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  ctaButtonDisabled: { opacity: 0.7 },
  ctaGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  ctaText: { fontSize: 18, fontWeight: '600', color: '#ffffff', letterSpacing: 0.3 },

  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  loginLabel: { fontSize: 16 },
  loginLink: { fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
});
