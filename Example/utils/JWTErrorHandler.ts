//
//  JWTErrorHandler.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import {Alert} from 'react-native';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import {generateSignedJWT, setCurrentUserJwt, testConfig} from './JWTUtils';

type MobileMessagingError = MobileMessagingReactNative.MobileMessagingError;

const jwtErrorCodes = new Set([
  'ACCESS_TOKEN_MISSING',
  'JWT_TOKEN_EXPIRED',
  'JWT_TOKEN_STRUCTURE_INVALID',
]);

export function isJWTError(error: MobileMessagingError): boolean {
  return jwtErrorCodes.has(error.code);
}

/**
 * Generates a new JWT and sets it in MobileMessaging.
 * Demo only: a production app gets user tokens from its own backend and never ships the signing secret.
 */
export const generateAndSetJWT = async (): Promise<void> => {
  try {
    const newJWT = await generateSignedJWT(
      testConfig.keyid,
      testConfig.secretKeyHex,
      testConfig.applicationCode,
      testConfig.externalPersonId,
    );
    mobileMessaging.setUserDataJwt(
      newJWT,
      () => {
        setCurrentUserJwt(newJWT);
        Alert.alert('Success', 'New JWT token has been set successfully!');
      },
      (jwtError: MobileMessagingError) => {
        setCurrentUserJwt(null);
        Alert.alert(
          'JWT Set Error',
          `Failed to set JWT: ${jwtError.description}`,
        );
      },
    );
  } catch (error) {
    console.error('JWT Generation Error:', error);
    Alert.alert('JWT Generation Failed', `Error: ${error}`);
  }
};
