package org.infobip.reactlibrary.mobilemessaging;

import androidx.annotation.NonNull;

import com.google.firebase.FirebaseOptions;

import org.infobip.mobile.messaging.api.support.http.serialization.JsonSerializer;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
        //common
        String widgetTheme;
        String toolbarTitle;
        String toolbarTitleColor;
        String toolbarBackgroundColor;
        String chatBackgroundColor;
        String noConnectionAlertTextColor;
        String noConnectionAlertBackgroundColor;
        String chatInputPlaceholderTextColor;
        String chatInputCursorColor;
        String chatInputBackgroundColor;
        String sendButtonIconUri;
        String attachmentButtonIconUri;
        boolean chatInputSeparatorVisible;
        //android only
        //status bar properties
        boolean statusBarColorLight;
        String statusBarBackgroundColor;
        //toolbar properties
        String navigationIconUri;
        String navigationIconTint;
        String subtitleText;
        String subtitleTextColor;
        String subtitleTextAppearanceRes;
        boolean subtitleCentered;
        String titleTextAppearanceRes;
        boolean titleCentered;
        String menuItemsIconTint;
        String menuItemSaveAttachmentIcon;
        //chat properties
        String progressBarColor;
        String networkConnectionErrorTextAppearanceRes;
        String networkConnectionErrorText;
        //chat input properties
        String inputTextColor;
        String inputAttachmentIconTint;
        String inputAttachmentBackgroundColor;
        String inputAttachmentBackgroundDrawable;
        String inputSendIconTint;
        String inputSendBackgroundColor;
        String inputSendBackgroundDrawable;
        String inputSeparatorLineColor;
        String inputHintText;
        String inputTextAppearance;
    }

    class WebRTCUI {
        String configurationId;
    }

    AndroidConfiguration android;
    String applicationCode;
    boolean geofencingEnabled;
    boolean inAppChatEnabled;
    boolean fullFeaturedInAppsEnabled;
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
