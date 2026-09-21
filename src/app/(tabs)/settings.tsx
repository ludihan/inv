import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
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
import { exportToCSV, importAndMergeCSV } from '@/services/csv';
import type { ThemePreference } from '@/services/storage';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
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
  const { items, companies, reload, clearAll, loadSampleData } = useInventory();

  const handleExport = async () => {
    try {
      await exportToCSV();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to export.');
    }
  };

  const handleImport = async () => {
    try {
      const result = await importAndMergeCSV();
      if (result.imported) {
        await reload();
        Alert.alert('Imported', result.message);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to import.');
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Delete all data',
      'This permanently removes every company, sector and item on this device. Export a CSV first if you want a backup.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: () => clearAll() },
      ],
    );
  };

  const handleSample = async () => {
    await loadSampleData();
    Alert.alert('Sample data added', 'A demo company with a few items was created.');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title="Settings" subtitle="Appearance, backup and data" />

          <Section title="Appearance">
            <View style={styles.chips}>
              {THEME_OPTIONS.map(o => (
                <Chip
                  key={o.value}
                  label={o.label}
                  selected={preference === o.value}
                  onPress={() => setPreference(o.value)}
                />
              ))}
            </View>
          </Section>

          <Section title="Backup">
            <ThemedText type="small" themeColor="textSecondary">
              Data lives on this device. Export a CSV to back it up or move it to another device;
              importing merges by ID and never overwrites existing rows.
            </ThemedText>
            <View style={styles.row}>
              <Button
                label="Export"
                variant="secondary"
                icon={{ ios: 'square.and.arrow.up', material: 'file_upload' }}
                onPress={handleExport}
                style={styles.flex}
              />
              <Button
                label="Import"
                variant="secondary"
                icon={{ ios: 'square.and.arrow.down', material: 'file_download' }}
                onPress={handleImport}
                style={styles.flex}
              />
            </View>
          </Section>

          <Section title="Data">
            <ThemedText type="small" themeColor="textSecondary">
              {companies.length} companies · {items.length} items stored.
            </ThemedText>
            <Button label="Add sample data" variant="secondary" onPress={handleSample} />
            <Button label="Delete all data" variant="danger" onPress={handleClear} disabled={companies.length === 0} />
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
