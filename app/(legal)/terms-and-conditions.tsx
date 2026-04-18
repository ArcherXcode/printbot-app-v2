import React from "react";
import { View, Text, ScrollView, StyleSheet, useColorScheme } from "react-native";

export default function TermsAndConditionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Intro */}
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark800]}>
            Welcome to PrintBot! By using our document printing services and website, you
            agree to the following terms and conditions. Please read them carefully.
          </Text>

          {/* Section 1 */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            1. Service Description
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • PrintBot provides document printing services for PDF files uploaded through our platform
            {"\n"}• We offer various printing options including different paper sizes, quality settings, and quantities
            {"\n"}• All documents are printed in a secure environment and handled with confidentiality
          </Text>

          {/* Section 2 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            2. User Accounts and Registration
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • You must create an account to use our printing services
            {"\n"}• You are responsible for maintaining the security of your account credentials
            {"\n"}• You must provide accurate and current information during registration
            {"\n"}• You must be at least 18 years old to use our services
          </Text>

          {/* Section 3 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            3. Document Upload and Content
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • You may only upload documents that you own or have permission to print
            {"\n"}• Prohibited content includes illegal, copyrighted, offensive, or malicious materials
            {"\n"}• We reserve the right to refuse printing any document that violates these terms
            {"\n"}• Maximum file size and page limits apply as specified on our platform
          </Text>

          {/* Section 4 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            4. Payment and Pricing
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • Payment is required before printing begins
            {"\n"}• Prices are clearly displayed and may vary based on document specifications
            {"\n"}• All payments are processed securely through our payment gateway partners
            {"\n"}• You will receive a magic code upon successful payment for document collection
          </Text>

          {/* Section 5 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            5. Document Collection
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • Documents must be collected within 7 days of printing
            {"\n"}• You must present your magic code to collect printed documents
            {"\n"}• Uncollected documents may be disposed of after the collection period
            {"\n"}• Collection is available during our operating hours
          </Text>

          {/* Section 6 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            6. Privacy and Data Security
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • We implement security measures to protect your documents and personal information
            {"\n"}• Uploaded documents are automatically deleted from our servers after collection
            {"\n"}• We do not access, read, or store the content of your documents
            {"\n"}• Please refer to our Privacy Policy for detailed information handling practices
          </Text>

          {/* Section 7 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            7. Quality and Accuracy
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • We strive to maintain high printing quality standards
            {"\n"}• Print quality depends on the quality of the uploaded document
            {"\n"}• We are not responsible for formatting issues present in the original document
            {"\n"}• Reprinting may be provided for quality issues caused by our equipment
          </Text>

          {/* Section 8 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            8. Refunds and Cancellations
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • Refunds may be issued for technical issues preventing document printing
            {"\n"}• Cancellations are not allowed once printing has begun
            {"\n"}• Refund requests must be submitted within 24 hours of payment
            {"\n"}• Refunds will be processed to the original payment method within 5-7 business days
          </Text>

          {/* Section 9 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            9. Limitation of Liability
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            PrintBot's liability is limited to the amount paid for the specific printing service. We are not liable for indirect, consequential, or incidental damages.
          </Text>

          {/* Section 10 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            10. Service Availability
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • We strive to maintain 99% service uptime but cannot guarantee uninterrupted service
            {"\n"}• Scheduled maintenance will be announced in advance when possible
            {"\n"}• We reserve the right to modify or discontinue services with reasonable notice
          </Text>

          {/* Section 11 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            11. Intellectual Property
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            • You retain all rights to your uploaded documents
            {"\n"}• PrintBot's website, logo, and branding are protected by intellectual property laws
            {"\n"}• You may not reproduce or distribute our platform without permission
          </Text>

          {/* Section 12 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            12. Changes to Terms
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            We may update these terms and conditions periodically. Continued use of our services constitutes acceptance of any changes. We will notify users of significant changes via email or platform notifications.
          </Text>

          {/* Section 13 */}
          <Text style={[styles.sectionTitle, styles.mt6, isDark ? styles.textWhite : styles.textBlack]}>
            13. Contact Information
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            For questions about these terms and conditions:
            {"\n"}Business Name: MadhuSons Group
            {"\n"}Email: support@printbot.cloud
            {"\n"}Phone: +91 9999273367
            {"\n"}Address: C-336, Greater Noida, Uttar Pradesh, 201310, India
          </Text>

          {/* Acknowledgment */}
          <View style={[styles.acknowledgmentBox, isDark ? styles.acknowledgmentBoxDark : styles.acknowledgmentBoxLight]}>
            <Text style={[styles.bodyText, styles.fontMedium, isDark ? styles.accentBlueLight : styles.accentBlueDark]}>
              By using PrintBot's services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
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
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
  },
  fontMedium: {
    fontWeight: '500',
  },

  /* ── Text alignment ── */
  textJustify: {
    textAlign: 'justify',
  },

  /* ── Spacing helpers ── */
  mb4: { marginBottom: 16 },
  mb6: { marginBottom: 24 },
  mt6: { marginTop: 24 },

  /* ── Text colors ── */
  textWhite: { color: '#ffffff' },
  textBlack: { color: '#000000' },
  textLight100: { color: '#f3f4f6' },  // gray-100
  textDark600: { color: '#4b5563' },  // gray-600
  textDark800: { color: '#1f2937' },  // gray-800

  /* ── Accent colors ── */
  accentBlueDark: { color: '#1e40af' },  // blue-800
  accentBlueLight: { color: '#dbeafe' },  // blue-100

  /* ── Acknowledgment box ── */
  acknowledgmentBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  acknowledgmentBoxDark: {
    backgroundColor: 'rgba(30, 58, 138, 0.3)', // blue-900/30
  },
  acknowledgmentBoxLight: {
    backgroundColor: '#eff6ff', // blue-50
  },
});