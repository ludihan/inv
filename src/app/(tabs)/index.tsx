import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/hooks/useInventory';
import { formatBRL } from '@/services/csv';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { companies, sectors, items, getTotalValue, getItemsByCompany, getSectorsByCompany } = useInventory();
  
  const totalValue = getTotalValue();
  const totalItems = items.length;
  const totalCompanies = companies.length;
  const totalSectors = sectors.length;
  
  // Get top companies by item count
  const topCompanies = companies
    .map(company => ({
      ...company,
      itemCount: getItemsByCompany(company.id).length,
    }))
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 5);
  
  // Get top sectors by item count
  const topSectors = sectors
    .map(sector => ({
      ...sector,
      itemCount: items.filter(i => i.sectorId === sector.id).length,
    }))
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 5);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Inventory
          </ThemedText>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">Total Items</ThemedText>
              <ThemedText type="subtitle">{totalItems}</ThemedText>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">Total Value</ThemedText>
              <ThemedText type="subtitle">{formatBRL(totalValue)}</ThemedText>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">Companies</ThemedText>
              <ThemedText type="subtitle">{totalCompanies}</ThemedText>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">Sectors</ThemedText>
              <ThemedText type="subtitle">{totalSectors}</ThemedText>
            </View>
          </View>
          
          {/* Top Companies */}
          {topCompanies.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Top Companies
              </ThemedText>
              {topCompanies.map(company => (
                <View 
                  key={company.id} 
                  style={[styles.listItem, { backgroundColor: theme.backgroundElement }]}
                >
                  <ThemedText type="default">{company.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {company.itemCount} items
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
          
          {/* Top Sectors */}
          {topSectors.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Top Sectors
              </ThemedText>
              {topSectors.map(sector => (
                <View 
                  key={sector.id} 
                  style={[styles.listItem, { backgroundColor: theme.backgroundElement }]}
                >
                  <ThemedText type="default">{sector.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {sector.itemCount} items
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
          
          {/* Empty State */}
          {totalItems === 0 && (
            <View style={[styles.emptyState, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle" style={styles.emptyTitle}>
                No items yet
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyMessage}>
                Add companies, sectors, and items to get started
              </ThemedText>
            </View>
          )}
        </ScrollView>
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
  content: {
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  statCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    gap: Spacing.one,
  },
  section: {
    marginTop: Spacing.four,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.one,
  },
  emptyState: {
    padding: Spacing.four,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  emptyTitle: {
    marginBottom: Spacing.two,
  },
  emptyMessage: {
    textAlign: 'center',
  },
});
