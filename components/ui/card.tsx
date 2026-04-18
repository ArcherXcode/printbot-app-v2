import React, { forwardRef } from "react";
import {
  View,
  Text,
  ViewProps,
  TextProps,
  TextStyle,
  ViewStyle
} from "react-native";
import { useTextStyles } from "@/constants/styles/textStyles";
import { useCardStyles } from "@/constants/styles/cardStyles";

/* ----------------------------- Card ----------------------------- */

export const Card = forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => {
    const { card } = useCardStyles();
    return <View ref={ref} style={[card, style]} {...props} />;
  }
);
Card.displayName = "Card";

/* -------------------------- Card Header ------------------------- */
export const CardHeader = forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => {
    const { header } = useCardStyles();
    return <View ref={ref} style={[header, style]} {...props} />;
  }
);
CardHeader.displayName = "CardHeader";

/* -------------------------- Card Title -------------------------- */

export const CardTitle = forwardRef<Text, TextProps>(
  ({ style, ...props }, ref) => {
    const { title } = useTextStyles();
    return <Text ref={ref} style={[title, style]} {...props} />;
  }
);
CardTitle.displayName = "CardTitle";

/* ----------------------- Card Description ----------------------- */

export const CardDescription = forwardRef<Text, TextProps>(
  ({ style, ...props }, ref) => {
    const { subtitle } = useTextStyles();
    return <Text ref={ref} style={[subtitle, style]} {...props} />;
  }
);
CardDescription.displayName = "CardDescription";

/* ------------------------- Card Content ------------------------- */

export const CardContent = forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => {
    const { content } = useCardStyles();
    return <View ref={ref} style={[content, style]} {...props} />;
  }
);
CardContent.displayName = "CardContent";

/* ------------------------- Card Footer -------------------------- */

export const CardFooter = forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => {
    const { footer } = useCardStyles();
    return <View ref={ref} style={[footer, style]} {...props} />;
  }
);
CardFooter.displayName = "CardFooter";