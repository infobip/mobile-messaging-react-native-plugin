/*
    Example of in-app Chat screen as React Component
 */

import React from 'react';
import {ChatView} from 'infobip-mobile-messaging-react-native-plugin';
import Colors from '../constants/Colors';

function ChatScreen() {
  return <ChatView style={{flex: 1}} sendButtonColor={Colors.primary600} />;
}

export default ChatScreen;
