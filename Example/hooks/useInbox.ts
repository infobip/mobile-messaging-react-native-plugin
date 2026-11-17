//
//  useInbox.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import {useCallback, useEffect, useRef, useState} from 'react';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import {getCurrentUserJwt} from '../utils/JWTUtils';

type Inbox = MobileMessagingReactNative.MMInbox;
type FilterOptions = MobileMessagingReactNative.MMInboxFilterOptions;
type Message = MobileMessagingReactNative.Message;
type InboxError = MobileMessagingReactNative.MobileMessagingError;

/** Request state for one user. Filters change within a session; hidden and seen IDs stay for the whole session. */
type InboxSession = {
  externalUserId: string;
  filters: FilterOptions;
  filtersKey: string;
  nextCursor?: string;
  pageRequest?: object;
  deleteRequest?: object;
  /** Numbers page and counter requests in the order they start. */
  requestCount: number;
  /** The request whose counters are shown. Responses to older requests keep the messages but not the counters. */
  countersRequestNumber: number;
  deletedIds: Set<string>;
  seenIds: Set<string>;
};

const emptyInbox = (): Inbox => ({countTotal: 0, countUnread: 0, messages: []});

/** Snapshot of the applied filters. Cursors belong to the session, not to the filters. */
function copyFilters({
  cursor: _cursor,
  ...filters
}: FilterOptions): FilterOptions {
  return filters.topics
    ? {...filters, topics: filters.topics.slice()}
    : filters;
}

/** Uses JWT authorization when the app has a token, otherwise application-code authorization. */
function fetchInbox(
  current: InboxSession,
  options: FilterOptions,
  onSuccess: (inbox: Inbox) => void,
  onError: (error: InboxError) => void,
) {
  const token = getCurrentUserJwt();
  if (token) {
    mobileMessaging.fetchInboxMessages(
      token,
      current.externalUserId,
      options,
      onSuccess,
      onError,
    );
  } else {
    mobileMessaging.fetchInboxMessagesWithoutToken(
      current.externalUserId,
      options,
      onSuccess,
      onError,
    );
  }
}

/** Seen and delete actions change the counters, so a late response to an earlier request must not restore them. */
function takeCounters(current: InboxSession, requestNumber: number): boolean {
  if (requestNumber < current.countersRequestNumber) {
    return false;
  }
  current.countersRequestNumber = requestNumber;
  return true;
}

function mergeMessages(
  previous: Message[],
  page: Message[],
  deletedIds: Set<string>,
): Message[] {
  const messages = new Map(
    previous.map(message => [message.messageId, message]),
  );
  page.forEach(message => messages.set(message.messageId, message));
  return Array.from(messages.values()).filter(
    message => !deletedIds.has(message.messageId),
  );
}

/**
 * Loads the server-side inbox of `externalUserId` with the given filters.
 * Changing the user or the filters restarts from the first page and ignores responses to earlier requests.
 */
export default function useInbox(
  externalUserId: string | undefined,
  filters: FilterOptions,
) {
  const [inbox, setInbox] = useState<Inbox>(emptyInbox);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<InboxError | null>(null);
  const session = useRef<InboxSession | null>(null);
  const filtersKey = JSON.stringify(filters);
  const latestFilters = useRef(filters);
  latestFilters.current = filters;

  const fetchPage = useCallback(function fetchPageForSession(
    current: InboxSession,
    startOver: boolean,
  ) {
    if (
      session.current !== current ||
      (!startOver && (current.pageRequest || !current.nextCursor))
    ) {
      return;
    }
    const request = {};
    const requestNumber = ++current.requestCount;
    const options = {...current.filters};
    if (startOver) {
      // Counters requested before a restart may belong to other filters.
      current.countersRequestNumber = requestNumber;
    } else {
      options.cursor = current.nextCursor;
    }
    current.pageRequest = request;
    setRefreshing(startOver);
    setLoadingMore(!startOver);
    setError(null);

    fetchInbox(
      current,
      options,
      page => {
        if (session.current !== current || current.pageRequest !== request) {
          return;
        }
        current.pageRequest = undefined;
        current.nextCursor = page.nextCursor;
        const showsLatestCounters = takeCounters(current, requestNumber);
        setRefreshing(false);
        setLoadingMore(false);
        setInbox(previous => ({
          ...(showsLatestCounters ? page : previous),
          nextCursor: page.nextCursor,
          messages: mergeMessages(
            startOver ? [] : previous.messages ?? [],
            page.messages ?? [],
            current.deletedIds,
          ).map(message =>
            current.seenIds.has(message.messageId)
              ? {...message, seen: true}
              : message,
          ),
        }));
      },
      fetchError => {
        if (session.current !== current || current.pageRequest !== request) {
          return;
        }
        current.pageRequest = undefined;
        if (!startOver && fetchError.code === 'INVALID_CURSOR') {
          current.nextCursor = undefined;
          setInbox(previous => ({...previous, nextCursor: undefined}));
          fetchPageForSession(current, true);
          return;
        }
        setRefreshing(false);
        setLoadingMore(false);
        setError(fetchError);
      },
    );
  },
  []);

  const fetchCounters = useCallback((current: InboxSession) => {
    const requestNumber = ++current.requestCount;
    fetchInbox(
      current,
      {...current.filters, limit: 0},
      counters => {
        if (
          session.current !== current ||
          !takeCounters(current, requestNumber)
        ) {
          return;
        }
        setInbox(previous => ({
          ...previous,
          countTotal: counters.countTotal,
          countUnread: counters.countUnread,
          countTotalFiltered: counters.countTotalFiltered,
          countUnreadFiltered: counters.countUnreadFiltered,
        }));
      },
      counterError => {
        if (
          session.current === current &&
          requestNumber >= current.countersRequestNumber
        ) {
          setError(counterError);
        }
      },
    );
  }, []);

  useEffect(() => {
    setInbox(emptyInbox());
    setRefreshing(false);
    setLoadingMore(false);
    setDeleting(false);
    setError(null);
    if (!externalUserId) {
      session.current = null;
      return;
    }
    const current: InboxSession = {
      externalUserId,
      filters: copyFilters(latestFilters.current),
      filtersKey: JSON.stringify(latestFilters.current),
      deletedIds: new Set(),
      seenIds: new Set(),
      requestCount: 0,
      countersRequestNumber: 0,
    };
    session.current = current;
    // Inbox requests fail until push registration completes, so retry the applied query once it does.
    const subscription = mobileMessaging.subscribe(
      'registrationUpdated',
      () => {
        fetchPage(current, true);
      },
    );
    fetchPage(current, true);
    return () => {
      session.current = null;
      mobileMessaging.unsubscribe(subscription);
    };
  }, [externalUserId, fetchPage]);

  useEffect(() => {
    const current = session.current;
    if (!current || current.filtersKey === filtersKey) {
      return;
    }
    current.filters = copyFilters(latestFilters.current);
    current.filtersKey = filtersKey;
    current.nextCursor = undefined;
    setInbox(emptyInbox());
    fetchPage(current, true);
  }, [filtersKey, fetchPage]);

  /** Restarts the applied query. Loaded messages stay visible until the first page arrives. */
  const refresh = useCallback(() => {
    if (session.current) {
      fetchPage(session.current, true);
    }
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (session.current) {
      fetchPage(session.current, false);
    }
  }, [fetchPage]);

  const deleteMessages = useCallback(
    (messageIds: string[]) => {
      const current = session.current;
      if (!current || current.deleteRequest || messageIds.length === 0) {
        return;
      }
      const request = {};
      const ids = messageIds.slice();
      current.deleteRequest = request;
      setDeleting(true);
      setError(null);
      const onSuccess = () => {
        if (session.current !== current || current.deleteRequest !== request) {
          return;
        }
        current.deleteRequest = undefined;
        setDeleting(false);
        // A fetch can still include accepted deletes until backend replication catches up.
        ids.forEach(id => current.deletedIds.add(id));
        setInbox(previous => ({
          ...previous,
          messages: (previous.messages ?? []).filter(
            message => !current.deletedIds.has(message.messageId),
          ),
        }));
        fetchCounters(current);
      };
      const onError = (deleteError: InboxError) => {
        if (session.current === current && current.deleteRequest === request) {
          current.deleteRequest = undefined;
          setDeleting(false);
          setError(deleteError);
        }
      };
      const token = getCurrentUserJwt();
      if (token) {
        mobileMessaging.deleteInboxMessages(
          token,
          current.externalUserId,
          ids,
          onSuccess,
          onError,
        );
      } else {
        mobileMessaging.deleteInboxMessagesWithoutToken(
          current.externalUserId,
          ids,
          onSuccess,
          onError,
        );
      }
    },
    [fetchCounters],
  );

  const markSeen = useCallback(
    (messageId: string) => {
      const current = session.current;
      if (!current) {
        return;
      }
      mobileMessaging.setInboxMessagesSeen(
        current.externalUserId,
        [messageId],
        () => {
          if (session.current !== current) {
            return;
          }
          current.seenIds.add(messageId);
          setInbox(previous => ({
            ...previous,
            messages: (previous.messages ?? []).map(message =>
              message.messageId === messageId
                ? {...message, seen: true}
                : message,
            ),
          }));
          fetchCounters(current);
        },
        seenError => {
          if (session.current === current) {
            setError(seenError);
          }
        },
      );
    },
    [fetchCounters],
  );

  return {
    inbox,
    refreshing,
    loadingMore,
    deleting,
    error,
    refresh,
    loadMore,
    deleteMessages,
    markSeen,
  };
}
