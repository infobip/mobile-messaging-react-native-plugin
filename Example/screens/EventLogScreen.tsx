//
//  EventLogScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import Colors from '../constants/Colors';
import EventLogStore from '../constants/EventLogStore';
import type {EventLogEntry} from '../constants/EventLogStore';
import {countLabel, formatDateTime} from '../utils/format';

/** Events are recorded with their argument list; most have a single argument, shown on its own. */
function formatEventData(data: unknown, expanded: boolean): string {
  const value = Array.isArray(data) && data.length === 1 ? data[0] : data;
  if (value === undefined || value === null) {
    return 'No data';
  }
  if (typeof value === 'string') {
    return value;
  }
  return expanded ? JSON.stringify(value, null, 2) : JSON.stringify(value);
}

/** Every SDK event received since install, recorded by App.tsx. Useful when testing push and personalization. */
const EventLogScreen: React.FC = () => {
  const {bottom: bottomInset} = useSafeAreaInsets();
  const [entries, setEntries] = useState<EventLogEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string>();

  const load = useCallback(
    async () => setEntries(await EventLogStore.list()),
    [],
  );

  useEffect(() => {
    load();
    return EventLogStore.subscribe(load);
  }, [load]);

  const renderEntry = ({item}: {item: EventLogEntry}) => {
    const expanded = expandedId === item.id;
    return (
      <Pressable
        onPress={() =>
          setExpandedId(previous =>
            previous === item.id ? undefined : item.id,
          )
        }
        accessibilityRole="button"
        accessibilityState={{expanded}}
        style={styles.entry}>
        <View style={styles.entryHeader}>
          <Text style={styles.type}>{item.type}</Text>
          <Text style={styles.time}>{formatDateTime(item.ts)}</Text>
        </View>
        <Text style={styles.data} numberOfLines={expanded ? undefined : 3}>
          {formatEventData(item.data, expanded)}
        </Text>
      </Pressable>
    );
  };

  const header = entries.length ? (
    <View style={styles.summary}>
      <Text style={styles.summaryText}>
        {countLabel(entries.length, 'event')}
      </Text>
      <Pressable
        onPress={() => EventLogStore.clear()}
        accessibilityRole="button"
        hitSlop={8}>
        <Text style={styles.clear}>Clear</Text>
      </Pressable>
    </View>
  ) : undefined;

  return (
    <FlatList
      data={entries}
      keyExtractor={entry => entry.id}
      renderItem={renderEntry}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <EmptyState
          title="No events yet"
          description="SDK events such as registrationUpdated appear here."
        />
      }
      contentContainerStyle={[styles.list, {paddingBottom: 16 + bottomInset}]}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 8,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  clear: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dangerText,
  },
  entry: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  type: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  data: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
  },
});

export default EventLogScreen;
