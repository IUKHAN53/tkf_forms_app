import React from 'react';
import { ActivityIndicator, ScrollView, Text, View, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm as useFormQuery } from '../../../src/hooks/useForms';
import { FormRenderer } from '../../../src/components/DynamicForm/FormRenderer';
import { submitForm } from '../../../src/api/forms';
import { useOfflineQueueStore } from '../../../src/store/offlineQueueStore';
import { useThemeColors } from '../../../src/store/themeStore';

export default function FormDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const formId = parseInt(id ?? '0', 10);
  const { data: form, isLoading, isError } = useFormQuery(formId);
  const { addToQueue } = useOfflineQueueStore();
  const { colors } = useThemeColors();

  const handleSubmit = async (payload: any) => {
    if (!form) return;
    try {
      await submitForm(form.id, payload);
      Alert.alert('Success', 'Submission sent');
    } catch (error) {
      await addToQueue(form.id, payload);
      Alert.alert('Offline', 'Saved locally; will sync when online.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !form) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Failed to load form</Text>
        <Text style={{ color: colors.muted }}>Pull to retry</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{form.name}</Text>
      {form.description ? <Text style={[styles.description, { color: colors.muted }]}>{form.description}</Text> : null}
      <FormRenderer form={form} onSubmit={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 8,
  },
});
