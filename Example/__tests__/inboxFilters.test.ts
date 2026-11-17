//
//  inboxFilters.test.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import {
  buildCustomFilters,
  describeFilters,
  emptyCustomFilterForm,
  getInboxCounts,
  toInboxDateTime,
  validateCustomFilterForm,
} from '../screens/inbox/inboxFilters';

const now = new Date('2026-11-06T12:30:45.678Z');

describe('inbox filters', () => {
  it('formats dates as whole seconds with a UTC offset', () => {
    expect(toInboxDateTime(now)).toBe('2026-11-06T12:30:45+00:00');
  });

  it('builds no filters from an empty form', () => {
    expect(buildCustomFilters(emptyCustomFilterForm, now)).toEqual({});
    expect(describeFilters({})).toBe('All messages');
    expect(describeFilters({topic: 'News', toDateTime: 'soon', limit: 5})).toBe(
      'Topic News · Sent before soon · 5 per page',
    );
  });

  it('uses the paginated topic filter for a single topic', () => {
    expect(
      buildCustomFilters({...emptyCustomFilterForm, topics: ' news '}, now),
    ).toEqual({topic: 'news'});
    expect(
      buildCustomFilters({...emptyCustomFilterForm, topics: 'a, ,b'}, now),
    ).toEqual({
      topics: ['a', 'b'],
    });
  });

  it('resolves date presets against the apply time', () => {
    expect(
      buildCustomFilters({...emptyCustomFilterForm, datePreset: 'day'}, now),
    ).toEqual({
      fromDateTime: '2026-11-05T12:30:45+00:00',
    });
  });

  it('uses exact dates only for the exact preset', () => {
    const form = {
      ...emptyCustomFilterForm,
      fromDateTime: '2026-11-01T00:00:00+00:00',
      toDateTime: '2026-11-02T00:00:00+00:00',
    };
    expect(buildCustomFilters(form, now)).toEqual({});
    expect(buildCustomFilters({...form, datePreset: 'exact'}, now)).toEqual({
      fromDateTime: '2026-11-01T00:00:00+00:00',
      toDateTime: '2026-11-02T00:00:00+00:00',
    });
  });

  it('normalizes exact dates to whole UTC seconds', () => {
    expect(
      buildCustomFilters(
        {
          ...emptyCustomFilterForm,
          datePreset: 'exact',
          fromDateTime: '2026-11-01T02:00:00.500+02:00',
        },
        now,
      ),
    ).toEqual({fromDateTime: '2026-11-01T00:00:00+00:00'});
  });

  it('rejects unparseable or reversed exact dates', () => {
    const exact = {...emptyCustomFilterForm, datePreset: 'exact' as const};
    expect(validateCustomFilterForm(exact)).toBeUndefined();
    expect(
      validateCustomFilterForm({...exact, fromDateTime: 'yesterday'}),
    ).toBeDefined();
    expect(
      validateCustomFilterForm({
        ...exact,
        fromDateTime: '2026-11-02T00:00:00+00:00',
        toDateTime: '2026-11-01T00:00:00+00:00',
      }),
    ).toBe('From must be before To.');
    expect(
      validateCustomFilterForm({...emptyCustomFilterForm, fromDateTime: 'x'}),
    ).toBeUndefined();
  });

  it('accepts only positive whole page sizes', () => {
    expect(
      buildCustomFilters({...emptyCustomFilterForm, pageSize: '20'}, now),
    ).toEqual({limit: 20});
    ['0', '-1', '2.5', 'abc'].forEach(pageSize =>
      expect(
        buildCustomFilters({...emptyCustomFilterForm, pageSize}, now),
      ).toEqual({}),
    );
  });

  it('shows filtered counts only for filtered queries', () => {
    const inbox = {
      countTotal: 10,
      countUnread: 4,
      countTotalFiltered: 3,
      countUnreadFiltered: 1,
      messages: [],
    };
    expect(getInboxCounts(inbox, {limit: 5})).toEqual({total: 10, unread: 4});
    expect(getInboxCounts(inbox, {topic: 'Promotions'})).toEqual({
      total: 3,
      unread: 1,
    });
    expect(
      getInboxCounts({countTotal: 10, countUnread: 4}, {topic: 'Promotions'}),
    ).toEqual({
      total: undefined,
      unread: undefined,
    });
  });
});
