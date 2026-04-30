import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";

/* ──────────────────────────────────────────
   Color builder (shared design token pattern)
────────────────────────────────────────── */
function buildColors(isDark: boolean) {
  return {
    bg: isDark ? '#0a0e27' : '#f0f4ff',
    card: isDark ? '#12183a' : '#ffffff',
    cardBorder: isDark ? '#1e2a50' : '#dde3f5',
    heading: isDark ? '#ffffff' : '#0a0e27',
    subheading: isDark ? '#a0a8c8' : '#5a6080',
    icon: isDark ? '#6b7194' : '#8890aa',
    inputBorder: isDark ? '#2a3460' : '#cdd4ee',
    input: isDark ? '#1a2240' : '#eef1fb',
    muted: isDark ? '#4a5278' : '#9099ba',
    codeText: isDark ? '#a0a8c8' : '#5a6080',
  };
}

/* ──────────────────────────────────────────
   NotFound Screen
────────────────────────────────────────── */
export default function NotFoundScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const colors = buildColors(isDark);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{
        headerTitle: "Oops!",
        headerLeft: () => (
          Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back()
              }}
            >
              <ChevronLeft
                size={24}
                color={colors.heading}
              />
            </TouchableOpacity>
          )
        ),
      }} />
      <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>

        {/* ── Card ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>

          {/* ── Error code badge ── */}
          <View style={[styles.codeBadge, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
            <Text style={[styles.codeText, { color: colors.codeText }]}>ERROR 404</Text>
          </View>

          {/* ── Illustration ── */}
          <View style={styles.errorContainer}>
            <Image
              source={require('@/assets/images/404.png')}
              style={styles.errorImage}
              resizeMode="contain"
            />
          </View>

          {/* ── Text ── */}
          <Text style={[styles.heading, { color: colors.heading }]}>Page Not Found</Text>
          <Text style={[styles.body, { color: colors.subheading }]}>
            The page you're looking for doesn't exist or has been moved to another location.
          </Text>

          {/* ── Divider ── */}
          <View style={[styles.divider, { backgroundColor: colors.inputBorder }]} />

          {/* ── Suggestion row ── */}
          <View style={styles.suggestionRow}>
            <View style={[styles.suggestionItem, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
              <Feather name="link" size={14} color={colors.icon} />
              <Text style={[styles.suggestionText, { color: colors.muted }]}>Check the URL</Text>
            </View>
            <View style={[styles.suggestionItem, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}>
              <Feather name="clock" size={14} color={colors.icon} />
              <Text style={[styles.suggestionText, { color: colors.muted }]}>Try again later</Text>
            </View>
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionsContainer}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.filledButton, pressed && styles.buttonPressed]}
          >
            <LinearGradient
              colors={['#5986e7', '#4a6fd4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.filledGradient}
            >
              <Feather name="arrow-left" size={16} color={styles.filledButtonText.color} style={{ marginRight: 8 }} />
              <Text style={styles.filledButtonText}>Go Back</Text>
            </LinearGradient>
          </Pressable>
        </View>

      </View>
    </View>
  );
}

/* ──────────────────────────────────────────
   Styles
────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },

  /* ── Logo ── */
  errorContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  errorImage: {
    width: 420,
    height: 160,
  },

  /* ── Card ── */
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  /* ── Code badge ── */
  codeBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  codeText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },

  /* ── Illustration ── */
  illustrationContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  illustrationOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Text ── */
  heading: { fontSize: 22, fontWeight: '700', letterSpacing: 0.3, textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 21, textAlign: 'center', paddingHorizontal: 8 },

  /* ── Divider ── */
  divider: { height: 1, width: '100%', opacity: 0.6 },

  /* ── Suggestions ── */
  suggestionRow: { flexDirection: 'row', gap: 10, width: '100%' },
  suggestionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  suggestionText: { fontSize: 12, fontWeight: '500' },

  /* ── Actions ── */
  actionsContainer: { width: '100%', gap: 10 },
  filledButton: {
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  filledGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButtonText: { fontSize: 16, fontWeight: '600', color: '#ffffff', letterSpacing: 0.2 },
  outlineButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  outlineButtonText: { fontSize: 15, fontWeight: '600' },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});