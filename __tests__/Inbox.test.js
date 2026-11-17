//
//  Inbox.test.js
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import {mobileMessaging} from '../src';
import nativeMessaging from '../src/specs/NativeMobileMessaging';

jest.mock('react-native', () => ({
  NativeEventEmitter: jest.fn(),
  Platform: {OS: 'ios'},
}));
jest.mock('../src/components/ChatView', () => ({}));
jest.mock('../src/specs/NativeRNMMChat', () => ({}));
jest.mock('../src/specs/NativeRNMMWebRTCUI', () => ({}));
jest.mock('../src/specs/NativeMobileMessaging', () => ({
  __esModule: true,
  default: {
    deleteInboxMessages: jest.fn(),
    deleteInboxMessagesWithoutToken: jest.fn(),
    fetchInboxMessages: jest.fn(),
    fetchInboxMessagesWithoutToken: jest.fn(),
    setInboxMessagesSeen: jest.fn(),
  },
}));

beforeEach(() => jest.resetAllMocks());

describe.each([
  ['deleteInboxMessages', ['token', 'user']],
  ['deleteInboxMessagesWithoutToken', ['user']],
])('%s', (method, identity) => {
  test.each([
    ['missing array', undefined],
    ['null array', null],
    ['string', 'id'],
    ['object', {}],
    ['null element', [null]],
    ['undefined element', [undefined]],
    ['number element', [123]],
    ['boolean element', [true]],
    ['object element', [{}]],
    ['nested array', [['id']]],
    ['mixed elements', ['id', null]],
    ['sparse array', new Array(1)],
  ])('rejects %s before calling native code', (_label, messageIds) => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    mobileMessaging[method](...identity, messageIds, onSuccess, onError);

    expect(nativeMessaging[method]).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith({
      code: '20013',
      description: 'Message identifiers must be an array of strings.',
    });
  });

  test.each([
    ['message IDs', ['first', 'second']],
    ['digit-only push ID', ['1234567890']],
    ['push ID above the JavaScript safe integer range', ['9007199254740993']],
    ['duplicates', ['id', 'id']],
    ['empty array', []],
    ['blank IDs', ['', ' ']],
  ])('passes %s unchanged to SDK validation', (_label, messageIds) => {
    const expectedMessageIds = [...messageIds];
    const onSuccess = jest.fn();
    const onError = jest.fn();

    mobileMessaging[method](...identity, messageIds, onSuccess, onError);

    expect(nativeMessaging[method]).toHaveBeenCalledTimes(1);
    expect(nativeMessaging[method]).toHaveBeenCalledWith(
      ...identity,
      messageIds,
      onSuccess,
      onError,
    );
    expect(nativeMessaging[method].mock.calls[0][identity.length]).toBe(messageIds);
    expect(messageIds).toEqual(expectedMessageIds);
    expect(onError).not.toHaveBeenCalled();
  });

  test('supports omitted callbacks for malformed input', () => {
    expect(() => mobileMessaging[method](...identity, [null])).not.toThrow();
    expect(nativeMessaging[method]).not.toHaveBeenCalled();
  });

  test('preserves the success callback and its arguments', () => {
    const onSuccess = jest.fn();
    nativeMessaging[method].mockImplementation((...args) => {
      args[args.length - 2]();
    });

    mobileMessaging[method](...identity, ['id'], onSuccess);

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith();
  });
});

describe.each([
  ['fetchInboxMessages', ['token', 'user', {cursor: null}]],
  ['fetchInboxMessagesWithoutToken', ['user', {cursor: null}]],
  ['setInboxMessagesSeen', ['user', ['id']]],
  ['deleteInboxMessages', ['token', 'user', ['id']]],
  ['deleteInboxMessagesWithoutToken', ['user', ['id']]],
])('%s error compatibility', (method, args) => {
  test.each([
    ['registration', {code: 1, domain: 'com.mobile-messaging'}],
    ['network', {code: -1009, domain: 'NSURLErrorDomain'}],
    ['server', {code: 'INVALID_CURSOR'}],
    ['Android registration', {code: '20006'}],
  ])('preserves the native %s error object', (_label, error) => {
    const onError = jest.fn();
    nativeMessaging[method].mockImplementation((...nativeArgs) => {
      nativeArgs[nativeArgs.length - 1](error);
    });

    mobileMessaging[method](...args, jest.fn(), onError);

    expect(nativeMessaging[method]).toHaveBeenCalledWith(
      ...args,
      expect.any(Function),
      onError,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBe(error);
  });
});
