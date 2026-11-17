//
//  SwitchRow.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import Colors from '../constants/Colors';

interface SwitchRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SwitchRow: React.FC<SwitchRowProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled,
}) => (
  <View style={styles.row}>
    <View style={styles.texts}>
      <Text style={styles.label}>{label}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{false: Colors.border, true: Colors.primary}}
      thumbColor={Colors.surface}
      ios_backgroundColor={Colors.border}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

export default SwitchRow;
