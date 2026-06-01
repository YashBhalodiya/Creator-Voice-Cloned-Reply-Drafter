import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  useColorScheme,
  Pressable
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Creator } from '@/constants/mockData';
import { api } from '@/services/api';
import Card from '../components/ui/card';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import Badge from '../components/ui/badge';

export interface CreatorSetupScreenProps {
  activeCreator: Creator | null;
  setActiveCreator: (creator: Creator | null) => void;
  creatorsList: Creator[];
  setCreatorsList: React.Dispatch<React.SetStateAction<Creator[]>>;
}

export default function CreatorSetupScreen({
  activeCreator,
  setActiveCreator,
  creatorsList,
  setCreatorsList
}: CreatorSetupScreenProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];

  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreateProfile = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Profile name is required';
    if (!persona.trim()) newErrors.persona = 'Persona description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    api.createCreator(name.trim(), persona.trim())
      .then((newCreator) => {
        setCreatorsList((prev) => [newCreator, ...prev]);
        setActiveCreator(newCreator);
        setName('');
        setPersona('');
      })
      .catch((err) => {
        setErrors({ general: err.message || 'Failed to connect to backend server' });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background, paddingBottom: 110 }]}
      showsVerticalScrollIndicator={false}>
      
      <Text style={[styles.title, { color: colors.text }]}>Writing Style Profiles</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Configure a custom tone profile by describing a specific persona and importing writing samples.
      </Text>

      {/* Profile Creation Form */}
      <Card style={styles.formCard}>
        <Text style={[styles.formTitle, { color: colors.text }]}>New Profile Configuration</Text>
        
        {errors.general && (
          <Text style={{ color: colors.error, fontSize: 13, marginBottom: Spacing.two, fontWeight: '500' }}>
            {errors.general}
          </Text>
        )}
        
        <Input
          label="Profile Name / Identifier"
          placeholder="e.g., Technical Support, Public Relations"
          value={name}
          onChangeText={setName}
          error={errors.name}
          disabled={isSubmitting}
        />

        <Input
          label="Style / Persona Description"
          placeholder="e.g., Professional executive coach. Tone is supportive yet formal. Uses structured paragraphs. Avoids contractions and slang."
          value={persona}
          onChangeText={setPersona}
          multiline
          numberOfLines={4}
          error={errors.persona}
          disabled={isSubmitting}
        />

        <Button
          title="Save Profile"
          onPress={handleCreateProfile}
          loading={isSubmitting}
          style={styles.formButton}
        />
      </Card>

      {/* Profiles List */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Selected Tone Profile</Text>
      
      {creatorsList.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tone profiles defined yet. Complete the form above to add a new profile.
          </Text>
        </Card>
      ) : (
        creatorsList.map((creator) => {
          const isActive = activeCreator && creator.id === activeCreator.id;
          const hasStyles = creator.styleFeatures !== null;

          return (
            <Pressable
              key={creator.id}
              onPress={() => setActiveCreator(creator)}
              style={({ pressed }) => [
                styles.creatorCardPressable,
                pressed && styles.pressed
              ]}>
              <Card
                style={[
                  styles.creatorCard,
                  isActive && {
                    borderColor: colors.violet,
                    backgroundColor: `${colors.violet}08`
                  }
                ]}>
                <View style={styles.creatorHeader}>
                  <View style={styles.creatorHeaderLeft}>
                    <Text style={[styles.creatorName, { color: colors.text }]}>
                      {creator.name}
                    </Text>
                    {isActive && <Badge text="Active" type="primary" />}
                  </View>
                  {hasStyles ? (
                    <Badge text="Ingested" type="success" />
                  ) : (
                    <Badge text="Pending Upload" type="warning" />
                  )}
                </View>
                <Text
                  style={[styles.creatorPersona, { color: colors.textSecondary }]}
                  numberOfLines={2}>
                  {creator.persona}
                </Text>
              </Card>
            </Pressable>
          );
        })
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
  formCard: {
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  formButton: {
    marginTop: Spacing.one,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.two * 1.5,
  },
  creatorCardPressable: {
    width: '100%',
  },
  creatorCard: {
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  creatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  creatorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  creatorPersona: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCard: {
    padding: Spacing.four,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.9,
  }
});
