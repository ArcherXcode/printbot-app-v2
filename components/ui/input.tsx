import React, { forwardRef, useState } from "react";
import {
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";

import { useInputStyles } from "@/constants/styles/inputStyles";
import { useTextStyles } from "@/constants/styles/textStyles";

interface InputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ style, containerStyle, inputStyle, editable = true, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    const styles = useInputStyles(focused);
    const text = useTextStyles();

    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor={styles.placeholderColor}
          style={[
            styles.input,
            text.body,
            !editable && { opacity: 0.5 },
            inputStyle,
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </View>
    );
  }
);

Input.displayName = "Input";