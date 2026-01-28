//
//  Configuration.java
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.firebase.FirebaseOptions;

import org.infobip.mobile.messaging.api.support.http.serialization.JsonSerializer;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Configuration {

    class AndroidConfiguration {
        String notificationIcon;
        String notificationChannelId;
        String notificationChannelName;
        String notificationSound;
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

    class WebRTCUI {
        String configurationId;
    }

    AndroidConfiguration android;
    String applicationCode;
    boolean inAppChatEnabled;
    boolean fullFeaturedInAppsEnabled;
    Map<String, ?> messageStorage;
    boolean defaultMessageStorage;
    boolean logging;
    String reactNativePluginVersion = "unknown";
    PrivacySettings privacySettings = new PrivacySettings();
    List<Category> notificationCategories = new ArrayList<Category>();
    WebRTCUI webRTCUI;
    String userDataJwt;
    @Nullable String backendBaseURL;

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
