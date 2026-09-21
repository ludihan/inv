import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { CurrencyInput } from '@/components/currency-input';
import { Icon } from '@/components/icon';
import { TextField } from '@/components/text-field';
import { confirmDestructive } from '@/services/dialog';
import { formatBRL } from '@/services/csv';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/hooks/useInventory';
import { useT } from '@/i18n';

export default function ItemFormModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useT();
  const { companies, sectors, items, addItem, editItem, removeItem } = useInventory();
  
  const params = useLocalSearchParams<{
    itemId?: string;
    companyId?: string;
    sectorId?: string;
  }>();
  
  const isEditing = !!params.itemId;
  const existingItem = params.itemId ? items.find(i => i.id === params.itemId) : null;
  
  const [name, setName] = useState(existingItem?.name || '');
  const [description, setDescription] = useState(existingItem?.description || '');
  const [value, setValue] = useState(existingItem?.value || 0);
  const [quantity, setQuantity] = useState(existingItem?.quantity ?? 1);
  const [sku, setSku] = useState(existingItem?.sku || '');
  const [minQuantity, setMinQuantity] = useState(existingItem?.minQuantity ?? 0);
  const [selectedCompanyId, setSelectedCompanyId] = useState(existingItem?.companyId || params.companyId || '');
  const [selectedSectorId, setSelectedSectorId] = useState(existingItem?.sectorId || params.sectorId || '');
  
  // Items may not be loaded yet on a cold deep link; fill the form once they are.
  const [loadedId, setLoadedId] = useState(existingItem?.id);
  if (existingItem && existingItem.id !== loadedId) {
    setLoadedId(existingItem.id);
    setName(existingItem.name);
    setDescription(existingItem.description || '');
    setValue(existingItem.value);
    setQuantity(existingItem.quantity ?? 1);
    setSku(existingItem.sku || '');
    setMinQuantity(existingItem.minQuantity ?? 0);
    setSelectedCompanyId(existingItem.companyId);
    setSelectedSectorId(existingItem.sectorId);
  }
  
  const filteredSectors = sectors.filter(s => s.companyId === selectedCompanyId);
  
  const isValid =
    !!name.trim() && !!selectedCompanyId && !!selectedSectorId && quantity >= 0;

  const handleSubmit = async () => {
    if (!isValid) {
      return;
    }
    
    if (isEditing && params.itemId) {
      await editItem(params.itemId, {
        name: name.trim(),
        description: description.trim() || undefined,
        value,
        quantity,
        sku: sku.trim() || undefined,
        minQuantity: minQuantity > 0 ? minQuantity : undefined,
        companyId: selectedCompanyId,
        sectorId: selectedSectorId,
      });
    } else {
      await addItem({
        name: name.trim(),
        description: description.trim() || undefined,
        value,
        quantity,
        sku: sku.trim() || undefined,
        minQuantity: minQuantity > 0 ? minQuantity : undefined,
        companyId: selectedCompanyId,
        sectorId: selectedSectorId,
      });
    }
    
    router.back();
  };
  
  const handleDelete = () => {
    if (!params.itemId) return;
    confirmDestructive({
      title: t('items.deleteTitle'),
      message: t('items.deleteMessage', { name }),
      confirmLabel: t('delete'),
      cancelLabel: t('cancel'),
      onConfirm: async () => {
        await removeItem(params.itemId!);
        router.back();
      },
    });
  };

  const parseCount = (text: string) => {
    const n = parseInt(text.replace(/\D/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]} keyboardShouldPersistTaps="handled">
        <ThemedText type="subtitle">{isEditing ? t('form.editItem') : t('form.newItem')}</ThemedText>

        <TextField label={t('form.name')} value={name} onChangeText={setName} placeholder={t('form.namePlaceholder')} />
        <TextField
          label={t('form.description')}
          value={description}
          onChangeText={setDescription}
          placeholder={t('form.descriptionPlaceholder')}
          multiline
        />
        <TextField
          label={t('form.sku')}
          value={sku}
          onChangeText={setSku}
          placeholder={t('form.optional')}
          autoCapitalize="characters"
        />

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">{t('form.unitValue')}</ThemedText>
          <CurrencyInput value={value} onChangeText={setValue} />
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">{t('form.quantity')}</ThemedText>
          <View style={styles.stepperRow}>
            <Pressable
              accessibilityLabel={t('items.decrease')}
              style={[styles.stepBtn, { backgroundColor: theme.backgroundSelected }]}
              onPress={() => setQuantity(q => Math.max(0, q - 1))}
            >
              <Icon ios="minus" material="remove" />
            </Pressable>
            <TextInput
              style={[styles.qtyInput, styles.qtyGrow, { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text }]}
              value={String(quantity)}
              onChangeText={text => setQuantity(parseCount(text))}
              keyboardType="number-pad"
              textAlign="center"
            />
            <Pressable
              accessibilityLabel={t('items.increase')}
              style={[styles.stepBtn, { backgroundColor: theme.backgroundSelected }]}
              onPress={() => setQuantity(q => q + 1)}
            >
              <Icon ios="plus" material="add" />
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">{t('form.lowStockAlert')}</ThemedText>
          <TextInput
            style={[styles.qtyInput, { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text }]}
            value={String(minQuantity)}
            onChangeText={text => setMinQuantity(parseCount(text))}
            keyboardType="number-pad"
          />
        </View>

        <View style={[styles.totalBox, { backgroundColor: theme.primaryMuted }]}>
          <ThemedText type="small" themeColor="primary">{t('form.totalValue')}</ThemedText>
          <ThemedText type="default" themeColor="primary" style={styles.totalText}>
            {formatBRL(value * quantity)}
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">{t('form.company')}</ThemedText>
          {companies.length === 0 ? (
            <Button label={t('form.addCompanyFirst')} variant="secondary" onPress={() => router.push('/modal/company-form')} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {companies.map(company => (
                <Chip
                  key={company.id}
                  label={company.name}
                  selected={selectedCompanyId === company.id}
                  onPress={() => {
                    setSelectedCompanyId(company.id);
                    setSelectedSectorId('');
                  }}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">{t('form.sector')}</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {filteredSectors.map(sector => (
              <Chip
                key={sector.id}
                label={sector.name}
                selected={selectedSectorId === sector.id}
                onPress={() => setSelectedSectorId(sector.id)}
              />
            ))}
          </ScrollView>
          {selectedCompanyId !== '' && filteredSectors.length === 0 && (
            <Button
              label={t('form.addSectorToCompany')}
              variant="secondary"
              onPress={() => router.push({ pathname: '/modal/sector-form', params: { companyId: selectedCompanyId } })}
            />
          )}
        </View>

        <View style={styles.buttons}>
          <Button label={t('cancel')} variant="secondary" onPress={() => router.back()} style={styles.flex} />
          <Button label={isEditing ? t('save') : t('add')} onPress={handleSubmit} disabled={!isValid} style={styles.flex} />
        </View>
        {isEditing && <Button label={t('form.deleteItem')} variant="danger" onPress={handleDelete} />}
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 20 },
  field: { gap: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  qtyInput: { height: 48, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 16, fontSize: 16 },
  qtyGrow: { flex: 1 },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: Radius.md,
  },
  totalText: { fontWeight: 700 },
  buttons: { flexDirection: 'row', gap: 16 },
  flex: { flex: 1 },
});
