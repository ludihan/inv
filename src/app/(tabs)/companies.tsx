import React from 'react';
import { StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { CompanyCard } from '@/components/company-card';
import { useActionSheet } from '@/components/action-sheet';
import { EmptyState } from '@/components/empty-state';
import { Icon } from '@/components/icon';
import { ScreenHeader } from '@/components/screen-header';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/hooks/useInventory';
import { useT } from '@/i18n';
import { confirmDestructive } from '@/services/dialog';
import { Company, Sector } from '@/types';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

export default function CompaniesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const sheet = useActionSheet();
  const { t } = useT();
  const { companies, removeCompany, removeSector, getSectorsByCompany, getItemsByCompany } = useInventory();
  
  const handleEditCompany = (company: Company) => {
    router.push({
      pathname: '/modal/company-form',
      params: { companyId: company.id, companyName: company.name },
    });
  };
  
  const handleDeleteCompany = (company: Company) => {
    confirmDestructive({ title: t('companies.deleteTitle'), message: t('companies.deleteMessage', { name: company.name }), confirmLabel: t('delete'), cancelLabel: t('cancel'), onConfirm: () => removeCompany(company.id) });
  };
  
  const openCompanyMenu = (company: Company) => {
    sheet.show(company.name, [
      { label: t('companies.viewItems'), onPress: () => router.push({ pathname: '/items', params: { companyId: company.id } }) },
      { label: t('companies.addSector'), onPress: () => handleAddSector(company.id) },
      { label: t('rename'), onPress: () => handleEditCompany(company) },
      { label: t('delete'), destructive: true, onPress: () => handleDeleteCompany(company) },
    ]);
  };

  const openSectorMenu = (sector: Sector) => {
    sheet.show(sector.name, [
      { label: t('companies.viewItems'), onPress: () => router.push({ pathname: '/items', params: { companyId: sector.companyId, sectorId: sector.id } }) },
      { label: t('rename'), onPress: () => handleEditSector(sector) },
      { label: t('delete'), destructive: true, onPress: () => handleDeleteSector(sector) },
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
    confirmDestructive({ title: t('companies.deleteSectorTitle'), message: t('companies.deleteSectorMessage', { name: sector.name }), confirmLabel: t('delete'), cancelLabel: t('cancel'), onConfirm: () => removeSector(sector.id) });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title={t('companies.title')} subtitle={t('companies.subtitle')} />
        
        {/* Companies List */}
        {companies.length === 0 ? (
          <EmptyState
            title={t('companies.emptyTitle')}
            message={t('companies.emptyMessage')}
            icon="🏢"
            action={{ label: t('companies.addCompany'), onPress: handleAddCompany }}
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
            accessibilityLabel={t('companies.addCompany')}
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
    borderRadius: Radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 4,
  },
});
