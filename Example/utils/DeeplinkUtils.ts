//
//  DeeplinkUtils.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import {URL} from 'react-native-url-polyfill';
import type {RootStackParamList} from '../constants/RootStackParamList';

// The iOS SDK fires actionTapped for dismiss actions too (swipe-away or in-app close button).
// Reject those so a deeplink is never opened on dismissal.
const IOS_DISMISS_ACTION_ID = 'com.apple.UNNotificationDismissActionIdentifier';

// Must match the scheme registered in AndroidManifest.xml and Info.plist.
const DEEPLINK_SCHEME = 'com.infobip.mobilemessaging:';

type DeeplinkScreen = keyof RootStackParamList;

// Only these path segments open a screen; anything else in a deeplink is ignored.
const deeplinkScreens = new Map<string, DeeplinkScreen>([
  ['TestDeeplinkingScreen', 'TestDeeplinkingScreen'],
  ['TestDeeplinkingScreen2', 'TestDeeplinkingScreen2'],
  ['InboxScreen', 'InboxScreen'],
  ['testdeeplinking', 'TestDeeplinkingScreen'],
  ['testdeeplinking2', 'TestDeeplinkingScreen2'],
]);

export function getDeeplinkFromTapEvent(
  eventData: unknown,
): string | undefined {
  if (!Array.isArray(eventData)) {
    return undefined;
  }
  // iOS actionTapped sends [[message, actionId]], while Android sends [message, actionId].
  // notificationTapped sends [message] on both platforms. Extract the message from either format.
  const isIosActionTapped = Array.isArray(eventData[0]);
  const message = isIosActionTapped ? eventData[0][0] : eventData[0];
  const actionId = isIosActionTapped ? eventData[0][1] : eventData[1];
  if (actionId === IOS_DISMISS_ACTION_ID) {
    return undefined;
  }
  if (typeof message?.deeplink !== 'string' || !message.deeplink.trim()) {
    return undefined;
  }
  return message.deeplink;
}

/**
 * Returns the screens to open, in order, for a deeplink such as
 * com.infobip.mobilemessaging://deeplink/TestDeeplinkingScreen/TestDeeplinkingScreen2.
 */
export function getDeeplinkScreens(deeplink: string): DeeplinkScreen[] {
  let url: URL;
  try {
    url = new URL(deeplink);
  } catch {
    return [];
  }
  if (url.protocol !== DEEPLINK_SCHEME) {
    return [];
  }
  return url.pathname
    .split('/')
    .map(segment => deeplinkScreens.get(segment))
    .filter((screen): screen is DeeplinkScreen => screen !== undefined);
}
