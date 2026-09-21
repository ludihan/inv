import React from 'react';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useTheme } from '@/hooks/use-theme';
import type { ThemeColor } from '@/constants/theme';

interface IconProps {
  ios: string;
  material: string;
  size?: number;
  color?: ThemeColor;
}

/** SF Symbol on iOS, Material Symbol on Android and web. */
export function Icon({ ios, material, size = 20, color = 'text' }: IconProps) {
  const theme = useTheme();
  const name = { ios, android: material, web: material } as unknown as SymbolViewProps['name'];
  return <SymbolView name={name} tintColor={theme[color]} size={size} />;
}
