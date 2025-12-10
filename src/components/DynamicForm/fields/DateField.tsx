import React from 'react';
import { TextInput } from 'react-native';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  name: string;
  required?: boolean;
}

export const DateField: React.FC<Props> = ({ value, onChange }) => (
  <TextInput
    className="bg-slate-900 text-white px-3 py-2 rounded-lg border border-slate-800"
    value={value}
    onChangeText={onChange}
    placeholder="YYYY-MM-DD"
    placeholderTextColor="#94a3b8"
  />
);
