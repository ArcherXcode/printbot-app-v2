import { useState, useRef } from 'react';
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
  TextInput as RNTextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { z } from 'zod';

/* ──────────────────────────────────────────
   Types
────────────────────────────────────────── */
type FormData = {
  first_name: string;
  middle_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  password: string;
  confirm_password: string;
};

type FormErrors = Partial<Record<keyof FormData | 'form', string>>;

/* ──────────────────────────────────────────
   Zod schemas per step
────────────────────────────────────────── */
const identitySchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
});

const addressSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(4, 'Enter a valid pincode'),
  country: z.string().min(1, 'Country is required'),
});

const securitySchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

/* ──────────────────────────────────────────
   Steps config
────────────────────────────────────────── */
const STEPS = [
  { title: 'Identity', description: 'Personal & account identity' },
  { title: 'Address', description: 'Delivery location details' },
  { title: 'Security', description: 'Finalize credentials' },
  { title: 'Photo', description: 'Upload profile image' },
  { title: 'Review', description: 'Confirm and submit' },
];

/* ──────────────────────────────────────────
   Reusable field component
────────────────────────────────────────── */
type FieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: RNTextInput['props']['keyboardType'];
  autoCapitalize?: RNTextInput['props']['autoCapitalize'];
  autoComplete?: RNTextInput['props']['autoComplete'];
  returnKeyType?: RNTextInput['props']['returnKeyType'];
  onSubmitEditing?: () => void;
  rightElement?: React.ReactNode;
  colors: ReturnType<typeof buildColors>;
  inputRef?: React.RefObject<RNTextInput>;
};

function Field({
  label, value, onChangeText, error, placeholder,
  secureTextEntry, keyboardType, autoCapitalize, autoComplete,
  returnKeyType, onSubmitEditing, rightElement, colors, inputRef,
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.label }]}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        { backgroundColor: colors.input, borderColor: error ? colors.error : colors.inputBorder },
      ]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.inputText }]}
          placeholder={placeholder ?? ''}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoComplete={autoComplete}
          returnKeyType={returnKeyType ?? 'next'}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={false}
        />
        {rightElement}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

/* ──────────────────────────────────────────
   Color builder
────────────────────────────────────────── */
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
    termsText: isDark ? '#6b7194' : '#8890aa',
    termsLink: isDark ? '#8b93b8' : '#5986e7',
    error: '#e05c6a',
    stepActive: '#5986e7',
    stepDone: '#5986e7',
    stepInactive: isDark ? '#2a3460' : '#cdd4ee',
    stepTextActive: isDark ? '#ffffff' : '#0a0e27',
    stepTextDone: '#ffffff',
    stepTextInactive: isDark ? '#4a5278' : '#9099ba',
    reviewRow: isDark ? '#1a2240' : '#eef1fb',
    reviewLabel: isDark ? '#a0a8c8' : '#5a6080',
    reviewValue: isDark ? '#ffffff' : '#0a0e27',
  };
}

/* ──────────────────────────────────────────
   Main screen
────────────────────────────────────────── */
export default function SignupUserScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const colors = buildColors(isDark);

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  /* Password visibility */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* Form state */
  const [form, setForm] = useState<FormData>({
    first_name: '', middle_name: '', last_name: '',
    username: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '', country: '',
    password: '', confirm_password: '',
  });

  const set = (field: keyof FormData) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  /* ── Validation per step ── */
  const validateStep = (): boolean => {
    let result: z.ZodSafeParseResult<unknown>;

    if (currentStep === 0) {
      result = identitySchema.safeParse(form);
    } else if (currentStep === 1) {
      result = addressSchema.safeParse(form);
    } else if (currentStep === 2) {
      result = securitySchema.safeParse(form);
    } else {
      return true;
    }

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      (result as z.ZodSafeParseError<unknown>).error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    if (currentStep === 0) {
      router.back();
    } else {
      setCurrentStep((s) => Math.max(s - 1, 0));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: replace with your API call
      await new Promise((res) => setTimeout(res, 1500));
      router.replace('/(tabs)/(dashboard)/dashboard');
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  /* ──────────────────────────────────────────
     Step indicator
  ────────────────────────────────────────── */
  const StepIndicator = () => (
    <View style={styles.stepRow}>
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;
        return (
          <View key={step.title} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              {
                backgroundColor: isDone
                  ? colors.stepDone
                  : isActive
                    ? 'transparent'
                    : colors.stepInactive,
                borderColor: isActive ? colors.stepActive : 'transparent',
                borderWidth: isActive ? 2 : 0,
              },
            ]}>
              {isDone ? (
                <Feather name="check" size={14} color="#ffffff" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  {
                    color: isActive
                      ? colors.stepActive
                      : colors.stepTextInactive,
                  },
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              { color: isActive ? colors.heading : colors.stepTextInactive },
              isActive && styles.stepLabelActive,
            ]}>
              {step.title}
            </Text>
          </View>
        );
      })}
    </View>
  );

  /* ──────────────────────────────────────────
     Step content
  ────────────────────────────────────────── */
  const StepContent = () => {
    /* Step 0 — Identity */
    if (currentStep === 0) return (
      <View style={styles.fieldsGrid}>
        <Field label="First Name *" value={form.first_name} onChangeText={set('first_name')}
          placeholder="John" autoCapitalize="words" autoComplete="given-name"
          error={errors.first_name} colors={colors} />
        <Field label="Middle Name" value={form.middle_name} onChangeText={set('middle_name')}
          placeholder="(optional)" autoCapitalize="words" autoComplete="additional-name"
          error={errors.middle_name} colors={colors} />
        <Field label="Last Name *" value={form.last_name} onChangeText={set('last_name')}
          placeholder="Doe" autoCapitalize="words" autoComplete="family-name"
          error={errors.last_name} colors={colors} />
        <Field label="Username *" value={form.username} onChangeText={set('username')}
          placeholder="johndoe" autoComplete="username"
          error={errors.username} colors={colors} />
        <Field label="Email *" value={form.email} onChangeText={set('email')}
          placeholder="john@example.com" keyboardType="email-address" autoComplete="email"
          error={errors.email} colors={colors} />
        <Field label="Phone *" value={form.phone} onChangeText={set('phone')}
          placeholder="+91 99999 99999" keyboardType="phone-pad" autoComplete="tel"
          error={errors.phone} colors={colors} />
      </View>
    );

    /* Step 1 — Address */
    if (currentStep === 1) return (
      <View style={styles.fieldsGrid}>
        <Field label="Address *" value={form.address} onChangeText={set('address')}
          placeholder="123 Main Street" autoCapitalize="words" autoComplete="street-address"
          error={errors.address} colors={colors} />
        <Field label="City *" value={form.city} onChangeText={set('city')}
          placeholder="Mumbai" autoCapitalize="words" autoComplete="address-line2"
          error={errors.city} colors={colors} />
        <Field label="State *" value={form.state} onChangeText={set('state')}
          placeholder="Maharashtra" autoCapitalize="words" autoComplete="address-line1"
          error={errors.state} colors={colors} />
        <Field label="Pincode *" value={form.pincode} onChangeText={set('pincode')}
          placeholder="400001" keyboardType="number-pad" autoComplete="postal-code"
          error={errors.pincode} colors={colors} />
        <Field label="Country *" value={form.country} onChangeText={set('country')}
          placeholder="India" autoCapitalize="words" autoComplete="country"
          error={errors.country} colors={colors} />
      </View>
    );

    /* Step 2 — Security */
    if (currentStep === 2) return (
      <View style={styles.fieldsGrid}>
        <Field
          label="Password *"
          value={form.password}
          onChangeText={set('password')}
          placeholder="Min. 8 characters"
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          error={errors.password}
          colors={colors}
          rightElement={
            <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton} hitSlop={8}>
              <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color={colors.icon} />
            </Pressable>
          }
        />
        <Field
          label="Confirm Password *"
          value={form.confirm_password}
          onChangeText={set('confirm_password')}
          placeholder="Re-enter password"
          secureTextEntry={!showConfirmPassword}
          autoComplete="new-password"
          returnKeyType="done"
          error={errors.confirm_password}
          colors={colors}
          rightElement={
            <Pressable onPress={() => setShowConfirmPassword((v) => !v)} style={styles.eyeButton} hitSlop={8}>
              <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={18} color={colors.icon} />
            </Pressable>
          }
        />
      </View>
    );

    /* Step 3 — Photo */
    if (currentStep === 3) return (
      <View style={styles.photoStep}>
        <View style={[styles.photoCircle, { borderColor: colors.inputBorder, backgroundColor: colors.input }]}>
          <Feather name="camera" size={32} color={colors.icon} />
        </View>
        <Text style={[styles.photoTitle, { color: colors.heading }]}>
          Profile Photo
        </Text>
        <Text style={[styles.photoSubtitle, { color: colors.subheading }]}>
          This step is optional. You can add a profile photo later from your account settings.
        </Text>
        <View style={[styles.photoNote, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
          <Feather name="info" size={14} color={colors.icon} style={{ marginRight: 8 }} />
          <Text style={[styles.photoNoteText, { color: colors.subheading }]}>
            Photo upload from the mobile app is coming soon.
          </Text>
        </View>
      </View>
    );

    /* Step 4 — Review */
    if (currentStep === 4) {
      const reviewGroups = [
        {
          title: 'Identity',
          rows: [
            { label: 'Full Name', value: [form.first_name, form.middle_name, form.last_name].filter(Boolean).join(' ') },
            { label: 'Username', value: form.username },
            { label: 'Email', value: form.email },
            { label: 'Phone', value: form.phone },
          ],
        },
        {
          title: 'Address',
          rows: [
            { label: 'Address', value: form.address },
            { label: 'City', value: form.city },
            { label: 'State', value: form.state },
            { label: 'Pincode', value: form.pincode },
            { label: 'Country', value: form.country },
          ],
        },
      ];

      return (
        <View style={styles.reviewContainer}>
          {reviewGroups.map((group) => (
            <View key={group.title} style={styles.reviewGroup}>
              <Text style={[styles.reviewGroupTitle, { color: colors.heading }]}>
                {group.title}
              </Text>
              {group.rows.map((row) => (
                <View key={row.label} style={[styles.reviewRow, { backgroundColor: colors.reviewRow }]}>
                  <Text style={[styles.reviewLabel, { color: colors.reviewLabel }]}>{row.label}</Text>
                  <Text style={[styles.reviewValue, { color: colors.reviewValue }]} numberOfLines={1}>
                    {row.value || '—'}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          <View style={[styles.reviewNote, { backgroundColor: 'rgba(89,134,231,0.08)', borderColor: '#5986e7' }]}>
            <Feather name="check-circle" size={14} color="#5986e7" style={{ marginRight: 8 }} />
            <Text style={[styles.reviewNoteText, { color: '#5986e7' }]}>
              Ready to create your account. Tap Create Account to submit.
            </Text>
          </View>

          {errors.form && (
            <View style={[styles.formError, { borderColor: colors.error }]}>
              <Feather name="alert-circle" size={14} color={colors.error} />
              <Text style={[styles.formErrorText, { color: colors.error }]}>{errors.form}</Text>
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  /* ──────────────────────────────────────────
     Render
  ────────────────────────────────────────── */
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        style={styles.kavContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
      >
        {/* ── Fixed top section ── */}
        <View style={[styles.topSection, { paddingTop: insets.top + 24 }]}>
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
              Create Account
            </Text>
            <Text style={[styles.subheading, { color: colors.subheading }]}>
              {STEPS[currentStep]?.description ?? ''}
            </Text>
          </View>

          {/* ── Step indicator ── */}
          <StepIndicator />
        </View>

        {/* ── Scrollable card section ── */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.stepCardTitle, { color: colors.heading }]}>
              {STEPS[currentStep]?.title}
            </Text>
            <StepContent />
          </View>
        </ScrollView>

        {/* ── Fixed bottom section ── */}
        <View style={[styles.bottomSection]}>
          {/* ── Navigation buttons ── */}
          <View style={styles.navRow}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.outlineButton,
                { borderColor: colors.inputBorder },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={[styles.outlineButtonText, { color: colors.heading }]}>
                {currentStep === 0 ? 'Back' : 'Previous'}
              </Text>
            </Pressable>

            {isLastStep ? (
              <Pressable
                onPress={handleSubmit}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.filledButton,
                  pressed && styles.buttonPressed,
                  isLoading && styles.buttonDisabled,
                ]}
              >
                <LinearGradient
                  colors={['#5986e7', '#4a6fd4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.filledGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.filledButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [
                  styles.filledButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <LinearGradient
                  colors={['#5986e7', '#4a6fd4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.filledGradient}
                >
                  <Text style={styles.filledButtonText}>Next Step</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>

          {/* ── Terms ── */}
          <View style={styles.termsSection}>
            <Text style={[styles.termsText, { color: colors.termsText }]}>
              By continuing, you agree to PrintBot's
            </Text>
            <View style={styles.termsRow}>
              <Pressable onPress={() => router.push('/(legal)/terms-and-conditions')}>
                <Text style={[styles.termsLink, { color: colors.termsLink }]}>Terms of Service</Text>
              </Pressable>
              <Text style={[styles.termsText, { color: colors.termsText }]}> and </Text>
              <Pressable onPress={() => router.push('/(legal)/privacy-policy')}>
                <Text style={[styles.termsLink, { color: colors.termsLink }]}>Privacy Policy</Text>
              </Pressable>
              <Text style={[styles.termsText, { color: colors.termsText }]}>.</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ──────────────────────────────────────────
   Styles
────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1 },
  kavContainer: { flex: 1 },

  /* ── Fixed top section ── */
  topSection: {
    paddingHorizontal: 20,
  },

  /* ── Scrollable card section ── */
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },

  /* ── Fixed bottom section ── */
  bottomSection: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    justifyContent: 'flex-end'
  },

  /* ── Logo ── */
  logoSection: { alignItems: 'center', marginBottom: 12 },
  logo: { width: 56, height: 56, borderRadius: 14 },

  /* ── Header ── */
  header: { alignItems: 'center', marginBottom: 16, paddingHorizontal: 2 },
  heading: { fontSize: 24, fontWeight: '700', letterSpacing: 0.3, marginBottom: 4 },
  subheading: { fontSize: 14, fontWeight: '400', textAlign: 'center' },

  /* ── Step indicator ── */
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  stepItem: { flex: 1, alignItems: 'center', gap: 6 },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: { fontSize: 13, fontWeight: '700' },
  stepLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center' },
  stepLabelActive: { fontWeight: '700' },

  /* ── Card ── */
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  stepCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 18,
    letterSpacing: 0.2,
  },

  /* ── Fields ── */
  fieldsGrid: { gap: 4 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  input: { flex: 1, fontSize: 15, height: '100%' },
  eyeButton: { paddingLeft: 10 },
  errorText: { fontSize: 11, fontWeight: '500', marginTop: 4, marginLeft: 2 },

  /* ── Form error banner ── */
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    backgroundColor: 'rgba(224, 92, 106, 0.08)',
  },
  formErrorText: { fontSize: 13, fontWeight: '500', flex: 1 },

  /* ── Photo step ── */
  photoStep: { alignItems: 'center', paddingVertical: 12, gap: 12 },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTitle: { fontSize: 17, fontWeight: '700' },
  photoSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  photoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    width: '100%',
  },
  photoNoteText: { fontSize: 13, flex: 1 },

  /* ── Review step ── */
  reviewContainer: { gap: 16 },
  reviewGroup: { gap: 8 },
  reviewGroupTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reviewLabel: { fontSize: 13, fontWeight: '500', flex: 1 },
  reviewValue: { fontSize: 13, flex: 2, textAlign: 'right' },
  reviewNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  reviewNoteText: { fontSize: 13, flex: 1 },

  /* ── Nav buttons ── */
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  outlineButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: { fontSize: 15, fontWeight: '600' },
  filledButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filledGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff', letterSpacing: 0.2 },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonDisabled: { opacity: 0.7 },
  /* ── Terms ── */
  termsSection: {
    alignItems: 'center',
  },
  termsRow: { flexDirection: 'row', alignItems: 'center' },
  termsText: { fontSize: 14, lineHeight: 18 },
  termsLink: { fontSize: 14, textDecorationLine: 'underline', lineHeight: 18 },
});