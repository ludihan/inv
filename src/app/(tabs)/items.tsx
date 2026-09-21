import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useActionSheet } from '@/components/action-sheet';
import { ItemCard } from '@/components/item-card';
import { EmptyState } from '@/components/empty-state';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { ScreenHeader } from '@/components/screen-header';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/hooks/useInventory';
import { useT } from '@/i18n';
import { Item } from '@/types';
import { confirmDestructive } from '@/services/dialog';
import { formatBRL } from '@/services/csv';
import { isLowStock, isOutOfStock, itemQuantity, itemTotal, normalize, sumTotal } from '@/services/stock';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

type SortKey = 'recent' | 'name' | 'value' | 'quantity';

const SORTS: SortKey[] = ['recent', 'name', 'value', 'quantity'];

const comparators: Record<SortKey, (a: Item, b: Item) => number> = {
  recent: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
  value: (a, b) => itemTotal(b) - itemTotal(a),
  quantity: (a, b) => itemQuantity(b) - itemQuantity(a),
};

export default function ItemsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const sheet = useActionSheet();
  const { t, plural } = useT();
  const params = useLocalSearchParams<{ companyId?: string; sectorId?: string; lowStock?: string }>();
  const {
    items, companies, sectors, removeItem, duplicateItem, adjustQuantity, getCompanyName, getSectorName,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('recent');

  // Deep links from other screens (e.g. "View items" on a company, low stock alert).
  const paramKey =
    params.companyId || params.sectorId || params.lowStock
      ? `${params.companyId ?? ''}|${params.sectorId ?? ''}|${params.lowStock ?? ''}`
      : '';
  const [appliedParamKey, setAppliedParamKey] = useState('');
  if (paramKey !== appliedParamKey) {
    setAppliedParamKey(paramKey);
    if (paramKey) {
      setSelectedCompanyId(params.companyId ?? null);
      setSelectedSectorId(params.sectorId ?? null);
      setLowStockOnly(params.lowStock === '1');
      setSearchQuery('');
    }
  }

  const filteredItems = useMemo(() => {
    const q = normalize(searchQuery.trim());
    return items
      .filter(item => {
        const matchesSearch =
          !q || normalize(`${item.name} ${item.description ?? ''} ${item.sku ?? ''}`).includes(q);
        const matchesCompany = !selectedCompanyId || item.companyId === selectedCompanyId;
        const matchesSector = !selectedSectorId || item.sectorId === selectedSectorId;
        const matchesStock = !lowStockOnly || isLowStock(item) || isOutOfStock(item);
        return matchesSearch && matchesCompany && matchesSector && matchesStock;
      })
      .sort(comparators[sortKey]);
  }, [items, searchQuery, selectedCompanyId, selectedSectorId, lowStockOnly, sortKey]);

  const openMenu = (item: Item) => {
    sheet.show(item.name, [
      { label: t('edit'), onPress: () => handleEditItem(item) },
      { label: t('duplicate'), onPress: () => duplicateItem(item.id) },
      { label: t('delete'), destructive: true, onPress: () => confirmDelete(item) },
    ]);
  };

  const handleEditItem = (item: Item) => {
    router.push({ pathname: '/modal/item-form', params: { itemId: item.id } });
  };

  const confirmDelete = (item: Item) => {
    confirmDestructive({ title: t('items.deleteTitle'), message: t('items.deleteMessage', { name: item.name }), confirmLabel: t('delete'), cancelLabel: t('cancel'), onConfirm: () => removeItem(item.id) });
  };

  const filteredSectors = selectedCompanyId
    ? sectors.filter(s => s.companyId === selectedCompanyId)
    : sectors;

  const hasActiveFilters = !!searchQuery || !!selectedCompanyId || !!selectedSectorId || lowStockOnly;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCompanyId(null);
    setSelectedSectorId(null);
    setLowStockOnly(false);
    router.setParams({ companyId: undefined, sectorId: undefined, lowStock: undefined });
  };

  const filteredValue = sumTotal(filteredItems);

  const listHeader = (
    <View style={styles.controls}>
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <Icon ios="magnifyingglass" material="search" size={18} color="textSecondary" />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('items.search')}
          placeholderTextColor={theme.textSecondary}
          returnKeyType="search"
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8} accessibilityLabel={t('items.clearSearch')}>
            <Icon ios="xmark.circle.fill" material="cancel" size={18} color="textSecondary" />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={companies}
        keyExtractor={c => c.id}
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        ListHeaderComponent={
          <Chip label={t('items.lowStock')} tone="warning" selected={lowStockOnly} onPress={() => setLowStockOnly(v => !v)} />
        }
        renderItem={({ item: company }) => (
          <Chip
            label={company.name}
            selected={selectedCompanyId === company.id}
            onPress={() => {
              setSelectedCompanyId(selectedCompanyId === company.id ? null : company.id);
              setSelectedSectorId(null);
            }}
          />
        )}
      />

      {filteredSectors.length > 0 && (
        <FlatList
          horizontal
          data={filteredSectors}
          keyExtractor={s => s.id}
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          renderItem={({ item: sector }) => (
            <Chip
              label={sector.name}
              selected={selectedSectorId === sector.id}
              onPress={() => setSelectedSectorId(selectedSectorId === sector.id ? null : sector.id)}
            />
          )}
        />
      )}

      <FlatList
        horizontal
        data={SORTS}
        keyExtractor={s => s}
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        ListHeaderComponent={<ThemedText type="small" themeColor="textSecondary" style={styles.sortLabel}>{t('items.sort')}</ThemedText>}
        renderItem={({ item: sort }) => (
          <Chip label={t(`items.sort.${sort}` as const)} selected={sortKey === sort} onPress={() => setSortKey(sort)} />
        )}
      />

      <View style={styles.summaryRow}>
        <ThemedText type="small" themeColor="textSecondary">
          {plural('items', filteredItems.length)} · {formatBRL(filteredValue)}
        </ThemedText>
        {hasActiveFilters && (
          <Pressable onPress={clearFilters} hitSlop={8}>
            <ThemedText type="small" themeColor="primary">{t('items.clearFilters')}</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title={t('items.title')} subtitle={t('items.subtitle')} />

        {items.length === 0 ? (
          <EmptyState
            title={t('items.emptyTitle')}
            message={
              companies.length === 0 ? t('items.emptyNoCompanies') : t('items.emptyFirst')
            }
            icon="📦"
            action={
              companies.length === 0
                ? { label: t('home.addCompany'), onPress: () => router.push('/modal/company-form') }
                : { label: t('items.addItem'), onPress: () => router.push('/modal/item-form') }
            }
          />
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={listHeader}
            ListEmptyComponent={
              <EmptyState title={t('items.notFound')} message={t('items.notFoundHint')} icon="🔍" />
            }
            ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                companyName={getCompanyName(item.companyId)}
                sectorName={getSectorName(item.sectorId)}
                onPress={handleEditItem}
                onLongPress={openMenu}
                onAdjustQuantity={(i, delta) => adjustQuantity(i.id, delta)}
              />
            )}
          />
        )}

        {items.length > 0 && (
          <Pressable
            accessibilityLabel={t('items.addItem')}
            style={({ pressed }) => [styles.fab, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.push('/modal/item-form')}
          >
            <Icon ios="plus" material="add" size={26} color="primaryText" />
          </Pressable>
        )}
        {sheet.element}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  controls: { gap: Spacing.two, marginBottom: Spacing.two },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    minHeight: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: Spacing.two },
  chipRow: { flexGrow: 0 },
  sortLabel: { alignSelf: 'center', marginRight: Spacing.two },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four + 80,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: BottomTabInset + Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
