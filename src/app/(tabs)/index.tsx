import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/hooks/useInventory';
import { useT } from '@/i18n';
import { formatBRL } from '@/services/csv';
import { isLowStock, isOutOfStock, itemTotal, sumQuantity, sumTotal } from '@/services/stock';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import type { Item } from '@/types';

function Section({ title, action, children }: { title: string; action?: { label: string; onPress: () => void }; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="default" style={styles.sectionTitle}>{title}</ThemedText>
        {action && (
          <Pressable onPress={action.onPress} hitSlop={8}>
            <ThemedText type="small" themeColor="link">{action.label}</ThemedText>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, plural, locale } = useT();
  const { companies, sectors, items, getCompanyName, getSectorName, loadSampleData } = useInventory();

  const totalValue = sumTotal(items);
  const totalQuantity = sumQuantity(items);

  const attention = useMemo(() => items.filter(i => isOutOfStock(i) || isLowStock(i)), [items]);
  const topItems = useMemo(() => [...items].sort((a, b) => itemTotal(b) - itemTotal(a)).slice(0, 5), [items]);
  const recent = useMemo(() => [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5), [items]);
  const byCompany = useMemo(
    () =>
      companies
        .map(c => {
          const own = items.filter(i => i.companyId === c.id);
          return { company: c, value: sumTotal(own), count: own.length };
        })
        .sort((a, b) => b.value - a.value),
    [companies, items],
  );

  const openItem = (item: Item) => router.push({ pathname: '/modal/item-form', params: { itemId: item.id } });

  const itemRow = (item: Item, trailing: string) => (
    <Pressable
      key={item.id}
      onPress={() => openItem(item)}
      style={({ pressed }) => [styles.row, { borderTopColor: theme.border, opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.flex}>
        <ThemedText type="default" numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {getCompanyName(item.companyId)} · {getSectorName(item.sectorId)}
        </ThemedText>
      </View>
      <ThemedText type="small" style={styles.trailing}>{trailing}</ThemedText>
    </Pressable>
  );

  const card = { backgroundColor: theme.backgroundElement, borderColor: theme.border };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader
            title={t('home.title')}
            subtitle={new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
          />

          <View style={styles.pad}>
            <View style={[styles.hero, card]}>
              <ThemedText type="small" themeColor="textSecondary">{t('home.totalValue')}</ThemedText>
              <ThemedText type="subtitle" style={styles.heroValue} adjustsFontSizeToFit numberOfLines={1}>
                {formatBRL(totalValue)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {plural('items', items.length)} · {plural('units', totalQuantity)}
              </ThemedText>
            </View>

            <View style={styles.tiles}>
              {[
                { label: t('home.companies'), value: companies.length, icon: ['building.2.fill', 'business'] },
                { label: t('home.sectors'), value: sectors.length, icon: ['square.grid.2x2.fill', 'grid_view'] },
                { label: t('home.needRestock'), value: attention.length, icon: ['exclamationmark.triangle.fill', 'warning'], warn: attention.length > 0 },
              ].map(t => (
                <View key={t.label} style={[styles.tile, card]}>
                  <Icon ios={t.icon[0]} material={t.icon[1]} size={18} color={t.warn ? 'warning' : 'textSecondary'} />
                  <ThemedText type="subtitle" style={styles.tileValue}>{t.value}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{t.label}</ThemedText>
                </View>
              ))}
            </View>

            {items.length === 0 && (
              <View style={[styles.empty, card]}>
                <ThemedText type="subtitle" style={styles.emptyTitle}>{t('home.welcome')}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                  {t('home.welcomeText')}
                </ThemedText>
                <Button label={t('home.addCompany')} onPress={() => router.push('/modal/company-form')} style={styles.stretch} />
                {companies.length === 0 && (
                  <Button label={t('home.loadSample')} variant="secondary" onPress={() => loadSampleData()} style={styles.stretch} />
                )}
              </View>
            )}

            {attention.length > 0 && (
              <Section title={t('home.attention')} action={{ label: t('home.viewAll'), onPress: () => router.push({ pathname: '/items', params: { lowStock: '1' } }) }}>
                <View style={[styles.list, card]}>
                  {attention.slice(0, 4).map(item => (
                    <Pressable
                      key={item.id}
                      onPress={() => openItem(item)}
                      style={({ pressed }) => [styles.row, { borderTopColor: theme.border, opacity: pressed ? 0.7 : 1 }]}
                    >
                      <View style={styles.flex}>
                        <ThemedText type="default" numberOfLines={1}>{item.name}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {t('home.left', { count: item.quantity })}{item.minQuantity ? ` · ${t('home.min', { count: item.minQuantity })}` : ''}
                        </ThemedText>
                      </View>
                      {isOutOfStock(item) ? <Badge label={t('home.out')} tone="danger" /> : <Badge label={t('home.low')} tone="warning" />}
                    </Pressable>
                  ))}
                </View>
              </Section>
            )}

            {byCompany.some(b => b.value > 0) && (
              <Section title={t('home.byCompany')}>
                <View style={[styles.list, card, styles.padded]}>
                  {byCompany.map(({ company, value, count }) => {
                    const share = totalValue > 0 ? value / totalValue : 0;
                    return (
                      <View key={company.id} style={styles.barBlock}>
                        <View style={styles.barLabels}>
                          <ThemedText type="small" numberOfLines={1} style={styles.flex}>{company.name}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {formatBRL(value)} · {Math.round(share * 100)}%
                          </ThemedText>
                        </View>
                        <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
                          <View style={[styles.barFill, { backgroundColor: theme.primary, width: `${Math.max(share * 100, count > 0 ? 2 : 0)}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Section>
            )}

            {topItems.length > 0 && (
              <Section title={t('home.topItems')}>
                <View style={[styles.list, card]}>
                  {topItems.map(item => itemRow(item, formatBRL(itemTotal(item))))}
                </View>
              </Section>
            )}

            {recent.length > 0 && (
              <Section title={t('home.recent')}>
                <View style={[styles.list, card]}>
                  {recent.map(item => itemRow(item, new Date(item.updatedAt).toLocaleDateString(locale)))}
                </View>
              </Section>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingBottom: BottomTabInset + Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  pad: { paddingHorizontal: Spacing.four, gap: Spacing.four },
  hero: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.four, gap: Spacing.one },
  heroValue: { fontWeight: 700, fontSize: 40, lineHeight: 48, letterSpacing: -1.5 },
  tiles: { flexDirection: 'row', gap: Spacing.two },
  tile: { flex: 1, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.three, gap: Spacing.half },
  tileValue: { fontSize: 26, lineHeight: 34, fontWeight: 700, letterSpacing: -0.5 },
  section: { gap: Spacing.two },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontWeight: 700, fontSize: 18 },
  list: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  padded: { padding: Spacing.three, gap: Spacing.three },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  trailing: { fontWeight: 600 },
  barBlock: { gap: 6 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  empty: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.four, gap: Spacing.three, alignItems: 'center' },
  emptyTitle: { fontSize: 24, lineHeight: 32 },
  emptyText: { textAlign: 'center' },
  stretch: { alignSelf: 'stretch' },
});
