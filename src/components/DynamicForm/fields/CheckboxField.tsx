import React from 'react';
import { Switch, View, StyleSheet } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import { useThemeColors } from '../../../store/themeStore';

interface Props {
  control: Control<any>;
  name: string;
  label: string;
}

export const CheckboxField: React.FC<Props> = ({ control, name }) => {
  const { colors } = useThemeColors();

  return (
    <Controller
      control={control}
      name={`data.${name}`}
      render={({ field: { value, onChange } }) => (
        <View style={styles.container}>
          <Switch
            value={!!value}
            onValueChange={onChange}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={value ? colors.primary : colors.muted}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
