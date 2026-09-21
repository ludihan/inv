import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  tone?: 'default' | 'warning';
}

export function Chip({ label, selected, onPress, tone = 'default' }: ChipProps) {
  const theme = useTheme();
  const accent = tone === 'warning' ? theme.warning : theme.primary;
  const accentMuted = tone === 'warning' ? theme.warningMuted : theme.primaryMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? accentMuted : theme.backgroundElement,
          borderColor: selected ? accent : theme.border,
        },
      ]}
    >
      <ThemedText type="small" style={{ color: selected ? accent : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginRight: Spacing.two,
  },
});
