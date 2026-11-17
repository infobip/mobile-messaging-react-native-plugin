//
//  MessageCard.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {AccessibilityActionEvent} from 'react-native';
import Colors from '../constants/Colors';
import SwipeableRow from './SwipeableRow';
import type {SwipeAction} from './SwipeableRow';

interface MessageCardProps {
  title?: string;
  body?: string;
  time: string;
  seen: boolean;
  topic?: string;
  selected?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  swipeRightAction?: SwipeAction;
  swipeLeftAction?: SwipeAction;
}

/** A message in a list: tap for details, swipe for quick actions. Screen readers get the swipe actions as accessibility actions. */
const MessageCard: React.FC<MessageCardProps> = ({
  title,
  body,
  time,
  seen,
  topic,
  selected = false,
  onPress,
  onLongPress,
  swipeRightAction,
  swipeLeftAction,
}) => {
  const swipeActions = [swipeRightAction, swipeLeftAction].filter(
    (action): action is SwipeAction => action !== undefined,
  );
  const onAccessibilityAction = ({nativeEvent}: AccessibilityActionEvent) =>
    swipeActions
      .find(action => action.label === nativeEvent.actionName)
      ?.onTrigger();

  return (
    <SwipeableRow
      swipeRightAction={swipeRightAction}
      swipeLeftAction={swipeLeftAction}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="button"
        accessibilityState={{selected}}
        accessibilityLabel={`${seen ? '' : 'Unread. '}${title || 'No title'}. ${
          body ?? ''
        }`}
        accessibilityActions={swipeActions.map(action => ({
          name: action.label,
          label: action.label,
        }))}
        onAccessibilityAction={onAccessibilityAction}
        style={({pressed}) => [
          styles.card,
          selected && styles.selectedCard,
          pressed && !selected && styles.pressedCard,
        ]}>
        <View style={styles.header}>
          {selected ? (
            <Text style={styles.check}>✓</Text>
          ) : (
            <View style={[styles.unreadDot, seen && styles.hidden]} />
          )}
          <Text
            style={[styles.title, !seen && styles.unreadTitle]}
            numberOfLines={1}>
            {title || '(No title)'}
          </Text>
        </View>
        {body ? (
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Text style={styles.time}>{time}</Text>
          {topic ? <Text style={styles.topic}>{topic}</Text> : null}
        </View>
      </Pressable>
    </SwipeableRow>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 6,
  },
  selectedCard: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSubdued,
  },
  pressedCard: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  hidden: {
    opacity: 0,
  },
  check: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent,
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginLeft: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
  },
  time: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  topic: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});

export default MessageCard;
