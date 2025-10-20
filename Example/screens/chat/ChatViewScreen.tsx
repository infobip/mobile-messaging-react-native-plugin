//
//  ChatViewScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

/*
 * Example of In-app ChatView as React Component in full screen mode.
 */

import React from 'react';
import { ChatView } from 'infobip-mobile-messaging-react-native-plugin';
import Colors from '../../constants/Colors';

const ChatViewScreen: React.FC = () => {
  return <ChatView style={{flex: 1}} sendButtonColor={Colors.primary600} />;
};

export default ChatViewScreen;
