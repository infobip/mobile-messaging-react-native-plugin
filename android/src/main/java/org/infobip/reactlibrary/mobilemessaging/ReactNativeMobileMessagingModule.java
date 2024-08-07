package org.infobip.reactlibrary.mobilemessaging;

import static android.content.Context.RECEIVER_NOT_EXPORTED;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;

import org.infobip.mobile.messaging.BroadcastParameter;
import org.infobip.mobile.messaging.CustomEvent;
import org.infobip.mobile.messaging.Event;
import org.infobip.mobile.messaging.Installation;
import org.infobip.mobile.messaging.Message;
import org.infobip.mobile.messaging.MobileMessaging;
import org.infobip.mobile.messaging.MobileMessagingProperty;
import org.infobip.mobile.messaging.NotificationSettings;
import org.infobip.mobile.messaging.SuccessPending;
import org.infobip.mobile.messaging.User;
import org.infobip.mobile.messaging.chat.InAppChat;
import org.infobip.mobile.messaging.chat.core.InAppChatEvent;
import org.infobip.mobile.messaging.dal.bundle.MessageBundleMapper;
import org.infobip.mobile.messaging.inbox.Inbox;
import org.infobip.mobile.messaging.inbox.MobileInbox;
import org.infobip.mobile.messaging.inbox.MobileInboxFilterOptions;
import org.infobip.mobile.messaging.interactive.InteractiveEvent;
import org.infobip.mobile.messaging.interactive.MobileInteractive;
import org.infobip.mobile.messaging.interactive.NotificationAction;
import org.infobip.mobile.messaging.interactive.NotificationCategory;
import org.infobip.mobile.messaging.logging.MobileMessagingLogger;
import org.infobip.mobile.messaging.mobileapi.InternalSdkError;
import org.infobip.mobile.messaging.mobileapi.MobileMessagingError;
import org.infobip.mobile.messaging.mobileapi.Result;
import org.infobip.mobile.messaging.storage.MessageStore;
import org.infobip.mobile.messaging.storage.SQLiteMessageStore;
import org.infobip.mobile.messaging.util.Cryptor;
import org.infobip.mobile.messaging.util.DeviceInformation;
import org.infobip.mobile.messaging.util.PreferenceHelper;
import org.infobip.reactlibrary.mobilemessaging.datamappers.CustomEventJson;
import org.infobip.reactlibrary.mobilemessaging.datamappers.InboxJson;
import org.infobip.reactlibrary.mobilemessaging.datamappers.InstallationJson;
import org.infobip.reactlibrary.mobilemessaging.datamappers.MessageJson;
import org.infobip.reactlibrary.mobilemessaging.datamappers.MobileInboxFilterOptionsJson;
import org.infobip.reactlibrary.mobilemessaging.datamappers.PersonalizationCtx;
import org.infobip.reactlibrary.mobilemessaging.datamappers.ReactNativeJson;
import org.infobip.reactlibrary.mobilemessaging.datamappers.UserJson;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;

public class ReactNativeMobileMessagingModule extends ReactContextBaseJavaModule implements LifecycleEventListener,
        ActivityEventListener,
        PermissionsRequestManager.PermissionsRequester,
        PermissionListener {
    public static final String MODULE_NAME = "ReactNativeMobileMessaging";

    private final ReactApplicationContext reactContext;

    private static volatile Boolean broadcastReceiverRegistered = false;
    private static volatile Boolean pluginInitialized = false;
    private PermissionsRequestManager permissionsRequestManager;

    public ReactNativeMobileMessagingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        while (getReactApplicationContext() == null) ;
        reactContext = getReactApplicationContext();

        this.reactContext = reactContext;
        reactContext.addLifecycleEventListener(this);
        permissionsRequestManager = new PermissionsRequestManager(this);
    }

    @Override
    public void initialize() {
        super.initialize();
        for (CacheManager.Event event : CacheManager.loadEvents(reactContext)) {
            ReactNativeEvent.send(event.type, reactContext, event.jsonObject, event.objects);
        }
        pluginInitialized = true;
        registerBroadcastReceiver();
    }

    // LifecycleEventListener

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @Override
    public void onHostResume() {
    }

    @Override
    public void onHostPause() {
    }

    @Override
    public void onHostDestroy() {
        pluginInitialized = false;
        unregisterBroadcastReceiver();
        reactContext.removeLifecycleEventListener(this);
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    //region BroadcastReceivers
    //region Events
    private static final String EVENT_TOKEN_RECEIVED = "tokenReceived";
    private static final String EVENT_REGISTRATION_UPDATED = "registrationUpdated";
    private static final String EVENT_INSTALLATION_UPDATED = "installationUpdated";
    private static final String EVENT_USER_UPDATED = "userUpdated";
    private static final String EVENT_PERSONALIZED = "personalized";
    private static final String EVENT_DEPERSONALIZED = "depersonalized";

    private static final String EVENT_GEOFENCE_ENTERED = "geofenceEntered";
    private static final String EVENT_NOTIFICATION_TAPPED = "notificationTapped";
    private static final String EVENT_NOTIFICATION_ACTION_TAPPED = "actionTapped";
    private static final String EVENT_MESSAGE_RECEIVED = "messageReceived";

    private static final String EVENT_INAPPCHAT_UNREAD_MESSAGES_COUNT_UPDATED = "inAppChat.unreadMessageCounterUpdated";
    private static final String EVENT_INAPPCHAT_VIEW_STATE_CHANGED = "inAppChat.viewStateChanged";
    private static final String EVENT_INAPPCHAT_CONFIGURATION_SYNCED = "inAppChat.configurationSynced";
    private static final String EVENT_INAPPCHAT_LIVECHAT_REGISTRATION_ID_UPDATED = "inAppChat.livechatRegistrationIdUpdated";
    private static final String EVENT_INAPPCHAT_AVAILABILITY_UPDATED = "inAppChat.availabilityUpdated";
    //endregion

    //Geo dependency is opt-out by default. Extracted from GeoEvent.GEOFENCE_AREA_ENTERED module 'infobip-mobile-messaging-android-geo-sdk'
    private static final String GEO_EVENT_GEOFENCE_AREA_ENTERED_KEY = "org.infobip.mobile.messaging.geo.GEOFENCE_AREA_ENTERED";


    //region MessageStorageBroadcastReceiver
    private static final Map<String, String> messageStorageEventMap = new HashMap<String, String>() {{
        put(MessageStoreAdapter.EVENT_MESSAGESTORAGE_START, MessageStoreAdapter.EVENT_MESSAGESTORAGE_START);
        put(MessageStoreAdapter.EVENT_MESSAGESTORAGE_SAVE, MessageStoreAdapter.EVENT_MESSAGESTORAGE_SAVE);
        put(MessageStoreAdapter.EVENT_MESSAGESTORAGE_FIND_ALL, MessageStoreAdapter.EVENT_MESSAGESTORAGE_FIND_ALL);
    }};

    private static String getMessageStorageBroadcastEvent(Intent intent) {
        if (intent == null || intent.getAction() == null) {
            Log.w(Utils.TAG, "Cannot process event for broadcast, cause intent or action is null");
            return null;
        }
        return messageStorageEventMap.get(intent.getAction());
    }

    private final BroadcastReceiver messageStorageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String event = getMessageStorageBroadcastEvent(intent);
            if (event == null) {
                Log.w(Utils.TAG, "Cannot process event for messageStorageReceiver: " + intent.getAction());
                return;
            }
            Log.i(Utils.TAG, "messageStorageReceiver event: " + event);
            if (intent.getExtras() == null) {
                ReactNativeEvent.send(event, reactContext);
                return;
            }
            List<Message> messages = Message.createFrom(intent.<Bundle>getParcelableArrayListExtra(BroadcastParameter.EXTRA_MESSAGES));
            if (messages == null) {
                Log.w(Utils.TAG, "messageStorageReceiver messages is null");
                ReactNativeEvent.send(event, reactContext);
                return;
            }
            Log.i(Utils.TAG, "messageStorageReceiver messages: " + messages.toString());
            try {
                ReactNativeEvent.send(event, reactContext, ReactNativeJson.convertJsonToArray(MessageJson.toJSONArray(messages.toArray(new Message[messages.size()]))));
            } catch (JSONException e) {
                ReactNativeEvent.send(event, reactContext);
            }
        }
    };
    //endregion

    //region MessageBroadcastReceiver

    /**
     * For event caching, if plugin not yet initialized
     */
    private static final Map<String, String> messageBroadcastEventMap = new HashMap<String, String>() {{
        put(Event.MESSAGE_RECEIVED.getKey(), EVENT_MESSAGE_RECEIVED);
        put(Event.NOTIFICATION_TAPPED.getKey(), EVENT_NOTIFICATION_TAPPED);
        put(InteractiveEvent.NOTIFICATION_ACTION_TAPPED.getKey(), EVENT_NOTIFICATION_ACTION_TAPPED);
        put(InAppChatEvent.UNREAD_MESSAGES_COUNTER_UPDATED.getKey(), EVENT_INAPPCHAT_UNREAD_MESSAGES_COUNT_UPDATED);
    }};

    private static String getMessageBroadcastEvent(Intent intent) {
        if (intent == null || intent.getAction() == null) {
            Log.w(Utils.TAG, "Cannot process event for broadcast (getMessageBroadcastEvent), cause intent or action is null");
            return null;
        }
        return messageBroadcastEventMap.get(intent.getAction());
    }

    public static class MessageEventReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            String event = getMessageBroadcastEvent(intent);
            if (event == null) {
                Log.w(Utils.TAG, "Cannot process event for broadcast: " + intent.getAction());
                return;
            }
            if (InAppChatEvent.UNREAD_MESSAGES_COUNTER_UPDATED.getKey().equals(intent.getAction())) {
                handleUnreadMessageCounterIntent(context, intent, event);
                return;
            }
            JSONObject message = MessageJson.bundleToJSON(intent.getExtras());
            String actionId = null;
            String actionInputText = null;
            if (InteractiveEvent.NOTIFICATION_ACTION_TAPPED.getKey().equals(intent.getAction())) {
                NotificationAction notificationAction = NotificationAction.createFrom(intent.getExtras());
                actionId = notificationAction.getId();
                actionInputText = notificationAction.getInputText();
            }
            if (!pluginInitialized) {
                CacheManager.saveEvent(context, event, message, actionId, actionInputText);
            } else {
                ReactContext reactContext = getReactContext(context);
                ReactNativeEvent.send(event, reactContext, message, actionId, actionInputText);
            }
        }

        private void handleUnreadMessageCounterIntent(Context context, Intent intent, String event) {
            int unreadChatMessagesCounter = intent.getIntExtra(BroadcastParameter.EXTRA_UNREAD_CHAT_MESSAGES_COUNT, 0);
            if (!pluginInitialized) {
                CacheManager.saveEvent(context, event, unreadChatMessagesCounter);
            } else {
                ReactContext reactContext = getReactContext(context);
                ReactNativeEvent.send(event, reactContext, unreadChatMessagesCounter);
            }
        }

        @Nullable
        private ReactContext getReactContext(Context context) {
            ReactApplication reactApplication = (ReactApplication) context.getApplicationContext();
            if (reactApplication == null) return null;
            return reactApplication.getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
        }
    }
    //endregion

    //region CommonLibraryEventsBroadcastReceiver
    private static final Map<String, String> broadcastEventMap = new HashMap<String, String>() {{
        put(Event.TOKEN_RECEIVED.getKey(), EVENT_TOKEN_RECEIVED);
        put(Event.REGISTRATION_CREATED.getKey(), EVENT_REGISTRATION_UPDATED);
        put(Event.INSTALLATION_UPDATED.getKey(), EVENT_INSTALLATION_UPDATED);
        put(Event.USER_UPDATED.getKey(), EVENT_USER_UPDATED);
        put(Event.PERSONALIZED.getKey(), EVENT_PERSONALIZED);
        put(Event.DEPERSONALIZED.getKey(), EVENT_DEPERSONALIZED);
        put(GEO_EVENT_GEOFENCE_AREA_ENTERED_KEY, EVENT_GEOFENCE_ENTERED);
        put(InAppChatEvent.CHAT_VIEW_CHANGED.getKey(), EVENT_INAPPCHAT_VIEW_STATE_CHANGED);
        put(InAppChatEvent.CHAT_CONFIGURATION_SYNCED.getKey(), EVENT_INAPPCHAT_CONFIGURATION_SYNCED);
        put(InAppChatEvent.LIVECHAT_REGISTRATION_ID_UPDATED.getKey(), EVENT_INAPPCHAT_LIVECHAT_REGISTRATION_ID_UPDATED);
        put(InAppChatEvent.IN_APP_CHAT_AVAILABILITY_UPDATED.getKey(), EVENT_INAPPCHAT_AVAILABILITY_UPDATED);
    }};

    private final BroadcastReceiver commonLibraryBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {

            String event = broadcastEventMap.get(intent.getAction());
            if (event == null) {
                Log.w(Utils.TAG, "Cannot process event for broadcast: " + intent.getAction());
                return;
            }

            if (GEO_EVENT_GEOFENCE_AREA_ENTERED_KEY.equals(intent.getAction())) {
                for (JSONObject geo : MessageJson.geosFromBundle(intent.getExtras())) {
                    ReactNativeEvent.send(event, reactContext, geo);
                }
                return;
            }

            if (Event.INSTALLATION_UPDATED.getKey().equals(intent.getAction())) {
                JSONObject updatedInstallation = InstallationJson.toJSON(Installation.createFrom(intent.getExtras()));
                ReactNativeEvent.send(event, reactContext, updatedInstallation);
                return;
            }

            if (Event.USER_UPDATED.getKey().equals(intent.getAction()) || Event.PERSONALIZED.getKey().equals(intent.getAction())) {
                JSONObject updatedUser = UserJson.toJSON(User.createFrom(intent.getExtras()));
                ReactNativeEvent.send(event, reactContext, updatedUser);
                return;
            }

            if (Event.DEPERSONALIZED.getKey().equals(intent.getAction())) {
                ReactNativeEvent.send(event, reactContext);
                return;
            }

            String data = null;
            if (Event.TOKEN_RECEIVED.getKey().equals(intent.getAction())) {
                data = intent.getStringExtra(BroadcastParameter.EXTRA_CLOUD_TOKEN);
            } else if (Event.REGISTRATION_CREATED.getKey().equals(intent.getAction())) {
                data = intent.getStringExtra(BroadcastParameter.EXTRA_INFOBIP_ID);
            } else if (InAppChatEvent.CHAT_VIEW_CHANGED.getKey().equals(intent.getAction())) {
                data = intent.getStringExtra(BroadcastParameter.EXTRA_CHAT_VIEW);
            } else if (InAppChatEvent.LIVECHAT_REGISTRATION_ID_UPDATED.getKey().equals(intent.getAction())) {
                data = intent.getStringExtra(BroadcastParameter.EXTRA_LIVECHAT_REGISTRATION_ID);
            } else if (InAppChatEvent.IN_APP_CHAT_AVAILABILITY_UPDATED.getKey().equals(intent.getAction())) {
                boolean isChatAvailable = intent.getBooleanExtra(BroadcastParameter.EXTRA_IS_CHAT_AVAILABLE, false);
                data = String.valueOf(isChatAvailable);
            }

            if (data == null) {
                ReactNativeEvent.send(event, reactContext);
            } else {
                ReactNativeEvent.send(event, reactContext, data);
            }
        }
    };
    //endregion

    private void registerBroadcastReceiver() {

        IntentFilter commonLibIntentFilter = new IntentFilter();
        for (String action : broadcastEventMap.keySet()) {
            commonLibIntentFilter.addAction(action);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(commonLibraryBroadcastReceiver, commonLibIntentFilter, RECEIVER_NOT_EXPORTED);
        } else {
            reactContext.registerReceiver(commonLibraryBroadcastReceiver, commonLibIntentFilter);
        }

        IntentFilter messageStorageIntentFilter = new IntentFilter();
        for (String action : messageStorageEventMap.keySet()) {
            messageStorageIntentFilter.addAction(action);
        }

        LocalBroadcastManager.getInstance(reactContext).registerReceiver(messageStorageReceiver, messageStorageIntentFilter);
        broadcastReceiverRegistered = true;
    }

    private void unregisterBroadcastReceiver() {
        if (!broadcastReceiverRegistered) return;
        try {
            reactContext.unregisterReceiver(commonLibraryBroadcastReceiver);
            LocalBroadcastManager.getInstance(reactContext).unregisterReceiver(messageStorageReceiver);
        } catch (IllegalArgumentException e) {
            Log.d(Utils.TAG, "Can't unregister broadcast receivers");
        }
        broadcastReceiverRegistered = false;
    }
    //endregion

    @ReactMethod
    public void init(ReadableMap args, final Callback successCallback, final Callback errorCallback) throws JSONException {
        final Configuration configuration = Configuration.resolveConfiguration(ReactNativeJson.convertMapToJson(args));
        ConfigCache.getInstance().setConfiguration(configuration);

        final Application context = (Application) reactContext.getApplicationContext();

        if (configuration.loggingEnabled) {
            MobileMessagingLogger.enforce();
        }

        PreferenceHelper.saveString(context, MobileMessagingProperty.SYSTEM_DATA_VERSION_POSTFIX, "reactNative " + configuration.reactNativePluginVersion);

        MobileMessaging.Builder builder = new MobileMessaging.Builder(context)
                .withoutRegisteringForRemoteNotifications()
                .withApplicationCode(configuration.applicationCode);

        if (configuration.fullFeaturedInAppsEnabled)
            builder.withFullFeaturedInApps();

        if (configuration.privacySettings.userDataPersistingDisabled) {
            builder.withoutStoringUserData();
        }
        if (configuration.privacySettings.carrierInfoSendingDisabled) {
            builder.withoutCarrierInfo();
        }
        if (configuration.privacySettings.systemInfoSendingDisabled) {
            builder.withoutSystemInfo();
        }

        if (configuration.messageStorage != null) {
            MessageStoreAdapter.init(context);
            builder.withMessageStore(MessageStoreAdapter.class);
        } else if (configuration.defaultMessageStorage) {
            builder.withMessageStore(SQLiteMessageStore.class);
        }

        if (configuration.android != null) {
            NotificationSettings.Builder notificationBuilder = new NotificationSettings.Builder(context);
            if (configuration.android.notificationIcon != null) {
                int resId = Utils.getResId(context.getResources(), configuration.android.notificationIcon, context.getPackageName());
                if (resId != 0) {
                    notificationBuilder.withDefaultIcon(resId);
                }
            }
            if (configuration.android.multipleNotifications) {
                notificationBuilder.withMultipleNotifications();
            }
            if (configuration.android.notificationAccentColor != null) {
                int color = Color.parseColor(configuration.android.notificationAccentColor);
                notificationBuilder.withColor(color);
            }
            builder.withDisplayNotification(notificationBuilder.build());

            if (configuration.android.firebaseOptions != null) {
                builder.withFirebaseOptions(configuration.android.firebaseOptions);
            }
        }

        // Checking do we need to migrate data saved with old cryptor,
        // if withCryptorMigration project ext property is set, ECBCryptorImpl class will exist.
        Cryptor cryptor = null;
        try {
            Class cls = Class.forName("org.infobip.mobile.messaging.cryptor.ECBCryptorImpl");
            cryptor = (Cryptor) cls.getDeclaredConstructor(String.class).newInstance(DeviceInformation.getDeviceID(context));
        } catch (Exception e) {
            Log.d(Utils.TAG, "Will not migrate cryptor :");
            e.printStackTrace();
        }
        if (cryptor != null) {
            builder.withCryptorMigration(cryptor);
        }

        builder.build(new MobileMessaging.InitListener() {
            @SuppressLint("MissingPermission")
            @Override
            public void onSuccess() {
                if (configuration.geofencingEnabled) {
                    try {
                        Class<?> cls = Class.forName("org.infobip.mobile.messaging.geo.MobileGeo");
                        Method newInstance_method = cls.getDeclaredMethod("getInstance", Context.class);
                        Method activateGeofencing_method = cls.getDeclaredMethod("activateGeofencing");
                        Object geoInstance = newInstance_method.invoke(cls, context);
                        activateGeofencing_method.invoke(geoInstance);
                    } catch (Exception e) {
                        Log.d(Utils.TAG, "Geofencing is not enabled.");
                        e.printStackTrace();
                    }
                }

                NotificationCategory categories[] = notificationCategoriesFromConfiguration(configuration.notificationCategories);
                if (categories.length > 0) {
                    MobileInteractive.getInstance(context).setNotificationCategories(categories);
                }

                successCallback.invoke();
            }

            @Override
            public void onError(InternalSdkError e, @Nullable Integer googleErrorCode) {
                errorCallback.invoke(Utils.callbackError(e.get(), googleErrorCode));
                Log.e(Utils.TAG, "Cannot start SDK: " + e.get() + " errorCode: " + googleErrorCode);
            }
        });

        if (configuration.inAppChatEnabled) {
            InAppChat.getInstance(context).activate();
        }
    }

    /**
     * Converts notification categories in configuration into library format
     *
     * @param categories notification categories from cordova
     * @return library-understandable categories
     */
    @NonNull
    private NotificationCategory[] notificationCategoriesFromConfiguration(@NonNull List<Configuration.Category> categories) {
        NotificationCategory[] notificationCategories = new NotificationCategory[categories.size()];
        for (int i = 0; i < notificationCategories.length; i++) {
            Configuration.Category category = categories.get(i);
            notificationCategories[i] = new NotificationCategory(
                    category.identifier,
                    notificationActionsFromConfiguration(category.actions)
            );
        }
        return notificationCategories;
    }

    /**
     * Converts notification actions in configuration into library format
     *
     * @param actions notification actions from cordova
     * @return library-understandable actions
     */
    @NonNull
    private NotificationAction[] notificationActionsFromConfiguration(@NonNull List<Configuration.Action> actions) {
        NotificationAction[] notificationActions = new NotificationAction[actions.size()];
        for (int i = 0; i < notificationActions.length; i++) {
            Configuration.Action action = actions.get(i);
            notificationActions[i] = new NotificationAction.Builder()
                    .withId(action.identifier)
                    //getCurrentActivity().getApplication()
                    .withIcon(reactContext, action.icon)
                    .withTitleText(action.title)
                    .withBringingAppToForeground(action.foreground)
                    .withInput(action.textInputPlaceholder)
                    .withMoMessage(action.moRequired)
                    .build();
        }
        return notificationActions;
    }


    /* Default message storage */

    @ReactMethod
    public synchronized void defaultMessageStorage_find(String messageId, final Callback onSuccess, final Callback onError) throws JSONException {
        MessageStore messageStore = MobileMessaging.getInstance(reactContext).getMessageStore();
        if (messageStore == null) {
            onError.invoke(Utils.callbackError("Message store does not exist", null));
            return;
        }

        for (Message m : messageStore.findAll(reactContext)) {
            if (messageId.equals(m.getMessageId())) {
                onSuccess.invoke(ReactNativeJson.convertJsonToMap(MessageJson.toJSON(m)));
                return;
            }
        }
        onSuccess.invoke();
    }

    @ReactMethod
    public void defaultMessageStorage_findAll(final Callback onSuccess, final Callback onError) throws JSONException {
        MessageStore messageStore = MobileMessaging.getInstance(reactContext).getMessageStore();
        if (messageStore == null) {
            onError.invoke(Utils.callbackError("Message store does not exist", null));
            return;
        }
        List<Message> messages = messageStore.findAll(reactContext);
        onSuccess.invoke(ReactNativeJson.convertJsonToArray(MessageJson.toJSONArray(messages.toArray(new Message[messages.size()]))));
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_delete(String messageId, final Callback onSuccess, final Callback onError) throws JSONException {
        MessageStore messageStore = MobileMessaging.getInstance(reactContext).getMessageStore();
        if (messageStore == null) {
            onError.invoke(Utils.callbackError("Message store does not exist", null));
            return;
        }

        List<Message> messagesToKeep = new ArrayList<Message>();
        for (Message m : messageStore.findAll(reactContext)) {
            if (messageId.equals(m.getMessageId())) {
                continue;
            }
            messagesToKeep.add(m);
        }
        messageStore.deleteAll(reactContext);
        messageStore.save(reactContext, messagesToKeep.toArray(new Message[messagesToKeep.size()]));
        onSuccess.invoke();
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_deleteAll(final Callback onSuccess, final Callback onError) {
        MessageStore messageStore = MobileMessaging.getInstance(reactContext).getMessageStore();
        if (messageStore == null) {
            onError.invoke(Utils.callbackError("Message store does not exist", null));
            return;
        }
        messageStore.deleteAll(reactContext);
        onSuccess.invoke();
    }

    @ReactMethod
    public void fetchInboxMessages(@NonNull String token, @NonNull String externalUserId, ReadableMap args, final Callback successCallback, final Callback errorCallback) throws JSONException {
        try {
            mobileMessagingInbox().fetchInbox(token, externalUserId, MobileInboxFilterOptionsJson.resolveMobileInboxFilterOptions(ReactNativeJson.convertMapToJson(args)), inboxResultListener(successCallback, errorCallback));
        } catch (IllegalArgumentException e) {
            Log.d(Utils.TAG, "Error fetching inbox:" + e.getMessage());
        }
    }

    @ReactMethod
    public void fetchInboxMessagesWithoutToken(@NonNull String externalUserId, ReadableMap args, final Callback successCallback, final Callback errorCallback) throws JSONException {
        try {
            mobileMessagingInbox().fetchInbox(externalUserId, MobileInboxFilterOptionsJson.resolveMobileInboxFilterOptions(ReactNativeJson.convertMapToJson(args)), inboxResultListener(successCallback, errorCallback));
        } catch (IllegalArgumentException e) {
            Log.d(Utils.TAG, "Error fetching inbox:" + e.getMessage());
        }
    }

    @ReactMethod
    public void setInboxMessagesSeen(@NonNull String externalUserId, ReadableArray args, final Callback successCallback, final Callback errorCallback) {
        mobileMessagingInbox().setSeen(externalUserId, convertReadableArrayToStringArray(args), setSeenResultListener(successCallback, errorCallback));
    }

    private String[] convertReadableArrayToStringArray(ReadableArray readableArray) {
        String[] stringArray = new String[readableArray.size()];
        for (int i = 0; i < readableArray.size(); i++) {
            stringArray[i] = readableArray.getString(i);
        }
        return stringArray;
    }

    @NonNull
    private MobileMessaging.ResultListener<Inbox> inboxResultListener(final Callback successCallback, final Callback errorCallback) {
        return new MobileMessaging.ResultListener<Inbox>() {
            @Override
            public void onResult(Result<Inbox, MobileMessagingError> result) {
                if (result.isSuccess()) {
                    ReadableMap readableMap = InboxJson.toReadableMap(result.getData());
                    successCallback.invoke(readableMap);
                } else {
                    errorCallback.invoke(Utils.callbackError(result.getError().getMessage(), null));
                }
            }
        };
    }

    @NonNull
    private MobileMessaging.ResultListener<String[]> setSeenResultListener(final Callback successCallback, final Callback errorCallback) {
        return new MobileMessaging.ResultListener<String[]>() {
            @Override
            public void onResult(Result<String[], MobileMessagingError> result) {
                if (result.isSuccess()) {
                    String[] messagesSetSeen = result.getData();
                    WritableMap writableMap = Arguments.createMap();

                    for (int i = 0; i < messagesSetSeen.length; i++) {
                        writableMap.putString(Integer.toString(i), messagesSetSeen[i]);
                    }

                    successCallback.invoke(writableMap);
                } else {
                    errorCallback.invoke(Utils.callbackError(result.getError().getMessage(), null));
                }
            }
        };
    }


    /*User Profile Management*/

    @ReactMethod
    public void saveUser(ReadableMap args, final Callback successCallback, final Callback errorCallback) throws JSONException {
        try {
            final User user = UserJson.resolveUser(ReactNativeJson.convertMapToJson(args));
            mobileMessaging().saveUser(user, userResultListener(successCallback, errorCallback));
        } catch (IllegalArgumentException e) {
            errorCallback.invoke(e.getMessage());
        }
    }

    @ReactMethod
    public void fetchUser(final Callback successCallback, final Callback errorCallback) {
        mobileMessaging().fetchUser(userResultListener(successCallback, errorCallback));
    }

    @NonNull
    private MobileMessaging.ResultListener<User> userResultListener(final Callback successCallback, final Callback errorCallback) {
        return new MobileMessaging.ResultListener<User>() {
            @Override
            public void onResult(Result<User, MobileMessagingError> result) {
                if (result.isSuccess()) {
                    ReadableMap readableMap = UserJson.toReadableMap(result.getData());
                    successCallback.invoke(readableMap);
                } else {
                    errorCallback.invoke(Utils.callbackError(result.getError().getMessage(), null));
                }
            }
        };
    }

    @ReactMethod
    public void getUser(final Callback successCallback) {
        User user = mobileMessaging().getUser();
        ReadableMap userReadableMap = UserJson.toReadableMap(user);
        successCallback.invoke(userReadableMap);
    }

    @ReactMethod
    public void saveInstallation(ReadableMap args, final Callback successCallback, final Callback errorCallback) throws JSONException {
        final Installation installation = InstallationJson.resolveInstallation(ReactNativeJson.convertMapToJson(args));
        mobileMessaging().saveInstallation(installation, installationResultListener(successCallback, errorCallback));
    }

    @ReactMethod
    public void fetchInstallation(final Callback successCallback, final Callback errorCallback) {
        mobileMessaging().fetchInstallation(installationResultListener(successCallback, errorCallback));
    }

    @NonNull
    private MobileMessaging.ResultListener<Installation> installationResultListener(final Callback successCallback, final Callback errorCallback) {
        return new MobileMessaging.ResultListener<Installation>() {
            @Override
            public void onResult(Result<Installation, MobileMessagingError> result) {
                if (result.isSuccess()) {
                    ReadableMap readableMap = InstallationJson.toReadableMap(result.getData());
                    successCallback.invoke(readableMap);
                } else {
                    errorCallback.invoke(Utils.callbackError(result.getError().getMessage(), null));
                }
            }
        };
    }

    @ReactMethod
    public void getInstallation(final Callback successCallback) {
        Installation installation = mobileMessaging().getInstallation();
        ReadableMap installationReadableMap = InstallationJson.toReadableMap(installation);
        successCallback.invoke(installationReadableMap);
    }

    @ReactMethod
    public void personalize(ReadableMap args, final Callback successCallback, final Callback errorCallback) throws JSONException {
        try {
            final PersonalizationCtx ctx = PersonalizationCtx.resolvePersonalizationCtx(ReactNativeJson.convertMapToJson(args));
            mobileMessaging().personalize(ctx.userIdentity, ctx.userAttributes, ctx.forceDepersonalize, new MobileMessaging.ResultListener<User>() {
                @Override
                public void onResult(Result<User, MobileMessagingError> result) {
                    if (result.isSuccess()) {
                        ReadableMap readableMap = UserJson.toReadableMap(result.getData());
                        successCallback.invoke(readableMap);
                    } else {
                        errorCallback.invoke(Utils.callbackError(result.getError().getMessage(), null));
                    }
                }
            });
        } catch (IllegalArgumentException e) {
            errorCallback.invoke(e.getMessage());
        }
    }

    private static final Map<SuccessPending, String> depersonalizeStates = new HashMap<SuccessPending, String>() {{
        put(SuccessPending.Pending, "pending");
        put(SuccessPending.Success, "success");
    }};

    @ReactMethod
    public void depersonalize(final Callback successCallback, final Callback errorCallback) {
        mobileMessaging().depersonalize(new MobileMessaging.ResultListener<SuccessPending>() {
            @Override
            public void onResult(Result<SuccessPending, MobileMessagingError> result) {
                if (result.isSuccess()) {
                    successCallback.invoke(depersonalizeStates.get(result.getData()));
                } else {
                    errorCallback.invoke(Utils.callbackError(result.getError().getMessage(), null));
                }
            }
        });
    }

    @ReactMethod
    public void depersonalizeInstallation(final String pushRegistrationId, final Callback successCallback, final Callback errorCallback) {
        if (pushRegistrationId.isEmpty()) {
            errorCallback.invoke(Utils.callbackError("Cannot resolve pushRegistrationId from arguments", null));
            return;
        }
        mobileMessaging().depersonalizeInstallation(pushRegistrationId, installationsResultListener(successCallback, errorCallback));
    }

    @ReactMethod
    public void setInstallationAsPrimary(final String pushRegistrationId, final Boolean primary, final Callback successCallback, final Callback errorCallback) {

        if (pushRegistrationId.isEmpty()) {
            errorCallback.invoke(Utils.callbackError("Cannot resolve pushRegistrationId from arguments", null));
            return;
        }
        mobileMessaging().setInstallationAsPrimary(pushRegistrationId, primary, installationsResultListener(successCallback, errorCallback));
    }

    @NonNull
    private MobileMessaging.ResultListener<List<Installation>> installationsResultListener(final Callback successCallback, final Callback errorCallback) {
        return new MobileMessaging.ResultListener<List<Installation>>() {
            @Override
            public void onResult(Result<List<Installation>, MobileMessagingError> result) {
                if (result.isSuccess()) {
                    ReadableArray readableArray = InstallationJson.toReadableArray(result.getData());
                    successCallback.invoke(readableArray);
                } else {
                    errorCallback.invoke(Utils.callbackError(result.getError().getMessage(), null));
                }
            }
        };
    }

    private MobileMessaging mobileMessaging() {
        return MobileMessaging.getInstance(this.reactContext.getApplicationContext());
    }


    private MobileInbox mobileMessagingInbox() {
        return MobileInbox.getInstance(this.reactContext.getApplicationContext());
    }

    /* Messages and Notifications management */

    @ReactMethod
    public void markMessagesSeen(final ReadableArray args, final Callback successCallback, final Callback errorCallback) throws JSONException {
        final String[] messageIds = Utils.resolveStringArray(args);
        runInBackground(new Runnable() {
            @Override
            public void run() {
                mobileMessaging().setMessagesSeen(messageIds);
                successCallback.invoke();
            }
        });
    }

    @ReactMethod
    public void registerForAndroidRemoteNotifications() {
        Activity activity = getCurrentActivity();
        if (activity != null && (activity instanceof PermissionAwareActivity)) {
            permissionsRequestManager.isRequiredPermissionsGranted((PermissionAwareActivity) activity, this);
        } else {
            Log.e(Utils.TAG, "Cannot register for remote notifications because activity isn't exist");
        }
    }

    private static void runInBackground(final Runnable runnable) {
        new AsyncTask<Void, Void, Void>() {

            @Override
            protected Void doInBackground(Void... params) {
                runnable.run();
                return null;
            }
        }.execute();
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_find(String messageId, final Callback callback) throws JSONException {
        MessageStore messageStore = MobileMessaging.getInstance(reactContext).getMessageStore();
        if (messageStore == null) {
            callback.invoke();
            return;
        }

        for (Message m : messageStore.findAll(reactContext)) {
            if (messageId.equals(m.getMessageId())) {
                callback.invoke(ReactNativeJson.convertJsonToMap(MessageJson.toJSON(m)));
                return;
            }
        }
        callback.invoke();
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_findAll(final Callback callback) throws JSONException {
        MessageStore messageStore = MobileMessaging.getInstance(reactContext).getMessageStore();
        if (messageStore == null) {
            callback.invoke();
            return;
        }
        List<Message> messages = messageStore.findAll(reactContext);
        callback.invoke(ReactNativeJson.convertJsonToArray(MessageJson.toJSONArray(messages.toArray(new Message[messages.size()]))));
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_delete(String messageId, final Callback callback) throws JSONException {
        MessageStore messageStore = MobileMessaging.getInstance(reactContext).getMessageStore();
        if (messageStore == null) {
            callback.invoke();
            return;
        }

        List<Message> messagesToKeep = new ArrayList<Message>();
        for (Message m : messageStore.findAll(reactContext)) {
            if (messageId.equals(m.getMessageId())) {
                continue;
            }
            messagesToKeep.add(m);
        }
        messageStore.deleteAll(reactContext);
        messageStore.save(reactContext, messagesToKeep.toArray(new Message[messagesToKeep.size()]));
        callback.invoke();
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_deleteAll(final Callback callback) {
        MessageStore messageStore = MobileMessaging.getInstance(reactContext).getMessageStore();
        if (messageStore == null) {
            callback.invoke();
            return;
        }
        messageStore.deleteAll(reactContext);
        callback.invoke();
    }

    /**
     * Message store adapter for JS layer
     */

    public static class MessageStoreAdapter implements MessageStore {

        //NOTE: 'stop' and 'find' events are not needed for android
        private static final String EVENT_MESSAGESTORAGE_START = "messageStorage.start";
        private static final String EVENT_MESSAGESTORAGE_SAVE = "messageStorage.save";
        private static final String EVENT_MESSAGESTORAGE_FIND_ALL = "messageStorage.findAll";

        private static final long SYNC_CALL_TIMEOUT_MS = 30000;
        private static final CopyOnWriteArrayList<JSONArray> messageStorage_findAllResults = new CopyOnWriteArrayList<JSONArray>();

        public static void init(Context context) {
            LocalBroadcastManager.getInstance(context).sendBroadcast(new Intent(EVENT_MESSAGESTORAGE_START));
        }

        @Override
        public List<Message> findAll(Context context) {
            Log.i(Utils.TAG, "MessageStoreAdapter findAll:");

            messageStorage_findAllResults.clear();
            LocalBroadcastManager.getInstance(context).sendBroadcast(new Intent(EVENT_MESSAGESTORAGE_FIND_ALL));
            try {
                if (!messageStorage_findAllResults.isEmpty()) {
                    return MessageJson.resolveMessages(messageStorage_findAllResults.get(0));
                }
            } catch (Exception e) {
                Log.e(Utils.TAG, "Cannot find messages: " + e);
            }
            return new CopyOnWriteArrayList<Message>();
        }

        @Override
        public long countAll(Context context) {
            return findAll(context).size();
        }

        @Override
        public void save(Context context, Message... messages) {
            Log.i(Utils.TAG, "MessageStoreAdapter save messages");
            Intent saveMessageIntent = new Intent(EVENT_MESSAGESTORAGE_SAVE);
            saveMessageIntent
                    .putParcelableArrayListExtra(BroadcastParameter.EXTRA_MESSAGES,
                            MessageBundleMapper
                                    .messagesToBundles(Arrays.asList(messages)));
            LocalBroadcastManager.getInstance(context).sendBroadcast(saveMessageIntent);
        }

        @Override
        public void deleteAll(Context context) {
            Log.e(Utils.TAG, "deleteAll is not implemented because it should not be called from within library");
        }
    }

    /*
       Custom message storage:
       methods to provide results to Native Bridge.
       Need to be called from JS part.
    */

    @ReactMethod
    void messageStorage_provideFindAllResult(ReadableArray result) {

        MessageStoreAdapter.init(getReactApplicationContext());

        try {
            MessageStoreAdapter.messageStorage_findAllResults.addIfAbsent(ReactNativeJson.convertArrayToJson(result));
        } catch (JSONException e) {
            Log.e(Utils.TAG, "Provided results can't be parsed");
        }
    }

    @ReactMethod
    void messageStorage_provideFindResult(ReadableMap result) {
        //not needed for android
    }

    private final Utils.ReactNativeCallContext showErrorDialogContext = new Utils.ReactNativeCallContext();

    // ActivityEventListener

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (requestCode != Utils.REQ_CODE_RESOLVE_GOOGLE_ERROR) {
            return;
        }

        if (!showErrorDialogContext.isValid()) {
            Log.e(Utils.TAG, "Show dialog context is invalid, cannot forward information to React Native");
            return;
        }

        Callback successCallback = showErrorDialogContext.onSuccess;
        Callback errorCallback = showErrorDialogContext.onError;

        showErrorDialogContext.reset();
        reactContext.removeActivityEventListener(this);

        GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();
        int playServicesAvailabilityResult = googleApiAvailability.isGooglePlayServicesAvailable(reactContext);
        if (playServicesAvailabilityResult != ConnectionResult.SUCCESS) {
            try {
                showDialogForError(playServicesAvailabilityResult, successCallback, errorCallback);
            } catch (JSONException e) {
                errorCallback.invoke(e.getMessage());
            }
        } else {
            successCallback.invoke();
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
    }

    @ReactMethod
    void showDialogForError(final int errorCode, final Callback successCallback, final Callback errorCallback) throws JSONException {
        GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();
        if (!googleApiAvailability.isUserResolvableError(errorCode)) {
            errorCallback.invoke(Utils.callbackError("Error code [" + errorCode + "] is not user resolvable", null));
            return;
        }

        showErrorDialogContext.onSuccess = successCallback;
        showErrorDialogContext.onError = errorCallback;
        reactContext.addActivityEventListener(this);

        googleApiAvailability
                .getErrorDialog(
                        reactContext.getCurrentActivity(),
                        errorCode,
                        Utils.REQ_CODE_RESOLVE_GOOGLE_ERROR,
                        new DialogInterface.OnCancelListener() {
                            @Override
                            public void onCancel(DialogInterface dialog) {
                                showErrorDialogContext.reset();
                                errorCallback.invoke(Utils.callbackError("Error dialog was cancelled by user", null));
                            }
                        })
                .show();
    }

    @ReactMethod
    public void submitEvent(ReadableMap args, final Callback errorCallback) throws JSONException {
        final CustomEvent event = CustomEventJson.fromJSON(ReactNativeJson.convertMapToJson(args));
        mobileMessaging().submitEvent(event);
    }

    @ReactMethod
    public void submitEventImmediately(ReadableMap args, final Callback successCallback, final Callback errorCallback) throws JSONException {
        final CustomEvent customEvent = CustomEventJson.fromJSON(ReactNativeJson.convertMapToJson(args));
        mobileMessaging().submitEvent(customEvent, customEventResultListener(successCallback, errorCallback));
    }

    @NonNull
    private MobileMessaging.ResultListener<CustomEvent> customEventResultListener(final Callback successCallback, final Callback errorCallback) {
        return new MobileMessaging.ResultListener<CustomEvent>() {
            @Override
            public void onResult(Result<CustomEvent, MobileMessagingError> result) {
                if (result.isSuccess()) {
                    successCallback.invoke();
                } else {
                    errorCallback.invoke(Utils.callbackError(result.getError().getMessage(), null));
                }
            }
        };
    }

    // PermissionsRequester for Post Notifications Permission

    @Override
    public boolean onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == PermissionsRequestManager.REQ_CODE_POST_NOTIFICATIONS_PERMISSIONS) {
            permissionsRequestManager.onRequestPermissionsResult(permissions, grantResults);
        }
        return true;
    }

    @Override
    public void onPermissionGranted() {
        Log.i(Utils.TAG, "Post Notifications permission granted");
    }

    @NonNull
    @Override
    public String[] requiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return new String[]{Manifest.permission.POST_NOTIFICATIONS};
        }
        return new String[0];
    }

    @Override
    public boolean shouldShowPermissionsNotGrantedDialogIfShownOnce() {
        return true;
    }

    @Override
    public int permissionsNotGrantedDialogTitle() {
        return org.infobip.mobile.messaging.resources.R.string.mm_post_notifications_settings_title;
    }

    @Override
    public int permissionsNotGrantedDialogMessage() {
        return org.infobip.mobile.messaging.resources.R.string.mm_post_notifications_settings_message;
    }
}
