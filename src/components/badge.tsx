import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const theme = useTheme();
  const colors = {
    neutral: { bg: theme.backgroundSelected, fg: theme.textSecondary },
    success: { bg: theme.successMuted, fg: theme.success },
    warning: { bg: theme.warningMuted, fg: theme.warning },
    danger: { bg: theme.dangerMuted, fg: theme.danger },
    primary: { bg: theme.primaryMuted, fg: theme.primary },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <ThemedText type="small" style={{ color: colors.fg, fontSize: 12, lineHeight: 16 }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
});
