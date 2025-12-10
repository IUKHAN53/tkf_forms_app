import React from 'react';
import { Button, Text, View } from 'react-native';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField } from '../../api/forms';
import { formSubmissionSchema } from '../../utils/validators';
import { FieldRenderer } from './FieldRenderer';

interface Props {
  form: Form;
  onSubmit: (payload: any) => Promise<void>;
}

export const FormRenderer: React.FC<Props> = ({ form, onSubmit }) => {
  const methods = useForm({ resolver: zodResolver(formSubmissionSchema), defaultValues: { data: {} } });
  const { handleSubmit, control, formState } = methods;

  const submit = async (values: any) => {
    await onSubmit(values);
  };

  return (
    <FormProvider {...methods}>
      <View className="space-y-4">
        {[...form.fields].sort((a, b) => a.order - b.order).map((field: FormField) => (
          <FieldRenderer key={field.id} control={control} field={field} />
        ))}
        {formState.isSubmitting ? (
          <Text className="text-slate-300">Submitting...</Text>
        ) : (
          <Button title="Submit" onPress={handleSubmit(submit)} />
        )}
      </View>
    </FormProvider>
  );
};
