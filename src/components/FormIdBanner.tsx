import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../store/themeStore';

interface FormIdBannerProps {
  formId: string | null;
  loading?: boolean;
  formTitle: string;
}

export function FormIdBanner({ formId, loading, formTitle }: FormIdBannerProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
      <Text style={[styles.title, { color: colors.text }]}>{formTitle}</Text>
      <View style={styles.idRow}>
        <Text style={[styles.label, { color: colors.muted }]}>Form ID:</Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
        ) : (
          <Text style={[styles.formId, { color: colors.primary }]}>
            {formId || 'Generating...'}
          </Text>
        )}
      </View>
      <Text style={[styles.hint, { color: colors.muted }]}>
        Save this ID for your records
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
  },
  formId: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginLeft: 8,
    letterSpacing: 1,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
