import React, { forwardRef } from "react";
import {
  Pressable,
  Text,
  PressableProps,
  TextStyle,
  ViewStyle,
} from "react-native";

import { useButtonStyles, ButtonVariant, ButtonSize } from "@/constants/styles/buttonStyles";
import { useTextStyles } from "@/constants/styles/textStyles";

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

export const Button = forwardRef<any, ButtonProps>(
  (
    {
      variant = "default",
      size = "default",
      style,
      textStyle,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const btn = useButtonStyles();
    const text = useTextStyles();

    const variantStyles = btn.variants[variant];
    const sizeStyles = btn.sizes[size];

    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        style={({ pressed }) => [
          btn.base,
          sizeStyles,
          variantStyles.container,
          pressed && { opacity: 0.85 },
          disabled && { opacity: 0.5 },
          style as ViewStyle,
        ]}
        {...props}
      >
        {typeof children === "string" ? (
          <Text
            style={[
              btn.textBase,
              text.body,
              variantStyles.text,
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);

Button.displayName = "Button";