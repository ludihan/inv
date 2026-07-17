import React from 'react';
import { TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: number;
  onChangeText: (value: number) => void;
}

export function CurrencyInput({ value, onChangeText, style, ...props }: CurrencyInputProps) {
  const theme = useTheme();

  const handleChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^\d.]/g, '');
    const numValue = parseFloat(cleaned) || 0;
    onChangeText(numValue);
  };

  const formatDisplay = (num: number): string => {
    if (num === 0) return '';
    return num.toFixed(2);
  };

  return (
    <TextInput
      style={[
        styles.input,
        { 
          backgroundColor: theme.backgroundElement,
          color: theme.text,
          borderColor: theme.backgroundSelected,
        },
        style,
      ]}
      value={formatDisplay(value)}
      onChangeText={handleChange}
      keyboardType="decimal-pad"
      placeholder="0.00"
      placeholderTextColor={theme.textSecondary}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});
