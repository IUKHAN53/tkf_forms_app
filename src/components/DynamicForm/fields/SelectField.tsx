import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FieldOption } from '../../../api/forms';

interface Props {
  control: Control<any>;
  name: string;
  label: string;
  required?: boolean;
  options: FieldOption[];
}

export const SelectField: React.FC<Props> = ({ control, name, label, options, required }) => {
  return (
    <View>
      <Controller
        control={control}
        name={`data.${name}`}
        rules={{ required: required ? `${label} is required` : false }}
        render={({ field: { value, onChange }, fieldState }) => (
          <View>
            <View className="bg-slate-900 border border-slate-800 rounded-lg">
              <Picker selectedValue={value} onValueChange={onChange} dropdownIconColor="#fff" style={{ color: '#fff' }}>
                <Picker.Item label="Select" value="" />
                {options.map((opt) => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>
            {fieldState.error && <Text className="text-red-500 text-sm mt-1">{fieldState.error.message}</Text>}
          </View>
        )}
      />
    </View>
  );
};
