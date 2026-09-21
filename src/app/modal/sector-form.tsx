import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useInventory } from '@/hooks/useInventory';

export default function SectorFormModal() {
  const router = useRouter();
  const { addSector, editSector, getCompanyName } = useInventory();

  const params = useLocalSearchParams<{ companyId?: string; sectorId?: string; sectorName?: string }>();
  const isEditing = !!params.sectorId;
  const companyName = params.companyId ? getCompanyName(params.companyId) : '';
  const [name, setName] = useState(params.sectorName || '');
  const isValid = !!name.trim() && !!params.companyId;

  const handleSubmit = async () => {
    if (!isValid || !params.companyId) return;
    if (isEditing && params.sectorId) {
      await editSector(params.sectorId, name.trim());
    } else {
      await addSector(name.trim(), params.companyId);
    }
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.titleBlock}>
          <ThemedText type="subtitle">{isEditing ? 'Edit sector' : 'New sector'}</ThemedText>
          {companyName ? <Badge label={companyName} tone="primary" /> : null}
        </View>

        <TextField
          label="Sector name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g. T.I., RH, Financeiro"
          autoFocus={!isEditing}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <View style={styles.buttons}>
          <Button label="Cancel" variant="secondary" onPress={() => router.back()} style={styles.flex} />
          <Button label={isEditing ? 'Save' : 'Add'} onPress={handleSubmit} disabled={!isValid} style={styles.flex} />
        </View>
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 24 },
  titleBlock: { gap: 8, alignItems: 'flex-start' },
  buttons: { flexDirection: 'row', gap: 16 },
  flex: { flex: 1 },
});
