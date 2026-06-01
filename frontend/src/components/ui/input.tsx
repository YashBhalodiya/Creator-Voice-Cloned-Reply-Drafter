import React, { useState } from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  useColorScheme,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export default function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  disabled,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.backgroundElement,
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.violet
              : colors.border
          },
          props.multiline && styles.textArea,
          inputStyle
        ]}
        placeholderTextColor={colors.textSecondary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={disabled !== undefined ? !disabled : props.editable}
        {...props}
      />
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two * 1.5,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: Spacing.one,
    fontWeight: '500',
  }
});
