import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  mobileMessaging,
} from 'infobip-mobile-messaging-react-native-plugin';
import type {
  Message,
  DefaultMessageStorage,
} from 'infobip-mobile-messaging-react-native-plugin';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import MyMessageStorage from '../constants/MyMessageStorage.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessagesScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortMessages = (msgs: Message[]) => {
    return (msgs || [])
      .filter(m => m && m.messageId && typeof m.body !== 'undefined')
      .sort(
        (a, b) =>
          (normalizeMs(b.receivedTimestamp ?? null) ?? 0) -
          (normalizeMs(a.receivedTimestamp ?? null) ?? 0),
      );
  };

  const loadMessages = useCallback(() => {
    const defaultStorage: DefaultMessageStorage | undefined =
      // @ts-ignore RN SDK exposes function returning storage API when enabled
      (mobileMessaging as any).defaultMessageStorage?.();

    if (defaultStorage) {
      defaultStorage.findAll(
        msgs => setMessages(sortMessages(msgs)),
        () => setMessages([]),
      );
      return;
    }

    MyMessageStorage.findAll(msgs => {
      setMessages(sortMessages(msgs));
    });
  }, []);

  useEffect(() => {
    loadMessages();
    const sub1 = mobileMessaging.subscribe('messageReceived', () =>
      loadMessages(),
    );
    const sub2 = mobileMessaging.subscribe('notificationTapped', () =>
      loadMessages(),
    );
    return () => {
      mobileMessaging.unsubscribe(sub1);
      mobileMessaging.unsubscribe(sub2);
    };
  }, [loadMessages]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
    setTimeout(() => setRefreshing(false), 800);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const openLink = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Open URL failed', String(e));
    }
  };

  const markSeen = (m: Message) => {
    mobileMessaging.markMessagesSeen(
      [m.messageId],
      () => {
        const updated = {...m, seen: true, seenDate: Date.now()};
        AsyncStorage.setItem(m.messageId, JSON.stringify(updated)).finally(
          loadMessages,
        );
      },
      err => {
        Alert.alert('Mark seen failed', err?.description || 'Unknown error');
      },
    );
  };

  const deleteMessage = (m: Message) => {
    const defaultStorage: DefaultMessageStorage | undefined =
      // @ts-ignore RN SDK exposes function returning storage API when enabled
      (mobileMessaging as any).defaultMessageStorage?.();

    if (defaultStorage) {
      defaultStorage.delete(m.messageId, () => loadMessages(), () => loadMessages());
      return;
    }
    AsyncStorage.removeItem(m.messageId).then(loadMessages);
  };

  const clearAll = () => {
    const defaultStorage: DefaultMessageStorage | undefined =
      // @ts-ignore RN SDK exposes function returning storage API when enabled
      (mobileMessaging as any).defaultMessageStorage?.();

    if (defaultStorage) {
      defaultStorage.deleteAll(() => setMessages([]), () => setMessages([]));
      return;
    }
    MyMessageStorage.findAll(msgs => {
      const ids = (msgs || [])
        .map(m => m.messageId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
      Promise.all(ids.map(id => AsyncStorage.removeItem(id))).then(() => {
        setMessages([]);
      });
    });
  };

  const renderItem = ({item}: {item: Message}) => {
    const isExpanded = expandedId === item.messageId;
    return (
      <TouchableOpacity
        onPress={() => toggleExpand(item.messageId)}
        style={styles.card}>
        <View style={styles.rowHeader}>
          <Text style={styles.title}>{item.title || '(No title)'}</Text>
        </View>
        <Text style={styles.body} numberOfLines={isExpanded ? 0 : 2}>
          {item.body || ''}
        </Text>
        <View style={styles.timeRow}>
          <Text style={styles.timestamp}>
            {formatTimestamp(normalizeMs(item.receivedTimestamp ?? null))}
          </Text>
          {item.seen ? (
            <Text style={styles.seen}>
              <Text style={styles.seenIcon}>✓✓</Text> Seen
            </Text>
          ) : (
            <Text style={styles.unseen}>Unseen</Text>
          )}
        </View>
        {isExpanded && (
          <View style={styles.actions}>
            {item.deeplink ? (
              <PrimaryButton onPress={() => openLink(item.deeplink)}>
                Open Deeplink
              </PrimaryButton>
            ) : null}
            {item.contentUrl || item.webViewUrl ? (
              <PrimaryButton
                onPress={() => openLink(item.contentUrl || item.webViewUrl)}>
                Open Content
              </PrimaryButton>
            ) : null}
            <PrimaryButton onPress={() => markSeen(item)}>
              {item.seen ? 'Mark Seen Again' : 'Mark Seen'}
            </PrimaryButton>
            <PrimaryButton onPress={() => deleteMessage(item)}>
              Delete
            </PrimaryButton>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Push Messages ({messages.length})</Text>
        <TouchableOpacity onPress={clearAll} style={styles.headerAction}>
          <Text style={styles.headerActionText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        keyExtractor={m => m.messageId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text style={styles.empty}>No messages yet</Text>}
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
  headerAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary600,
    borderRadius: 16,
  },
  headerActionText: {color: Colors.tintWhite, fontWeight: '600'},
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

export default MessagesScreen;
