import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import Badge from './badge';

export interface StyleMetricProps {
  label: string;
  value: string | number;
  description?: string;
  progress?: number; // float from 0 to 1
  badgeType?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  style?: any;
}

export default function StyleMetric({
  label,
  value,
  description,
  progress,
  badgeType,
  style
}: StyleMetricProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];

  // Progress bar color mirrors the badge semantic
  const progressColor = (() => {
    switch (badgeType) {
      case 'success': return colors.emerald;
      case 'danger':  return colors.error;
      case 'warning': return '#EAB308';
      case 'primary': return colors.violet;
      default:        return colors.violet;
    }
  })();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }, style]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {badgeType ? (
          <Badge text={String(value)} type={badgeType} />
        ) : (
          <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        )}
      </View>

      {progress !== undefined && (
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: progressColor,
                width: `${Math.min(Math.max(progress * 100, 0), 100)}%`
              }
            ]}
          />
        </View>
      )}

      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: Spacing.two * 1.5,
    marginBottom: Spacing.two,
    flexGrow: 1,
    minWidth: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBg: {
    height: 6,
    borderRadius: 999,
    width: '100%',
    marginBottom: Spacing.one,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
  description: {
    fontSize: 12,
    marginTop: Spacing.one,
    lineHeight: 16,
  }
});
