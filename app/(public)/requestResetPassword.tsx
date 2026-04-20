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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { requestPasswordResetSchema } from '@/lib/assetHooksApis/publicPages/types';
import { useRequestPasswordResetMutation } from '@/lib/assetHooksApis/publicPages/hooks';

/* ── Types ── */
type FormFields = 'email' | 'form';
type FormErrors = Partial<Record<FormFields, string>>;

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
    success: '#4caf80',
  };
}

export default function RequestResetPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const colors = buildColors(isDark);

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const resetMutation = useRequestPasswordResetMutation();
  const isLoading = resetMutation.isPending;

  const validate = () => {
    const result = requestPasswordResetSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as FormFields;
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

    resetMutation.mutate({ email }, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: () => {
        // Backend returns 200 for valid submissions (user enumeration defense)
        // The hook already swallows errors, so show success anyway
        setSubmitted(true);
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
          {/* ── Back button ── */}
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
              Reset Password
            </Text>
            <Text style={[styles.subheading, { color: colors.subheading }]}>
              Enter your email address and we'll send you a reset code.
            </Text>
          </View>

          {/* ── Card ── */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>

            {submitted ? (
              /* ── Success state ── */
              <View style={styles.successContainer}>
                <View style={[styles.successCircle, { backgroundColor: 'rgba(76, 175, 128, 0.12)' }]}>
                  <Feather name="check-circle" size={32} color={colors.success} />
                </View>
                <Text style={[styles.successTitle, { color: colors.heading }]}>
                  Check your email
                </Text>
                <Text style={[styles.successBody, { color: colors.subheading }]}>
                  If an account with {email} exists, we've sent a password reset code. Check your inbox and spam folder.
                </Text>

                <Pressable
                  onPress={() => router.push({
                    pathname: '/(public)/confirmResetPassword',
                    params: { email },
                  })}
                  style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
                >
                  <LinearGradient
                    colors={['#5986e7', '#4a6fd4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaGradient}
                  >
                    <Text style={styles.ctaText}>Enter Reset Code</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable onPress={() => { setSubmitted(false); resetMutation.reset(); }} hitSlop={8}>
                  <Text style={[styles.resendLink, { color: colors.subheading }]}>
                    Didn't receive it? <Text style={{ fontWeight: '600', color: colors.heading }}>Resend</Text>
                  </Text>
                </Pressable>
              </View>
            ) : (
              /* ── Email form ── */
              <>
                {errors.form && (
                  <View style={[styles.formError, { borderColor: colors.error }]}>
                    <Feather name="alert-circle" size={14} color={colors.error} />
                    <Text style={[styles.formErrorText, { color: colors.error }]}>{errors.form}</Text>
                  </View>
                )}

                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.label }]}>Email Address</Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: colors.input, borderColor: errors.email ? colors.error : colors.inputBorder },
                  ]}>
                    <Feather
                      name="mail"
                      size={18}
                      color={errors.email ? colors.error : colors.icon}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.inputText }]}
                      placeholder="john@example.com"
                      placeholderTextColor={colors.placeholder}
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                  </View>
                  {errors.email && (
                    <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>
                  )}
                </View>

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
                      <Text style={styles.ctaText}>Send Reset Code</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </>
            )}
          </View>

          {/* ── Back to login ── */}
          <View style={styles.loginRow}>
            <Text style={[styles.loginLabel, { color: colors.subheading }]}>
              Remember your password?{' '}
            </Text>
            <Pressable onPress={() => router.replace('/(public)/login')}>
              <Text style={[styles.loginLink, { color: colors.heading }]}>
                Log in
              </Text>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },

  /* ── Back ── */
  backButton: { marginBottom: 16, alignSelf: 'flex-start' },

  /* ── Logo ── */
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 80, height: 80, borderRadius: 20 },

  /* ── Header ── */
  header: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 2 },
  heading: { fontSize: 28, fontWeight: '700', letterSpacing: 0.3, marginBottom: 6 },
  subheading: { fontSize: 15, fontWeight: '400', textAlign: 'center', lineHeight: 22 },

  /* ── Card ── */
  card: { borderRadius: 20, borderWidth: 1, padding: 24, marginBottom: 12 },

  /* ── Form error ── */
  formError: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16,
    backgroundColor: 'rgba(224, 92, 106, 0.08)',
  },
  formErrorText: { fontSize: 13, fontWeight: '500', flex: 1 },

  /* ── Fields ── */
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  errorText: { fontSize: 12, fontWeight: '500', marginTop: 6, marginLeft: 2 },

  /* ── CTA ── */
  ctaButton: { width: '100%', borderRadius: 12, overflow: 'hidden', marginTop: 6, height: 52 },
  ctaButtonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  ctaButtonDisabled: { opacity: 0.7 },
  ctaGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  ctaText: { fontSize: 18, fontWeight: '600', color: '#ffffff', letterSpacing: 0.3 },

  /* ── Success ── */
  successContainer: { alignItems: 'center', gap: 14, paddingVertical: 8 },
  successCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 20, fontWeight: '700' },
  successBody: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  resendLink: { fontSize: 14, marginTop: 4 },

  /* ── Login row ── */
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  loginLabel: { fontSize: 16 },
  loginLink: { fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
});
