import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: { ios: string; material: string };
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, style }: ButtonProps) {
  const theme = useTheme();

  const palette = {
    primary: { bg: theme.primary, fg: 'primaryText' as const, border: theme.primary },
    secondary: { bg: theme.backgroundElement, fg: 'text' as const, border: theme.border },
    danger: { bg: theme.dangerMuted, fg: 'danger' as const, border: theme.dangerMuted },
    ghost: { bg: 'transparent', fg: 'primary' as const, border: 'transparent' },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: disabled ? theme.backgroundSelected : palette.bg,
          borderColor: disabled ? theme.backgroundSelected : palette.border,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {icon && <Icon {...icon} size={18} color={disabled ? 'textSecondary' : palette.fg} />}
        <ThemedText type="default" themeColor={disabled ? 'textSecondary' : palette.fg} style={styles.label}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  label: { fontWeight: 600 },
});
