import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Item } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { formatBRL } from '@/services/csv';

interface ItemCardProps {
  item: Item;
  companyName: string;
  sectorName: string;
  onPress: (item: Item) => void;
  onLongPress?: (item: Item) => void;
}

export function ItemCard({ item, companyName, sectorName, onPress, onLongPress }: ItemCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress?.(item)}
    >
      <View style={styles.header}>
        <ThemedText type="default" numberOfLines={1} style={styles.name}>
          {item.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatBRL(item.value)}
        </ThemedText>
      </View>
      
      {item.description ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {item.description}
        </ThemedText>
      ) : null}
      
      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="small" themeColor="textSecondary">{companyName}</ThemedText>
        </View>
        <View style={[styles.tag, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="small" themeColor="textSecondary">{sectorName}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
