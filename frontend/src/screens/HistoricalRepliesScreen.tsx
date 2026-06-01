import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  useColorScheme
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Creator } from '@/constants/mockData';
import { api } from '@/services/api';
import Card from '../components/ui/card';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import StateView from '../components/ui/state-view';
import StyleMetric from '../components/ui/style-metric';
import Badge from '../components/ui/badge';

export interface HistoricalRepliesScreenProps {
  activeCreator: Creator | null;
  onUpdateCreatorStyle: (creatorId: string, style: any, mockReplies: string[]) => Promise<void>;
}

export default function HistoricalRepliesScreen({
  activeCreator,
  onUpdateCreatorStyle
}: HistoricalRepliesScreenProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];

  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState('');
  const [replies, setReplies] = useState<string[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  useEffect(() => {
    if (!activeCreator) {
      setReplies([]);
      return;
    }
    
    setLoadingReplies(true);
    api.getReplies(activeCreator.id)
      .then((data) => {
        setReplies(data.map((r: any) => r.text));
      })
      .catch(() => {
        setReplies([]);
      })
      .finally(() => {
        setLoadingReplies(false);
      });
  }, [activeCreator]);

  // 1. Check if no active profile is loaded
  if (!activeCreator) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <StateView
          type="empty"
          title="No Profile Selected"
          description="Establish or select a writing style profile in the Creators tab before ingesting text history."
        />
      </View>
    );
  }

  const creatorReplies = replies;

  const handleStartAnalysis = () => {
    if (!rawText.trim()) {
      setErrors('Please input text history to analyze.');
      return;
    }

    const lines = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 5);

    if (lines.length === 0) {
      setErrors('Valid entries must be at least 5 characters long.');
      return;
    }

    setErrors('');
    setIsAnalyzing(true);

    onUpdateCreatorStyle(activeCreator.id, null, lines)
      .then(() => {
        setRawText('');
        // Reload replies from backend
        return api.getReplies(activeCreator.id);
      })
      .then((data) => {
        if (data) {
          setReplies(data.map((r: any) => r.text));
        }
      })
      .catch((err) => {
        setErrors(err.message || 'Failed to analyze replies');
      })
      .finally(() => {
        setIsAnalyzing(false);
      });
  };

  if (isAnalyzing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <StateView
          type="loading"
          title="Analyzing Corpus Style..."
          description={`Extracting tone, formality parameters, and text statistics for ${activeCreator.name}...`}
        />
      </View>
    );
  }

  const hasStyles = activeCreator.styleFeatures !== null;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background, paddingBottom: 110 }]}
      showsVerticalScrollIndicator={false}>
      
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Text Ingestion</Text>
        <Badge text={activeCreator.name} type="primary" />
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Provide writing history to establish style constraints.
      </Text>

      {/* Style Analysis Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Tone Profiles</Text>
      {hasStyles && activeCreator.styleFeatures ? (
        <View style={styles.metricsContainer}>
          <StyleMetric
            label="Formality Level"
            value={activeCreator.styleFeatures.formality}
            badgeType={activeCreator.styleFeatures.formality === 'formal' ? 'success' : 'primary'}
            description="Overall vocabulary register."
          />
          <StyleMetric
            label="Avg Character Count"
            value={`${activeCreator.styleFeatures.avgCharLength} chars`}
            progress={activeCreator.styleFeatures.avgCharLength / 280}
            description={`Approx. ${activeCreator.styleFeatures.avgWordLength} words.`}
          />
          <StyleMetric
            label="Emoji Frequency"
            value={`${activeCreator.styleFeatures.emojiDensity}%`}
            progress={activeCreator.styleFeatures.emojiDensity / 30}
            description="Percent of words containing symbols."
          />
          <StyleMetric
            label="Punctuation Traits"
            value="Standard"
            description={activeCreator.styleFeatures.punctuationStyle}
          />
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <StateView
            type="empty"
            title="Analysis Needed"
            description="No text history has been ingested for this profile. Provide posts below to compute style traits."
          />
        </Card>
      )}

      {/* Ingestion paste box */}
      <Card style={styles.ingestionForm}>
        <Text style={[styles.formTitle, { color: colors.text }]}>Submit Writing Samples</Text>
        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
          Paste past posts or replies (one per line, minimum 5 entries).
        </Text>

        <Input
          placeholder="Paste past posts here...&#10;e.g., Let's review the technical requirements before starting.&#10;e.g., Fiduciary duties are critical for corporate governance."
          value={rawText}
          onChangeText={setRawText}
          multiline
          numberOfLines={6}
          error={errors}
        />

        <Button
          title="Extract Tone Features"
          onPress={handleStartAnalysis}
        />
      </Card>

      {/* Ingested list */}
      {creatorReplies.length > 0 && (
        <View style={styles.repliesList}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ingested Submissions ({creatorReplies.length})
          </Text>
          {creatorReplies.map((replyText, idx) => (
            <Card key={idx} style={styles.replyItemCard}>
              <Text style={[styles.replyText, { color: colors.text }]}>
                {replyText}
              </Text>
              <Text style={[styles.replyMeta, { color: colors.textSecondary }]}>
                Submission #{creatorReplies.length - idx}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
  metricsContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: Spacing.four,
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyCard: {
    marginBottom: Spacing.four,
    padding: 0,
  },
  ingestionForm: {
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  formSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.three,
  },
  repliesList: {
    marginTop: Spacing.two,
  },
  replyItemCard: {
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.two,
  },
  replyMeta: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  }
});
