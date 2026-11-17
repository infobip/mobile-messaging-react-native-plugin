//
//  Tabs.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Colors from '../constants/Colors';

interface TabsProps<Key extends string> {
  tabs: ReadonlyArray<{key: Key; label: string}>;
  selectedKey: Key;
  onSelect: (key: Key) => void;
}

function Tabs<Key extends string>({
  tabs,
  selectedKey,
  onSelect,
}: TabsProps<Key>) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {tabs.map(tab => {
        const selected = tab.key === selectedKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{selected}}
            style={[styles.tab, selected && styles.selectedTab]}>
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  selectedTab: {
    borderBottomColor: Colors.accent,
  },
  label: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  selectedLabel: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});

export default Tabs;
