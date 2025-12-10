import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { View, Text } from 'react-native';
import { FormField } from '../../api/forms';
import { TextField } from './fields/TextField';
import { NumberField } from './fields/NumberField';
import { SelectField } from './fields/SelectField';
import { FileField } from './fields/FileField';
import { CheckboxField } from './fields/CheckboxField';
import { DateField } from './fields/DateField';

interface Props {
  control: Control<any>;
  field: FormField;
}

export const FieldRenderer: React.FC<Props> = ({ control, field }) => {
  const renderControlledField = (value: any, onChange: (val: any) => void) => {
    switch (field.type) {
      case 'number':
        return <NumberField value={value} onChange={onChange} label={field.label} name={field.name} required={field.required} />;
      case 'date':
        return <DateField value={value} onChange={onChange} label={field.label} name={field.name} required={field.required} />;
      case 'image':
      case 'signature':
        return <FileField value={value} onChange={onChange} label={field.label} name={field.name} mode={field.type} />;
      default:
        return <TextField value={value} onChange={onChange} label={field.label} name={field.name} required={field.required} />;
    }
  };

  const isSelfControlled = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold mb-1 text-white">{field.label}</Text>
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
              {fieldState.error && <Text className="text-red-500 text-sm mt-1">{fieldState.error.message}</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
};
