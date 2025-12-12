import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface CNICInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
}

export const CNICInput: React.FC<CNICInputProps> = ({ value, onChangeText, ...props }) => {
  const formatCNIC = (text: string) => {
    // Remove all non-digit characters
    const digits = text.replace(/\D/g, '');
    
    // Format: 00000-0000000-0
    // Total 13 digits with dashes at positions 5 and 12
    let formatted = '';
    
    for (let i = 0; i < digits.length && i < 13; i++) {
      if (i === 5 || i === 12) {
        formatted += '-';
      }
      formatted += digits[i];
    }
    
    return formatted;
  };

  const handleChange = (text: string) => {
    const formatted = formatCNIC(text);
    onChangeText(formatted);
  };

  return (
    <TextInput
      {...props}
      value={value}
      onChangeText={handleChange}
      keyboardType="number-pad"
      maxLength={15} // 13 digits + 2 dashes
      placeholder="00000-0000000-0"
    />
  );
};
