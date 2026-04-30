import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { StyleSheet, Text, View, Pressable, Modal, Animated, Easing, Platform, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, ScrollView, TextInput } from "react-native";
import { useCreateSupportTicket } from "@/lib/assetHooksApis/support/hooks";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/appHooks/useColorScheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { z } from "zod";
import { ChevronLeft } from "lucide-react-native";

function toSentenceCase(value: string): string {
  const normalized = value.replaceAll("_", " ").trim();
  if (normalized.length === 0) return value;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

const categoryOptions = ["print_quality", "payment_refund", "vendor_service", "delivery_pickup", "technical_issue", "other"] as const;

const subcategoryByCategory: Record<(typeof categoryOptions)[number], string[]> = {
  print_quality: ["alignment_issue", "faded_output", "wrong_paper", "other"],
  payment_refund: ["refund_delay", "double_charge", "failed_payment", "other"],
  vendor_service: ["late_response", "behavior_issue", "store_closed", "other"],
  delivery_pickup: ["pickup_delay", "otp_issue", "address_issue", "other"],
  technical_issue: ["app_crash", "upload_failed", "notification_issue", "other"],
  other: ["other"],
};

const priorityOptions = ["low", "medium", "high", "critical"] as const;

const ticketSchema = z.object({
  order_id: z.string().optional(),
  payment_id: z.string().optional(),
  category: z.enum(categoryOptions),
  subcategory: z.string().min(2, "Subcategory is required."),
  priority: z.enum(["low", "medium", "high", "critical"]),
  subject: z.string().min(5, "Subject should be at least 5 characters.").optional().or(z.literal("")),
  message: z.string().min(15, "Message should be at least 15 characters."),
});

// --- Custom Animated Bottom Sheet ---
function BottomSheet({
  open,
  onClose,
  title,
  children,
  colorScheme,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  colorScheme: "light" | "dark";
}) {
  const [sheetVisible, setSheetVisible] = useState(open);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    const listenerId = progress.addListener(() => { });
    return () => {
      progress.removeListener(listenerId);
    };
  }, [progress]);

  const animateTo = useCallback(
    (toValue: 0 | 1, onFinished?: () => void) => {
      Animated.timing(progress, {
        toValue,
        duration: toValue === 1 ? 260 : 210,
        easing: toValue === 1 ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onFinished?.();
        }
      });
    },
    [progress],
  );

  const closeSheet = useCallback(() => {
    animateTo(0, () => {
      setSheetVisible(false);
      onClose();
    });
  }, [animateTo, onClose]);

  useEffect(() => {
    if (open) {
      setSheetVisible(true);
      requestAnimationFrame(() => animateTo(1));
      return;
    }
    if (sheetVisible) {
      animateTo(0, () => setSheetVisible(false));
    }
  }, [animateTo, open, sheetVisible]);

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const sheetTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [800, 0],
  });

  return (
    <Modal visible={sheetVisible} animationType="none" transparent onRequestClose={closeSheet}>
      <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ justifyContent: "flex-end", flex: 1 }} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.filterSheet,
              {
                backgroundColor: colors[colorScheme].elevated,
                borderColor: colors[colorScheme].border,
                paddingBottom: 28,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: colors[colorScheme].textPrimary }]}>{title}</Text>
              <View style={[styles.filterHeaderActions, { gap: Platform.OS === "ios" ? 14 : 18 }]}>
                <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={closeSheet}>
                  <MaterialIcons name="close" size={24} color={colors[colorScheme].textPrimary} />
                </Pressable>
              </View>
            </View>

            <ScrollView
              style={{ maxHeight: '80%' }}
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{
                paddingBottom: 16
              }}
            >
              <View style={styles.sheetContent}>
                {children}
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

export default function CreateSupportTicketScreen() {
  const colorScheme = (useColorScheme() as "light" | "dark") ?? "light";
  const theme = colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const screenSafeAreaStyle = useMemo(
    () => ({
      paddingTop: Platform.OS === "ios" ? insets.top + 60 : 20
    }),
    [insets.bottom, insets.left, insets.right, insets.top],
  );

  const createMutation = useCreateSupportTicket();

  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [category, setCategory] = useState<any>("technical_issue");
  const [subcategory, setSubcategory] = useState<any>("app_crash");
  const [priority, setPriority] = useState<any>("medium");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [selectModalConfig, setSelectModalConfig] = useState<{
    open: boolean;
    title: string;
    options: { label: string, value: string }[];
    selectedValue: string;
    onSelect: (val: string) => void;
  }>({ open: false, title: "", options: [], selectedValue: "", onSelect: () => { } });

  const submitTicket = async () => {
    setIsSubmittingForm(true);
    setFormErrors({});

    const payload = {
      order_id: orderId.trim() || undefined,
      payment_id: paymentId.trim() || undefined,
      category,
      subcategory,
      priority,
      subject: subject.trim() || undefined,
      message: message.trim(),
    };

    const parseResult = ticketSchema.safeParse(payload);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setFormErrors(fieldErrors);
      setIsSubmittingForm(false);
      return;
    }

    try {
      await createMutation.mutateAsync(parseResult.data);
      router.back();
    } catch (error) {
      // Handle generic error if needed
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const openSelect = (title: string, options: string[], selectedValue: string, onSelect: (val: string) => void) => {
    setSelectModalConfig({
      open: true,
      title,
      options: options.map(o => ({ label: toSentenceCase(o), value: o })),
      selectedValue,
      onSelect: (val) => {
        onSelect(val);
        setSelectModalConfig(prev => ({ ...prev, open: false }));
      }
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <Stack.Screen
        options={{
          headerTitle: "Create a Ticket",
          headerLeft: () => (
            Platform.OS === 'ios' && (
              <TouchableOpacity
                onPress={() => router.back()}
              >
                <ChevronLeft
                  size={24}
                  color={colors[colorScheme].headerText}
                />
              </TouchableOpacity>
            )
          ),
        }} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, screenSafeAreaStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Payment ID (optional)</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Related payment ID"
              placeholderTextColor={theme.textSecondary}
              value={paymentId}
              onChangeText={setPaymentId}
            />
            {formErrors.payment_id ? <Text style={styles.errorText}>{formErrors.payment_id}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Order ID (optional)</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Related order ID"
              placeholderTextColor={theme.textSecondary}
              value={orderId}
              onChangeText={setOrderId}
            />
            {formErrors.order_id ? <Text style={styles.errorText}>{formErrors.order_id}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Category</Text>
            <TouchableOpacity
              style={[styles.selectBox, { borderColor: theme.border, backgroundColor: theme.background }]}
              onPress={() => openSelect("Category", [...categoryOptions], category, (val) => {
                setCategory(val);
                setSubcategory(subcategoryByCategory[val as keyof typeof subcategoryByCategory][0] ?? "other");
              })}
            >
              <Text style={{ color: theme.textPrimary }}>{toSentenceCase(category)}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            {formErrors.category ? <Text style={styles.errorText}>{formErrors.category}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Subcategory</Text>
            <TouchableOpacity
              style={[styles.selectBox, { borderColor: theme.border, backgroundColor: theme.background }]}
              onPress={() => openSelect("Subcategory", subcategoryByCategory[category as keyof typeof subcategoryByCategory] ?? ["other"], subcategory, setSubcategory)}
            >
              <Text style={{ color: theme.textPrimary }}>{toSentenceCase(subcategory)}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            {formErrors.subcategory ? <Text style={styles.errorText}>{formErrors.subcategory}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Priority</Text>
            <TouchableOpacity
              style={[styles.selectBox, { borderColor: theme.border, backgroundColor: theme.background }]}
              onPress={() => openSelect("Priority", [...priorityOptions], priority, setPriority)}
            >
              <Text style={{ color: theme.textPrimary }}>{toSentenceCase(priority)}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            {formErrors.priority ? <Text style={styles.errorText}>{formErrors.priority}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Subject (optional)</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Short title"
              placeholderTextColor={theme.textSecondary}
              value={subject}
              onChangeText={setSubject}
            />
            {formErrors.subject ? <Text style={styles.errorText}>{formErrors.subject}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Message</Text>
            <TextInput
              style={[styles.textArea, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Describe what happened and what help you need"
              placeholderTextColor={theme.textSecondary}
              multiline
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
            {formErrors.message ? <Text style={styles.errorText}>{formErrors.message}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary, opacity: isSubmittingForm || createMutation.isPending ? 0.7 : 1 }]}
            disabled={isSubmittingForm || createMutation.isPending}
            onPress={submitTicket}
          >
            {isSubmittingForm || createMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create ticket</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomSheet
        open={selectModalConfig.open}
        onClose={() => setSelectModalConfig(prev => ({ ...prev, open: false }))}
        title={`Select ${selectModalConfig.title}`}
        colorScheme={colorScheme}
      >
        <View style={{ gap: 8, paddingBottom: 16 }}>
          {selectModalConfig.options.map(option => {
            const isSelected = selectModalConfig.selectedValue === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectOptionRow,
                  {
                    backgroundColor: isSelected ? theme.elevated : theme.background,
                    borderColor: isSelected ? theme.primary : theme.border
                  }
                ]}
                onPress={() => selectModalConfig.onSelect(option.value)}
              >
                <Text style={{
                  color: theme.textPrimary,
                  fontWeight: isSelected ? '600' : '400',
                  fontSize: 16
                }}>
                  {option.label}
                </Text>
                {isSelected && <MaterialIcons name="check" size={20} color={theme.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  formContainer: {
    gap: 8,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  selectBox: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    minHeight: 300,
    maxHeight: "90%",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  filterHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  sheetContent: {
    padding: 24,
  },
  selectOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
});
