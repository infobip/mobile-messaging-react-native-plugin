//
//  SwipeableRow.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useRef} from 'react';
import {Animated, PanResponder, StyleSheet, Text, View} from 'react-native';
import type {PanResponderGestureState} from 'react-native';
import Colors from '../constants/Colors';

export interface SwipeAction {
  label: string;
  color: string;
  onTrigger: () => void;
}

interface SwipeableRowProps {
  /** Revealed on the left while swiping right. */
  swipeRightAction?: SwipeAction;
  /** Revealed on the right while swiping left. */
  swipeLeftAction?: SwipeAction;
  children: React.ReactNode;
}

const TRIGGER_DISTANCE = 96;

/** Horizontal drags only, so vertical list scrolling and taps keep working. */
const isHorizontalDrag = ({dx, dy}: PanResponderGestureState) =>
  Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 2;

/** Swipe a row past TRIGGER_DISTANCE to run its action, built on PanResponder so it needs no gesture library. */
const SwipeableRow: React.FC<SwipeableRowProps> = ({
  swipeRightAction,
  swipeLeftAction,
  children,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  // The responder is created once, so it reads the latest actions through a ref.
  const actions = useRef({swipeRightAction, swipeLeftAction});
  actions.current = {swipeRightAction, swipeLeftAction};

  const springBack = () =>
    Animated.spring(translateX, {toValue: 0, useNativeDriver: true}).start();

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        isHorizontalDrag(gesture) &&
        Boolean(
          gesture.dx > 0
            ? actions.current.swipeRightAction
            : actions.current.swipeLeftAction,
        ),
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, {dx}) => {
        const action =
          dx > 0
            ? actions.current.swipeRightAction
            : actions.current.swipeLeftAction;
        translateX.setValue(action ? dx : 0);
      },
      onPanResponderRelease: (_, {dx}) => {
        const action =
          dx > TRIGGER_DISTANCE
            ? actions.current.swipeRightAction
            : dx < -TRIGGER_DISTANCE
            ? actions.current.swipeLeftAction
            : undefined;
        springBack();
        action?.onTrigger();
      },
      onPanResponderTerminate: springBack,
    }),
  ).current;

  const reveal = (direction: 1 | -1) =>
    translateX.interpolate({
      inputRange: direction === 1 ? [0, 24] : [-24, 0],
      outputRange: direction === 1 ? [0, 1] : [1, 0],
      extrapolate: 'clamp',
    });

  return (
    <View>
      {swipeRightAction ? (
        <Animated.View
          style={[
            styles.action,
            styles.leftAction,
            {backgroundColor: swipeRightAction.color, opacity: reveal(1)},
          ]}>
          <Text style={styles.label}>{swipeRightAction.label}</Text>
        </Animated.View>
      ) : null}
      {swipeLeftAction ? (
        <Animated.View
          style={[
            styles.action,
            styles.rightAction,
            {backgroundColor: swipeLeftAction.color, opacity: reveal(-1)},
          ]}>
          <Text style={styles.label}>{swipeLeftAction.label}</Text>
        </Animated.View>
      ) : null}
      <Animated.View
        style={{transform: [{translateX}]}}
        {...responder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  action: {
    ...StyleSheet.absoluteFill,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  leftAction: {
    alignItems: 'flex-start',
  },
  rightAction: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textInverse,
  },
});

export default SwipeableRow;
