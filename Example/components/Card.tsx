//
//  Card.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Colors from '../constants/Colors';

interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

/** Groups related content. Children are spaced evenly, so buttons and fields need no margins. */
const Card: React.FC<CardProps> = ({title, description, children}) => (
  <View style={styles.card}>
    {title ? <Text style={styles.title}>{title}</Text> : null}
    {description ? <Text style={styles.description}>{description}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: -6,
  },
});

export default Card;
