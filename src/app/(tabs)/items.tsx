import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ItemCard } from '@/components/item-card';
import { EmptyState } from '@/components/empty-state';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/hooks/useInventory';
import { Item } from '@/types';
import { formatBRL } from '@/services/csv';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function ItemsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { items, companies, sectors, removeItem, getCompanyName, getSectorName } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = !selectedCompanyId || item.companyId === selectedCompanyId;
    const matchesSector = !selectedSectorId || item.sectorId === selectedSectorId;
    return matchesSearch && matchesCompany && matchesSector;
  });
  
  const handleEditItem = (item: Item) => {
    router.push({
      pathname: '/modal/item-form',
      params: { itemId: item.id },
    });
  };
  
  const handleDeleteItem = (item: Item) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeItem(item.id) },
      ]
    );
  };
  
  const handleAddItem = () => {
    router.push('/modal/item-form');
  };
  
  const filteredSectors = selectedCompanyId
    ? sectors.filter(s => s.companyId === selectedCompanyId)
    : sectors;

  const hasActiveFilters = !!searchQuery || !!selectedCompanyId || !!selectedSectorId;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCompanyId(null);
    setSelectedSectorId(null);
  };

  const filteredValue = filteredItems.reduce(
    (sum, i) => sum + i.value * (i.quantity || 1),
    0,
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Items</ThemedText>
        </View>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">🔍</ThemedText>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search items..."
            placeholderTextColor={theme.textSecondary}
          />
        </View>
        
        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={companies}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: company }) => (
              <Pressable
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: selectedCompanyId === company.id ? theme.text : theme.backgroundElement,
                    borderColor: theme.backgroundSelected,
                  },
                ]}
                onPress={() => {
                  setSelectedCompanyId(selectedCompanyId === company.id ? null : company.id);
                  setSelectedSectorId(null);
                }}
              >
                <ThemedText 
                  type="small"
                  style={{ color: selectedCompanyId === company.id ? theme.background : theme.text }}
                >
                  {company.name}
                </ThemedText>
              </Pressable>
            )}
          />
        </View>
        
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={filteredSectors}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: sector }) => (
              <Pressable
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: selectedSectorId === sector.id ? theme.text : theme.backgroundElement,
                    borderColor: theme.backgroundSelected,
                  },
                ]}
                onPress={() => {
                  setSelectedSectorId(selectedSectorId === sector.id ? null : sector.id);
                }}
              >
                <ThemedText 
                  type="small"
                  style={{ color: selectedSectorId === sector.id ? theme.background : theme.text }}
                >
                  {sector.name}
                </ThemedText>
              </Pressable>
            )}
          />
        </View>
        
        {/* Summary */}
        <View style={styles.summaryRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} · {formatBRL(filteredValue)}
          </ThemedText>
          {hasActiveFilters && (
            <Pressable onPress={clearFilters} hitSlop={8}>
              <ThemedText type="small" themeColor="textSecondary">Clear filters ✕</ThemedText>
            </Pressable>
          )}
        </View>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <EmptyState
            title="No items found"
            message={items.length === 0 ? "Add your first item to get started" : "Try adjusting your filters"}
            icon={items.length === 0 ? "📦" : "🔍"}
          />
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                companyName={getCompanyName(item.companyId)}
                sectorName={getSectorName(item.sectorId)}
                onPress={handleEditItem}
                onLongPress={handleDeleteItem}
              />
            )}
          />
        )}
        
        {/* FAB */}
        <Pressable
          style={[styles.fab, { backgroundColor: theme.text }]}
          onPress={handleAddItem}
        >
          <ThemedText type="subtitle" style={{ color: theme.background }}>+</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: Spacing.one,
  },
  listContent: {
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four + 80,
    gap: Spacing.two,
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
