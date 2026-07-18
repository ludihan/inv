import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useInventory } from '@/hooks/useInventory';

export default function SectorFormModal() {
  const router = useRouter();
  const theme = useTheme();
  const { addSector, editSector, getCompanyName } = useInventory();
  
  const params = useLocalSearchParams<{
    companyId?: string;
    sectorId?: string;
    sectorName?: string;
  }>();
  
  const isEditing = !!params.sectorId;
  const companyName = params.companyId ? getCompanyName(params.companyId) : '';
  
  const [name, setName] = useState(params.sectorName || '');
  
  const handleSubmit = async () => {
    if (!name.trim() || !params.companyId) {
      return;
    }
    
    if (isEditing && params.sectorId) {
      await editSector(params.sectorId, name.trim());
    } else {
      await addSector(name.trim(), params.companyId);
    }
    
    router.back();
  };
  
  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {isEditing ? 'Edit Sector' : 'Add Sector'}
        </ThemedText>
        
        {companyName ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Company: {companyName}
          </ThemedText>
        ) : null}
        
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">Sector Name *</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected, color: theme.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Sector name (e.g., T.I., RH)"
            placeholderTextColor={theme.textSecondary}
          />
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
                backgroundColor: !name.trim() ? theme.backgroundSelected : theme.text,
              },
            ]}
            onPress={handleSubmit}
            disabled={!name.trim()}
          >
            <ThemedText 
              type="default"
              style={{ color: !name.trim() ? theme.textSecondary : theme.background }}
            >
              {isEditing ? 'Save' : 'Add'}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
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
  subtitle: {
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
