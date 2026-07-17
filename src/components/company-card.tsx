import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Company, Sector } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface CompanyCardProps {
  company: Company;
  sectors: Sector[];
  itemCount: number;
  onPress: (company: Company) => void;
  onLongPress?: (company: Company) => void;
  onAddSector: (companyId: string) => void;
  onPressSector: (sector: Sector) => void;
  onLongPressSector?: (sector: Sector) => void;
}

export function CompanyCard({
  company,
  sectors,
  itemCount,
  onPress,
  onLongPress,
  onAddSector,
  onPressSector,
  onLongPressSector,
}: CompanyCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
      <Pressable
        style={({ pressed }) => [
          styles.header,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => onPress(company)}
        onLongPress={() => onLongPress?.(company)}
      >
        <View style={styles.headerContent}>
          <ThemedText type="default" numberOfLines={1}>
            {company.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {itemCount} items
          </ThemedText>
        </View>
      </Pressable>

      <Pressable
        style={styles.expandButton}
        onPress={() => setExpanded(!expanded)}
      >
        <ThemedText type="small" themeColor="textSecondary">
          {expanded ? '▼' : '▶'} {sectors.length} sectors
        </ThemedText>
      </Pressable>

      {expanded && (
        <View style={styles.sectorsContainer}>
          {sectors.map(sector => (
            <Pressable
              key={sector.id}
              style={({ pressed }) => [
                styles.sectorItem,
                { 
                  backgroundColor: theme.backgroundSelected,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => onPressSector(sector)}
              onLongPress={() => onLongPressSector?.(sector)}
            >
              <ThemedText type="small">{sector.name}</ThemedText>
            </Pressable>
          ))}
          
          <Pressable
            style={[styles.addSectorButton, { borderColor: theme.textSecondary }]}
            onPress={() => onAddSector(company.id)}
          >
            <ThemedText type="small" themeColor="textSecondary">+ Add Sector</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandButton: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectorsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  sectorItem: {
    padding: 12,
    borderRadius: 8,
  },
  addSectorButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
});
