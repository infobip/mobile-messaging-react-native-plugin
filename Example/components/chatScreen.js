/*
    Example of in-app Chat screen as React Component
 */

import React from 'react';
import {ChatView} from 'infobip-mobile-messaging-react-native-plugin';

class ChatScreen extends React.Component {
  render() {
    return <ChatView style={styles} sendButtonColor={'#FF0000'} />;
  }
}

const styles = {flex: 1};

export default ChatScreen;
