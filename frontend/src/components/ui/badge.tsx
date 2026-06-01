import React from 'react';
import { View, Text, StyleSheet, useColorScheme, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface BadgeProps {
  text: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Badge({
  text,
  type = 'neutral',
  style,
  textStyle
}: BadgeProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];

  const getColors = () => {
    switch (type) {
      case 'primary':
        return { bg: `${colors.violet}20`, text: colors.violet };
      case 'success':
        return { bg: `${colors.emerald}20`, text: colors.emerald };
      case 'danger':
        return { bg: `${colors.error}20`, text: colors.error };
      case 'warning':
        return { bg: '#EAB30820', text: '#EAB308' }; // Gold / Yellow-500
      case 'neutral':
      default:
        return { bg: colors.backgroundSelected, text: colors.textSecondary };
    }
  };

  const badgeColors = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeColors.bg },
        style
      ]}>
      <Text style={[styles.text, { color: badgeColors.text }, textStyle]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.two * 1.5,
    paddingVertical: Spacing.half * 1.5,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
