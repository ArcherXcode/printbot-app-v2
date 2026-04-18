import React, {
  createContext,
  useContext,
  useState,
  forwardRef,
  useRef,
} from "react";

import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  UIManager,
  findNodeHandle,
  ViewProps,
  ScrollView,
} from "react-native";

import { ChevronDown, Check } from "lucide-react-native";
import { useSelectStyles } from "@/constants/styles/selectStyles";
import { useTextStyles } from "@/constants/styles/textStyles";

/* ---------------- Context ---------------- */

interface SelectContextType {
  value: string | null;
  setValue: (val: string) => void;

  open: boolean;
  setOpen: (val: boolean) => void;

  triggerRef: any;
  triggerLayout: any;
  setTriggerLayout: (layout: any) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

const useSelect = () => {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("Select must be used inside Select");
  return ctx;
};

/* ---------------- Root ---------------- */

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  children,
  value,
  defaultValue,
  onValueChange,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? null);
  const [open, setOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<any>(null);

  const triggerRef = useRef<View>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = (val: string) => {
    if (!isControlled) setInternalValue(val);
    onValueChange?.(val);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        setValue,
        open,
        setOpen,
        triggerRef,
        triggerLayout,
        setTriggerLayout,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
};

/* ---------------- Trigger ---------------- */

export const SelectTrigger = forwardRef<View, ViewProps>(
  ({ style, children, ...props }, ref) => {
    const { open, setOpen, triggerRef, setTriggerLayout } = useSelect();
    const styles = useSelectStyles();

    const measure = () => {
      const handle = findNodeHandle(triggerRef.current);
      if (!handle) return;

      UIManager.measureInWindow(handle, (x, y, width, height) => {
        setTriggerLayout({ x, y, width, height });
      });
    };

    return (
      <Pressable
        ref={(node) => {
          // @ts-ignore
          triggerRef.current = node;
        }}
        onPress={() => {
          measure();
          setOpen(!open);
        }}
        style={[styles.trigger, style]}
        {...props}
      >
        {children}

        <ChevronDown
          size={18}
          style={{
            transform: [{ rotate: open ? "180deg" : "0deg" }],
            opacity: 0.6,
          }}
        />
      </Pressable>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

/* ---------------- Value ---------------- */

export const SelectValue: React.FC<{ placeholder?: string }> = ({
  placeholder,
}) => {
  const { value } = useSelect();
  const styles = useSelectStyles();
  const text = useTextStyles();

  return (
    <Text
      style={[
        text.body,
        styles.triggerText,
        !value && styles.placeholder,
      ]}
    >
      {value ?? placeholder ?? "Select..."}
    </Text>
  );
};

/* ---------------- Content (Popover) ---------------- */

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { open, setOpen, triggerLayout } = useSelect();
  const styles = useSelectStyles();

  if (!open || !triggerLayout) return null;

  const screenHeight = Dimensions.get("window").height;

  const estimatedHeight = 250;

  const isBottomOverflow =
    triggerLayout.y + triggerLayout.height + estimatedHeight >
    screenHeight;

  const top = isBottomOverflow
    ? triggerLayout.y - estimatedHeight - 6
    : triggerLayout.y + triggerLayout.height + 6;

  return (
    <Modal transparent animationType="fade">
      <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
        <View
          style={{
            position: "absolute",
            top,
            left: triggerLayout.x,
            width: triggerLayout.width,
          }}
        >
          <View style={styles.content}>
            <ScrollView>{children}</ScrollView>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

/* ---------------- Item ---------------- */

interface SelectItemProps extends ViewProps {
  value: string;
}

export const SelectItem = forwardRef<View, SelectItemProps>(
  ({ value, children, style, ...props }, ref) => {
    const { value: selected, setValue } = useSelect();
    const styles = useSelectStyles();
    const text = useTextStyles();

    const isSelected = selected === value;

    return (
      <Pressable
        ref={ref}
        onPress={() => setValue(value)}
        style={[
          styles.item,
          isSelected && styles.selectedItem,
          style,
        ]}
        {...props}
      >
        <Text style={[text.body, styles.itemText]}>{children}</Text>

        {isSelected && <Check size={16} />}
      </Pressable>
    );
  }
);
SelectItem.displayName = "SelectItem";

/* ---------------- Label ---------------- */

export const SelectLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const text = useTextStyles();
  return <Text style={[text.header, { padding: 8 }]}>{children}</Text>;
};

/* ---------------- Separator ---------------- */

export const SelectSeparator = () => {
  const styles = useSelectStyles();
  return <View style={styles.separator} />;
};

/* ---------------- Group ---------------- */

export const SelectGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;