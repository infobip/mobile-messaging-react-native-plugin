//
//  InboxScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import MessageCard from '../../components/MessageCard';
import MessageDetailsSheet from '../../components/MessageDetailsSheet';
import Notice from '../../components/Notice';
import Tabs from '../../components/Tabs';
import Colors from '../../constants/Colors';
import type {ScreenProps} from '../../constants/RootStackParamList';
import useInbox from '../../hooks/useInbox';
import {errorFeedback} from '../../utils/feedback';
import {
  countLabel,
  formatDateTime,
  toTimestampMs,
  withoutNullStrings,
} from '../../utils/format';
import CustomFiltersPanel from './CustomFiltersPanel';
import {
  emptyCustomFilterForm,
  getInboxCounts,
  inboxTabs,
  predefinedTabFilters,
} from './inboxFilters';
import type {InboxTab} from './inboxFilters';

type Message = MobileMessagingReactNative.Message;
type FilterOptions = MobileMessagingReactNative.MMInboxFilterOptions;

/** deleteInboxMessages accepts at most 100 message IDs per call. */
const MAX_DELETE_BATCH = 100;

/** Android reports the send time as sentTimestamp; iOS reports it as receivedTimestamp and has no sentTimestamp. */
const getSendTime = (message: Message) =>
  toTimestampMs(message.sentTimestamp) ??
  toTimestampMs(message.receivedTimestamp);

/**
 * The inbox belongs to the external user ID of the personalized user.
 * `loaded` stays false until the SDK returns the cached user, so the screen does not flash a "not personalized" state.
 */
function useExternalUserId(): {loaded: boolean; externalUserId?: string} {
  const [state, setState] = useState<{
    loaded: boolean;
    externalUserId?: string;
  }>({loaded: false});
  useEffect(() => {
    const loadUser = () =>
      mobileMessaging.getUser(user =>
        setState({
          loaded: true,
          externalUserId: withoutNullStrings(user).externalUserId || undefined,
        }),
      );
    loadUser();
    const subscriptions = ['personalized', 'depersonalized', 'userUpdated'].map(
      event => mobileMessaging.subscribe(event, loadUser),
    );
    return () =>
      subscriptions.forEach(subscription =>
        mobileMessaging.unsubscribe(subscription),
      );
  }, []);
  return state;
}

const InboxScreen: React.FC<ScreenProps<'InboxScreen'>> = ({navigation}) => {
  const {bottom: bottomInset} = useSafeAreaInsets();
  const {loaded: userLoaded, externalUserId} = useExternalUserId();
  const [tab, setTab] = useState<InboxTab>('Promotions');
  const [customForm, setCustomForm] = useState(emptyCustomFilterForm);
  const [customFilters, setCustomFilters] = useState<FilterOptions>({});
  const filters = tab === 'Custom' ? customFilters : predefinedTabFilters[tab];
  const {
    inbox,
    refreshing,
    loadingMore,
    deleting,
    error,
    refresh,
    loadMore,
    deleteMessages,
    markSeen,
  } = useInbox(externalUserId, filters);
  const messages = useMemo(() => inbox.messages ?? [], [inbox.messages]);
  const counts = getInboxCounts(inbox, filters);

  const [detailsId, setDetailsId] = useState<string>();
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Deleted messages leave the list, so drop them from the selection too.
  useEffect(() => {
    const loadedIds = new Set(messages.map(message => message.messageId));
    setSelectedIds(
      previous => new Set([...previous].filter(id => loadedIds.has(id))),
    );
  }, [messages]);

  const stopSelecting = () => {
    setSelecting(false);
    setSelectedIds(new Set());
  };

  const selectTab = (nextTab: InboxTab) => {
    stopSelecting();
    setTab(nextTab);
  };

  const toggleSelected = (messageId: string) => {
    setSelecting(true);
    setSelectedIds(previous => {
      const next = new Set(previous);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else if (next.size < MAX_DELETE_BATCH) {
        next.add(messageId);
      }
      return next;
    });
  };

  const selectAllLoaded = () => {
    setSelectedIds(
      new Set(
        messages.slice(0, MAX_DELETE_BATCH).map(message => message.messageId),
      ),
    );
  };

  if (!userLoaded) {
    return null;
  }
  if (!externalUserId) {
    return (
      <EmptyState
        title="Personalize to see the inbox"
        description="Inbox messages belong to a person, so the installation must be personalized with an external user ID.">
        <Button
          title="Go to user"
          onPress={() => navigation.navigate('UserScreen')}
        />
      </EmptyState>
    );
  }

  const renderMessage = ({item}: {item: Message}) => (
    <MessageCard
      title={item.title}
      body={item.body}
      time={formatDateTime(getSendTime(item))}
      seen={Boolean(item.seen)}
      topic={tab === 'Custom' ? item.topic : undefined}
      selected={selectedIds.has(item.messageId)}
      onPress={() =>
        selecting
          ? toggleSelected(item.messageId)
          : setDetailsId(item.messageId)
      }
      onLongPress={() => toggleSelected(item.messageId)}
      swipeRightAction={
        selecting || item.seen
          ? undefined
          : {
              label: 'Mark as seen',
              color: Colors.primary,
              onTrigger: () => markSeen(item.messageId),
            }
      }
      swipeLeftAction={
        selecting || deleting
          ? undefined
          : {
              label: 'Delete',
              color: Colors.danger,
              onTrigger: () => deleteMessages([item.messageId]),
            }
      }
    />
  );

  const detailsMessage = messages.find(
    message => message.messageId === detailsId,
  );

  const header = (
    <View style={styles.header}>
      {tab === 'Custom' ? (
        <CustomFiltersPanel
          form={customForm}
          onFormChange={setCustomForm}
          appliedFilters={customFilters}
          onApply={setCustomFilters}
        />
      ) : null}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {counts.total === undefined
            ? ' '
            : `${countLabel(counts.total, 'message')} · ${
                counts.unread ?? 0
              } unread`}
        </Text>
        {selecting || !messages.length ? null : (
          <Pressable
            onPress={() => setSelecting(true)}
            accessibilityRole="button"
            hitSlop={8}>
            <Text style={styles.link}>Select</Text>
          </Pressable>
        )}
      </View>
      {messages.length && !selecting ? (
        <Text style={styles.hint}>
          Tap for details. Swipe right to mark as seen, left to delete. Long
          press to select several.
        </Text>
      ) : null}
      {error ? (
        <Notice {...errorFeedback('Inbox request failed', error, refresh)} />
      ) : null}
    </View>
  );

  const footer = inbox.nextCursor ? (
    <View style={styles.footer}>
      {loadingMore ? (
        <ActivityIndicator color={Colors.accent} />
      ) : (
        <Button
          variant="secondary"
          title="Load more"
          disabled={refreshing}
          onPress={loadMore}
        />
      )}
    </View>
  ) : undefined;

  return (
    <View style={styles.container}>
      <Tabs tabs={inboxTabs} selectedKey={tab} onSelect={selectTab} />
      {selecting ? (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>{selectedIds.size} selected</Text>
          <Pressable
            onPress={selectAllLoaded}
            accessibilityRole="button"
            hitSlop={8}>
            <Text style={styles.link}>
              {messages.length > MAX_DELETE_BATCH
                ? `First ${MAX_DELETE_BATCH}`
                : 'All loaded'}
            </Text>
          </Pressable>
          <Button
            variant="danger"
            title={deleting ? 'Deleting…' : 'Delete'}
            disabled={deleting || !selectedIds.size}
            onPress={() => deleteMessages([...selectedIds])}
          />
          <Button variant="secondary" title="Done" onPress={stopSelecting} />
        </View>
      ) : null}
      <FlatList
        data={messages}
        keyExtractor={message => message.messageId}
        renderItem={renderMessage}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={
          refreshing ? undefined : (
            <EmptyState
              title="No messages"
              description={
                tab === 'Custom'
                  ? 'No messages match these filters.'
                  : `No ${tab.toLowerCase()} yet.`
              }
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[Colors.accent]}
          />
        }
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[styles.list, {paddingBottom: 16 + bottomInset}]}
      />
      <MessageDetailsSheet
        message={detailsMessage}
        time={formatDateTime(detailsMessage && getSendTime(detailsMessage))}
        onClose={() => setDetailsId(undefined)}
        onMarkSeen={markSeen}
        onDelete={messageId => deleteMessages([messageId])}
        deleteDisabled={deleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 12,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  hint: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  footer: {
    paddingTop: 4,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  selectionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default InboxScreen;
