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
import { z } from 'zod';

/* ── Types ── */
type FormFields = 'identifier' | 'password' | 'form';
type FormErrors = Partial<Record<FormFields, string>>;

/* ── Validation schema ── */
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Username or email is required')
    .refine(
      (val) =>
        val.includes('@')
          ? z.string().email().safeParse(val).success
          : val.length >= 3,
      { message: 'Enter a valid email or username (min. 3 characters)' }
    ),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  /* ── Validation ── */
  const validate = () => {
    const result = loginSchema.safeParse({ identifier, password });
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

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      // TODO: replace with your auth call
      await new Promise((res) => setTimeout(res, 1500));
      router.replace('/(tabs)/(dashboard)/dashboard');
    } catch {
      setErrors({ form: 'Invalid credentials. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

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
                    borderColor: errors.identifier
                      ? colors.error
                      : colors.inputBorder,
                  },
                ]}
              >
                <Feather
                  name="user"
                  size={18}
                  color={errors.identifier ? colors.error : colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="john@example.com"
                  placeholderTextColor={colors.placeholder}
                  value={identifier}
                  onChangeText={(t) => {
                    setIdentifier(t);
                    if (errors.identifier)
                      setErrors((e) => ({ ...e, identifier: undefined }));
                  }}
                  autoCapitalize="none"
                  returnKeyType="next"
                  accessibilityLabel="Username or Email"
                  autoComplete="email"
                />
              </View>
              {errors.identifier && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.identifier}
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
                  onPress={() => router.push('/(public)/requestResetPassword')}
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
                  onPress={() => setShowPassword((v) => !v)}
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

            {/* ── Login button ── */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Log In"
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
                  <Text style={styles.ctaText}>Log In</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* ── Sign up row ── */}
          <View style={styles.signupRow}>
            <Text style={[styles.signupLabel, { color: colors.subheading }]}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/(public)/signupSelect')} accessibilityRole="link" accessibilityLabel="Sign Up">
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
            onPress={() => router.push('/(legal)/terms-and-conditions')}
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
          <Pressable onPress={() => router.push('/(legal)/privacy-policy')} accessibilityRole="link" accessibilityLabel="Privacy Policy">
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

  /* ── CTA button ── */
  ctaButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 6,
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
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
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