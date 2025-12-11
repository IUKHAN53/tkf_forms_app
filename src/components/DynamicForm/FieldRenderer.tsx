import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { View, Text, StyleSheet } from 'react-native';
import { FormField } from '../../api/forms';
import { TextField } from './fields/TextField';
import { NumberField } from './fields/NumberField';
import { SelectField } from './fields/SelectField';
import { FileField } from './fields/FileField';
import { CheckboxField } from './fields/CheckboxField';
import { DateField } from './fields/DateField';
import { useThemeColors } from '../../store/themeStore';

interface Props {
  control: Control<any>;
  field: FormField;
}

export const FieldRenderer: React.FC<Props> = ({ control, field }) => {
  const { colors } = useThemeColors();

  const renderControlledField = (value: any, onChange: (val: any) => void) => {
    switch (field.type) {
      case 'number':
        return <NumberField value={value} onChange={onChange} label={field.label} name={field.name} required={field.required} />;
      case 'date':
        return <DateField value={value} onChange={onChange} label={field.label} name={field.name} required={field.required} />;
      case 'image':
      case 'signature':
        return <FileField value={value} onChange={onChange} label={field.label} name={field.name} mode={field.type} />;
      case 'textarea':
        return <TextField value={value} onChange={onChange} label={field.label} name={field.name} required={field.required} multiline />;
      default:
        return <TextField value={value} onChange={onChange} label={field.label} name={field.name} required={field.required} />;
    }
  };

  const isSelfControlled = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {field.label}
        {field.required && <Text style={{ color: colors.error || '#ef4444' }}> *</Text>}
      </Text>
      {isSelfControlled ? (
        field.type === 'checkbox' ? (
          <CheckboxField control={control} name={field.name} label={field.label} />
        ) : (
          <SelectField
            control={control}
            name={field.name}
            label={field.label}
            required={field.required}
            options={field.options ?? []}
          />
        )
      ) : (
        <Controller
          control={control}
          name={`data.${field.name}`}
          rules={{ required: field.required ? `${field.label} is required` : false }}
          render={({ field: rhfField, fieldState }) => (
            <View>
              {renderControlledField(rhfField.value, rhfField.onChange)}
              {fieldState.error && (
                <Text style={[styles.error, { color: colors.error || '#ef4444' }]}>
                  {fieldState.error.message}
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
