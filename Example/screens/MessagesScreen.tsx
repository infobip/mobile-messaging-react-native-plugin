//
//  MessagesScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import EmptyState from '../components/EmptyState';
import MessageCard from '../components/MessageCard';
import MessageDetailsSheet from '../components/MessageDetailsSheet';
import Notice from '../components/Notice';
import Colors from '../constants/Colors';
import MyMessageStorage from '../constants/MyMessageStorage';
import {errorFeedback} from '../utils/feedback';
import type {Feedback} from '../utils/feedback';
import {countLabel, formatDateTime, toTimestampMs} from '../utils/format';

type Message = MobileMessagingReactNative.Message;

type ReceivedMessageStore = {
  findAll(): Promise<Message[]>;
  markSeen(messageId: string): Promise<void>;
  delete(messageId: string): Promise<void>;
  deleteAll(): Promise<void>;
};

/**
 * Received messages are kept by the SDK's default storage when `defaultMessageStorage: true` is configured,
 * otherwise by the custom `messageStorage` passed to init, here MyMessageStorage.
 */
function getReceivedMessageStore(): ReceivedMessageStore {
  const defaultStorage = mobileMessaging.defaultMessageStorage();
  if (!defaultStorage) {
    return {
      findAll: () => new Promise(resolve => MyMessageStorage.findAll(resolve)),
      markSeen: MyMessageStorage.markSeen,
      delete: MyMessageStorage.delete,
      deleteAll: MyMessageStorage.deleteAll,
    };
  }
  return {
    findAll: () =>
      new Promise((resolve, reject) => defaultStorage.findAll(resolve, reject)),
    // The SDK updates its default storage itself when messages are marked as seen.
    markSeen: () => Promise.resolve(),
    delete: messageId =>
      new Promise((resolve, reject) =>
        defaultStorage.delete(messageId, resolve, reject),
      ),
    deleteAll: () =>
      new Promise((resolve, reject) =>
        defaultStorage.deleteAll(resolve, reject),
      ),
  };
}

const newestFirst = (a: Message, b: Message) =>
  (toTimestampMs(b.receivedTimestamp) ?? 0) -
  (toTimestampMs(a.receivedTimestamp) ?? 0);

const storageFailed = (title: string): Feedback => ({
  tone: 'error',
  title,
  message: 'Message storage request failed.',
});

const MessagesScreen: React.FC = () => {
  const {bottom: bottomInset} = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsId, setDetailsId] = useState<string>();
  const [feedback, setFeedback] = useState<Feedback>();

  const loadMessages = useCallback(async () => {
    try {
      const stored = await getReceivedMessageStore().findAll();
      setMessages(stored.slice().sort(newestFirst));
    } catch {
      setFeedback(storageFailed('Loading messages failed'));
    }
  }, []);

  useEffect(() => {
    loadMessages();
    const subscriptions = ['messageReceived', 'notificationTapped'].map(event =>
      mobileMessaging.subscribe(event, loadMessages),
    );
    return () =>
      subscriptions.forEach(subscription =>
        mobileMessaging.unsubscribe(subscription),
      );
  }, [loadMessages]);

  const refresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const markSeen = (messageId: string) => {
    mobileMessaging.markMessagesSeen(
      [messageId],
      () => {
        getReceivedMessageStore()
          .markSeen(messageId)
          .catch(() => setFeedback(storageFailed('Saving seen status failed')))
          .finally(loadMessages);
      },
      error => setFeedback(errorFeedback('Mark as seen failed', error)),
    );
  };

  const deleteMessage = (messageId: string) => {
    getReceivedMessageStore()
      .delete(messageId)
      .catch(() => setFeedback(storageFailed('Delete failed')))
      .finally(loadMessages);
  };

  const deleteAll = () => {
    getReceivedMessageStore()
      .deleteAll()
      .catch(() => setFeedback(storageFailed('Delete failed')))
      .finally(loadMessages);
  };

  const renderMessage = ({item}: {item: Message}) => (
    <MessageCard
      title={item.title}
      body={item.body}
      time={formatDateTime(toTimestampMs(item.receivedTimestamp))}
      seen={Boolean(item.seen)}
      onPress={() => setDetailsId(item.messageId)}
      swipeRightAction={
        item.seen
          ? undefined
          : {
              label: 'Mark as seen',
              color: Colors.primary,
              onTrigger: () => markSeen(item.messageId),
            }
      }
      swipeLeftAction={{
        label: 'Delete',
        color: Colors.danger,
        onTrigger: () => deleteMessage(item.messageId),
      }}
    />
  );

  const detailsMessage = messages.find(
    message => message.messageId === detailsId,
  );

  const header = (
    <View style={styles.header}>
      <Text style={styles.description}>
        Push messages received on this device, kept by the message storage
        configured in mobileMessaging.init. Tap a message for details, swipe
        right to mark it as seen or left to delete it.
      </Text>
      {feedback ? <Notice {...feedback} /> : null}
      {messages.length ? (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {countLabel(messages.length, 'message')}
          </Text>
          <Pressable onPress={deleteAll} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.deleteAll}>Delete all</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  return (
    <>
      <FlatList
        data={messages}
        keyExtractor={message => message.messageId}
        renderItem={renderMessage}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            title="No messages yet"
            description="Send a push message to this device and it appears here."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[Colors.accent]}
          />
        }
        contentContainerStyle={[styles.list, {paddingBottom: 16 + bottomInset}]}
      />
      <MessageDetailsSheet
        message={detailsMessage}
        time={formatDateTime(toTimestampMs(detailsMessage?.receivedTimestamp))}
        onClose={() => setDetailsId(undefined)}
        onMarkSeen={markSeen}
        onDelete={deleteMessage}
      />
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  deleteAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dangerText,
  },
});

export default MessagesScreen;
