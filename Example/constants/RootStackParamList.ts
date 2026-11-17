//
//  RootStackParamList.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  HomeScreen: undefined;
  InstallationScreen: undefined;
  UserScreen: undefined;
  PersonalizeScreen: undefined;
  UserDataScreen: undefined;
  InboxScreen: undefined;
  MessagesScreen: undefined;
  EventLogScreen: undefined;
  ChatOptionsScreen: undefined;
  ChatViewScreen: undefined;
  ChatViewCustomLayoutScreen: undefined;
  ChatViewMultithreadScreen: undefined;
  TestDeeplinkingScreen: undefined;
  TestDeeplinkingScreen2: undefined;
};

export type ScreenProps<Name extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Name>;
