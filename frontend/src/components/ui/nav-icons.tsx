import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  color: any;
}

export function CreatorsIcon({ color }: IconProps) {
  return (
    <View style={styles.container}>
      <View style={styles.creatorsWrapper}>
        {/* Left User avatar silhouette */}
        <View style={[styles.avatarGroup, { marginRight: -3, zIndex: 1 }]}>
          <View style={[styles.head, { borderColor: color, width: 7, height: 7, borderRadius: 3.5 }]} />
          <View style={[styles.body, { borderColor: color, width: 10, height: 5, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottomWidth: 0 }]} />
        </View>
        {/* Right/Front User avatar silhouette */}
        <View style={[styles.avatarGroup, { zIndex: 2 }]}>
          <View style={[styles.head, { borderColor: color, width: 7, height: 7, borderRadius: 3.5 }]} />
          <View style={[styles.body, { borderColor: color, width: 12, height: 6, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomWidth: 0 }]} />
        </View>
      </View>
    </View>
  );
}

export function RepliesIcon({ color }: IconProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.bubble, { borderColor: color }]}>
        <View style={[styles.bubbleLine, { backgroundColor: color, width: 6 }]} />
        <View style={[styles.bubbleLine, { backgroundColor: color, width: 10 }]} />
      </View>
      <View style={[styles.bubbleTail, { borderLeftColor: color }]} />
    </View>
  );
}

export function DraftsIcon({ color }: IconProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.doc, { borderColor: color }]}>
        <View style={[styles.docLine, { backgroundColor: color, width: 6 }]} />
        <View style={[styles.docLine, { backgroundColor: color, width: 8 }]} />
      </View>
      <View style={[styles.pencil, { backgroundColor: color }]} />
    </View>
  );
}

export function AnalyticsIcon({ color }: IconProps) {
  return (
    <View style={[styles.container, styles.analytics]}>
      <View style={[styles.bar, { backgroundColor: color, height: 7 }]} />
      <View style={[styles.bar, { backgroundColor: color, height: 14 }]} />
      <View style={[styles.bar, { backgroundColor: color, height: 10 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 4,
  },
  creatorsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
  },
  avatarGroup: {
    alignItems: 'center',
  },
  head: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  body: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    marginTop: 1,
  },
  bubble: {
    width: 16,
    height: 13,
    borderRadius: 3,
    borderWidth: 1.5,
    padding: 1.5,
    justifyContent: 'center',
    gap: 1.5,
  },
  bubbleLine: {
    height: 1.2,
    borderRadius: 0.5,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: 3,
    left: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderTopWidth: 0,
    borderStyle: 'solid',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '135deg' }],
  },
  doc: {
    width: 14,
    height: 16,
    borderRadius: 2,
    borderWidth: 1.5,
    padding: 1.5,
    justifyContent: 'center',
    gap: 1.5,
  },
  docLine: {
    height: 1.2,
    borderRadius: 0.5,
  },
  pencil: {
    position: 'absolute',
    bottom: 3,
    right: 2,
    width: 4,
    height: 4,
    borderRadius: 0.5,
    transform: [{ rotate: '45deg' }],
  },
  analytics: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
  },
  bar: {
    width: 3,
    borderRadius: 1,
  }
});
