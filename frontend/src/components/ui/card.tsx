import React from 'react';
import { View, StyleSheet, useColorScheme, StyleProp, ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, style }: CardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border
        },
        style
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    overflow: 'hidden',
  }
});
