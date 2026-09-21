import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useThemePreference } from '@/hooks/use-theme-preference';

const subscribe = () => () => {};

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const { preference } = useThemePreference();
  const colorScheme = useRNColorScheme();

  if (!hasHydrated) return 'light';
  return preference === 'system' ? colorScheme : preference;
}
