//
//  Chip.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Colors from '../constants/Colors';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** A selectable option, used for small single-choice groups. */
const Chip: React.FC<ChipProps> = ({label, selected, onPress}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{checked: selected}}
    style={[styles.chip, selected && styles.selected]}>
    <Text style={[styles.label, selected && styles.selectedLabel]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSubdued,
  },
  label: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  selectedLabel: {
    fontWeight: '600',
  },
});

export default Chip;
