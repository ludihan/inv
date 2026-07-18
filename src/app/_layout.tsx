import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { InventoryProvider } from '@/hooks/useInventory';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <KeyboardProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <InventoryProvider>
        <AnimatedSplashOverlay />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="modal/item-form" 
            options={{ 
              presentation: 'modal',
              title: 'Item',
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
