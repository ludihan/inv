import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Item } from '@/types';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/badge';
import { Icon } from '@/components/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { formatBRL } from '@/services/csv';
import { isLowStock, isOutOfStock, itemQuantity, itemTotal } from '@/services/stock';

interface ItemCardProps {
  item: Item;
  companyName: string;
  sectorName: string;
  onPress: (item: Item) => void;
  onLongPress?: (item: Item) => void;
  onAdjustQuantity?: (item: Item, delta: number) => void;
}

function StepButton({ material, ios, label, onPress, disabled }: {
  material: string; ios: string; label: string; onPress: () => void; disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={6}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.step,
        { backgroundColor: theme.backgroundSelected, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <Icon ios={ios} material={material} size={16} />
    </Pressable>
  );
}

export function ItemCard({ item, companyName, sectorName, onPress, onLongPress, onAdjustQuantity }: ItemCardProps) {
  const theme = useTheme();
  const { t } = useT();
  const quantity = itemQuantity(item);
  const out = isOutOfStock(item);
  const low = isLowStock(item);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: out ? theme.danger : low ? theme.warning : theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress?.(item)}
    >
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <ThemedText type="default" numberOfLines={1} style={styles.name}>{item.name}</ThemedText>
          {item.sku ? <ThemedText type="small" themeColor="textSecondary">{item.sku}</ThemedText> : null}
        </View>
        <View style={styles.totals}>
          <ThemedText type="default" style={styles.total}>{formatBRL(itemTotal(item))}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{t('items.each', { value: formatBRL(item.value) })}</ThemedText>
        </View>
      </View>

      {item.description ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>{item.description}</ThemedText>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.tags}>
          <Badge label={companyName} tone="primary" />
          <Badge label={sectorName} />
          {out ? <Badge label={t('items.outOfStock')} tone="danger" /> : low ? <Badge label={t('items.lowStock')} tone="warning" /> : null}
        </View>
        {onAdjustQuantity && (
          <View style={styles.stepper}>
            <StepButton ios="minus" material="remove" label={t('items.decrease')} disabled={quantity === 0} onPress={() => onAdjustQuantity(item, -1)} />
            <ThemedText type="default" style={styles.quantity}>{quantity}</ThemedText>
            <StepButton ios="plus" material="add" label={t('items.increase')} onPress={() => onAdjustQuantity(item, 1)} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.three, borderRadius: Radius.lg, borderWidth: 1, gap: Spacing.two },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.two },
  titleBlock: { flex: 1 },
  name: { fontWeight: 600 },
  totals: { alignItems: 'flex-end' },
  total: { fontWeight: 700 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  tags: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  step: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  quantity: { minWidth: 28, textAlign: 'center', fontWeight: 700 },
});
