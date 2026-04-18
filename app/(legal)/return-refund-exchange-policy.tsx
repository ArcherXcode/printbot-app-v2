import React from "react";
import { View, Text, ScrollView, StyleSheet, useColorScheme } from "react-native";

export default function ReturnRefundExchangePolicyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* 3-Day Return Policy */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            3-Day Return Policy
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark600]}>
            We offer a 3-day return policy from the date of delivery. Items must be in original condition with all tags attached.
          </Text>

          {/* Returns */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Returns
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            We have a 3-day return policy, which means you have 3 days after receiving your item to request a return.
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            To start a return, you can contact us at{" "}
            <Text style={styles.link}>support@printbot.cloud</Text>.
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark600]}>
            Items sent back to us without first requesting a return will not be accepted.
          </Text>

          {/* Damages and Issues */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Damages and Issues
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark600]}>
            Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
          </Text>

          {/* Exceptions / Non-Returnable Items */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Exceptions / Non-Returnable Items
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark600]}>
            Unfortunately, we cannot accept returns on sale items or gift cards.
          </Text>

          {/* Exchanges */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Exchanges
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark600]}>
            <Text style={styles.fontSemibold}>Note:</Text> For hygiene reasons, we can only exchange items that are unopened and in their original packaging.
          </Text>

          {/* European Union */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            European Union 14 Day Cooling Off Period
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark600]}>
            Notwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.
          </Text>

          {/* Refunds */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Refunds
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            We will notify you once we've received and inspected your return, and let you know if the refund was approved or not. If approved, you'll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark600]}>
            If more than 5 business days have passed since we've approved your return, please contact us at{" "}
            <Text style={styles.link}>support@printbot.cloud</Text>.
          </Text>

          {/* Need Help */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Need Help?
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb4, isDark ? styles.textLight100 : styles.textDark600]}>
            If you have any questions about our return, refund, or exchange policy, please don't hesitate to contact our customer service team.
          </Text>

          {/* Contact Support */}
          <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textBlack]}>
            Contact Support
          </Text>
          <Text style={[styles.bodyText, styles.textJustify, styles.mb6, isDark ? styles.textLight100 : styles.textDark600]}>
            For any inquiries or support needs, please reach out to us at{" "}
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
  fontSemibold: {
    fontWeight: '600',
  },
  link: {
    color: '#3b82f6',   // blue-500
    fontWeight: '500',
  },

  /* ── Text alignment ── */
  textJustify: {
    textAlign: 'justify',
  },

  /* ── Spacing helpers ── */
  mb4: { marginBottom: 16 },
  mb6: { marginBottom: 24 },

  /* ── Text colors ── */
  textWhite: { color: '#ffffff' },
  textBlack: { color: '#000000' },
  textLight100: { color: '#f3f4f6' }, // gray-100
  textDark600: { color: '#4b5563' }, // gray-600
});