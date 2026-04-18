import { Image, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function GettingStarted() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Top spacer ── */}
      <View style={styles.topSpacer} />

      {/* ── Logo + Branding ── */}
      <View style={styles.brandSection}>
        <Image
          source={
            isDark
              ? require('../../assets/images/icons/icon-light.png')
              : require('../../assets/images/icons/icon-dark.png')
          }
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.appName, isDark ? styles.textWhite : styles.textBlack]}>
          PrintBot
        </Text>
      </View>

      {/* ── Tagline ── */}
      <View style={styles.taglineSection}>
        <View style={styles.taglineRow}>
          <Text style={[styles.taglineText, isDark ? styles.textWhite : styles.textBlack]}>
            Say Hello to
          </Text>
          <Text style={[styles.taglineText, isDark ? styles.textWhite : styles.textBlack]}>
            <Text style={styles.taglineHighlight}>Instant Printing</Text>
          </Text>
        </View>
        <Text style={[styles.description, isDark ? styles.descriptionDark : styles.descriptionLight]}>
          Upload a document, pick your options, and have it printed, all without leaving your couch.
        </Text>
      </View>

      {/* ── Flexible spacer ── */}
      <View style={styles.flexSpacer} />

      {/* ── Bottom CTA area ── */}
      <View style={styles.bottomSection}>

        {/* Get Started button */}
        <Pressable
          onPress={() => router.push('/(public)/signupSelect')}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
        >
          <LinearGradient
            colors={['#5986e7', '#4a6fd4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Get Started</Text>
          </LinearGradient>
        </Pressable>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={[styles.loginLabel, isDark ? styles.loginLabelDark : styles.loginLabelLight]}>
            Have a PrintBot Account?{' '}
          </Text>
          <Pressable onPress={() => router.replace('/(public)/login')}>
            <Text style={[styles.loginLink, isDark ? styles.loginLinkDark : styles.loginLinkLight]}>
              Log in
            </Text>
          </Pressable>
        </View>

        {/* Terms & Privacy */}
        <View style={styles.termsSection}>
          <Text style={[styles.termsText, isDark ? styles.termsTextDark : styles.termsTextLight]}>
            By continuing, you agree to PrintBot's
          </Text>
          <View style={styles.termsRow}>
            <Pressable onPress={() => router.push('/(legal)/terms-and-conditions')}>
              <Text style={[styles.termsLink, isDark ? styles.termsLinkDark : styles.termsLinkLight]}>
                Terms of Service
              </Text>
            </Pressable>
            <Text style={[styles.termsText, isDark ? styles.termsTextDark : styles.termsTextLight]}>
              {' '}and{' '}
            </Text>
            <Pressable onPress={() => router.push('/(legal)/privacy-policy')}>
              <Text style={[styles.termsLink, isDark ? styles.termsLinkDark : styles.termsLinkLight]}>
                Privacy Policy
              </Text>
            </Pressable>
            <Text style={[styles.termsText, isDark ? styles.termsTextDark : styles.termsTextLight]}>
              .
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  containerDark: {
    backgroundColor: '#0a0e27',
  },
  containerLight: {
    backgroundColor: '#f0f4ff',
  },

  /* ── Spacing ── */
  topSpacer: {
    height: '20%',
  },
  flexSpacer: {
    flex: 1,
  },

  /* ── Branding ── */
  brandSection: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 28,
    marginBottom: 16,
  },
  appName: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textWhite: { color: '#ffffff' },
  textBlack: { color: '#0a0e27' },

  /* ── Tagline ── */
  taglineSection: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taglineText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 44,
  },
  taglineHighlight: {
    color: '#5986e7',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
  descriptionDark: { color: '#c8cee8' },
  descriptionLight: { color: '#3a4060' },

  /* ── Bottom CTA area ── */
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 50,
  },

  /* Get Started button */
  ctaButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    height: 52,
  },
  ctaButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
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

  /* Login link */
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 2,
  },
  loginLabel: {
    fontSize: 16,
  },
  loginLabelDark: { color: '#a0a8c8' },
  loginLabelLight: { color: '#5a6080' },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginLinkDark: { color: '#ffffff' },
  loginLinkLight: { color: '#0a0e27' },

  /* Terms */
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
  termsTextDark: { color: '#6b7194' },
  termsTextLight: { color: '#8890aa' },
  termsLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
  termsLinkDark: { color: '#8b93b8' },
  termsLinkLight: { color: '#5986e7' },
});