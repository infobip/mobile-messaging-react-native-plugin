import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import CryptoJS from 'crypto-js';

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
