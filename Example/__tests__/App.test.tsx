//
//  App.test.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// Native modules do not exist in Jest. Every plugin method becomes a mock.
jest.mock('infobip-mobile-messaging-react-native-plugin', () => ({
  mobileMessaging: new Proxy<Record<string | symbol, unknown>>(
    {supportedEvents: [], inAppChatEvents: []},
    {
      get: (target, name) =>
        target[name] ?? (target[name] = jest.fn(() => ({}))),
    },
  ),
}));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-native-clipboard/clipboard', () => ({setString: jest.fn()}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
