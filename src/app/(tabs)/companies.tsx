import React from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CompanyCard } from '@/components/company-card';
import { EmptyState } from '@/components/empty-state';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/hooks/useInventory';
import { Company, Sector } from '@/types';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function CompaniesScreen() {
  const router = useRouter();
  const theme = useTheme();
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
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Companies</ThemedText>
        </View>
        
        {/* Companies List */}
        {companies.length === 0 ? (
          <EmptyState
            title="No companies yet"
            message="Add your first company to get started"
            icon="🏢"
          />
        ) : (
          <FlatList
            data={companies}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: company }) => {
              const companySectors = getSectorsByCompany(company.id);
              const companyItems = getItemsByCompany(company.id);
              
              return (
                <CompanyCard
                  company={company}
                  sectors={companySectors}
                  itemCount={companyItems.length}
                  onPress={handleEditCompany}
                  onLongPress={handleDeleteCompany}
                  onAddSector={handleAddSector}
                  onPressSector={handleEditSector}
                  onLongPressSector={handleDeleteSector}
                />
              );
            }}
          />
        )}
        
        {/* FAB */}
        <Pressable
          style={[styles.fab, { backgroundColor: theme.text }]}
          onPress={handleAddCompany}
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
