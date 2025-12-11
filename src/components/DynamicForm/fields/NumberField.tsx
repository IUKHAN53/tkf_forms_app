import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../store/themeStore';

interface Props {
  value?: string | number;
  onChange?: (value: string) => void;
  label: string;
  name: string;
  required?: boolean;
}

export const NumberField: React.FC<Props> = ({ value, onChange }) => {
  const { colors } = useThemeColors();

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.text,
        },
      ]}
      value={value?.toString()}
      onChangeText={onChange}
      keyboardType="numeric"
      placeholderTextColor={colors.muted}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
  },
});
