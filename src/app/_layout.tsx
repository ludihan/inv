import { KeyboardProvider } from 'react-native-keyboard-controller';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { I18nProvider, useT } from '@/i18n';
import { ThemePreferenceProvider } from '@/hooks/use-theme-preference';
import { InventoryProvider } from '@/hooks/useInventory';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <I18nProvider>
        <RootStack />
      </I18nProvider>
    </ThemePreferenceProvider>
  );
}

function RootStack() {
  const colorScheme = useColorScheme();
  const { t } = useT();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <KeyboardProvider>
    <ThemeProvider value={navTheme}>
      <InventoryProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShadowVisible: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="modal/item-form" 
            options={{ 
              presentation: 'modal',
              title: t('nav.item'),
              headerBackTitle: t('nav.back'),
            }} 
          />
          <Stack.Screen 
            name="modal/company-form" 
            options={{ 
              presentation: 'modal',
              title: t('nav.company'),
            }} 
          />
          <Stack.Screen 
            name="modal/sector-form" 
            options={{ 
              presentation: 'modal',
              title: t('nav.sector'),
            }} 
          />
        </Stack>
      </InventoryProvider>
    </ThemeProvider>
    </KeyboardProvider>
  );
}
