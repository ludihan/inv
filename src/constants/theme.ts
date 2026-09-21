/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FAFAFA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F2F2F2',
    textSecondary: '#666666',
    border: '#EAEAEA',
    primary: '#000000',
    primaryText: '#FFFFFF',
    primaryMuted: '#F2F2F2',
    link: '#0072F5',
    success: '#00A344',
    successMuted: '#E6F6EB',
    warning: '#AB570A',
    warningMuted: '#FFF4DB',
    danger: '#E5484D',
    dangerMuted: '#FEECEC',
  },
  dark: {
    text: '#EDEDED',
    background: '#000000',
    backgroundElement: '#0A0A0A',
    backgroundSelected: '#1A1A1A',
    textSecondary: '#A1A1A1',
    border: '#2E2E2E',
    primary: '#EDEDED',
    primaryText: '#000000',
    primaryMuted: '#1A1A1A',
    link: '#52A8FF',
    success: '#3DD68C',
    successMuted: '#0B2A1B',
    warning: '#FFB224',
    warningMuted: '#2E2008',
    danger: '#FF6369',
    dangerMuted: '#301316',
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
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
