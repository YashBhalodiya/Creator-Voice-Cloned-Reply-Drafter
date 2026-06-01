import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import Button from './button';

export interface StateViewProps {
  type: 'loading' | 'empty' | 'error';
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

export default function StateView({
  type,
  title,
  description,
  actionTitle,
  onAction
}: StateViewProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: type === 'error' ? colors.error : colors.border,
            borderWidth: 1
          }
        ]}>
        {type === 'loading' ? (
          <ActivityIndicator size="small" color={colors.violet} />
        ) : type === 'error' ? (
          <Text style={[styles.glyph, { color: colors.error }]}>!</Text>
        ) : (
          <Text style={[styles.glyph, { color: colors.textSecondary }]}>∅</Text>
        )}
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>

      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant={type === 'error' ? 'danger' : 'primary'}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
    textAlign: 'center',
    minHeight: 280,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  glyph: {
    fontSize: 20,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.one * 1.5,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: Spacing.four,
    maxWidth: 280,
  },
  button: {
    minWidth: 120,
  }
});
