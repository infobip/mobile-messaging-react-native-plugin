//
//  ChatViewMultithreadScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

/*
    Example of subview multithread in-app chat screen as React Component.
    ChatView shows the SDK's default alert for chat errors. On Android you can handle them yourself
    by passing a handler to chatViewRef.current?.setExceptionHandler once the view is mounted.
    The iOS wrapper does not forward that handler yet.
 */

import React, {useRef, useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import type {ScreenProps} from '../../constants/RootStackParamList';
import Button from '../../components/Button';
import {
  mobileMessaging,
  ChatView,
  ChatViewHandle,
} from 'infobip-mobile-messaging-react-native-plugin';

const ChatViewMultithreadScreen: React.FC<
  ScreenProps<'ChatViewMultithreadScreen'>
> = ({navigation}) => {
  const [showButton, setShowButton] = useState(false);
  const chatViewRef = useRef<ChatViewHandle>(null);

  useEffect(() => {
    const handleViewStateChangeEvent = (value: any) => {
      if (typeof value !== 'undefined' && value != null) {
        const view = String(value).split(',').pop()?.trim();
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
    const subscription = mobileMessaging.subscribe(
      'inAppChat.viewStateChanged',
      handleViewStateChangeEvent,
    );
    return () => {
      mobileMessaging.unsubscribe(subscription);
    };
  }, [navigation]);

  const goBackToList = () => {
    chatViewRef.current?.showThreadsList();
  };

  return (
    <SafeAreaView style={{backgroundColor: Colors.surface, flex: 1.0}}>
      {showButton && (
        <Button
          variant="secondary"
          title="Show chat list"
          onPress={goBackToList}
        />
      )}
      <ChatView
        ref={chatViewRef}
        style={{flex: 1}}
        sendButtonColor={Colors.accent}
      />
    </SafeAreaView>
  );
};

export default ChatViewMultithreadScreen;
