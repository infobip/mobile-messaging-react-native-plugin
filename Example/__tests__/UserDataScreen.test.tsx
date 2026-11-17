//
//  UserDataScreen.test.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {act} from 'react';
import TestRenderer from 'react-test-renderer';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import Button from '../components/Button';
import UserDataScreen from '../screens/UserDataScreen';

jest.mock('infobip-mobile-messaging-react-native-plugin', () => ({
  mobileMessaging: {fetchUser: jest.fn(), saveUser: jest.fn()},
}));
jest.mock('@react-native-clipboard/clipboard', () => ({setString: jest.fn()}));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('../utils/JWTErrorHandler', () => ({isJWTError: () => false}));

const sdk = jest.mocked(mobileMessaging);
let renderer: TestRenderer.ReactTestRenderer;

function saveButton() {
  return renderer.root.findAllByType(Button)[0];
}

beforeEach(() => {
  jest.clearAllMocks();
  act(() => {
    renderer = TestRenderer.create(<UserDataScreen />);
  });
  act(() => {
    renderer.root
      .findByProps({label: 'First name', value: ''})
      .props.onChangeText(' New name ');
  });
});

afterEach(() => act(() => renderer.unmount()));

test('fetches before saving and preserves identity, profile and custom attributes', () => {
  const currentUser = {
    externalUserId: 'existing-user',
    firstName: 'Old name',
    lastName: 'Existing surname',
    middleName: 'Existing middle name',
    emails: ['existing@example.com'],
    phones: ['385981234567'],
    gender: 'Female' as const,
    birthday: '1985-01-15',
    tags: ['test'],
    customAttributes: {tier: 'gold'},
  };
  act(() => saveButton().props.onPress());
  expect(sdk.saveUser).not.toHaveBeenCalled();
  expect(saveButton().props.disabled).toBe(true);
  act(() => sdk.fetchUser.mock.calls[0][0](currentUser));
  expect(sdk.saveUser.mock.calls[0][0]).toEqual({
    ...currentUser,
    firstName: 'New name',
  });
  act(() => sdk.saveUser.mock.calls[0][1](currentUser));
  expect(saveButton().props.disabled).toBe(false);
});

test('does not send absent bridge values back as nulls', () => {
  act(() => saveButton().props.onPress());
  act(() =>
    sdk.fetchUser.mock.calls[0][0](
      JSON.parse(
        '{"externalUserId":"existing-user","lastName":null,"middleName":"null"}',
      ),
    ),
  );
  expect(sdk.saveUser.mock.calls[0][0]).toEqual({
    externalUserId: 'existing-user',
    firstName: 'New name',
  });
});

test('does not save a partial user if fetching fails and allows a retry', () => {
  act(() => saveButton().props.onPress());
  act(() =>
    sdk.fetchUser.mock.calls[0][1]({code: 'offline', description: 'Offline'}),
  );
  expect(sdk.saveUser).not.toHaveBeenCalled();
  expect(saveButton().props.disabled).toBe(false);
  act(() => saveButton().props.onPress());
  expect(sdk.fetchUser).toHaveBeenCalledTimes(2);
});

test('allows retrying after a save failure', () => {
  act(() => saveButton().props.onPress());
  act(() => sdk.fetchUser.mock.calls[0][0]({externalUserId: 'existing-user'}));
  act(() =>
    sdk.saveUser.mock.calls[0][2]({code: 'offline', description: 'Offline'}),
  );
  expect(saveButton().props.disabled).toBe(false);
  act(() => saveButton().props.onPress());
  expect(sdk.fetchUser).toHaveBeenCalledTimes(2);
});
