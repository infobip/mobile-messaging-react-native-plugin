//
//  format.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

/** Accepts epoch milliseconds as a number or numeric string, as the native bridges differ. */
export function toTimestampMs(value: unknown): number | undefined {
  const ms = typeof value === 'string' ? Number(value) : value;
  return typeof ms === 'number' && Number.isFinite(ms) && ms > 0
    ? ms
    : undefined;
}

/** Drops fields that the Android bridge passes as the string "null" when the native value is unset. */
export function withoutNullStrings<T extends object>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== 'null'),
  ) as T;
}

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDateTime(timestampMs?: number): string {
  return timestampMs
    ? dateTimeFormat.format(new Date(timestampMs))
    : 'Unknown time';
}

/** For example countLabel(1, 'message') is "1 message" and countLabel(2, 'message') is "2 messages". */
export function countLabel(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : noun + 's'}`;
}
