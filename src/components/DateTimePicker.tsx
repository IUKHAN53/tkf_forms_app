import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useThemeColors } from '../store/themeStore';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  label?: string;
}

export function DateTimePicker({ value, onChange, mode = 'datetime', label }: DateTimePickerProps) {
  const { colors } = useThemeColors();
  const [isVisible, setIsVisible] = useState(false);

  const showPicker = () => setIsVisible(true);
  const hidePicker = () => setIsVisible(false);

  const handleConfirm = (date: Date) => {
    hidePicker();
    onChange(date);
  };

  const formatDate = (date: Date) => {
    if (mode === 'date') {
      return date.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    if (mode === 'time') {
      return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return date.toLocaleString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View>
      <Pressable
        style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={showPicker}
      >
        <Text style={[styles.text, { color: colors.text }]}>
          {formatDate(value)}
        </Text>
        <Text style={[styles.icon, { color: colors.primary }]}>📅</Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={isVisible}
        mode={mode}
        date={value}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        isDarkModeEnabled={colors.bg === '#0f1729'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  text: {
    fontSize: 15,
  },
  icon: {
    fontSize: 18,
  },
});

