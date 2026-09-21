import { Stack } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemePreferenceProvider } from '@/hooks/use-theme-preference';
import { InventoryProvider } from '@/hooks/useInventory';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootStack />
    </ThemePreferenceProvider>
  );
}

function RootStack() {
  const colorScheme = useColorScheme();
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
              title: 'Item',
              headerBackTitle: 'Back',
            }} 
          />
          <Stack.Screen 
            name="modal/company-form" 
            options={{ 
              presentation: 'modal',
              title: 'Company',
            }} 
          />
          <Stack.Screen 
            name="modal/sector-form" 
            options={{ 
              presentation: 'modal',
              title: 'Sector',
            }} 
          />
        </Stack>
      </InventoryProvider>
    </ThemeProvider>
    </KeyboardProvider>
  );
}
