import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import CreatorSetupScreen from '@/screens/CreatorSetupScreen';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];
  const { activeCreator, setActiveCreator, creatorsList, setCreatorsList } = useAppContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <CreatorSetupScreen
          activeCreator={activeCreator}
          setActiveCreator={setActiveCreator}
          creatorsList={creatorsList}
          setCreatorsList={setCreatorsList}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
