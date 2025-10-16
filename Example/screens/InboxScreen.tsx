import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {
  Message,
  MMInbox,
  MobileMessagingError,
} from 'infobip-mobile-messaging-react-native-plugin';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import {handleJWTError} from '../utils/JWTErrorHandler';
import {getCurrentUserJwt} from '../utils/JWTUtils';

type FilterOptions = {
  topic?: string;
  limit?: number;
  fromDateTime?: string;
  toDateTime?: string;
};

type FilterForm = {
  topic: string;
  fromDateTime: string;
  toDateTime: string;
  limit: string;
};

type InboxCounts = {
  total: number;
  unread: number;
  filteredTotal?: number;
  filteredUnread?: number;
};

const InboxScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [counts, setCounts] = useState<InboxCounts>({total: 0, unread: 0});
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [externalUserId, setExternalUserId] = useState<string | undefined>(
    undefined,
  );

  const [filters, setFilters] = useState<FilterForm>(
    () => ({topic: '', fromDateTime: '', toDateTime: '', limit: ''}),
  );

  const buildFilterOptions = useCallback((): FilterOptions => {
    const opts: FilterOptions = {};
    const trimmedTopic = filters.topic.trim();
    if (trimmedTopic) {
      opts.topic = trimmedTopic;
    }
    const trimmedFrom = filters.fromDateTime.trim();
    if (trimmedFrom) {
      opts.fromDateTime = trimmedFrom;
    }
    const trimmedTo = filters.toDateTime.trim();
    if (trimmedTo) {
      opts.toDateTime = trimmedTo;
    }
    const trimmedLimit = filters.limit.trim();
    if (trimmedLimit) {
      const limitNum = Number(trimmedLimit);
      if (Number.isFinite(limitNum) && limitNum > -1) {
        opts.limit = Math.floor(limitNum);
      }
    }
    return opts;
  }, [filters]);

  const sortMessages = (msgs: Message[]) => {
    return (msgs || [])
      .filter(m => m && m.messageId)
      .map(message => {
        const internal = parseInternalData(message);
        return {message, ts: getTimestampNumber(message, internal)};
      })
      .sort((a, b) => b.ts - a.ts)
      .map(entry => entry.message);
  };

  const fetchInbox = (override?: FilterOptions): Promise<void> => {
    if (!externalUserId) return Promise.resolve();
    const options = override ?? buildFilterOptions();
    const token = getCurrentUserJwt();
    return new Promise<void>(resolve => {
      const onSuccess = (inbox: MMInbox) => {
        applyInboxResult(inbox);
        resolve();
      };
      const onError = (error: any) => {
        handleJWTError(normalizeError(error));
        resolve();
      };

      if (token) {
        mobileMessaging.fetchInboxMessages(
          token,
          externalUserId,
          options,
          onSuccess,
          onError,
        );
      } else {
        mobileMessaging.fetchInboxMessagesWithoutToken(
          externalUserId,
          options,
          onSuccess,
          onError,
        );
      }
    });
  };

  const applyInboxResult = (inbox: MMInbox) => {
    const msgs = Array.isArray(inbox.messages) ? (inbox.messages as unknown as Message[]) : ([] as Message[]);
    setMessages(sortMessages(msgs));
    setCounts({
      total: inbox.countTotal || msgs.length,
      unread: inbox.countUnread || 0,
      filteredTotal:
        typeof (inbox as any).countTotalFiltered === 'number'
          ? (inbox as any).countTotalFiltered
          : undefined,
      filteredUnread:
        typeof (inbox as any).countUnreadFiltered === 'number'
          ? (inbox as any).countUnreadFiltered
          : undefined,
    });
  };

  useEffect(() => {
    mobileMessaging.getUser((user: any) => {
      const rawId = typeof user?.externalUserId === 'string' ? user.externalUserId.trim() : '';
      const normalizedId = rawId.length > 0 ? rawId : undefined;
      setExternalUserId(normalizedId);
      if (!normalizedId) {
        setMessages([]);
        setCounts({total: 0, unread: 0});
      }
    });
  }, []);

  useEffect(() => {
    if (externalUserId) {
      fetchInbox();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalUserId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInbox().finally(() => setRefreshing(false));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const markSeen = (m: Message) => {
    if (!externalUserId) return;
    mobileMessaging.setInboxMessagesSeen(
      externalUserId,
      [m.messageId],
      () => {
        fetchInbox();
      },
      (err: any) => {
        handleJWTError(normalizeError(err));
      },
    );
  };

  const removeFilters = () => {
    setFilters({topic: '', fromDateTime: '', toDateTime: '', limit: ''});
    fetchInbox({});
  };

  const renderItem = ({item}: {item: Message}) => {
    const isExpanded = expandedId === item.messageId;
    const internal = parseInternalData(item);
    const isSeen = getInboxSeen(item, internal);
    const title = getDisplayTitle(item);
    const body = getDisplayBody(item);
    const tsStr = formatTimestamp(getDisplayTimestamp(item, internal));
    return (
      <TouchableOpacity
        onPress={() => toggleExpand(item.messageId)}
        style={styles.card}>
        <View style={styles.rowHeader}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.body} numberOfLines={isExpanded ? 0 : 2}>
          {body}
        </Text>
        <View style={styles.timeRow}>
          <Text style={styles.timestamp}>{tsStr}</Text>
          {isSeen ? (
            <Text style={styles.seen}>
              <Text style={styles.seenIcon}>✓✓</Text> Seen
            </Text>
          ) : (
            <Text style={styles.unseen}>Unseen</Text>
          )}
        </View>
        {isExpanded && (
          <View style={styles.actions}>
            <PrimaryButton onPress={() => markSeen(item)}>
              {isSeen ? 'Mark Seen Again' : 'Mark Seen'}
            </PrimaryButton>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const headerTitle = externalUserId
    ? buildHeaderTitle(counts)
    : 'Inbox (Not personalized)';

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>{headerTitle}</Text>
      </View>
      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Topic</Text>
          <TextInput
            value={filters.topic}
            onChangeText={text =>
              setFilters(prev => ({...prev, topic: text}))
            }
            placeholder="Optional"
            style={styles.input}
          />
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>From</Text>
          <TextInput
            value={filters.fromDateTime}
            onChangeText={text =>
              setFilters(prev => ({...prev, fromDateTime: text}))
            }
            placeholder="YYYY-MM-DDTHH:mm:ss±HH:MM"
            style={styles.input}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>To</Text>
          <TextInput
            value={filters.toDateTime}
            onChangeText={text =>
              setFilters(prev => ({...prev, toDateTime: text}))
            }
            placeholder="YYYY-MM-DDTHH:mm:ss±HH:MM"
            style={styles.input}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Limit</Text>
          <TextInput
            value={filters.limit}
            onChangeText={text =>
              setFilters(prev => ({...prev, limit: text}))
            }
            keyboardType="number-pad"
            placeholder="Optional"
            style={styles.input}
          />
        </View>
        <PrimaryButton onPress={() => fetchInbox()}>Apply Filters</PrimaryButton>
        <PrimaryButton onPress={removeFilters}>Remove Filters</PrimaryButton>
      </View>
      <FlatList
        data={messages}
        keyExtractor={m => m.messageId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {externalUserId
              ? 'No inbox messages'
              : 'Inbox requires personalization with externalUserId'}
          </Text>
        }
      />
    </View>
  );
};

function normalizeMs(ts?: number | string | null): number | null {
  if (typeof ts === 'number') {
    return Number.isFinite(ts) && ts > 0 ? ts : null;
  }
  if (typeof ts === 'string') {
    const n = Number(ts);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function formatTimestamp(ts?: number | null): string {
  if (!ts || !Number.isFinite(ts)) return 'Unknown time';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return 'Unknown time';
  try {
    const fmt = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return fmt.format(d);
  } catch (e) {
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    } as any);
  }
}

type InboxInternal = {
  sendDateTime?: number | string;
  inbox?: {
    topic?: string;
    seen?: boolean;
  };
  [key: string]: any;
} | null;

function parseInternalData(message: Message): InboxInternal {
  const raw = (message as any)?.internalData as string | undefined;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getInboxSeen(message: Message, internal?: InboxInternal): boolean {
  const data = internal ?? parseInternalData(message);
  const seenValue = data?.inbox?.seen;
  if (typeof seenValue === 'boolean') {
    return seenValue;
  }
  return Boolean((message as any).seen);
}

function getDisplayTitle(message: Message): string {
  return (
    (message as any).title ||
    (message as any)['gcm.notification.title'] ||
    '(No title)'
  );
}

function getDisplayBody(message: Message): string {
  return (
    (message as any).body ||
    (message as any)['gcm.notification.body'] ||
    ''
  );
}

function getDisplayTimestamp(
  message: Message,
  internal?: InboxInternal,
): number | null {
  const data = internal ?? parseInternalData(message);
  const sendMs = normalizeMs(data?.sendDateTime ?? null);
  if (sendMs) return sendMs;
  const direct = normalizeMs((message as any).receivedTimestamp);
  return direct;
}

function getTimestampNumber(message: Message, internal?: InboxInternal): number {
  return getDisplayTimestamp(message, internal) ?? 0;
}

function buildHeaderTitle(counts: InboxCounts): string {
  const base = `Inbox total:${counts.total} unread:${counts.unread}`;
  if (
    typeof counts.filteredTotal === 'number' &&
    typeof counts.filteredUnread === 'number'
  ) {
    return (
      `${base} | filtered total:${counts.filteredTotal} ` +
      `unread:${counts.filteredUnread}`
    );
  }
  return base;
}

function normalizeError(error: any): MobileMessagingError {
  if (error && typeof error === 'object' && typeof error.code === 'string') {
    return error as MobileMessagingError;
  }
  const description =
    typeof error === 'string'
      ? error
      : typeof error?.description === 'string'
      ? error.description
      : String(error ?? 'Unknown error');
  let code = typeof error?.code === 'string' ? error.code : undefined;
  if (!code) {
    const lower = description.toLowerCase();
    if (lower.includes('access token')) {
      code = 'ACCESS_TOKEN_MISSING';
    } else if (lower.includes('jwt')) {
      code = 'JWT_GENERIC_ERROR';
    } else {
      code = 'UNKNOWN_ERROR';
    }
  }
  return {
    code,
    description,
  } as MobileMessagingError;
}


const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.tintWhite},
  toolbar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primary500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarTitle: {color: Colors.tintWhite, fontSize: 16, fontWeight: 'bold'},
  filters: {paddingHorizontal: 12, paddingVertical: 8},
  filterRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  filterLabel: {width: 70, color: Colors.primaryGray},
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  listContent: {padding: 8},
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryGray,
    flex: 1,
    marginRight: 8,
  },
  body: {fontSize: 14, color: Colors.primaryGray, marginTop: 6},
  timestamp: {fontSize: 12, color: '#777', marginTop: 6},
  timeRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {marginTop: 10},
  seen: {fontSize: 12, color: Colors.primaryGray},
  seenIcon: {fontSize: 12, color: '#06ec3c', fontWeight: 'bold'},
  unseen: {fontSize: 12, color: '#F44336'},
  empty: {
    textAlign: 'center',
    color: Colors.primaryGray,
    marginTop: 24,
  },
});

export default InboxScreen;
