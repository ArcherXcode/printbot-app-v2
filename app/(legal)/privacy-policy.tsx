import React from "react";
import { View, Text, ScrollView, StyleSheet, useColorScheme } from "react-native";

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Intro */}
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark800]}>
            PrintBot ("we," "our," or "us") is a document printing service operated by
            MadhuSons Group. We are committed to protecting your privacy and ensuring the
            security of your personal information. This comprehensive Privacy Policy explains how
            we collect, use, disclose, and safeguard your information when you use our
            website (printbot.cloud), mobile application, and related services.
          </Text>

          {/* Section 1 */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            1. Information We Collect
          </Text>

          <Text style={[styles.subTitle, isDark ? styles.textLight100 : styles.textDark700]}>
            1.1 Personal Information You Provide
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            We collect personal information that you voluntarily provide when you:
            {"\n"}• Create an account: Name, email address, phone number
            {"\n"}• Place orders: Billing information, delivery address, payment details
            {"\n"}• Upload documents: PDF files, images, and other printable documents
            {"\n"}• Contact support: Name, email, message content, inquiry type
            {"\n"}• Subscribe to communications: Email address for newsletters and updates
          </Text>

          <Text style={[styles.subTitle, isDark ? styles.textLight100 : styles.textDark700]}>
            1.2 Mobile Application Permissions & Data
          </Text>

          <Text style={[styles.accentLabel, isDark ? styles.accentBlueLight : styles.accentBlueDark]}>
            Storage/File Access Permission
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb3, isDark ? styles.textLight100 : styles.textDark600]}>
            Purpose: To access documents and photos you want to print
            {"\n"}What we access: Only files you explicitly select for printing
            {"\n"}What we don't access: We don't scan or access your entire device storage
            {"\n"}Data handling: Selected files are temporarily uploaded to our secure servers, processed for printing, and automatically deleted within 7 days
          </Text>

          <Text style={[styles.accentLabel, isDark ? styles.accentBlueLight : styles.accentBlueDark]}>
            Camera Permission
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            Purpose: To scan documents directly within the app
            {"\n"}When requested: Only when you choose the "Scan Document" feature
            {"\n"}What we access: Camera feed only during document scanning sessions
            {"\n"}What we don't access: We don't access your camera without explicit user action or record video
          </Text>

          {/* Section 2 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            2. How We Use Your Information
          </Text>

          <Text style={[styles.subTitle, isDark ? styles.textLight100 : styles.textDark700]}>
            2.1 Primary Service Purposes
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • Order processing: Process and fulfill your document printing requests
            {"\n"}• Account management: Create and maintain your user account
            {"\n"}• Payment processing: Process payments through our secure payment gateway
            {"\n"}• Order communication: Send order confirmations and status updates
            {"\n"}• Customer support: Respond to your inquiries and resolve issues
            {"\n"}• Service delivery: Coordinate document printing and pickup/delivery
          </Text>

          {/* Section 3 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            3. Payment Processing & Financial Data
          </Text>

          <Text style={[styles.accentLabel, isDark ? styles.accentGreenLight : styles.accentGreenDark]}>
            Secure Payment Processing
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            We use Razorpay, a leading and trusted payment gateway in India, to process all transactions securely. We do not store or have access to your payment card details.
            {"\n\n"}All payment transactions are processed directly through Razorpay's PCI-DSS compliant infrastructure. We only store the transaction reference number, order amount, and payment status.
          </Text>

          {/* Section 4 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            4. Data Security and Protection
          </Text>

          <Text style={[styles.accentLabel, isDark ? styles.accentRedLight : styles.accentRedDark]}>
            Encryption & Security
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • AES-256 encryption for data at rest
            {"\n"}• TLS 1.3 encryption for data in transit
            {"\n"}• End-to-end encryption for document uploads
            {"\n"}• Enterprise-grade firewalls and intrusion detection
            {"\n"}• 24/7 security monitoring and threat detection
          </Text>

          {/* Section 5 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            5. Data Retention and Deletion
          </Text>

          <Text style={[styles.accentLabel, isDark ? styles.accentYellowLight : styles.accentYellowDark]}>
            Automatic Document Deletion
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            Your documents are automatically deleted from our servers to protect your privacy:
            {"\n"}• Documents are stored only during order processing (1-3 days)
            {"\n"}• Automatic deletion occurs 7 days after order completion
            {"\n"}• Failed orders are deleted immediately
            {"\n"}• Cancelled orders are deleted within 24 hours
          </Text>

          {/* Section 6 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            6. Your Privacy Rights and Choices
          </Text>

          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            You have significant control over your personal information:
            {"\n"}• Right to Access: Request a copy of all personal information we hold
            {"\n"}• Right to Rectification: Request correction of inaccurate information
            {"\n"}• Right to Erasure: Request deletion of your personal data
            {"\n"}• Right to Data Portability: Request your data in a portable format
            {"\n\n"}To exercise these rights, email us at support@printbot.cloud
          </Text>

          {/* Section 7 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            7. Contact Information
          </Text>

          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            For privacy-related inquiries:
            {"\n"}Business Name: MadhuSons Group
            {"\n"}Email: support@printbot.cloud
            {"\n"}Phone: +91 9999273367
            {"\n"}Address: C-336, Greater Noida, Uttar Pradesh, 201310, India
            {"\n\n"}Response Time: We respond to privacy inquiries within 72 hours
          </Text>

          {/* Section 8 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            8. Acknowledgment and Consent
          </Text>

          <Text style={[styles.bodyText, styles.textJustify, styles.mb8, isDark ? styles.textLight100 : styles.textDark600]}>
            By using PrintBot's services, you acknowledge that you have read and understood this Privacy Policy in its entirety and agree to the collection, use, and disclosure of your information as described.
          </Text>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Layout ── */
  container: {
    flex: 1
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
  },
  bottomSpacer: {
    height: 40,
  },

  /* ── Typography ── */
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  accentLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
  },

  /* ── Text alignment ── */
  textJustify: {
    textAlign: 'justify',
  },

  /* ── Spacing helpers ── */
  mb3: { marginBottom: 12 },
  mb4: { marginBottom: 16 },
  mb6: { marginBottom: 24 },
  mb8: { marginBottom: 32 },
  mt6: { marginTop: 24 },

  /* ── Text colors ── */
  textWhite: { color: '#ffffff' },
  textBlack: { color: '#000000' },
  textLight100: { color: '#f3f4f6' },  // gray-100
  textDark600: { color: '#4b5563' },  // gray-600
  textDark700: { color: '#374151' },  // gray-700
  textDark800: { color: '#1f2937' },  // gray-800

  /* ── Accent colors ── */
  accentBlueDark: { color: '#2563eb' },  // blue-600
  accentBlueLight: { color: '#93c5fd' },  // blue-300
  accentGreenDark: { color: '#16a34a' },  // green-600
  accentGreenLight: { color: '#86efac' },  // green-300
  accentRedDark: { color: '#dc2626' },  // red-600
  accentRedLight: { color: '#fca5a5' },  // red-300
  accentYellowDark: { color: '#ca8a04' },  // yellow-600
  accentYellowLight: { color: '#fde047' },  // yellow-300
});