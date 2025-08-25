/*
 * Example of In-app ChatView as React Component presented with custom UI components.
 */

import React from 'react';
import {ChatView} from 'infobip-mobile-messaging-react-native-plugin';
import {View, Text, KeyboardAvoidingView, Platform} from 'react-native';
import Colors from '../../constants/Colors';

const ChatViewCustomLayoutScreen: React.FC = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{backgroundColor: Colors.primary500, flex: 1}}>
      <View style={{backgroundColor: Colors.primary500, flex: 0.8}}>
        <Text> Some Title Above 1 </Text>
        <Text> Some Title Above 2 </Text>
        <Text> Some Title Above 3 </Text>
        <ChatView style={{flex: 1.5}} sendButtonColor={'#FF0000'} />
        <View style={{backgroundColor: Colors.primary500}}>
          <Text> Some Title Below 5555 </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatViewCustomLayoutScreen;
