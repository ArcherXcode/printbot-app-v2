import React, { forwardRef, useState } from "react";
import {
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";

import { useTextareaStyles } from "@/constants/styles/textareaStyles";
import { useTextStyles } from "@/constants/styles/textStyles";

interface TextareaProps extends TextInputProps {
  containerStyle?: ViewStyle;
  textareaStyle?: TextStyle;
}

export const Textarea = forwardRef<TextInput, TextareaProps>(
  (
    {
      style,
      containerStyle,
      textareaStyle,
      editable = true,
      multiline = true,
      numberOfLines = 4,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    const styles = useTextareaStyles(focused);
    const text = useTextStyles();

    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          placeholderTextColor={styles.placeholderColor}
          style={[
            styles.textarea,
            text.body,
            !editable && { opacity: 0.5 },
            textareaStyle,
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

Textarea.displayName = "Textarea";