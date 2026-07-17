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
  const { companies, sectors, items, getTotalValue, getTotalQuantity, getItemsByCompany, getItemsBySector, getSectorsByCompany } = useInventory();
  
  const totalValue = getTotalValue();
  const totalQuantity = getTotalQuantity();
  const totalItems = items.length;
  const totalCompanies = companies.length;
  const totalSectors = sectors.length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Inventory
          </ThemedText>
          
          {/* Global Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">Items</ThemedText>
              <ThemedText type="subtitle">{totalItems}</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">Quantity</ThemedText>
              <ThemedText type="subtitle">{totalQuantity}</ThemedText>
            </View>
          </View>
          
          <View style={[styles.statCardWide, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" themeColor="textSecondary">Total Value</ThemedText>
            <ThemedText type="subtitle">{formatBRL(totalValue)}</ThemedText>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">Companies</ThemedText>
              <ThemedText type="subtitle">{totalCompanies}</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary">Sectors</ThemedText>
              <ThemedText type="subtitle">{totalSectors}</ThemedText>
            </View>
          </View>
          
          {/* Per-Company Breakdown */}
          {companies.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                By Company
              </ThemedText>
              {companies.map(company => {
                const companyItems = getItemsByCompany(company.id);
                const companySectors = getSectorsByCompany(company.id);
                const companyValue = companyItems.reduce((sum, i) => sum + i.value * (i.quantity || 1), 0);
                const companyQuantity = companyItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
                
                return (
                  <View key={company.id} style={[styles.companyCard, { backgroundColor: theme.backgroundElement }]}>
                    <View style={styles.cardHeader}>
                      <ThemedText type="default">{company.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">{formatBRL(companyValue)}</ThemedText>
                    </View>
                    <View style={styles.cardStats}>
                      <ThemedText type="small" themeColor="textSecondary">
                        {companyItems.length} items  ·  {companyQuantity} units  ·  {companySectors.length} sectors
                      </ThemedText>
                    </View>
                    
                    {/* Sector breakdown within company */}
                    {companySectors.map(sector => {
                      const sectorItems = getItemsBySector(sector.id);
                      const sectorValue = sectorItems.reduce((sum, i) => sum + i.value * (i.quantity || 1), 0);
                      const sectorQuantity = sectorItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
                      
                      if (sectorItems.length === 0) return null;
                      
                      return (
                        <View key={sector.id} style={[styles.sectorRow, { borderTopColor: theme.backgroundSelected }]}>
                          <View style={styles.sectorInfo}>
                            <ThemedText type="small">{sector.name}</ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">
                              {sectorItems.length} items  ·  {sectorQuantity} units
                            </ThemedText>
                          </View>
                          <ThemedText type="small">{formatBRL(sectorValue)}</ThemedText>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          )}
          
          {/* Per-Sector Summary (cross-company) */}
          {sectors.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                By Sector (all companies)
              </ThemedText>
              {sectors.map(sector => {
                const sectorItems = getItemsBySector(sector.id);
                const sectorValue = sectorItems.reduce((sum, i) => sum + i.value * (i.quantity || 1), 0);
                const sectorQuantity = sectorItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
                const companyName = companies.find(c => c.id === sector.companyId)?.name || 'Unknown';
                
                return (
                  <View key={sector.id} style={[styles.listItem, { backgroundColor: theme.backgroundElement }]}>
                    <View style={styles.listItemLeft}>
                      <ThemedText type="default">{sector.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">{companyName}</ThemedText>
                    </View>
                    <View style={styles.listItemRight}>
                      <ThemedText type="small">{formatBRL(sectorValue)}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">{sectorQuantity} units</ThemedText>
                    </View>
                  </View>
                );
              })}
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
  statsRow: {
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
  statCardWide: {
    padding: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  section: {
    marginTop: Spacing.four,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
  },
  companyCard: {
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.two,
    gap: Spacing.one,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStats: {
    marginBottom: Spacing.one,
  },
  sectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingLeft: Spacing.two,
  },
  sectorInfo: {
    gap: 2,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.one,
  },
  listItemLeft: {
    gap: 2,
  },
  listItemRight: {
    alignItems: 'flex-end',
    gap: 2,
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
