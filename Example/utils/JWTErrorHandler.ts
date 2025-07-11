import {Alert} from 'react-native';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {MobileMessagingError} from 'infobip-mobile-messaging-react-native-plugin';
import {generateSignedJWT, testConfig} from './JWTUtils';

/**
 * Generates a new JWT token and sets it in MobileMessaging
 */
export const generateAndSetJWT = async (): Promise<void> => {
  try {
    const newJWT = await generateSignedJWT(
      testConfig.keyid,
      testConfig.secretKeyHex,
      testConfig.applicationCode,
      testConfig.externalPersonId
    );

    console.log('New JWT generated:', newJWT);

    mobileMessaging.setUserDataJwt(
      newJWT,
      () => {
        Alert.alert('Success', 'New JWT token has been set successfully!');
      },
      (jwtError: MobileMessagingError) => {
        Alert.alert('JWT Set Error', `Failed to set JWT: ${jwtError.description}`);
      }
    );
  } catch (error) {
    console.error('JWT Generation Error:', error);
    Alert.alert('JWT Generation Failed', `Error: ${error}`);
  }
};

/**
 * Handles JWT-related errors from MobileMessaging operations
 * @param error - The MobileMessagingError from the operation
 */
export const handleJWTError = (error: MobileMessagingError): void => {
  console.log('Handling JWT error:', error);
  switch (error.code) {
    case 'JWT_TOKEN_EXPIRED':
      Alert.alert(
        'JWT Token Expired',
        'The JWT token has expired. Please refresh the token and try again.\n\nWould you like to generate a new JWT token?',
        [
          {
            text: 'Cancel',
            style: 'cancel' as const,
          },
          {
            text: 'Generate New JWT',
            onPress: () => generateAndSetJWT(),
          },
        ]
      );
      break;

    case 'JWT_TOKEN_STRUCTURE_INVALID':
      Alert.alert(
        'JWT Token Invalid',
        `The JWT token has invalid structure: ${error.description || 'Unknown structure error'}`,
        [
          {
            text: 'Cancel',
            style: 'cancel' as const,
          },
          {
            text: 'Generate New JWT',
            onPress: () => generateAndSetJWT(),
          },
        ]
      );
      break;

    default:
      Alert.alert(
        'Error',
        `${error.code}: ${error.description || 'Unknown error occurred'}`
      );
      break;
  }
};
