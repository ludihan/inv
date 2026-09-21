import React from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CompanyCard } from '@/components/company-card';
import { useActionSheet } from '@/components/action-sheet';
import { EmptyState } from '@/components/empty-state';
import { Icon } from '@/components/icon';
import { ScreenHeader } from '@/components/screen-header';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/hooks/useInventory';
import { Company, Sector } from '@/types';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function CompaniesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const sheet = useActionSheet();
  const { companies, removeCompany, removeSector, getSectorsByCompany, getItemsByCompany } = useInventory();
  
  const handleEditCompany = (company: Company) => {
    router.push({
      pathname: '/modal/company-form',
      params: { companyId: company.id, companyName: company.name },
    });
  };
  
  const handleDeleteCompany = (company: Company) => {
    Alert.alert(
      'Delete Company',
      `Are you sure you want to delete "${company.name}"? This will also delete all sectors and items in this company.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeCompany(company.id) },
      ]
    );
  };
  
  const openCompanyMenu = (company: Company) => {
    sheet.show(company.name, [
      { label: 'View items', onPress: () => router.push({ pathname: '/items', params: { companyId: company.id } }) },
      { label: 'Add sector', onPress: () => handleAddSector(company.id) },
      { label: 'Rename', onPress: () => handleEditCompany(company) },
      { label: 'Delete', destructive: true, onPress: () => handleDeleteCompany(company) },
    ]);
  };

  const openSectorMenu = (sector: Sector) => {
    sheet.show(sector.name, [
      { label: 'View items', onPress: () => router.push({ pathname: '/items', params: { companyId: sector.companyId, sectorId: sector.id } }) },
      { label: 'Rename', onPress: () => handleEditSector(sector) },
      { label: 'Delete', destructive: true, onPress: () => handleDeleteSector(sector) },
    ]);
  };

  const handleAddCompany = () => {
    router.push('/modal/company-form');
  };
  
  const handleAddSector = (companyId: string) => {
    router.push({
      pathname: '/modal/sector-form',
      params: { companyId },
    });
  };
  
  const handleEditSector = (sector: Sector) => {
    router.push({
      pathname: '/modal/sector-form',
      params: { 
        companyId: sector.companyId, 
        sectorId: sector.id, 
        sectorName: sector.name 
      },
    });
  };
  
  const handleDeleteSector = (sector: Sector) => {
    Alert.alert(
      'Delete Sector',
      `Are you sure you want to delete "${sector.name}"? This will also delete all items in this sector.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeSector(sector.id) },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Companies" subtitle="Tap a company for its sectors and totals" />
        
        {/* Companies List */}
        {companies.length === 0 ? (
          <EmptyState
            title="No companies yet"
            message="Companies group your sectors and items. Add your first one to get started."
            icon="🏢"
            action={{ label: 'Add company', onPress: handleAddCompany }}
          />
        ) : (
          <FlatList
            data={companies}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: company }) => {
              return (
                <CompanyCard
                  company={company}
                  sectors={getSectorsByCompany(company.id)}
                  items={getItemsByCompany(company.id)}
                  onPress={handleEditCompany}
                  onMenu={openCompanyMenu}
                  onAddSector={handleAddSector}
                  onPressSector={handleEditSector}
                  onMenuSector={openSectorMenu}
                />
              );
            }}
          />
        )}
        
        {companies.length > 0 && (
          <Pressable
            accessibilityLabel="Add company"
            style={({ pressed }) => [styles.fab, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={handleAddCompany}
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four + 80,
    gap: Spacing.three,
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
