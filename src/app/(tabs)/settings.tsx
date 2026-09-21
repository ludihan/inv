import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemePreference } from '@/hooks/use-theme-preference';
import { useInventory } from '@/hooks/useInventory';
import { useT } from '@/i18n';
import { exportToCSV, importAndMergeCSV } from '@/services/csv';
import { confirmDestructive, notify } from '@/services/dialog';
import type { LanguagePreference, ThemePreference } from '@/services/storage';

const THEMES: ThemePreference[] = ['system', 'light', 'dark'];
const LANGUAGES: { value: LanguagePreference; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { preference, setPreference } = useThemePreference();
  const { t, plural, preference: languagePref, setPreference: setLanguagePref } = useT();
  const { items, companies, reload, clearAll, loadSampleData } = useInventory();

  const handleExport = async () => {
    try {
      await exportToCSV();
    } catch (e: any) {
      notify(t('error'), e.message || t('settings.exportFailed'));
    }
  };

  const handleImport = async () => {
    try {
      const result = await importAndMergeCSV();
      if (result.imported) {
        await reload();
        notify(
          t('settings.imported'),
          t('settings.importedMessage', {
            companies: plural('companies', result.companies),
            sectors: plural('sectors', result.sectors),
            items: plural('items', result.items),
          }),
        );
      }
    } catch (e: any) {
      notify(t('error'), e.message || t('settings.importFailed'));
    }
  };

  const handleClear = () => {
    confirmDestructive({
      title: t('settings.deleteAll'),
      message: t('settings.deleteAllMessage'),
      confirmLabel: t('settings.deleteEverything'),
      cancelLabel: t('cancel'),
      onConfirm: () => clearAll(),
    });
  };

  const handleSample = async () => {
    await loadSampleData();
    notify(t('settings.sampleAdded'), t('settings.sampleAddedMessage'));
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

          <Section title={t('settings.appearance')}>
            <View style={styles.chips}>
              {THEMES.map(value => (
                <Chip
                  key={value}
                  label={t(`settings.${value}` as const)}
                  selected={preference === value}
                  onPress={() => setPreference(value)}
                />
              ))}
            </View>
          </Section>

          <Section title={t('settings.language')}>
            <View style={styles.chips}>
              {LANGUAGES.map(o => (
                <Chip
                  key={o.value}
                  label={o.value === 'system' ? t('settings.system') : o.label}
                  selected={languagePref === o.value}
                  onPress={() => setLanguagePref(o.value)}
                />
              ))}
            </View>
          </Section>

          <Section title={t('settings.backup')}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('settings.backupText')}
            </ThemedText>
            <View style={styles.row}>
              <Button
                label={t('settings.export')}
                variant="secondary"
                icon={{ ios: 'square.and.arrow.up', material: 'file_upload' }}
                onPress={handleExport}
                style={styles.flex}
              />
              <Button
                label={t('settings.import')}
                variant="secondary"
                icon={{ ios: 'square.and.arrow.down', material: 'file_download' }}
                onPress={handleImport}
                style={styles.flex}
              />
            </View>
          </Section>

          <Section title={t('settings.data')}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('settings.stored', { companies: plural('companies', companies.length), items: plural('items', items.length) })}
            </ThemedText>
            <Button label={t('settings.addSample')} variant="secondary" onPress={handleSample} />
            <Button label={t('settings.deleteAll')} variant="danger" onPress={handleClear} disabled={companies.length === 0} />
          </Section>

          <ThemedText type="small" themeColor="textSecondary" style={styles.version}>
            inv v{Constants.expoConfig?.version ?? '1.0.0'}
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingBottom: BottomTabInset + Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  section: { paddingHorizontal: Spacing.four, marginBottom: Spacing.four, gap: Spacing.two },
  sectionTitle: { letterSpacing: 0.8, fontSize: 12 },
  card: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.three, gap: Spacing.three },
  chips: { flexDirection: 'row' },
  row: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  version: { textAlign: 'center' },
});
