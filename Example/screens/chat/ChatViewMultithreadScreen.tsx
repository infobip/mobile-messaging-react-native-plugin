//
//  ChatViewMultithreadScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

/*
    Example of subview multithread in-app chat screen as React Component
 */

import React, {useRef, useState, useEffect} from 'react';
import { SafeAreaView } from 'react-native';
import Colors from '../../constants/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import { mobileMessaging, ChatView, ChatViewHandle, ChatException } from 'infobip-mobile-messaging-react-native-plugin';
import { NavigationProp } from '@react-navigation/native';

interface MultiThreadChatScreenProps {
  navigation: NavigationProp<any>;
}

const ChatViewMultithreadScreen: React.FC<MultiThreadChatScreenProps> = ({
  navigation,
}) => {
  const [showButton, setShowButton] = useState(false);
  const chatViewRef = useRef<ChatViewHandle>(null);

  const setExceptionHandler = () => {
    chatViewRef.current?.setExceptionHandler(
      (exception: ChatException) =>
        console.log(
          'React app: ChatView exception received: ' + JSON.stringify(exception),
        ),
      (error: Error) =>
        console.log('React app: ChatView exception handler error: ' + error),
    );
  };

  useEffect(() => {
    const subscription = mobileMessaging.subscribe(
      'inAppChat.viewStateChanged',
      handleViewStateChangeEvent,
    );
    // Uncomment to use custom exception handler
    // setExceptionHandler();

    return () => {
      mobileMessaging.unsubscribe(subscription);
    };
  }, []);

  const handleViewStateChangeEvent = (value: any) => {
    if (typeof value !== 'undefined' && value != null) {
      const view = String(value).split(',').pop()?.trim();
      console.log('React app: Chat view changed to: ' + view);
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
    chatViewRef.current?.showThreadsList();
  };

  return (
    <SafeAreaView style={{backgroundColor: Colors.primary500, flex: 1.0}}>
      {showButton && (
        <PrimaryButton onPress={goBackToList}>Show Chat List</PrimaryButton>
      )}
      <ChatView
        ref={chatViewRef}
        style={{flex: 1}}
        sendButtonColor={'#FF0000'}
      />
    </SafeAreaView>
  );
};

export default ChatViewMultithreadScreen;
