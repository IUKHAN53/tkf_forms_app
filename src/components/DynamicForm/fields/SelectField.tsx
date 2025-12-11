import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Text, View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FieldOption } from '../../../api/forms';
import { useThemeColors } from '../../../store/themeStore';

interface Props {
  control: Control<any>;
  name: string;
  label: string;
  required?: boolean;
  options: FieldOption[];
}

export const SelectField: React.FC<Props> = ({ control, name, label, options, required }) => {
  const { colors } = useThemeColors();

  return (
    <View>
      <Controller
        control={control}
        name={`data.${name}`}
        rules={{ required: required ? `${label} is required` : false }}
        render={({ field: { value, onChange }, fieldState }) => (
          <View>
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                dropdownIconColor={colors.text}
                style={{ color: colors.text }}
              >
                <Picker.Item label="Select" value="" color={colors.muted} />
                {options.map((opt) => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>
            {fieldState.error && (
              <Text style={[styles.error, { color: colors.error || '#ef4444' }]}>
                {fieldState.error.message}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
