import React from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField } from '../../api/forms';
import { formSubmissionSchema } from '../../utils/validators';
import { FieldRenderer } from './FieldRenderer';
import { useThemeColors } from '../../store/themeStore';

interface Props {
  form: Form;
  onSubmit: (payload: any) => Promise<void>;
}

export const FormRenderer: React.FC<Props> = ({ form, onSubmit }) => {
  const methods = useForm({ resolver: zodResolver(formSubmissionSchema), defaultValues: { data: {} } });
  const { handleSubmit, control, formState } = methods;
  const { colors } = useThemeColors();

  const submit = async (values: any) => {
    await onSubmit(values);
  };

  return (
    <FormProvider {...methods}>
      <View style={styles.container}>
        {[...form.fields].sort((a, b) => a.order - b.order).map((field: FormField) => (
          <FieldRenderer key={field.id} control={control} field={field} />
        ))}
        <Pressable
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit(submit)}
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>SUBMIT</Text>
          )}
        </Pressable>
      </View>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
