import { Image, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Haptics from "expo-haptics";

export default function SignupSelect() {
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
                <Text style={[styles.taglineText, isDark ? styles.textWhite : styles.textBlack]}>
                    Create your account
                </Text>
                <Text style={[styles.description, isDark ? styles.descriptionDark : styles.descriptionLight]}>
                    Choose how you'd like to join PrintBot. You can always add more later.
                </Text>
            </View>

            {/* ── Flexible spacer ── */}
            <View style={styles.flexSpacer} />

            {/* ── Bottom CTA area ── */}
            <View style={styles.bottomSection}>

                {/* Signup as User — filled */}
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/(public)/signupUser')
                    }}
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
                        <Text style={styles.filledButtonText}>Signup as a User</Text>
                    </LinearGradient>
                </Pressable>

                {/* Signup as Business — outline */}
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/(public)/signupVendor')
                    }}
                    style={({ pressed }) => [
                        styles.outlineButton,
                        isDark ? styles.outlineButtonDark : styles.outlineButtonLight,
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <Text style={[styles.outlineButtonText, isDark ? styles.outlineButtonTextDark : styles.outlineButtonTextLight]}>
                        Signup as a Business
                    </Text>
                </Pressable>

                {/* Login link */}
                <View style={styles.loginRow}>
                    <Text style={[styles.loginLabel, isDark ? styles.loginLabelDark : styles.loginLabelLight]}>
                        Already have an account?{' '}
                    </Text>
                    <Pressable onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/(public)/login')
                    }}>
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
                        <Pressable onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/(legal)/terms-and-conditions')
                        }}>
                            <Text style={[styles.termsLink, isDark ? styles.termsLinkDark : styles.termsLinkLight]}>
                                Terms of Service
                            </Text>
                        </Pressable>
                        <Text style={[styles.termsText, isDark ? styles.termsTextDark : styles.termsTextLight]}>
                            {' '}and{' '}
                        </Text>
                        <Pressable onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/(legal)/privacy-policy')
                        }}>
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
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingHorizontal: 10,
    },
    taglineText: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    description: {
        fontSize: 15,
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 22,
    },
    descriptionDark: { color: '#a0a8c8' },
    descriptionLight: { color: '#5a6080' },

    /* ── Bottom CTA area ── */
    bottomSection: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 50,
        gap: 12,
    },

    /* ── Filled button (User) ── */
    filledButton: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        height: 52,
    },
    filledGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    filledButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#ffffff',
        letterSpacing: 0.3,
    },

    /* ── Outline button (Business) ── */
    outlineButton: {
        width: '100%',
        borderRadius: 12,
        borderWidth: 1.5,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineButtonDark: {
        borderColor: '#5986e7',
        backgroundColor: 'rgba(89, 134, 231, 0.08)',
    },
    outlineButtonLight: {
        borderColor: '#5986e7',
        backgroundColor: 'rgba(89, 134, 231, 0.05)',
    },
    outlineButtonText: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    outlineButtonTextDark: { color: '#5986e7' },
    outlineButtonTextLight: { color: '#4a6fd4' },

    /* ── Shared press state ── */
    buttonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },

    /* ── Login link ── */
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 2,
        marginBottom: 40
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