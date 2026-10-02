//
//  DeeplinkUtils.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//
// The iOS SDK fires actionTapped for dismiss actions too (swipe-away or in-app close button).
// Reject those so a deeplink is never opened on dismissal.
const IOS_DISMISS_ACTION_ID = 'com.apple.UNNotificationDismissActionIdentifier';

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
