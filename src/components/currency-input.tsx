import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: number;
  onChangeText: (value: number) => void;
}

function formatCents(cents: number): string {
  const s = String(Math.abs(Math.round(cents))).padStart(3, '0');
  return `${s.slice(0, -2)},${s.slice(-2)}`;
}

export function CurrencyInput({ value, onChangeText, style, ...props }: CurrencyInputProps) {
  const theme = useTheme();
  const [cents, setCents] = useState(() => Math.round(value * 100));

  useEffect(() => {
    setCents(Math.round(value * 100));
  }, [value]);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    const newCents = digits === '' ? 0 : parseInt(digits, 10);
    if (newCents > 100000000000) return;
    setCents(newCents);
    onChangeText(newCents / 100);
  };

  return (
    <TextInput
      style={[
        styles.input,
        { 
          backgroundColor: theme.backgroundElement,
          color: theme.text,
          borderColor: theme.border,
        },
        style,
      ]}
      value={formatCents(cents)}
      onChangeText={handleChange}
      keyboardType="number-pad"
      placeholder="0,00"
      placeholderTextColor={theme.textSecondary}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
