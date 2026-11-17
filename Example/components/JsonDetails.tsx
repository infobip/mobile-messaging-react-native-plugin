//
//  JsonDetails.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useState} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Colors from '../constants/Colors';

interface JsonDetailsProps {
  value: unknown;
  label?: string;
}

/** Collapsed raw SDK payload for debugging, with copy to clipboard. */
const JsonDetails: React.FC<JsonDetailsProps> = ({
  value,
  label = 'raw JSON',
}) => {
  const [expanded, setExpanded] = useState(false);
  const json = JSON.stringify(value, null, 2);
  return (
    <View>
      <View style={styles.header}>
        <Pressable
          onPress={() => setExpanded(previous => !previous)}
          accessibilityRole="button"
          accessibilityState={{expanded}}
          hitSlop={8}>
          <Text style={styles.link}>
            {expanded ? `Hide ${label}` : `Show ${label}`}
          </Text>
        </Pressable>
        {expanded ? (
          <Pressable
            onPress={() => Clipboard.setString(json)}
            accessibilityRole="button"
            hitSlop={8}>
            <Text style={styles.link}>Copy</Text>
          </Pressable>
        ) : null}
      </View>
      {expanded ? (
        <Text selectable style={styles.json}>
          {json}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  json: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    fontSize: 12,
    color: Colors.textPrimary,
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
  },
});

export default JsonDetails;
