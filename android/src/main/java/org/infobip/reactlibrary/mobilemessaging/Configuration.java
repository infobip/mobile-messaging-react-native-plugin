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

    class InAppChatCustomization {
        String toolbarTitle;
        String toolbarTintColor;
        String toolbarBackgroundColor;
        String toolbarTitleColor;
        String chatBackgroundColor;
        String noConnectionAlertTextColor;
        String noConnectionAlertBackgroundColor;
        String chatInputPlaceholderTextColor;
        String chatInputCursorColor;
        String sendButtonIconUri;
        String attachmentButtonIconUri;
        boolean chatInputSeparatorVisible;
        String navigationIconTint;
        String subtitleTextColor;
        String inputTextColor;
        String progressBarColor;
        String inputAttachmentIconTint;
        String inputSendIconTint;
        String inputSeparatorLineColor;
        String inputHintText;
        String subtitleText;
        String subtitleTextAppearanceRes;
        boolean subtitleCentered;
        boolean titleCentered;
        String inputTextAppearance;
        String networkConnectionErrorTextAppearanceRes;
        String networkConnectionErrorText;
        String navigationIconUri;
        boolean statusBarColorLight;
        String titleTextAppearanceRes;
        String statusBarBackgroundColor;
    }

    class WebRTCUI {
        String applicationId;
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
    WebRTCUI webRTCUI;
    InAppChatCustomization inAppChatCustomization;

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

    @NonNull
    static InAppChatCustomization resolveChatSettings(JSONObject args) throws JSONException {
        if (args == null) {
            throw new IllegalArgumentException("Cannot resolve configuration from arguments");
        }

        InAppChatCustomization config = new JsonSerializer().deserialize(args.toString(), InAppChatCustomization.class);
        if (config == null) {
            throw new IllegalArgumentException("Configuration is invalid");
        }

        return config;
    }
}
