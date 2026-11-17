//
//  DeeplinkUtils.test.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import {
  getDeeplinkFromTapEvent,
  getDeeplinkScreens,
} from '../utils/DeeplinkUtils';

// The polyfill ships untranspiled ESM; Node's URL parses custom schemes the same way.
jest.mock('react-native-url-polyfill', () => ({URL: globalThis.URL}));

describe('deeplinks', () => {
  it('maps allowed path segments to screens in order', () => {
    expect(
      getDeeplinkScreens(
        'com.infobip.mobilemessaging://deeplink/TestDeeplinkingScreen/TestDeeplinkingScreen2',
      ),
    ).toEqual(['TestDeeplinkingScreen', 'TestDeeplinkingScreen2']);
    expect(
      getDeeplinkScreens('com.infobip.mobilemessaging://deeplink/InboxScreen'),
    ).toEqual(['InboxScreen']);
  });

  it('ignores other schemes, unknown screens and invalid URLs', () => {
    expect(
      getDeeplinkScreens('https://example.com/deeplink/InboxScreen'),
    ).toEqual([]);
    expect(
      getDeeplinkScreens(
        'com.infobip.mobilemessaging://deeplink/ChatOptionsScreen/constructor',
      ),
    ).toEqual([]);
    expect(getDeeplinkScreens('not a url')).toEqual([]);
  });

  it('reads the deeplink from tap events on both platforms and skips iOS dismissals', () => {
    const message = {
      deeplink: 'com.infobip.mobilemessaging://deeplink/InboxScreen',
    };
    expect(getDeeplinkFromTapEvent([message])).toBe(message.deeplink);
    expect(getDeeplinkFromTapEvent([message, 'action'])).toBe(message.deeplink);
    expect(getDeeplinkFromTapEvent([[message, 'action']])).toBe(
      message.deeplink,
    );
    expect(
      getDeeplinkFromTapEvent([
        [message, 'com.apple.UNNotificationDismissActionIdentifier'],
      ]),
    ).toBeUndefined();
    expect(getDeeplinkFromTapEvent([{deeplink: ' '}])).toBeUndefined();
  });
});
