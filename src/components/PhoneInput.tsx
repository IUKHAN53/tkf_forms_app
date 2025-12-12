import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

interface PhoneInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChangeText, ...props }) => {
  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const digits = text.replace(/\D/g, '');
    
    // Always start with "03"
    if (digits.length === 0) {
      return '';
    }
    
    // If user tries to type something other than 0 as first digit, prepend 03
    if (digits[0] !== '0') {
      const formatted = '03' + digits;
      return formatted.substring(0, 11); // Limit to 11 digits
    }
    
    // If starts with 0 but second digit is not 3, force 03
    if (digits.length >= 2 && digits[1] !== '3') {
      const formatted = '03' + digits.substring(1);
      return formatted.substring(0, 11);
    }
    
    // Limit to 11 digits (03XXXXXXXXX)
    return digits.substring(0, 11);
  };

  const handleChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChangeText(formatted);
  };

  return (
    <TextInput
      {...props}
      value={value}
      onChangeText={handleChange}
      keyboardType="phone-pad"
      maxLength={11}
      placeholder="03XXXXXXXXX"
    />
  );
};
