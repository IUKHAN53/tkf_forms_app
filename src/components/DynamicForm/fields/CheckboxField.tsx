import React from 'react';
import { Switch, View } from 'react-native';
import { Control, Controller } from 'react-hook-form';

interface Props {
  control: Control<any>;
  name: string;
  label: string;
}

export const CheckboxField: React.FC<Props> = ({ control, name }) => (
  <Controller
    control={control}
    name={`data.${name}`}
    render={({ field: { value, onChange } }) => (
      <View className="flex-row items-center">
        <Switch value={!!value} onValueChange={onChange} />
      </View>
    )}
  />
);
