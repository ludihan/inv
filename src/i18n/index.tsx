import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getLanguagePreference, saveLanguagePreference, type LanguagePreference } from '@/services/storage';
import { en, pt, type TranslationKey } from './translations';

export type Language = 'en' | 'pt';
export type TParams = Record<string, string | number>;

const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, pt };

function systemLanguage(): Language {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  } catch {
    return 'en';
  }
}

interface I18nValue {
  language: Language;
  preference: LanguagePreference;
  setPreference: (pref: LanguagePreference) => void;
  t: (key: TranslationKey, params?: TParams) => string;
  /** Pluralized count label, e.g. plural('items', 3) -> "3 items". */
  plural: (noun: 'items' | 'units' | 'sectors' | 'companies', count: number) => string;
  /** BCP 47 tag for date formatting. */
  locale: string;
}

function interpolate(template: string, params?: TParams) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<LanguagePreference>('system');

  useEffect(() => {
    getLanguagePreference().then(setPreferenceState).catch(() => {});
  }, []);

  const setPreference = useCallback((pref: LanguagePreference) => {
    setPreferenceState(pref);
    saveLanguagePreference(pref).catch(() => {});
  }, []);

  const value = useMemo<I18nValue>(() => {
    const language = preference === 'system' ? systemLanguage() : preference;
    const dict = dictionaries[language];
    const t = (key: TranslationKey, params?: TParams) => interpolate(dict[key] ?? en[key], params);
    const plural: I18nValue['plural'] = (noun, count) =>
      t(`count.${noun}_${count === 1 ? 'one' : 'other'}` as TranslationKey, { count });
    return { language, preference, setPreference, t, plural, locale: language === 'pt' ? 'pt-BR' : 'en-US' };
  }, [preference, setPreference]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx;
}
