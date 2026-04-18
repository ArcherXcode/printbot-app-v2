import React, { forwardRef } from "react";
import { Text, TextProps, TextStyle } from "react-native";

import { useLabelStyles } from "@/constants/styles/labelStyles";

interface LabelProps extends TextProps {
  disabled?: boolean;
  required?: boolean;
  requiredText?: string; // optional override (default "*")
}

export const Label = forwardRef<Text, LabelProps>(
  (
    {
      style,
      disabled,
      required,
      requiredText = "*",
      children,
      ...props
    },
    ref
  ) => {
    const styles = useLabelStyles();

    return (
      <Text
        ref={ref}
        style={[
          styles.base,
          disabled && styles.disabled,
          style as TextStyle,
        ]}
        {...props}
      >
        {children}

        {required && (
          <Text
            style={styles.required}
          >
            {requiredText}
          </Text>
        )}
      </Text>
    );
  }
);

Label.displayName = "Label";