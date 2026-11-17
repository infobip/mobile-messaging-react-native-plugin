//
//  feedback.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import type {NoticeAction, NoticeProps} from '../components/Notice';
import {generateAndSetJWT, isJWTError} from './JWTErrorHandler';

/** Result of an SDK call, displayed with Notice. */
export type Feedback = NoticeProps;

export function errorFeedback(
  title: string,
  error: MobileMessagingReactNative.MobileMessagingError,
  refresh?: () => void,
): Feedback {
  const actions: NoticeAction[] = [];
  if (refresh) {
    actions.push({label: 'Refresh', onPress: refresh});
  }
  if (isJWTError(error)) {
    actions.push({label: 'Generate JWT', onPress: generateAndSetJWT});
  }
  return {
    tone: 'error',
    title,
    message: `${error.code}: ${error.description}`,
    actions,
  };
}
