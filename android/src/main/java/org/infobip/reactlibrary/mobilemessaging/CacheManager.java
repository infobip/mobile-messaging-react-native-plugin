package org.infobip.reactlibrary.mobilemessaging;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

import org.infobip.mobile.messaging.api.support.http.serialization.JsonSerializer;
import org.infobip.mobile.messaging.dal.json.JSONArrayAdapter;
import org.infobip.mobile.messaging.dal.json.JSONObjectAdapter;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

class CacheManager {
    private static final String EVENTS_KEY = Utils.TAG + ".cache.events";
    private static final Object cacheLock = new Object();
    private static final JsonSerializer serializer = new JsonSerializer(false, new JSONObjectAdapter(), new JSONArrayAdapter());

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

    static void saveEvent(Context context, String event, JSONObject object, String actionId, String actionInputText) {
        String serialized = serializer.serialize(new Event(event, object, actionId, actionInputText));
        saveStringsToSet(context, EVENTS_KEY, serialized);
    }

    static void saveEvent(Context context, String event, int unreadMessagesCounter) {
        //int `unreadMessagesCounter` isn't a JSONObject, so it'll go as a second argument
        String serialized = serializer.serialize(new Event(event, null, unreadMessagesCounter));
        saveStringsToSet(context, EVENTS_KEY, serialized);
    }

    static Event[] loadEvents(Context context) {
        Set<String> serialized = getAndRemoveStringSet(context, EVENTS_KEY);
        List<Event> events = new ArrayList<Event>(serialized.size());
        for (String s : serialized) {
            events.add(serializer.deserialize(s, Event.class));
        }
        return events.toArray(new Event[events.size()]);
    }

    private static Set<String> getAndRemoveStringSet(Context context, String key) {
        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
        Set<String> set;
        synchronized (cacheLock) {
            set = sharedPreferences.getStringSet(key, new HashSet<String>());
            if (set.isEmpty()) {
                return new HashSet<String>();
            }
            sharedPreferences
                    .edit()
                    .remove(key)
                    .apply();
        }
        return set;
    }

    @SuppressWarnings("UnusedReturnValue")
    private static Set<String> saveStringsToSet(Context context, String key, String... strings) {
        return saveStringSet(context, key, new HashSet<String>(Arrays.asList(strings)));
    }

    private static Set<String> saveStringSet(Context context, String key, Set<String> newSet) {
        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
        synchronized (cacheLock) {
            Set<String> set = sharedPreferences.getStringSet(key, new HashSet<String>());
            newSet.addAll(set);
            sharedPreferences
                    .edit()
                    .putStringSet(key, newSet)
                    .apply();
            return set;
        }
    }
}
