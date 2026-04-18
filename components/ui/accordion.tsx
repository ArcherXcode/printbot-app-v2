import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  forwardRef,
} from "react";
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  ViewProps
} from "react-native";

import { ChevronDown } from "lucide-react-native";
import { useAccordionStyles } from "@/constants/styles/accordionStyles";
import { useTextStyles } from "@/constants/styles/textStyles";

/* ---------------- Enable LayoutAnimation on Android ---------------- */

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

/* ----------------------------- Types ----------------------------- */

type AccordionType = "single" | "multiple";

interface AccordionContextType {
  openItems: string[];
  toggleItem: (val: string) => void;
  type: AccordionType;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

const useAccordion = () => {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used inside Accordion");
  return ctx;
};

/* ----------------------------- Root ----------------------------- */

interface AccordionProps {
  children: React.ReactNode;
  type?: AccordionType;

  // Controlled
  value?: string | string[];
  onValueChange?: (val: string | string[]) => void;

  // Uncontrolled
  defaultValue?: string | string[];
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  type = "single",
  value,
  onValueChange,
  defaultValue,
}) => {
  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const openItems = isControlled
    ? Array.isArray(value)
      ? value
      : value
        ? [value]
        : []
    : internalValue;

  const setValue = (val: string[]) => {
    if (!isControlled) {
      setInternalValue(val);
    }

    if (onValueChange) {
      onValueChange(type === "single" ? val[0] ?? "" : val);
    }
  };

  const toggleItem = (item: string) => {
    let newItems: string[] = [];

    if (type === "single") {
      newItems = openItems.includes(item) ? [] : [item];
    } else {
      if (openItems.includes(item)) {
        newItems = openItems.filter((i) => i !== item);
      } else {
        newItems = [...openItems, item];
      }
    }

    setValue(newItems);
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      {children}
    </AccordionContext.Provider>
  );
};

/* --------------------------- Item --------------------------- */

interface AccordionItemProps extends ViewProps {
  value: string;
}

export const AccordionItem = forwardRef<View, AccordionItemProps>(
  ({ style, children, ...props }, ref) => {
    const styles = useAccordionStyles();

    return (
      <View ref={ref} style={[styles.item, style]} {...props}>
        {children}
      </View>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

/* -------------------------- Trigger -------------------------- */

interface AccordionTriggerProps extends ViewProps {
  value: string;
  children: React.ReactNode;
}

export const AccordionTrigger = forwardRef<View, AccordionTriggerProps>(
  ({ value, children, style, ...props }, ref) => {
    const { openItems, toggleItem } = useAccordion();
    const styles = useAccordionStyles();
    const text = useTextStyles();

    const isOpen = openItems.includes(value);

    return (
      <Pressable
        ref={ref}
        onPress={() => toggleItem(value)}
        style={[styles.trigger, style]}
        {...props}
      >
        {typeof children === "string" ? (
          <Text style={[text.header, styles.title]}>{children}</Text>
        ) : (
          children
        )}

        <ChevronDown
          size={18}
          style={{
            transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
            opacity: 0.7,
          }}
        />
      </Pressable>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

/* -------------------------- Content -------------------------- */

interface AccordionContentProps extends ViewProps {
  value: string;
}

export const AccordionContent = forwardRef<View, AccordionContentProps>(
  ({ value, children, style, ...props }, ref) => {
    const { openItems } = useAccordion();
    const styles = useAccordionStyles();

    const isOpen = openItems.includes(value);

    useEffect(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <View ref={ref} style={[styles.contentWrapper, style]} {...props}>
        <View style={styles.content}>{children}</View>
      </View>
    );
  }
);
AccordionContent.displayName = "AccordionContent";