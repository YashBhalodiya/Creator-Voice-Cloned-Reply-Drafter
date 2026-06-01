import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle
}: ButtonProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];

  const buttonStyle = [
    styles.base,
    styles[size],
    {
      backgroundColor:
        variant === 'primary'
          ? colors.violet
          : variant === 'success'
          ? colors.emerald
          : variant === 'danger'
          ? colors.error
          : variant === 'outline'
          ? 'transparent'
          : colors.backgroundElement,
      borderColor:
        variant === 'outline'
          ? colors.border
          : 'transparent',
      borderWidth: variant === 'outline' ? 1 : 0
    },
    disabled && styles.disabled,
    style
  ];

  const textColor =
    variant === 'outline'
      ? colors.text
      : variant === 'secondary'
      ? colors.text
      : '#FFFFFF'; // White text for primary/danger/success

  const labelStyle = [
    styles.textBase,
    styles[`text_${size}` as keyof typeof styles],
    { color: textColor },
    textStyle
  ];

  return (
    <Pressable
      onPress={loading || disabled ? undefined : onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        buttonStyle,
        pressed && styles.pressed
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 0,
  },
  sm: {
    paddingVertical: Spacing.one * 1.5,
    paddingHorizontal: Spacing.two * 1.5,
  },
  md: {
    paddingVertical: Spacing.two * 1.5,
    paddingHorizontal: Spacing.three,
  },
  lg: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  textBase: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_sm: {
    fontSize: 13,
  },
  text_md: {
    fontSize: 15,
  },
  text_lg: {
    fontSize: 17,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  }
});
