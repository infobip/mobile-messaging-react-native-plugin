//
//  useInbox.test.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {act} from 'react';
import TestRenderer from 'react-test-renderer';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import useInbox from '../hooks/useInbox';
import {getCurrentUserJwt} from '../utils/JWTUtils';

jest.mock('infobip-mobile-messaging-react-native-plugin', () => ({
  mobileMessaging: {
    fetchInboxMessages: jest.fn(),
    fetchInboxMessagesWithoutToken: jest.fn(),
    deleteInboxMessages: jest.fn(),
    deleteInboxMessagesWithoutToken: jest.fn(),
    setInboxMessagesSeen: jest.fn(),
    subscribe: jest.fn(() => ({remove: jest.fn()})),
    unsubscribe: jest.fn(),
  },
}));
jest.mock('../utils/JWTUtils', () => ({getCurrentUserJwt: jest.fn()}));

const sdk = jest.mocked(mobileMessaging);
let api: ReturnType<typeof useInbox>;
let renderer: TestRenderer.ReactTestRenderer;

type Filters = Parameters<typeof useInbox>[1];

function Probe({
  user = 'user',
  filters = {},
}: {
  user?: string;
  filters?: Filters;
}) {
  api = useInbox(user, filters);
  return null;
}

function applyFilters(filters: Filters, user = 'user') {
  act(() => renderer.update(<Probe user={user} filters={filters} />));
}

function completePage(index: number, ids: string[], nextCursor?: string) {
  act(() =>
    sdk.fetchInboxMessagesWithoutToken.mock.calls[index][2]({
      messages: ids.map(messageId => ({messageId})),
      nextCursor,
      countTotal: 50,
      countUnread: 10,
    }),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getCurrentUserJwt).mockReturnValue(null);
  act(() => {
    renderer = TestRenderer.create(<Probe />);
  });
});

afterEach(() => act(() => renderer.unmount()));

test('appends pages in server order, deduplicates IDs, and serializes load-more requests', () => {
  applyFilters({topic: 'Offers', limit: 2});
  completePage(1, ['a', 'b'], 'cursor-1');
  act(() => {
    api.loadMore();
    api.loadMore();
  });
  expect(sdk.fetchInboxMessagesWithoutToken).toHaveBeenCalledTimes(3);
  expect(sdk.fetchInboxMessagesWithoutToken.mock.calls[2][1]).toEqual({
    topic: 'Offers',
    limit: 2,
    cursor: 'cursor-1',
  });
  completePage(2, ['b', 'c']);
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual([
    'a',
    'b',
    'c',
  ]);
  act(() => api.loadMore());
  expect(sdk.fetchInboxMessagesWithoutToken).toHaveBeenCalledTimes(3);
});

test('filter changes invalidate earlier pages and keep the applied filters for later pages', () => {
  completePage(0, ['old'], 'old-cursor');
  act(() => api.loadMore());
  applyFilters({topic: 'Offers', limit: 2});
  completePage(1, ['stale'], 'stale-cursor');
  expect(api.refreshing).toBe(true);
  expect(api.inbox.messages).toEqual([]);
  expect(api.inbox.nextCursor).toBeUndefined();
  completePage(2, ['offer'], 'next');
  act(() => api.loadMore());
  expect(sdk.fetchInboxMessagesWithoutToken.mock.calls[3][1]).toEqual({
    topic: 'Offers',
    limit: 2,
    cursor: 'next',
  });
});

test('failed refresh preserves loaded messages, counters, and a usable cursor', () => {
  completePage(0, ['a'], 'next');
  const loadedInbox = api.inbox;
  act(() => api.refresh());
  expect(api.inbox).toEqual(loadedInbox);
  expect(sdk.fetchInboxMessagesWithoutToken.mock.calls[1][1]).toEqual({});
  const failure = {code: 'NETWORK_ERROR', description: 'Offline'};
  act(() => sdk.fetchInboxMessagesWithoutToken.mock.calls[1][3](failure));
  expect(api.inbox).toEqual(loadedInbox);
  expect(api.refreshing).toBe(false);
  expect(api.error).toEqual(failure);
  act(() => api.loadMore());
  expect(sdk.fetchInboxMessagesWithoutToken.mock.calls[2][1]).toEqual({
    cursor: 'next',
  });
  completePage(2, ['b']);
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual([
    'a',
    'b',
  ]);
  act(() => api.refresh());
  completePage(3, ['fresh']);
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual([
    'fresh',
  ]);
});

test('invalid cursor recovery restarts the same query without a cursor', () => {
  applyFilters({topic: 'Offers'});
  completePage(1, ['a'], 'invalid');
  act(() => api.loadMore());
  act(() =>
    sdk.fetchInboxMessagesWithoutToken.mock.calls[2][3]({
      code: 'INVALID_CURSOR',
      description: 'Invalid cursor',
    }),
  );
  expect(sdk.fetchInboxMessagesWithoutToken.mock.calls[3][1]).toEqual({
    topic: 'Offers',
  });
  completePage(3, ['fresh']);
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual([
    'fresh',
  ]);
  expect(api.error).toBeNull();
});

test('failed invalid-cursor recovery retains messages but removes the unusable cursor', () => {
  completePage(0, ['a'], 'invalid');
  act(() => api.loadMore());
  act(() =>
    sdk.fetchInboxMessagesWithoutToken.mock.calls[1][3]({
      code: 'INVALID_CURSOR',
      description: 'Invalid cursor',
    }),
  );
  expect(api.inbox.messages?.[0].messageId).toBe('a');
  expect(api.inbox.nextCursor).toBeUndefined();
  const failure = {code: 'NETWORK_ERROR', description: 'Offline'};
  act(() => sdk.fetchInboxMessagesWithoutToken.mock.calls[2][3](failure));
  expect(api.inbox.countTotal).toBe(50);
  expect(api.inbox.countUnread).toBe(10);
  expect(api.inbox.messages?.[0].messageId).toBe('a');
  expect(api.refreshing).toBe(false);
  expect(api.loadingMore).toBe(false);
  expect(api.error).toEqual(failure);
  act(() => api.loadMore());
  expect(sdk.fetchInboxMessagesWithoutToken).toHaveBeenCalledTimes(3);
  act(() => api.refresh());
  expect(sdk.fetchInboxMessagesWithoutToken.mock.calls[3][1]).toEqual({});
  completePage(3, ['fresh']);
  expect(api.inbox.messages?.[0].messageId).toBe('fresh');
});

test('deleting all visible messages preserves pagination and ignores counter payloads', () => {
  completePage(0, ['a'], 'next');
  act(() => api.deleteMessages(['a']));
  act(() => sdk.deleteInboxMessagesWithoutToken.mock.calls[0][2]?.());
  expect(api.inbox.messages).toEqual([]);
  expect(api.inbox.nextCursor).toBe('next');
  expect(sdk.fetchInboxMessagesWithoutToken.mock.calls[1][1]).toEqual({
    limit: 0,
  });
  completePage(1, ['counter-payload'], 'wrong-cursor');
  expect(api.inbox.messages).toEqual([]);
  expect(api.inbox.nextCursor).toBe('next');
  act(() => api.loadMore());
  completePage(2, ['a', 'b']);
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual(['b']);
});

test('a page started before deletion cannot resurrect a successfully deleted message', () => {
  completePage(0, ['a'], 'next');
  act(() => api.loadMore());
  act(() => api.deleteMessages(['a']));
  act(() => sdk.deleteInboxMessagesWithoutToken.mock.calls[0][2]?.());
  completePage(1, ['a', 'b']);
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual(['b']);
});

test('a page started before deletion keeps the counters fetched after it', () => {
  completePage(0, ['a'], 'next');
  act(() => api.loadMore());
  act(() => api.deleteMessages(['a']));
  act(() => sdk.deleteInboxMessagesWithoutToken.mock.calls[0][2]?.());
  expect(sdk.fetchInboxMessagesWithoutToken.mock.calls[2][1]).toEqual({
    limit: 0,
  });
  act(() =>
    sdk.fetchInboxMessagesWithoutToken.mock.calls[2][2]({
      messages: [],
      countTotal: 49,
      countUnread: 9,
    }),
  );
  completePage(1, ['a', 'b'], 'next-2');
  expect(api.inbox.countTotal).toBe(49);
  expect(api.inbox.countUnread).toBe(9);
  expect(api.inbox.nextCursor).toBe('next-2');
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual(['b']);
});

test('failed deletion keeps messages and unlocks retry without duplicate concurrent requests', () => {
  completePage(0, ['a']);
  act(() => {
    api.deleteMessages(['a']);
    api.deleteMessages(['a']);
  });
  expect(sdk.deleteInboxMessagesWithoutToken).toHaveBeenCalledTimes(1);
  const failure = {code: 'UNAUTHORIZED', description: 'Expired'};
  act(() => sdk.deleteInboxMessagesWithoutToken.mock.calls[0][3]?.(failure));
  expect(api.deleting).toBe(false);
  expect(api.inbox.messages?.[0].messageId).toBe('a');
  expect(api.error).toEqual(failure);
  act(() => api.deleteMessages(['a']));
  expect(sdk.deleteInboxMessagesWithoutToken).toHaveBeenCalledTimes(2);
});

test('uses JWT authorization for both fetch and deletion when a token is present', () => {
  jest.mocked(getCurrentUserJwt).mockReturnValue('jwt');
  applyFilters({topic: 'Offers'});
  expect(sdk.fetchInboxMessages.mock.calls[0].slice(0, 3)).toEqual([
    'jwt',
    'user',
    {topic: 'Offers'},
  ]);
  act(() => api.deleteMessages(['id']));
  expect(sdk.deleteInboxMessages.mock.calls[0].slice(0, 3)).toEqual([
    'jwt',
    'user',
    ['id'],
  ]);
});

test('user changes ignore old fetch/delete responses and reset locally hidden IDs', () => {
  completePage(0, ['a']);
  act(() => api.deleteMessages(['a']));
  act(() => renderer.update(<Probe user="other" />));
  act(() => sdk.deleteInboxMessagesWithoutToken.mock.calls[0][2]?.());
  completePage(0, ['old-user']);
  completePage(1, ['a']);
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual(['a']);
  expect(api.deleting).toBe(false);
  expect(sdk.fetchInboxMessagesWithoutToken).toHaveBeenCalledTimes(2);
});

test('user changes keep the applied filters and deleted IDs do not leak to the next user', () => {
  applyFilters({topic: 'Promotions'});
  completePage(1, ['a']);
  act(() => api.deleteMessages(['a']));
  act(() => sdk.deleteInboxMessagesWithoutToken.mock.calls[0][2]?.());
  applyFilters({topic: 'Promotions'}, 'other');
  const lastCall = sdk.fetchInboxMessagesWithoutToken.mock.calls.at(-1)!;
  expect(lastCall.slice(0, 2)).toEqual(['other', {topic: 'Promotions'}]);
  act(() =>
    lastCall[2]({messages: [{messageId: 'a'}], countTotal: 1, countUnread: 1}),
  );
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual(['a']);
});

test('filter changes keep deleted IDs hidden for the same user', () => {
  completePage(0, ['a', 'b']);
  act(() => api.deleteMessages(['a']));
  act(() => sdk.deleteInboxMessagesWithoutToken.mock.calls[0][2]?.());
  applyFilters({topic: 'Promotions'});
  const lastCall = sdk.fetchInboxMessagesWithoutToken.mock.calls.at(-1)!;
  expect(lastCall[1]).toEqual({topic: 'Promotions'});
  act(() =>
    lastCall[2]({
      messages: [{messageId: 'a'}, {messageId: 'b'}],
      countTotal: 2,
      countUnread: 2,
    }),
  );
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual(['b']);
});

test('refresh invalidates in-flight counter responses without losing the new cursor or zero counters', () => {
  completePage(0, ['a']);
  act(() => api.deleteMessages(['a']));
  act(() => sdk.deleteInboxMessagesWithoutToken.mock.calls[0][2]?.());
  applyFilters({topic: 'new'});
  completePage(2, ['new'], 'new-cursor');
  completePage(1, ['stale-counter']);
  expect(api.inbox.messages?.[0].messageId).toBe('new');
  expect(api.inbox.nextCursor).toBe('new-cursor');
  applyFilters({limit: 0});
  act(() =>
    sdk.fetchInboxMessagesWithoutToken.mock.calls[3][2]({
      countTotal: 0,
      countUnread: 0,
      messages: [],
    }),
  );
  expect(api.inbox.countTotal).toBe(0);
});

test('multiple topics stop pagination when the native response has no nextCursor', () => {
  applyFilters({topics: ['Offers', 'Promotions']});
  completePage(1, ['a']);
  act(() => api.loadMore());
  expect(api.inbox.nextCursor).toBeUndefined();
  expect(sdk.fetchInboxMessagesWithoutToken).toHaveBeenCalledTimes(2);
});

test('registration reload failures preserve the current inbox', () => {
  completePage(0, ['a'], 'next');
  const loadedInbox = api.inbox;
  const onRegistration = sdk.subscribe.mock.calls[0][1];
  act(() => onRegistration({}));
  expect(api.inbox).toEqual(loadedInbox);
  act(() =>
    sdk.fetchInboxMessagesWithoutToken.mock.calls[1][3]({
      code: 'NETWORK_ERROR',
      description: 'Offline',
    }),
  );
  expect(api.inbox).toEqual(loadedInbox);
  expect(api.refreshing).toBe(false);
});

test('the singular topic keeps pagination enabled when topics is also supplied', () => {
  applyFilters({topic: 'Offers', topics: ['Other']});
  completePage(1, ['a'], 'next');
  act(() => api.loadMore());
  expect(sdk.fetchInboxMessagesWithoutToken.mock.calls[2][1]).toEqual({
    topic: 'Offers',
    topics: ['Other'],
    cursor: 'next',
  });
});

test.each([
  {code: '1', domain: 'com.mobile-messaging', description: 'Not registered'},
  {code: '20006', description: 'There is no valid registration'},
])('registration updates retry the applied query after $code', error => {
  applyFilters({topic: 'Offers'});
  act(() => sdk.fetchInboxMessagesWithoutToken.mock.calls[1][3](error));
  expect(sdk.subscribe).toHaveBeenCalledWith(
    'registrationUpdated',
    expect.any(Function),
  );
  const onRegistration = sdk.subscribe.mock.calls[0][1];
  act(() => onRegistration({}));
  expect(sdk.fetchInboxMessagesWithoutToken.mock.calls[2][1]).toEqual({
    topic: 'Offers',
  });
  completePage(0, ['stale']);
  completePage(2, ['fresh'], 'next');
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual([
    'fresh',
  ]);
  act(() => renderer.update(<Probe user="other" />));
  expect(sdk.unsubscribe).toHaveBeenCalledWith(
    sdk.subscribe.mock.results[0].value,
  );
  const calls = sdk.fetchInboxMessagesWithoutToken.mock.calls.length;
  act(() => onRegistration({}));
  expect(sdk.fetchInboxMessagesWithoutToken).toHaveBeenCalledTimes(calls);
});

test('mark-seen preserves loaded pages and survives a stale page response', () => {
  completePage(0, ['a'], 'next');
  act(() => api.loadMore());
  act(() => api.markSeen('a'));
  act(() => sdk.setInboxMessagesSeen.mock.calls[0][2](['a']));
  completePage(1, ['a', 'b']);
  expect(api.inbox.messages?.map(message => message.messageId)).toEqual([
    'a',
    'b',
  ]);
  expect(api.inbox.messages?.[0].seen).toBe(true);
});
