import React, { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

export interface SheetAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface SheetState {
  title: string;
  actions: SheetAction[];
}

/**
 * Bottom action sheet that behaves the same on every platform
 * (Alert is limited to three buttons on Android).
 */
export function useActionSheet() {
  const theme = useTheme();
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<SheetState | null>(null);

  const close = useCallback(() => setSheet(null), []);
  const show = useCallback((title: string, actions: SheetAction[]) => setSheet({ title, actions }), []);

  const element = (
    <Modal visible={!!sheet} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.backgroundElement, paddingBottom: Spacing.three + insets.bottom }]} onPress={() => {}}>
          <ThemedText type="smallBold" themeColor="textSecondary" numberOfLines={1} style={styles.title}>
            {sheet?.title}
          </ThemedText>
          {sheet?.actions.map(action => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.action,
                { borderTopColor: theme.border, backgroundColor: pressed ? theme.backgroundSelected : 'transparent' },
              ]}
              onPress={() => {
                close();
                action.onPress();
              }}
            >
              <ThemedText type="default" themeColor={action.destructive ? 'danger' : 'text'}>
                {action.label}
              </ThemedText>
            </Pressable>
          ))}
          <View style={[styles.gap, { backgroundColor: theme.background }]} />
          <Pressable style={[styles.action, { borderTopColor: theme.border }]} onPress={close} accessibilityRole="button">
            <ThemedText type="default" themeColor="textSecondary">{t('cancel')}</ThemedText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return { show, element };
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  title: { textAlign: 'center', padding: Spacing.three },
  action: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  gap: { height: Spacing.two },
});
