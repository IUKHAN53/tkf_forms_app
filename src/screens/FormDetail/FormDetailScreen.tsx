import React from 'react';
import { ActivityIndicator, ScrollView, Text, View, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { useForm as useFormQuery } from '../../hooks/useForms';
import { FormRenderer } from '../../components/DynamicForm/FormRenderer';
import { submitForm } from '../../api/forms';
import { useOfflineQueueStore } from '../../store/offlineQueueStore';
import { useThemeColors } from '../../store/themeStore';

export type FormDetailProps = NativeStackScreenProps<RootStackParamList, 'FormDetail'>;

export const FormDetailScreen: React.FC<FormDetailProps> = ({ route }) => {
  const { formId, form: initialForm } = route.params;
  const { data: form, isLoading, isError, refetch } = useFormQuery(formId);
  const { addToQueue } = useOfflineQueueStore();
  const { colors } = useThemeColors();

  const resolvedForm = form ?? initialForm;

  const handleSubmit = async (payload: any) => {
    if (!resolvedForm) return;
    try {
      await submitForm(resolvedForm.id, payload);
      Alert.alert('Success', 'Submission sent');
    } catch (error) {
      await addToQueue(resolvedForm.id, payload);
      Alert.alert('Offline', 'Saved locally; will sync when online.');
    }
  };

  if (isLoading && !resolvedForm) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }} className="items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError && !resolvedForm) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }} className="items-center justify-center">
        <Text style={{ color: colors.text }} className="mb-2">Failed to load form</Text>
        <Text style={{ color: colors.muted }} className="mb-4">Pull to retry</Text>
      </View>
    );
  }

  if (!resolvedForm) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: colors.text }} className="text-2xl font-bold mb-2">{resolvedForm.name}</Text>
      {resolvedForm.description ? <Text style={{ color: colors.muted }} className="mb-4">{resolvedForm.description}</Text> : null}
      <FormRenderer form={resolvedForm} onSubmit={handleSubmit} />
    </ScrollView>
  );
};
