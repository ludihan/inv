import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useInventory } from '@/hooks/useInventory';
import { useT } from '@/i18n';

export default function CompanyFormModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useT();
  const { addCompany, editCompany } = useInventory();

  const params = useLocalSearchParams<{ companyId?: string; companyName?: string }>();
  const isEditing = !!params.companyId;
  const [name, setName] = useState(params.companyName || '');
  const isValid = !!name.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    if (isEditing && params.companyId) {
      await editCompany(params.companyId, name.trim());
    } else {
      await addCompany(name.trim());
    }
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]} keyboardShouldPersistTaps="handled">
        <ThemedText type="subtitle">{isEditing ? t('form.editCompany') : t('form.newCompany')}</ThemedText>

        <TextField
          label={t('form.companyName')}
          value={name}
          onChangeText={setName}
          placeholder={t('form.companyNamePlaceholder')}
          autoFocus={!isEditing}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <View style={styles.buttons}>
          <Button label={t('cancel')} variant="secondary" onPress={() => router.back()} style={styles.flex} />
          <Button label={isEditing ? t('save') : t('add')} onPress={handleSubmit} disabled={!isValid} style={styles.flex} />
        </View>
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 24 },
  buttons: { flexDirection: 'row', gap: 16 },
  flex: { flex: 1 },
});
