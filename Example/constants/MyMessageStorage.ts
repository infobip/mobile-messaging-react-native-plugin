//
//  MyMessageStorage.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';

type Message = MobileMessagingReactNative.Message;

// A key prefix keeps messages apart from anything else the app stores in AsyncStorage.
const KEY_PREFIX = 'mm-message:';
const keyFor = (messageId: string) => KEY_PREFIX + messageId;

async function getMessageKeys(): Promise<string[]> {
  const keys = await AsyncStorage.getAllKeys();
  return keys.filter(key => key.startsWith(KEY_PREFIX));
}

function parseMessage(value: string | null): Message | null {
  if (!value) {
    return null;
  }
  try {
    const message = JSON.parse(value) as Partial<Message>;
    return typeof message.messageId === 'string' ? (message as Message) : null;
  } catch {
    return null;
  }
}

// Storage operations run one at a time in call order: reads see messages saved just before them,
// and markSeen cannot write back a message that a concurrent delete removed.
let pendingOperation: Promise<unknown> = Promise.resolve();
function runInOrder<T>(operation: () => Promise<T>): Promise<T> {
  const result = pendingOperation.then(operation);
  pendingOperation = result.catch(() => undefined);
  return result;
}

async function loadAll(): Promise<Message[]> {
  const entries = await AsyncStorage.multiGet(await getMessageKeys());
  return entries
    .map(([, value]) => parseMessage(value))
    .filter((message): message is Message => message !== null);
}

/**
 * Custom message storage passed to `mobileMessaging.init` as `messageStorage`.
 * The SDK calls start, stop, save, find and findAll; the app uses findAll, markSeen, delete and deleteAll.
 */
const MyMessageStorage = {
  start() {},

  stop() {},

  save(messages: Message[]) {
    runInOrder(() =>
      AsyncStorage.multiSet(
        messages.map(message => [
          keyFor(message.messageId),
          JSON.stringify(message),
        ]),
      ),
    ).catch(error =>
      console.warn('[MyMessageStorage] Saving messages failed', error),
    );
  },

  find(messageId: string, callback: (message: Message | null) => void) {
    runInOrder(() => AsyncStorage.getItem(keyFor(messageId)))
      .then(value => callback(parseMessage(value)))
      .catch(() => callback(null));
  },

  findAll(callback: (messages: Message[]) => void) {
    runInOrder(loadAll)
      .then(callback)
      .catch(() => callback([]));
  },

  markSeen(messageId: string): Promise<void> {
    return runInOrder(async () => {
      const message = parseMessage(
        await AsyncStorage.getItem(keyFor(messageId)),
      );
      if (message) {
        await AsyncStorage.setItem(
          keyFor(messageId),
          JSON.stringify({...message, seen: true, seenDate: Date.now()}),
        );
      }
    });
  },

  delete(messageId: string): Promise<void> {
    return runInOrder(() => AsyncStorage.removeItem(keyFor(messageId)));
  },

  deleteAll(): Promise<void> {
    return runInOrder(async () =>
      AsyncStorage.multiRemove(await getMessageKeys()),
    );
  },
};

export default MyMessageStorage;
