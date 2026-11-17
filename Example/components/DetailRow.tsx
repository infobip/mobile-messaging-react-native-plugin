//
//  DetailRow.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Colors from '../constants/Colors';

interface DetailRowProps {
  label: string;
  value?: string | number | boolean | null;
  copyable?: boolean;
}

function displayValue(value: DetailRowProps['value']): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}

/** A labelled value. Copyable values are copied to the clipboard on tap. */
const DetailRow: React.FC<DetailRowProps> = ({label, value, copyable}) => {
  const text = displayValue(value);
  const valueText = (
    <Text
      style={[
        styles.value,
        !text && styles.missing,
        copyable && text ? styles.copyable : null,
      ]}
      numberOfLines={1}
      ellipsizeMode="middle">
      {text ?? 'Not set'}
    </Text>
  );
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {copyable && text ? (
        <Pressable
          style={styles.valueContainer}
          onPress={() => Clipboard.setString(text)}
          accessibilityRole="button"
          accessibilityHint={`Copies ${label} to the clipboard`}>
          {valueText}
        </Pressable>
      ) : (
        <View style={styles.valueContainer}>{valueText}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    width: 120,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  valueContainer: {
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  missing: {
    color: Colors.textDisabled,
  },
  copyable: {
    color: Colors.primary,
  },
});

export default DetailRow;
