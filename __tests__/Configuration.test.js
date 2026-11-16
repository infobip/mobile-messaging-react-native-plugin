// Copyright (c) 2016-2026 Infobip Limited
// Licensed under the Apache License, Version 2.0

jest.mock('react-native', () => ({
  Platform: {OS: 'android'},
  NativeEventEmitter: jest.fn(),
}));

jest.mock('../src/specs/NativeMobileMessaging', () => ({
  __esModule: true,
  default: {init: jest.fn()},
}));
jest.mock('../src/specs/NativeRNMMChat', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../src/specs/NativeRNMMWebRTCUI', () => ({
  __esModule: true,
  default: {},
}));
jest.mock('../src/components/ChatView', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import {mobileMessaging} from '../src';
import nativeMobileMessaging from '../src/specs/NativeMobileMessaging';

beforeEach(() => jest.clearAllMocks());

// The mocked bridge verifies the init payload, not native parsing or the builder.
describe('init forwards appManagedFcmTokenLifecycle', () => {
  test.each([
    ['true', {appManagedFcmTokenLifecycle: true}],
    ['false', {appManagedFcmTokenLifecycle: false}],
    ['omitted', {}],
  ])('%s', (_name, android) => {
    mobileMessaging.init({applicationCode: 'test-code', android});

    expect(nativeMobileMessaging.init).toHaveBeenCalledTimes(1);
    expect(nativeMobileMessaging.init.mock.calls[0][0].android).toStrictEqual(android);
  });

  test('allows missing Android settings', () => {
    mobileMessaging.init({applicationCode: 'test-code'});

    expect(nativeMobileMessaging.init).toHaveBeenCalledTimes(1);
    expect(nativeMobileMessaging.init.mock.calls[0][0]).not.toHaveProperty('android');
  });
});
