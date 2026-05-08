//
//  CacheManager.java
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

class CacheManager {
    private static final String LEGACY_EVENTS_KEY = Utils.TAG + ".cache.events";
    private static final Object cacheLock = new Object();
    private static final List<Event> cachedEvents = new ArrayList<>();
    private static final int MAX_CACHE_SIZE = 100;

    static class Event {
        String type;
        JSONObject jsonObject;
        Object[] objects = null;

        Event(String type, JSONObject object, Object... objects) {
            this.type = type;
            this.jsonObject = object;
            this.objects = objects;
        }

        @Override
        public String toString() {
            return type;
        }
    }

    static void saveEvent(String event, JSONObject object, String actionId, String actionInputText) {
        synchronized (cacheLock) {
            if (cachedEvents.size() >= MAX_CACHE_SIZE) {
                Event removed = cachedEvents.remove(0);
                RNMMLogger.w(Utils.TAG, "Cache full, dropping oldest event: " + removed.type);
            }
            cachedEvents.add(new Event(event, object, actionId, actionInputText));
        }
    }

    static void saveEvent(String event, int unreadMessagesCounter) {
        synchronized (cacheLock) {
            if (cachedEvents.size() >= MAX_CACHE_SIZE) {
                Event removed = cachedEvents.remove(0);
                RNMMLogger.w(Utils.TAG, "Cache full, dropping oldest event: " + removed.type);
            }
            cachedEvents.add(new Event(event, null, unreadMessagesCounter));
        }
    }

    static Event[] loadEvents(String eventType) {
        synchronized (cacheLock) {
            List<Event> matched = new ArrayList<>();
            Iterator<Event> iterator = cachedEvents.iterator();
            while (iterator.hasNext()) {
                Event e = iterator.next();
                if (eventType.equals(e.type)) {
                    matched.add(e);
                    iterator.remove();
                }
            }
            return matched.toArray(new Event[0]);
        }
    }

    static void clearCache() {
        synchronized (cacheLock) {
            cachedEvents.clear();
        }
    }

    static void cleanupLegacyCache(Context context) {
        if (context == null) {
            return;
        }
        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
        if (sharedPreferences.contains(LEGACY_EVENTS_KEY)) {
            sharedPreferences.edit().remove(LEGACY_EVENTS_KEY).apply();
            RNMMLogger.d(Utils.TAG, "Cleaned up legacy SharedPreferences event cache");
        }
    }
}
