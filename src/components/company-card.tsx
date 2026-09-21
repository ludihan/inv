import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Company, Item, Sector } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatBRL } from '@/services/csv';
import { sumQuantity, sumTotal } from '@/services/stock';

interface CompanyCardProps {
  company: Company;
  sectors: Sector[];
  items: Item[];
  onPress: (company: Company) => void;
  onMenu: (company: Company) => void;
  onAddSector: (companyId: string) => void;
  onPressSector: (sector: Sector) => void;
  onMenuSector: (sector: Sector) => void;
}

export function CompanyCard({
  company, sectors, items, onPress, onMenu, onAddSector, onPressSector, onMenuSector,
}: CompanyCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.primaryMuted }]}>
          <ThemedText type="default" themeColor="primary" style={styles.avatarText}>
            {company.name.trim().charAt(0).toUpperCase() || '?'}
          </ThemedText>
        </View>
        <Pressable style={styles.headerContent} onPress={() => onPress(company)}>
          <ThemedText type="default" numberOfLines={1} style={styles.name}>{company.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {items.length} items · {sumQuantity(items)} units · {formatBRL(sumTotal(items))}
          </ThemedText>
        </Pressable>
        <Pressable onPress={() => onMenu(company)} hitSlop={10} accessibilityLabel="Company actions">
          <Icon ios="ellipsis" material="more_horiz" color="textSecondary" />
        </Pressable>
      </View>

      <Pressable
        style={[styles.expandButton, { borderTopColor: theme.border }]}
        onPress={() => setExpanded(!expanded)}
      >
        <ThemedText type="small" themeColor="textSecondary">
          {sectors.length} {sectors.length === 1 ? 'sector' : 'sectors'}
        </ThemedText>
        <Icon
          ios={expanded ? 'chevron.up' : 'chevron.down'}
          material={expanded ? 'expand_less' : 'expand_more'}
          size={16}
          color="textSecondary"
        />
      </Pressable>

      {expanded && (
        <View style={styles.sectorsContainer}>
          {sectors.map(sector => {
            const sectorItems = items.filter(i => i.sectorId === sector.id);
            return (
              <Pressable
                key={sector.id}
                style={({ pressed }) => [
                  styles.sectorItem,
                  { backgroundColor: theme.background, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => onPressSector(sector)}
                onLongPress={() => onMenuSector(sector)}
              >
                <View style={styles.flex}>
                  <ThemedText type="small" style={styles.name}>{sector.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {sectorItems.length} items · {formatBRL(sumTotal(sectorItems))}
                  </ThemedText>
                </View>
                <Pressable onPress={() => onMenuSector(sector)} hitSlop={10} accessibilityLabel="Sector actions">
                  <Icon ios="ellipsis" material="more_horiz" size={18} color="textSecondary" />
                </Pressable>
              </Pressable>
            );
          })}

          <Pressable
            style={[styles.addSectorButton, { borderColor: theme.border }]}
            onPress={() => onAddSector(company.id)}
          >
            <Icon ios="plus" material="add" size={16} color="primary" />
            <ThemedText type="small" themeColor="primary">Add sector</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, gap: Spacing.three },
  avatar: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: 700, fontSize: 18 },
  headerContent: { flex: 1 },
  name: { fontWeight: 600 },
  flex: { flex: 1 },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectorsContainer: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.two },
  sectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  addSectorButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
