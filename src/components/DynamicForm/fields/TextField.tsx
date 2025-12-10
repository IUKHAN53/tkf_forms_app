import React from 'react';
import { TextInput } from 'react-native';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  name: string;
  required?: boolean;
}

export const TextField: React.FC<Props> = ({ value, onChange }) => {
  return (
    <TextInput
      className="bg-slate-900 text-white px-3 py-2 rounded-lg border border-slate-800"
      value={value}
      onChangeText={onChange}
      placeholderTextColor="#94a3b8"
    />
  );
};
