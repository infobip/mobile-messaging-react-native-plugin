/*
    Example of subview multithread in-app chat screen as React Component
 */

import React, {useState, useEffect} from 'react';
import {ChatView} from 'infobip-mobile-messaging-react-native-plugin';
import {View, Text, KeyboardAvoidingView, SafeAreaView} from 'react-native';
import Colors from '../../constants/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import {NavigationContainer, NavigationProp} from '@react-navigation/native';

interface MultiThreadChatScreenProps {
  navigation: NavigationProp<any>;
}

const ChatViewMultithreadScreen: React.FC<MultiThreadChatScreenProps> = ({
  navigation,
}) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const subscription = mobileMessaging.subscribe(
      'inAppChat.viewStateChanged',
      handleViewStateChangeEvent,
    );

    return () => {
      mobileMessaging.unsubscribe(subscription);
    };
  }, []);

  const handleViewStateChangeEvent = (value: any) => {
    if (typeof value !== 'undefined' && value != null) {
      const view = String(value).split(',').pop()?.trim();
      console.log('Chat view changed to: ' + view);
      /*
        Possible views: LOADING, THREAD_LIST, LOADING_THREAD, THREAD, CLOSED_THREAD, SINGLE_MODE_THREAD, UNKNOWN
      */
      const isNestedDestination =
        view === 'THREAD' ||
        view === 'LOADING_THREAD' ||
        view === 'CLOSED_THREAD';
      setShowButton(isNestedDestination);
      navigation.setOptions({headerShown: !isNestedDestination});
    }
  };

  const goBackToList = () => {
    mobileMessaging.showThreadsList();
  };

  return (
    <SafeAreaView style={{backgroundColor: Colors.primary500, flex: 1.0}}>
      {showButton && (
        <PrimaryButton onPress={goBackToList}>Show Chat List</PrimaryButton>
      )}
      <ChatView style={{flex: 1}} sendButtonColor={'#FF0000'} />
    </SafeAreaView>
  );
};

export default ChatViewMultithreadScreen;
