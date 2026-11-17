//
//  App.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useEffect} from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';

import mobileMessagingConfig from './constants/MobileMessagingConfig';
import type {RootStackParamList} from './constants/RootStackParamList';
import Colors from './constants/Colors';
import EventLogStore from './constants/EventLogStore';
import useDeeplinkNavigation from './hooks/useDeeplinkNavigation';

import HomeScreen from './screens/HomeScreen';
import InstallationScreen from './screens/InstallationScreen';
import UserScreen from './screens/UserScreen';
import PersonalizeScreen from './screens/PersonalizeScreen';
import UserDataScreen from './screens/UserDataScreen';
import InboxScreen from './screens/inbox/InboxScreen';
import MessagesScreen from './screens/MessagesScreen';
import EventLogScreen from './screens/EventLogScreen';
import ChatOptionsScreen from './screens/chat/ChatOptionsScreen';
import ChatViewScreen from './screens/chat/ChatViewScreen';
import ChatViewCustomLayoutScreen from './screens/chat/ChatViewCustomLayoutScreen';
import ChatViewMultithreadScreen from './screens/chat/ChatViewMultithreadScreen';
import TestDeeplinkingScreen from './screens/TestDeeplinkingScreen';
import TestDeeplinkingScreen2 from './screens/TestDeeplinkingScreen2';

// Initialize once, before any screen calls the SDK.
mobileMessaging.init(
  mobileMessagingConfig,
  () => console.log('MobileMessaging started'),
  error => console.log('MobileMessaging error: ' + JSON.stringify(error)),
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Records every SDK event so the Event log screen can show them. */
function useEventLogRecording() {
  useEffect(() => {
    const events = [
      ...mobileMessaging.supportedEvents,
      ...mobileMessaging.inAppChatEvents,
    ];
    const subscriptions = events.map(event =>
      mobileMessaging.subscribe(event, value => {
        EventLogStore.add(event, value).catch(error =>
          console.warn('Failed to persist event log entry', error),
        );
      }),
    );
    return () => {
      subscriptions.forEach(subscription =>
        mobileMessaging.unsubscribe(subscription),
      );
    };
  }, []);
}

/** Message rows use horizontal swipes, so iOS goes back only with the edge swipe on these screens. */
const swipeableListOptions = {fullScreenGestureEnabled: false};

const App: React.FC = () => {
  useEventLogRecording();
  const onNavigationReady = useDeeplinkNavigation(navigationRef);

  return (
    <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{
          headerStyle: {backgroundColor: Colors.surface},
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: true,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: {backgroundColor: Colors.background},
        }}>
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{title: 'Infobip Mobile Messaging'}}
        />
        <Stack.Screen
          name="InstallationScreen"
          component={InstallationScreen}
          options={{title: 'Installation'}}
        />
        <Stack.Screen
          name="UserScreen"
          component={UserScreen}
          options={{title: 'User'}}
        />
        <Stack.Screen
          name="PersonalizeScreen"
          component={PersonalizeScreen}
          options={{title: 'Personalize'}}
        />
        <Stack.Screen
          name="UserDataScreen"
          component={UserDataScreen}
          options={{title: 'Edit user data'}}
        />
        <Stack.Screen
          name="InboxScreen"
          component={InboxScreen}
          options={{title: 'Inbox', ...swipeableListOptions}}
        />
        <Stack.Screen
          name="MessagesScreen"
          component={MessagesScreen}
          options={{title: 'Received messages', ...swipeableListOptions}}
        />
        <Stack.Screen
          name="EventLogScreen"
          component={EventLogScreen}
          options={{title: 'Event log'}}
        />
        <Stack.Screen
          name="ChatOptionsScreen"
          component={ChatOptionsScreen}
          options={{title: 'Live chat'}}
        />
        <Stack.Screen
          name="ChatViewScreen"
          component={ChatViewScreen}
          options={{title: 'ChatView fullscreen'}}
        />
        <Stack.Screen
          name="ChatViewCustomLayoutScreen"
          component={ChatViewCustomLayoutScreen}
          options={{title: 'ChatView in custom layout'}}
        />
        <Stack.Screen
          name="ChatViewMultithreadScreen"
          component={ChatViewMultithreadScreen}
          options={{title: 'Multithread ChatView'}}
        />
        <Stack.Screen
          name="TestDeeplinkingScreen"
          component={TestDeeplinkingScreen}
          options={{title: 'Test deeplinking'}}
        />
        <Stack.Screen
          name="TestDeeplinkingScreen2"
          component={TestDeeplinkingScreen2}
          options={{title: 'Test deeplinking 2'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
