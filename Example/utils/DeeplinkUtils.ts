//
//  DeeplinkUtils.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//
export function getDeeplinkFromTapEvent(
  eventData: unknown,
): string | undefined {
  if (!Array.isArray(eventData)) {
    return undefined;
  }
  // iOS actionTapped sends [[message, actionId]], while Android sends [message, actionId].
  // notificationTapped sends [message] on both platforms. Extract the message from either format.
  const message = Array.isArray(eventData[0]) ? eventData[0][0] : eventData[0];
  if (typeof message?.deeplink !== 'string' || !message.deeplink.trim()) {
    return undefined;
  }
  return message.deeplink;
}
