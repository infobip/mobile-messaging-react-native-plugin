package org.infobip.reactlibrary.mobilemessaging;

import org.infobip.mobile.messaging.api.support.http.serialization.JsonSerializer;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import androidx.annotation.NonNull;

import com.google.firebase.FirebaseOptions;

class Configuration {

    class AndroidConfiguration {
        String notificationIcon;
        boolean multipleNotifications;
        String notificationAccentColor;
        FirebaseOptions firebaseOptions;
    }

    class PrivacySettings {
        boolean userDataPersistingDisabled;
        boolean carrierInfoSendingDisabled;
        boolean systemInfoSendingDisabled;
    }

    class Action {
        String identifier;
        String title;
        boolean foreground;
        boolean moRequired;
        String icon;
        String textInputPlaceholder;
    }

    class Category {
        String identifier;
        List<Action> actions;
    }

    AndroidConfiguration android;
    String applicationCode;
    boolean geofencingEnabled;
    boolean inAppChatEnabled;
    Map<String, ?> messageStorage;
    boolean defaultMessageStorage;
    boolean loggingEnabled;
    String reactNativePluginVersion = "unknown";
    PrivacySettings privacySettings = new PrivacySettings();
    List<Category> notificationCategories = new ArrayList<Category>();

    @NonNull
    static Configuration resolveConfiguration(JSONObject args) throws JSONException {
        if (args == null) {
            throw new IllegalArgumentException("Cannot resolve configuration from arguments");
        }

        Configuration config = new JsonSerializer().deserialize(args.toString(), Configuration.class);
        if (config == null || config.applicationCode == null) {
            throw new IllegalArgumentException("Configuration is invalid");
        }

        return config;
    }
}
