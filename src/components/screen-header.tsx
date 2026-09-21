import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
      {subtitle ? <ThemedText type="small" themeColor="textSecondary">{subtitle}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  title: { fontSize: 30, lineHeight: 38, fontWeight: 700, letterSpacing: -1 },
});
