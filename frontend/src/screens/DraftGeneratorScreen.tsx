import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  useColorScheme,
  Pressable
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Creator, Question, Draft } from '@/constants/mockData';
import { api } from '@/services/api';
import Card from '../components/ui/card';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import StateView from '../components/ui/state-view';
import Badge from '../components/ui/badge';

export interface DraftGeneratorScreenProps {
  activeCreator: Creator | null;
  onAddEvaluation: (evaluation: { score: number; feedback: string }) => Promise<void>;
}

export default function DraftGeneratorScreen({
  activeCreator,
  onAddEvaluation
}: DraftGeneratorScreenProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [relevanceError, setRelevanceError] = useState<string | null>(null);

  // Rubric Feedback Form
  const [score, setScore] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Handle active profile changes and null states
  useEffect(() => {
    if (!activeCreator) {
      setQuestions([]);
      setSelectedQuestion(null);
      setDrafts([]);
      setSelectedDraft(null);
      setRelevanceError(null);
      return;
    }
    
    api.getQuestions(activeCreator.id)
      .then((list) => {
        setQuestions(list || []);
      })
      .catch(() => {
        setQuestions([]);
      });
    setSelectedQuestion(null);
    setDrafts([]);
    setSelectedDraft(null);
    setRelevanceError(null);
  }, [activeCreator]);

  // 1. Check if no active profile is loaded
  if (!activeCreator) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <StateView
          type="empty"
          title="No Profile Selected"
          description="Establish or select a writing style profile in the Creators tab before drafting reply suggestions."
        />
      </View>
    );
  }

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setDrafts([]);
    setSelectedDraft(null);
    setRelevanceError(null);
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;

    api.submitQuestion(activeCreator.id, newQuestionText.trim())
      .then((newQ) => {
        setQuestions((prev) => [newQ, ...prev]);
        setSelectedQuestion(newQ);
        setNewQuestionText('');
        setDrafts([]);
        setSelectedDraft(null);
        setRelevanceError(null);
      })
      .catch((err) => {
        alert(err.message || 'Failed to submit prompt');
      });
  };

  const handleGenerateDrafts = () => {
    if (!selectedQuestion) return;

    setIsGenerating(true);
    setSelectedDraft(null);
    setRelevanceError(null);

    api.generateDrafts(activeCreator.id, selectedQuestion.id)
      .then((generated) => {
        setDrafts(generated || []);
      })
      .catch((err) => {
        setRelevanceError(err.message || 'Generation failed');
        setDrafts([]);
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  const handleSubmitFeedback = () => {
    if (!selectedDraft) return;

    setIsSubmittingFeedback(true);

    onAddEvaluation({
      score,
      feedback: feedback.trim() || 'No text feedback provided.'
    })
      .then(() => {
        setFeedback('');
        setSelectedDraft(null);
      })
      .catch((err) => {
        alert(err.message || 'Failed to submit feedback');
      })
      .finally(() => {
        setIsSubmittingFeedback(false);
      });
  };

  const hasStyles = activeCreator.styleFeatures !== null;

  if (!hasStyles) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <StateView
          type="empty"
          title="Analysis Required"
          description={`Please navigate to the "Replies" tab to extract style features for ${activeCreator.name} before drafting responses.`}
        />
      </View>
    );
  }

  if (isGenerating) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <StateView
          type="loading"
          title="Drafting Responses..."
          description={`Retrieving matching writing examples from database and assembling draft candidates...`}
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background, paddingBottom: 110 }]}
      showsVerticalScrollIndicator={false}>
      
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Draft Suggestions</Text>
        <Badge text={activeCreator.name} type="primary" />
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Select an incoming prompt to generate style-consistent draft options.
      </Text>

      {/* Input custom question */}
      <Card style={styles.addQuestionCard}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Submit Custom Prompt</Text>
        <View style={styles.addQuestionRow}>
          <Input
            placeholder="Type a question or comment to draft replies for..."
            value={newQuestionText}
            onChangeText={setNewQuestionText}
            containerStyle={styles.addQuestionInput}
          />
          <Button title="Add" onPress={handleAddQuestion} style={styles.addQuestionBtn} />
        </View>
      </Card>

      {/* Questions list */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Incoming Prompts</Text>
      {questions.length === 0 ? (
        <Card style={styles.emptySelectionCard}>
          <Text style={[styles.emptySelectionText, { color: colors.textSecondary }]}>
            No prompts added yet. Write one in the input box above.
          </Text>
        </Card>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionsScroll}>
          {questions.map((q) => {
            const isSelected = selectedQuestion?.id === q.id;
            return (
              <Pressable
                key={q.id}
                onPress={() => handleSelectQuestion(q)}
                style={({ pressed }) => [
                  styles.questionPill,
                  {
                    backgroundColor: isSelected
                      ? colors.violet
                      : colors.backgroundSelected
                  },
                  pressed && styles.pressed
                ]}>
                <Text
                  style={[
                    styles.questionPillText,
                    { color: isSelected ? '#FFFFFF' : colors.text }
                  ]}
                  numberOfLines={1}>
                  {q.question}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Selected prompt detail */}
      {selectedQuestion ? (
        <Card style={styles.selectedQuestionCard}>
          <Text style={[styles.selectedQuestionLabel, { color: colors.textSecondary }]}>
            Active Prompt
          </Text>
          <Text style={[styles.selectedQuestionText, { color: colors.text }]}>
            "{selectedQuestion.question}"
          </Text>
          {drafts.length === 0 && !relevanceError && (
            <Button
              title="Compile Draft Suggestions"
              onPress={handleGenerateDrafts}
              style={styles.generateBtn}
            />
          )}
        </Card>
      ) : (
        <Card style={styles.emptySelectionCard}>
          <Text style={[styles.emptySelectionText, { color: colors.textSecondary }]}>
            Select or submit a prompt above to view draft candidates.
          </Text>
        </Card>
      )}

      {/* Relevance error card */}
      {relevanceError && (
        <Card style={styles.errorCard}>
          <Text style={[styles.errorTitle, { color: colors.error }]}>⚠️ Domain Relevance Check Failed</Text>
          <Text style={[styles.errorText, { color: colors.text }]}>{relevanceError}</Text>
          <Button
            title="Try a Different Question"
            onPress={() => {
              setRelevanceError(null);
              setSelectedQuestion(null);
              setDrafts([]);
            }}
            variant="outline"
            style={styles.errorRetryBtn}
          />
        </Card>
      )}

      {/* Draft Candidates List */}
      {drafts.length > 0 && selectedQuestion && (
        <View style={styles.draftsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ranked Draft Candidates</Text>
          
          {drafts.map((d) => {
            const isSelected = selectedDraft?.id === d.id;
            const badgeType = d.rank === 1 ? 'success' : d.rank === 2 ? 'primary' : 'neutral';
            
            return (
              <Pressable
                key={d.id}
                onPress={() => setSelectedDraft(d)}
                style={({ pressed }) => [
                  styles.draftCardPressable,
                  pressed && styles.pressed
                ]}>
                <Card
                  style={[
                    styles.draftCard,
                    isSelected && {
                      borderColor: colors.violet,
                      backgroundColor: `${colors.violet}04`
                    }
                  ]}>
                  <View style={styles.draftHeader}>
                    <View style={styles.draftHeaderLeft}>
                      <Badge text={`Option ${d.rank}`} type={badgeType} />
                      {d.similarityScore !== undefined && (
                        <Badge 
                          text={`${Math.round(d.similarityScore * 100)}% Match`} 
                          type={d.similarityScore >= 0.80 ? 'success' : 'neutral'} 
                        />
                      )}
                    </View>
                    <Text style={[styles.draftReasoning, { color: colors.textSecondary }]}>
                      {d.reasoning}
                    </Text>
                  </View>
                  <Text style={[styles.draftText, { color: colors.text }]}>{d.draft}</Text>
                  
                  {!isSelected && (
                    <Text style={[styles.selectPrompt, { color: colors.violet }]}>
                      Select to evaluate
                    </Text>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Scoring interface */}
      {selectedDraft && (
        <Card style={styles.evalCard}>
          <Text style={[styles.evalTitle, { color: colors.text }]}>Submit Accuracy Score</Text>
          <Text style={[styles.evalSubtitle, { color: colors.textSecondary }]}>
            Evaluate writing style consistency, length matching, and correct grammar register.
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setScore(star)} style={styles.starPressable}>
                <Text style={styles.starText}>{star <= score ? '★' : '☆'}</Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Evaluation Feedback"
            placeholder="Add comments on tone authenticity, pacing, or punctuation..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={3}
            disabled={isSubmittingFeedback}
          />

          <View style={styles.evalActions}>
            <Button
              title="Cancel"
              onPress={() => setSelectedDraft(null)}
              variant="outline"
              disabled={isSubmittingFeedback}
              style={styles.cancelBtn}
            />
            <Button
              title="Log Evaluation"
              onPress={handleSubmitFeedback}
              loading={isSubmittingFeedback}
              variant="success"
              style={styles.submitBtn}
            />
          </View>
        </Card>
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
    marginTop: Spacing.one,
  },
  addQuestionCard: {
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addQuestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  addQuestionInput: {
    flexGrow: 1,
    flexShrink: 1,
    marginBottom: 0,
  },
  addQuestionBtn: {
    height: 48,
    justifyContent: 'center',
    borderRadius: 8,
  },
  questionsScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.four,
  },
  questionPill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one * 1.5,
    marginRight: Spacing.two,
    maxWidth: 200,
  },
  questionPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectedQuestionCard: {
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  selectedQuestionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: Spacing.one,
  },
  selectedQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: Spacing.three,
  },
  generateBtn: {
    marginTop: Spacing.one,
  },
  emptySelectionCard: {
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySelectionText: {
    fontSize: 13,
    textAlign: 'center',
  },
  draftsSection: {
    marginBottom: Spacing.four,
  },
  draftCardPressable: {
    width: '100%',
  },
  draftCard: {
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  draftReasoning: {
    fontSize: 12,
    flexShrink: 1,
    textAlign: 'right',
  },
  draftText: {
    fontSize: 14,
    lineHeight: 20,
    marginVertical: Spacing.one,
  },
  selectPrompt: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: Spacing.two,
    textAlign: 'right',
  },
  evalCard: {
    padding: Spacing.three,
    marginTop: Spacing.two,
    borderColor: '#EAB308',
  },
  evalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  evalSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.three,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.three,
    marginVertical: Spacing.two,
  },
  starPressable: {
    padding: Spacing.one,
  },
  starText: {
    fontSize: 28,
    color: '#EAB308',
  },
  evalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelBtn: {
    flexGrow: 1,
  },
  submitBtn: {
    flexGrow: 2,
  },
  errorCard: {
    padding: Spacing.three,
    marginBottom: Spacing.four,
    borderColor: '#EF4444',
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  draftHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  errorRetryBtn: {
    marginTop: Spacing.three,
  },
  pressed: {
    opacity: 0.9,
  }
});
