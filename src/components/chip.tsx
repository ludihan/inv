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
  const warn = tone === 'warning';
  const selectedBg = warn ? theme.warningMuted : theme.primary;
  const selectedFg = warn ? theme.warning : theme.primaryText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? selectedBg : theme.backgroundElement,
          borderColor: selected ? (warn ? theme.warning : theme.primary) : theme.border,
        },
      ]}
    >
      <ThemedText type="small" style={{ color: selected ? selectedFg : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginRight: Spacing.two,
  },
});
