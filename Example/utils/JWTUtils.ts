//
//  JWTUtils.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { SubjectType } from '../constants/SubjectType';

export interface JWTConfig {
  keyid: string;
  secretKeyHex: string;
  applicationCode: string;
  externalPersonId: string;
}

// Test configuration for JWT generation
export const testConfig: JWTConfig = {
  keyid: '',
  secretKeyHex: '',
  applicationCode: '',
  externalPersonId: '',
};

let currentUserJwt: string | null = null;

export function setCurrentUserJwt(token: string | null | undefined): void {
  currentUserJwt = token ?? null;
}

export function getCurrentUserJwt(): string | null {
  return currentUserJwt;
}

/**
 * Generate a signed JWT token for MobileMessaging authentication
 *
 * @param keyid JWT key ID
 * @param secretKeyHex Secret key in hex format
 * @param applicationCode Application code from Infobip portal
 * @param externalPersonId External person identifier
 * @returns Promise<string> - The signed JWT token
 */
function createJWTManually(
  keyid: string,
  secretKeyHex: string,
  applicationCode: string,
  externalPersonId: string,
): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'HS256',
    typ: 'JWT',
    kid: keyid,
  };

  const payload = {
    typ: 'Bearer',
    jti: uuidv4(),
    sub: externalPersonId,
    iss: applicationCode,
    iat: timestamp,
    exp: timestamp + 60,
    'infobip-api-key': applicationCode,
  };

  // Base64URL encode header and payload
  const encodedHeader = base64URLEncode(JSON.stringify(header));
  const encodedPayload = base64URLEncode(JSON.stringify(payload));

  // Create signature input
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Create HMAC-SHA256 signature using hex secret key
  const secretKey = CryptoJS.enc.Hex.parse(secretKeyHex);
  const signature = CryptoJS.HmacSHA256(signatureInput, secretKey);

  // Convert signature to Base64URL (without using our function since it's already Base64)
  const signatureBase64 = signature.toString(CryptoJS.enc.Base64);
  const encodedSignature = signatureBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Combine all parts
  const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

  console.log('JWT:', jwt);

  return jwt;
}

/**
 * Base64URL encode (JWT standard)
 */
function base64URLEncode(str: string): string {
  // First encode to base64, then convert to base64url
  const base64 = btoa(str);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function generateSignedJWT(
  keyid: string,
  secretKeyHex: string,
  applicationCode: string,
  externalPersonId: string,
): Promise<string> {
  return createJWTManually(keyid, secretKeyHex, applicationCode, externalPersonId);
}

export async function generateChatJWT(
  subjectType: SubjectType,
  subject: string,
  widgetId: string,
  secretKeyJson: string,
): Promise<string> {
  try {
    const uuid = uuidv4();
    const nowSeconds = Math.floor(Date.now() / 1000);

    const keyData = JSON.parse(secretKeyJson);
    const keyId = keyData.id;
    const keySecret = keyData.key;

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    //see JWT payload structure table https://www.infobip.com/docs/live-chat/users-and-authentication#generate-the-personalization-token-web-authentication
    const payload = {
      jti: uuid, //JWT ID: must be unique for each token. Any string, max 50 characters.
      sub: subject, //Subject: value of the unique identifier, matching the type in stp.
      iss: widgetId, //Issuer: your widget's ID.
      iat: nowSeconds, //Issued at: Unix timestamp in seconds when the token is created.
      exp: nowSeconds + 60, //Expiration: Unix timestamp when the token expires in seconds.
      ski: keyId, //Secret key ID: the ID (not the value) of the secret key you're using to sign the token.
      stp: subjectType, //Subject type: type of identifier in sub.
      sid: uuid, //Session ID: your unique user session identifier, used for Session Invalidation API. Max 50 characters.
    };

    const encodedHeader = base64URLEncode(JSON.stringify(header));
    const encodedPayload = base64URLEncode(JSON.stringify(payload));

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const secretKey = CryptoJS.enc.Base64.parse(keySecret);
    const signature = CryptoJS.HmacSHA256(signingInput, secretKey);
    const signatureBase64 = signature.toString(CryptoJS.enc.Base64);
    const encodedSignature = signatureBase64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const jwt = `${signingInput}.${encodedSignature}`;
    return jwt;
  } catch (error) {
    console.error('React app: Chat JWT generation failed: ', error);
    throw error;
  }
}
