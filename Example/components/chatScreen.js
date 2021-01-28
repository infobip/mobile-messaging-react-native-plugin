/*
    Example of in-app Chat screen as React Component, supported only for iOS
 */

import React from 'react';
import {ChatView} from 'infobip-mobile-messaging-react-native-plugin';

class ChatScreen extends React.Component {
  render() {
    return <ChatView style={{flex: 1}} sendButtonColor={'#FF0000'} />;
  }
}

export default ChatScreen;
