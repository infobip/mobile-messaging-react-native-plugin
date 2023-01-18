/*
    Example of subview in-app chat screen as React Component
 */

import React from 'react';
import {ChatView} from 'infobip-mobile-messaging-react-native-plugin';
import {View, Text} from 'react-native';
import {KeyboardAvoidingView} from 'react-native';

class SubviewChatScreen extends React.Component {
    render() {
    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
        <View style={{flex: 0.8}}>
            <Text> Some Title Above 1 </Text>
            <Text> Some Title Above 2 </Text>
            <Text> Some Title Above 3 </Text>
            <ChatView style={{flex: 1.5}} sendButtonColor={'#FF0000'} />
            <Text> Some Title Below 5555 </Text>
        </View>
        </KeyboardAvoidingView>
    );
    }
}

export default SubviewChatScreen;
