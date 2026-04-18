import React from "react";
import { View, Text, ScrollView, StyleSheet, useColorScheme } from "react-native";

export default function ShippingPolicyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Shipping */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Shipping
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark600]}>
            Orders placed Monday-Friday before 12pm IST (Excluding national and postal holidays) will be processed and shipped within 48 hours. Orders placed on the weekend will be processed within 48 hours of the next business day. Orders placed during peak times around holidays may require an additional 24-48 hours to be processed and shipped.
          </Text>

          {/* Contact Us */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Contact Us
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark600]}>
            If you have any questions about our shipping policy, please contact our customer service team at{" "}
            <Text style={styles.link}>support@printbot.cloud</Text>
            {" "}or call us at{" "}
            <Text style={styles.link}>+91 9999273367</Text>.
          </Text>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Layout ── */
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#1e1e1e', // gray-900
  },
  containerLight: {
    backgroundColor: '#f9fafb', // gray-50
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 80,
  },

  /* ── Typography ── */
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    color: '#3b82f6',  // blue-500
    fontWeight: '500',
  },

  /* ── Text alignment ── */
  textJustify: {
    textAlign: 'justify',
  },

  /* ── Spacing helpers ── */
  mb6: { marginBottom: 24 },

  /* ── Text colors ── */
  textWhite: { color: '#ffffff' },
  textBlack: { color: '#000000' },
  textLight100: { color: '#f3f4f6' }, // gray-100
  textDark600: { color: '#4b5563' }, // gray-600
});