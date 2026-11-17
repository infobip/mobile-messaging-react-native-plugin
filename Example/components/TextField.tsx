//
//  TextField.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import type {TextInputProps} from 'react-native';
import Colors from '../constants/Colors';

interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  hint,
  style,
  ...inputProps
}) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      accessibilityLabel={label}
      placeholderTextColor={Colors.textDisabled}
      autoCorrect={false}
      style={[styles.input, style]}
      {...inputProps}
    />
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  hint: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});

export default TextField;
