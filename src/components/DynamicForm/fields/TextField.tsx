import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../store/themeStore';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  name: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
}

export const TextField: React.FC<Props> = ({ value, onChange, placeholder, multiline }) => {
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
        multiline && styles.multiline,
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
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
  multiline: {
    minHeight: 100,
    paddingTop: 12,
  },
});
