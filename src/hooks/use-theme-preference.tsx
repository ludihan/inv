import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

import { getThemePreference, saveThemePreference, type ThemePreference } from '@/services/storage';

interface ThemePreferenceValue {
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const ThemePreferenceContext = createContext<ThemePreferenceValue>({
  preference: 'system',
  setPreference: () => {},
});

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    getThemePreference().then(setPreferenceState).catch(() => {});
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    saveThemePreference(pref).catch(() => {});
  }, []);

  return (
    <ThemePreferenceContext.Provider value={{ preference, setPreference }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}
