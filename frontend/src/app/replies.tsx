import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import HistoricalRepliesScreen from '@/screens/HistoricalRepliesScreen';
import { Colors } from '@/constants/theme';

export default function RepliesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'dark' : scheme];
  const { activeCreator, updateCreatorStyle } = useAppContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <HistoricalRepliesScreen
          activeCreator={activeCreator}
          onUpdateCreatorStyle={updateCreatorStyle}
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
