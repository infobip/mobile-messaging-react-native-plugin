import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../constants/Colors';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import EventLogStore, {EventLogEntry} from '../constants/EventLogStore';

const EventLogScreen: React.FC = () => {
  const [entries, setEntries] = useState<EventLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const list = await EventLogStore.list();
    setEntries(list);
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh on incoming events
    const subs: any[] = [];
    for (const ev of mobileMessaging.supportedEvents) {
      subs.push(mobileMessaging.subscribe(ev, () => load()));
    }
    return () => {
      subs.forEach(s => mobileMessaging.unsubscribe(s));
    };
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load().finally(() => setTimeout(() => setRefreshing(false), 600));
  };

  const clearAll = () => {
    EventLogStore.clear().then(() => setEntries([]));
  };

  const renderItem = ({item}: {item: EventLogEntry}) => {
    const isExpanded = expandedId === item.id;
    const preview = makePreview(item.data);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpandedId(prev => (prev === item.id ? null : item.id))}>
        <View style={styles.rowHeader}>
          <Text style={styles.title}>{item.type}</Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timestamp}>{formatTimestamp(item.ts)}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={isExpanded ? 0 : 3}>
          {preview}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Event Log ({entries.length})</Text>
        <TouchableOpacity onPress={clearAll} style={styles.headerAction}>
          <Text style={styles.headerActionText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={entries}
        keyExtractor={e => e.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<Text style={styles.empty}>No events yet</Text>}
      />
    </View>
  );
};

function makePreview(data: any): string {
  try {
    if (data == null) return '∅';
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) {
      return JSON.stringify(data[0] ?? data, null, 2);
    }
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return String(data);
  }
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
  timeRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestamp: {fontSize: 12, color: '#777', marginTop: 6},
  preview: {fontSize: 13, color: Colors.primaryGray, marginTop: 8},
  empty: {
    textAlign: 'center',
    color: Colors.primaryGray,
    marginTop: 24,
  },
});

export default EventLogScreen;
