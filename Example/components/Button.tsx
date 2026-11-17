//
//  Button.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Colors from '../constants/Colors';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'dangerSecondary';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

const variantColors: Record<
  ButtonVariant,
  {background: string; pressed: string; border: string; text: string}
> = {
  primary: {
    background: Colors.primary,
    pressed: Colors.primaryPressed,
    border: Colors.primary,
    text: Colors.textInverse,
  },
  secondary: {
    background: Colors.surface,
    pressed: Colors.surfaceMuted,
    border: Colors.primary,
    text: Colors.primary,
  },
  danger: {
    background: Colors.danger,
    pressed: Colors.dangerPressed,
    border: Colors.danger,
    text: Colors.textInverse,
  },
  dangerSecondary: {
    background: Colors.surface,
    pressed: Colors.dangerSubdued,
    border: Colors.danger,
    text: Colors.dangerText,
  },
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}) => {
  const colors = variantColors[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{disabled}}
      style={({pressed}) => [
        styles.button,
        {
          backgroundColor: pressed ? colors.pressed : colors.background,
          borderColor: colors.border,
        },
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default Button;
