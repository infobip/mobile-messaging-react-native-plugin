//
//  ChatViewCustomLayoutScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

/*
 * Example of In-app ChatView as React Component presented with custom UI components.
 */

import React from 'react';
import {ChatView} from 'infobip-mobile-messaging-react-native-plugin';
import {Text, KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import Colors from '../../constants/Colors';

const ChatViewCustomLayoutScreen: React.FC = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Text style={styles.caption}>Your own views above the chat</Text>
      <ChatView style={styles.chat} sendButtonColor={Colors.accent} />
      <Text style={styles.caption}>Your own views below the chat</Text>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  chat: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  caption: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default ChatViewCustomLayoutScreen;
