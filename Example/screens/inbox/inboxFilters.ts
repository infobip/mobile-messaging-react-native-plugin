//
//  inboxFilters.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import {formatDateTime} from '../../utils/format';

type FilterOptions = MobileMessagingReactNative.MMInboxFilterOptions;
type Inbox = MobileMessagingReactNative.MMInbox;

export type InboxTab = 'Promotions' | 'Transactions' | 'Custom';

export const inboxTabs: ReadonlyArray<{key: InboxTab; label: string}> = [
  {key: 'Promotions', label: 'Promotions'},
  {key: 'Transactions', label: 'Transactions'},
  {key: 'Custom', label: 'Custom'},
];

// Every inbox has these two topics. A singular `topic` filter supports pagination.
export const predefinedTabFilters: Record<
  Exclude<InboxTab, 'Custom'>,
  FilterOptions
> = {
  Promotions: {topic: 'Promotions'},
  Transactions: {topic: 'Transactions'},
};

type DatePreset = 'any' | 'day' | 'week' | 'month' | 'exact';

export const datePresets: ReadonlyArray<{
  key: DatePreset;
  label: string;
  hours?: number;
}> = [
  {key: 'any', label: 'Any time'},
  {key: 'day', label: '24 hours', hours: 24},
  {key: 'week', label: '7 days', hours: 24 * 7},
  {key: 'month', label: '30 days', hours: 24 * 30},
  {key: 'exact', label: 'Exact dates'},
];

export type CustomFilterForm = {
  /** Comma-separated topic names. */
  topics: string;
  datePreset: DatePreset;
  fromDateTime: string;
  toDateTime: string;
  pageSize: string;
};

export const emptyCustomFilterForm: CustomFilterForm = {
  topics: '',
  datePreset: 'any',
  fromDateTime: '',
  toDateTime: '',
  pageSize: '',
};

/** Whole seconds with a UTC offset, e.g. 2026-11-06T12:00:00+00:00. Both native SDKs reject milliseconds. */
export function toInboxDateTime(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

function parseDate(value: string): number | undefined {
  const timestampMs = Date.parse(value.trim());
  return Number.isNaN(timestampMs) ? undefined : timestampMs;
}

/** Returns why the form cannot be applied, or undefined when it can. */
export function validateCustomFilterForm(
  form: CustomFilterForm,
): string | undefined {
  if (form.datePreset !== 'exact') {
    return undefined;
  }
  const from = form.fromDateTime.trim() ? parseDate(form.fromDateTime) : null;
  const to = form.toDateTime.trim() ? parseDate(form.toDateTime) : null;
  if (from === undefined || to === undefined) {
    return 'Enter dates like 2026-11-01T00:00:00+00:00.';
  }
  if (from !== null && to !== null && from >= to) {
    return 'From must be before To.';
  }
  return undefined;
}

/**
 * Converts a valid form (see validateCustomFilterForm) into SDK filter options. Date presets are resolved against `now` once, when the
 * filters are applied, so every page of the query uses the same time range.
 * Send time filters include `fromDateTime` and exclude `toDateTime`.
 *
 * One topic goes to `topic`, which the server filters and paginates. Several go to `topics`: the SDK then fetches
 * the newest messages in one batch and keeps those whose topic matches exactly, without pagination.
 */
export function buildCustomFilters(
  form: CustomFilterForm,
  now: Date,
): FilterOptions {
  const filters: FilterOptions = {};
  const topics = form.topics
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  if (topics.length === 1) {
    filters.topic = topics[0];
  } else if (topics.length > 1) {
    filters.topics = topics;
  }
  const presetHours = datePresets.find(
    preset => preset.key === form.datePreset,
  )?.hours;
  if (presetHours) {
    filters.fromDateTime = toInboxDateTime(
      new Date(now.getTime() - presetHours * 3600 * 1000),
    );
  } else if (form.datePreset === 'exact') {
    const from = parseDate(form.fromDateTime);
    const to = parseDate(form.toDateTime);
    if (from !== undefined) {
      filters.fromDateTime = toInboxDateTime(new Date(from));
    }
    if (to !== undefined) {
      filters.toDateTime = toInboxDateTime(new Date(to));
    }
  }
  const pageSize = Number(form.pageSize);
  if (form.pageSize.trim() && Number.isInteger(pageSize) && pageSize > 0) {
    filters.limit = pageSize;
  }
  return filters;
}

/** Shows a filter date in local time, or as entered if it does not parse. */
function formatFilterDate(dateTime: string): string {
  const timestampMs = Date.parse(dateTime);
  return Number.isNaN(timestampMs) ? dateTime : formatDateTime(timestampMs);
}

export function describeFilters(filters: FilterOptions): string {
  const parts: string[] = [];
  if (filters.topic) {
    parts.push(`Topic ${filters.topic}`);
  } else if (filters.topics?.length) {
    parts.push(`Topics ${filters.topics.join(', ')}`);
  }
  if (filters.fromDateTime) {
    parts.push(`Sent from ${formatFilterDate(filters.fromDateTime)}`);
  }
  if (filters.toDateTime) {
    parts.push(`Sent before ${formatFilterDate(filters.toDateTime)}`);
  }
  if (filters.limit) {
    parts.push(`${filters.limit} per page`);
  }
  return parts.length ? parts.join(' · ') : 'All messages';
}

function hasFilters(filters: FilterOptions): boolean {
  return Boolean(
    filters.topic ||
      filters.topics?.length ||
      filters.fromDateTime ||
      filters.toDateTime,
  );
}

/**
 * Message counts for the applied filters. Filtered queries report `countTotalFiltered`/`countUnreadFiltered`;
 * the plain totals always describe the whole inbox, so they are never shown in place of a missing filtered count.
 */
export function getInboxCounts(
  inbox: Inbox,
  filters: FilterOptions,
): {total?: number; unread?: number} {
  if (!hasFilters(filters)) {
    return {total: inbox.countTotal, unread: inbox.countUnread};
  }
  return {total: inbox.countTotalFiltered, unread: inbox.countUnreadFiltered};
}
