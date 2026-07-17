import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CurrencyInput } from '@/components/currency-input';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/hooks/useInventory';

export default function ItemFormModal() {
  const router = useRouter();
  const theme = useTheme();
  const { companies, sectors, items, addItem, editItem } = useInventory();
  
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
  const [quantity, setQuantity] = useState(existingItem?.quantity || 1);
  const [selectedCompanyId, setSelectedCompanyId] = useState(existingItem?.companyId || params.companyId || '');
  const [selectedSectorId, setSelectedSectorId] = useState(existingItem?.sectorId || params.sectorId || '');
  
  useEffect(() => {
    if (existingItem) {
      setName(existingItem.name);
      setDescription(existingItem.description || '');
      setValue(existingItem.value);
      setQuantity(existingItem.quantity || 1);
      setSelectedCompanyId(existingItem.companyId);
      setSelectedSectorId(existingItem.sectorId);
    }
  }, [existingItem]);
  
  const filteredSectors = sectors.filter(s => s.companyId === selectedCompanyId);
  
  const handleSubmit = async () => {
    if (!name.trim() || !selectedCompanyId || !selectedSectorId) {
      return;
    }
    
    if (isEditing && params.itemId) {
      await editItem(params.itemId, {
        name: name.trim(),
        description: description.trim() || undefined,
        value,
        quantity,
        companyId: selectedCompanyId,
        sectorId: selectedSectorId,
      });
    } else {
      await addItem({
        name: name.trim(),
        description: description.trim() || undefined,
        value,
        quantity,
        companyId: selectedCompanyId,
        sectorId: selectedSectorId,
      });
    }
    
    router.back();
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {isEditing ? 'Edit Item' : 'Add Item'}
        </ThemedText>
        
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">Name *</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected, color: theme.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Item name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
        
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected, color: theme.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">Value (R$) *</ThemedText>
          <CurrencyInput
            value={value}
            onChangeText={setValue}
          />
        </View>
        
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">Quantity *</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected, color: theme.text }]}
            value={String(quantity)}
            onChangeText={(text) => setQuantity(parseInt(text) || 0)}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
        
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">Company *</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {companies.map(company => (
              <Pressable
                key={company.id}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: selectedCompanyId === company.id ? theme.text : theme.backgroundElement,
                    borderColor: theme.backgroundSelected,
                  },
                ]}
                onPress={() => {
                  setSelectedCompanyId(company.id);
                  setSelectedSectorId('');
                }}
              >
                <ThemedText 
                  type="small"
                  style={{ color: selectedCompanyId === company.id ? theme.background : theme.text }}
                >
                  {company.name}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">Sector *</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {filteredSectors.map(sector => (
              <Pressable
                key={sector.id}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: selectedSectorId === sector.id ? theme.text : theme.backgroundElement,
                    borderColor: theme.backgroundSelected,
                  },
                ]}
                onPress={() => setSelectedSectorId(sector.id)}
              >
                <ThemedText 
                  type="small"
                  style={{ color: selectedSectorId === sector.id ? theme.background : theme.text }}
                >
                  {sector.name}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
          {selectedCompanyId && filteredSectors.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
              No sectors for this company. Add one first.
            </ThemedText>
          )}
        </View>
        
        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.cancelButton, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.back()}
          >
            <ThemedText type="default">Cancel</ThemedText>
          </Pressable>
          
          <Pressable
            style={[
              styles.button, 
              styles.submitButton, 
              { 
                backgroundColor: (!name.trim() || !selectedCompanyId || !selectedSectorId) 
                  ? theme.backgroundSelected 
                  : theme.text,
              },
            ]}
            onPress={handleSubmit}
            disabled={!name.trim() || !selectedCompanyId || !selectedSectorId}
          >
            <ThemedText 
              type="default"
              style={{ color: (!name.trim() || !selectedCompanyId || !selectedSectorId) ? theme.textSecondary : theme.background }}
            >
              {isEditing ? 'Save' : 'Add'}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  title: {
    textAlign: 'center',
  },
  field: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  hint: {
    fontStyle: 'italic',
    marginTop: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {},
  submitButton: {},
});
