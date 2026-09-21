/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F6F7FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8EAF2',
    textSecondary: '#64748B',
    border: '#E2E5EE',
    primary: '#4F46E5',
    primaryText: '#FFFFFF',
    primaryMuted: '#EAEBFF',
    success: '#16A34A',
    successMuted: '#DCFCE7',
    warning: '#B45309',
    warningMuted: '#FEF3C7',
    danger: '#DC2626',
    dangerMuted: '#FEE2E2',
  },
  dark: {
    text: '#F1F5F9',
    background: '#0B0D12',
    backgroundElement: '#151821',
    backgroundSelected: '#232838',
    textSecondary: '#94A3B8',
    border: '#242A3A',
    primary: '#818CF8',
    primaryText: '#0B0D12',
    primaryMuted: '#1E2140',
    success: '#4ADE80',
    successMuted: '#12291B',
    warning: '#FBBF24',
    warningMuted: '#33270B',
    danger: '#F87171',
    dangerMuted: '#361616',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
