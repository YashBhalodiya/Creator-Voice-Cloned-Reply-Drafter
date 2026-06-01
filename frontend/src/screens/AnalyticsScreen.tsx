import React from 'react';
import { ScrollView, Text, View, StyleSheet, useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import Card from '../components/ui/card';
import Badge from '../components/ui/badge';
import StyleMetric from '../components/ui/style-metric';
import Button from '../components/ui/button';

export interface EvaluationItem {
  id: string;
  creatorName: string;
  score: number;
  feedback: string;
  date: string;
}

export interface AnalyticsScreenProps {
  evaluations: EvaluationItem[];
  onResetEvaluations: () => void;
}

/**
 * Formats an ISO timestamp into a human-readable date string.
 * e.g. "2026-06-01T08:48:11.689Z" → "Jun 1, 2026 · 2:18 PM"
 */
function formatDate(isoString: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${datePart} · ${timePart}`;
  } catch {
    return isoString;
  }
}

/** Builds a star string like "★★★★☆" for a 1–5 score. */
function buildStars(score: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(score)));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

export default function AnalyticsScreen({
  evaluations,
  onResetEvaluations
}: AnalyticsScreenProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];

  const totalCount = evaluations.length;

  // Authenticity Pass Rate: evaluations rated 4 or 5 stars (creator feels it sounds like them)
  const passedCount = evaluations.filter((e) => e.score >= 4).length;
  const passPercentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  // Average Score across all reviews (real mean, rounded to 1 dp)
  const avgScore = totalCount > 0
    ? Math.round((evaluations.reduce((sum, e) => sum + e.score, 0) / totalCount) * 10) / 10
    : 0;

  // Contamination Rate: % of reviews rated 1–2 stars (response felt off-brand / wrong voice)
  const contaminatedCount = evaluations.filter((e) => e.score <= 2).length;
  const contaminationRate = totalCount > 0 ? Math.round((contaminatedCount / totalCount) * 100) : 0;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background, paddingBottom: 110 }]}
      showsVerticalScrollIndicator={false}>
      
      <Text style={[styles.title, { color: colors.text }]}>Evaluation Metrics</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Live statistics derived from your manual draft evaluations.
      </Text>

      {/* Performance Overview */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Overview</Text>
      <View style={styles.metricsGrid}>

        {/* Authenticity Pass Rate */}
        <StyleMetric
          label="Authenticity Pass Rate"
          value={`${passPercentage}%`}
          progress={passPercentage / 100}
          badgeType={passPercentage >= 70 ? 'success' : passPercentage >= 40 ? 'warning' : 'danger'}
          description={
            totalCount === 0
              ? 'No evaluations recorded yet.'
              : `${passedCount} of ${totalCount} drafts rated 4★ or higher.`
          }
        />

        {/* Average Star Score */}
        <StyleMetric
          label="Avg Voice Match Score"
          value={totalCount > 0 ? `${avgScore} / 5` : '—'}
          progress={totalCount > 0 ? avgScore / 5 : 0}
          badgeType={avgScore >= 4 ? 'success' : avgScore >= 3 ? 'primary' : avgScore > 0 ? 'warning' : 'neutral'}
          description={
            totalCount === 0
              ? 'Submit evaluations to see average score.'
              : `Average across ${totalCount} ${totalCount === 1 ? 'review' : 'reviews'}: ${buildStars(avgScore)}`
          }
        />

        {/* Contamination Rate */}
        <StyleMetric
          label="Off-Voice Contamination"
          value={`${contaminationRate}%`}
          progress={contaminationRate / 100}
          badgeType={contaminationRate === 0 ? 'success' : contaminationRate <= 20 ? 'warning' : 'danger'}
          description={
            totalCount === 0
              ? 'No data yet.'
              : contaminationRate === 0
                ? '✓ No off-brand drafts detected.'
                : `${contaminatedCount} draft${contaminatedCount !== 1 ? 's' : ''} rated ≤2★ (poor voice match).`
          }
        />

        {/* Total Logged Reviews */}
        <StyleMetric
          label="Logged Reviews"
          value={totalCount}
          description={
            totalCount === 0
              ? 'Go to Drafts tab to evaluate responses.'
              : `${totalCount} total assessment${totalCount !== 1 ? 's' : ''} recorded.`
          }
        />

      </View>

      {/* Database Administration */}
      <Card style={styles.actionsCard}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>Database Administration</Text>
        <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
          Permanently clear all evaluation logs and reset statistics to zero.
        </Text>
        <Button
          title="Clear Evaluation Database"
          onPress={onResetEvaluations}
          variant="outline"
          textStyle={{ color: colors.error }}
          style={styles.resetBtn}
        />
      </Card>

      {/* Evaluation Logs */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Evaluation Logs</Text>
      {evaluations.length > 0 ? (
        <View style={styles.logsList}>
          {evaluations.map((item) => {
            const scoreColor = item.score >= 4 ? colors.emerald : item.score >= 3 ? colors.violet : colors.error;
            const badgeType = item.score >= 4 ? 'success' : item.score >= 3 ? 'primary' : 'danger';
            const hasFeedback = item.feedback && item.feedback !== 'No text feedback provided.';

            return (
              <Card key={item.id} style={styles.logCard}>
                {/* Header row */}
                <View style={styles.logHeader}>
                  <View style={styles.logHeaderLeft}>
                    <Text style={[styles.creatorName, { color: colors.text }]}>
                      {item.creatorName}
                    </Text>
                  </View>
                  <Badge text={`${item.score}/5 ★`} type={badgeType} />
                </View>

                {/* Star visual */}
                <Text style={[styles.stars, { color: scoreColor }]}>
                  {buildStars(item.score)}
                </Text>

                {/* Feedback */}
                {hasFeedback ? (
                  <Text style={[styles.logFeedback, { color: colors.text }]}>
                    "{item.feedback}"
                  </Text>
                ) : (
                  <Text style={[styles.logFeedbackEmpty, { color: colors.textSecondary }]}>
                    No written feedback provided.
                  </Text>
                )}

                {/* Formatted date */}
                <Text style={[styles.logDate, { color: colors.textSecondary }]}>
                  {formatDate(item.date)}
                </Text>
              </Card>
            );
          })}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No evaluation history recorded yet.{'\n'}Submit reviews in the Drafts tab to populate this dashboard.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  metricsGrid: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  actionsCard: {
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  actionSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.three,
  },
  resetBtn: {
    borderColor: '#DC262620',
  },
  logsList: {
    marginTop: Spacing.one,
  },
  logCard: {
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  logHeaderLeft: {
    flexShrink: 1,
    marginRight: Spacing.two,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  stars: {
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: Spacing.two,
  },
  logFeedback: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: Spacing.two,
  },
  logFeedbackEmpty: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.two,
  },
  logDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyCard: {
    padding: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
