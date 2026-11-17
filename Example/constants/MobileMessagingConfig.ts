//
//  MobileMessagingConfig.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import MyMessageStorage from './MyMessageStorage';

/** Replace the placeholders with the values of your application profile in the Infobip portal. */
const mobileMessagingConfig: MobileMessagingReactNative.Configuration = {
  applicationCode: 'Your application code',
  webRTCUI: {
    configurationId: 'Your webrtc push configuration id',
  },
  ios: {
    notificationTypes: ['alert', 'badge', 'sound'],
  },
  android: {
    withBannerForegroundNotificationsEnabled: true,
    // firebaseOptions: {
    //   apiKey: '',
    //   applicationId: '',
    //   projectId: '',
    // },
  },
  // Use either the plugin's native message storage or your own storage implementation.
  // defaultMessageStorage: true,
  messageStorage: MyMessageStorage,
  inAppChatEnabled: true,
  inAppChatPushNavigationEnabled: true,
  fullFeaturedInAppsEnabled: true,
  logging: true,
  // userDataJwt: '',
  // trustedDomains: ['example.com'],
};

export default mobileMessagingConfig;
