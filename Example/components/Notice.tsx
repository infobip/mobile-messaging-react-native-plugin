//
//  Notice.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Colors from '../constants/Colors';

type NoticeTone = 'success' | 'error';

export interface NoticeAction {
  label: string;
  onPress: () => void;
}

export interface NoticeProps {
  tone: NoticeTone;
  title: string;
  message?: string;
  actions?: NoticeAction[];
}

const toneColors: Record<NoticeTone, {background: string; text: string}> = {
  success: {background: Colors.successSubdued, text: Colors.successText},
  error: {background: Colors.dangerSubdued, text: Colors.dangerText},
};

/** Inline feedback for an SDK call, shown next to the action instead of in an alert. */
const Notice: React.FC<NoticeProps> = ({tone, title, message, actions}) => {
  const colors = toneColors[tone];
  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actions?.length ? (
        <View style={styles.actions}>
          {actions.map(action => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              accessibilityRole="button"
              hitSlop={8}>
              <Text style={styles.action}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default Notice;
