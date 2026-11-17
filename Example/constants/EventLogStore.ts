//
//  EventLogStore.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import AsyncStorage from '@react-native-async-storage/async-storage';

export type EventLogEntry = {
  id: string;
  type: string;
  ts: number;
  data: any;
};

const STORAGE_KEY = 'eventlog:entries';
const MAX_ENTRIES = 500;
let writeQueue: Promise<void> = Promise.resolve();
const changeListeners = new Set<() => void>();

function notifyChange() {
  changeListeners.forEach(listener => listener());
}

function enqueueWrite(task: () => Promise<void>): Promise<void> {
  const next = writeQueue.catch(() => {}).then(task);

  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );

  return next;
}

async function readAll(): Promise<EventLogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as EventLogEntry[];
    return [];
  } catch {
    return [];
  }
}

async function writeAll(entries: EventLogEntry[]): Promise<void> {
  try {
    // Cap entries and persist
    const trimmed = entries.sort((a, b) => b.ts - a.ts).slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // no-op
  }
}

function makeId(): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${rnd}`;
}

export const EventLogStore = {
  async add(type: string, data: any, ts: number = Date.now()): Promise<void> {
    await enqueueWrite(async () => {
      const entry: EventLogEntry = {id: makeId(), type, ts, data};
      const all = await readAll();
      all.unshift(entry);
      await writeAll(all);
    });
    notifyChange();
  },

  async list(): Promise<EventLogEntry[]> {
    const all = await readAll();
    return all.sort((a, b) => b.ts - a.ts);
  },

  async clear(): Promise<void> {
    await enqueueWrite(async () => {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch {
        // no-op
      }
    });
    notifyChange();
  },

  /** Calls `listener` after every add or clear. Returns the unsubscribe function. */
  subscribe(listener: () => void): () => void {
    changeListeners.add(listener);
    return () => {
      changeListeners.delete(listener);
    };
  },
};

export default EventLogStore;
