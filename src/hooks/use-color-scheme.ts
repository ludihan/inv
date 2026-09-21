import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useThemePreference } from '@/hooks/use-theme-preference';

/** Resolved scheme: the user's override if set, otherwise the system scheme. */
export function useColorScheme() {
  const { preference } = useThemePreference();
  const system = useSystemColorScheme();
  return preference === 'system' ? system : preference;
}
