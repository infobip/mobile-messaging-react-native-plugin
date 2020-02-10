package org.infobip.reactlibrary.mobilemessaging;

import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import com.facebook.react.bridge.Callback;

import org.infobip.mobile.messaging.Message;
import org.infobip.mobile.messaging.MobileMessaging;
import org.infobip.mobile.messaging.NotificationSettings;
import org.infobip.mobile.messaging.storage.MessageStore;
import org.infobip.mobile.messaging.storage.SQLiteMessageStore;

import android.annotation.SuppressLint;
import android.content.IntentFilter;
import android.graphics.Color;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import android.os.AsyncTask;
import android.util.Log;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import org.infobip.reactlibrary.mobilemessaging.datamappers.InstallationJson;
import org.infobip.reactlibrary.mobilemessaging.datamappers.MessageJson;
import org.infobip.reactlibrary.mobilemessaging.datamappers.PersonalizationCtx;
import org.infobip.reactlibrary.mobilemessaging.datamappers.ReactNativeJson;
import org.infobip.reactlibrary.mobilemessaging.datamappers.UserJson;

import org.infobip.mobile.messaging.BroadcastParameter;
import org.infobip.mobile.messaging.Event;
import org.infobip.mobile.messaging.Installation;
import org.infobip.mobile.messaging.MobileMessagingProperty;
import org.infobip.mobile.messaging.SuccessPending;
import org.infobip.mobile.messaging.User;
import org.infobip.mobile.messaging.geo.GeoEvent;
import org.infobip.mobile.messaging.geo.MobileGeo;
import org.infobip.mobile.messaging.interactive.InteractiveEvent;
import org.infobip.mobile.messaging.interactive.MobileInteractive;
import org.infobip.mobile.messaging.interactive.NotificationAction;
import org.infobip.mobile.messaging.interactive.NotificationCategory;
import org.infobip.mobile.messaging.logging.MobileMessagingLogger;
import org.infobip.mobile.messaging.mobile.InternalSdkError;
import org.infobip.mobile.messaging.mobile.Result;
import org.infobip.mobile.messaging.mobile.MobileMessagingError;
import org.infobip.mobile.messaging.util.PreferenceHelper;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class ReactNativeMobileMessagingModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
    public static final String MODULE_NAME = "ReactNativeMobileMessaging";

    private final ReactApplicationContext reactContext;

    public ReactNativeMobileMessagingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        registerBroadcastReceiver();
        reactContext.addLifecycleEventListener(this);
    }

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
        reactContext.unregisterReceiver(commonLibraryBroadcastReceiver);
        reactContext.unregisterReceiver(messageActionReceiver);
        reactContext.removeLifecycleEventListener(this);
    }

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

    private static final Map<String, String> broadcastEventMap = new HashMap<String, String>() {{
        put(Event.TOKEN_RECEIVED.getKey(), EVENT_TOKEN_RECEIVED);
        put(Event.REGISTRATION_CREATED.getKey(), EVENT_REGISTRATION_UPDATED);
        put(Event.INSTALLATION_UPDATED.getKey(), EVENT_INSTALLATION_UPDATED);
        put(Event.USER_UPDATED.getKey(), EVENT_USER_UPDATED);
        put(Event.PERSONALIZED.getKey(), EVENT_PERSONALIZED);
        put(Event.DEPERSONALIZED.getKey(), EVENT_DEPERSONALIZED);
        put(GeoEvent.GEOFENCE_AREA_ENTERED.getKey(), EVENT_GEOFENCE_ENTERED);
        put(InteractiveEvent.NOTIFICATION_ACTION_TAPPED.getKey(), EVENT_NOTIFICATION_ACTION_TAPPED);
    }};

    private static final Map<String, String> messageBroadcastEventMap = new HashMap<String, String>() {{
        put(Event.MESSAGE_RECEIVED.getKey(), EVENT_MESSAGE_RECEIVED);
        put(Event.NOTIFICATION_TAPPED.getKey(), EVENT_NOTIFICATION_TAPPED);
    }};

    private final BroadcastReceiver messageActionReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String event = messageBroadcastEventMap.get(intent.getAction());
            if (event == null) {
                Log.w(Utils.TAG, "Cannot process event for broadcast: " + intent.getAction());
                return;
            }

            JSONObject message = MessageJson.bundleToJSON(intent.getExtras());
            ReactNativeEvent.send(event, reactContext, message);
        }
    };

    private final BroadcastReceiver commonLibraryBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {

            String event = broadcastEventMap.get(intent.getAction());
            if (event == null) {
                Log.w(Utils.TAG, "Cannot process event for broadcast: " + intent.getAction());
                return;
            }

            if (GeoEvent.GEOFENCE_AREA_ENTERED.getKey().equals(intent.getAction())) {
                for (JSONObject geo : MessageJson.geosFromBundle(intent.getExtras())) {
                    ReactNativeEvent.send(event, reactContext, geo);
                }
                return;
            }

            if (InteractiveEvent.NOTIFICATION_ACTION_TAPPED.getKey().equals(intent.getAction())) {
                Message message = Message.createFrom(intent.getExtras());
                NotificationAction notificationAction = NotificationAction.createFrom(intent.getExtras());
                ReactNativeEvent.send(event, reactContext, MessageJson.toJSON(message), notificationAction.getId(), notificationAction.getInputText());
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
            }

            if (data == null) {
                ReactNativeEvent.send(event, reactContext);
            } else {
                ReactNativeEvent.send(event, reactContext, data);
            }
        }
    };

    @ReactMethod
    public void init(ReadableMap args, final Callback successCallback, final Callback errorCallback) throws JSONException {
        final Configuration configuration = Configuration.resolveConfiguration(ReactNativeJson.convertMapToJson(args));

        final Application context = (Application) reactContext.getApplicationContext();

        if (configuration.loggingEnabled) {
            MobileMessagingLogger.enforce();
        }

        PreferenceHelper.saveString(context, MobileMessagingProperty.SYSTEM_DATA_VERSION_POSTFIX, "reactNative " + configuration.reactNativePluginVersion);

        MobileMessaging.Builder builder = new MobileMessaging.Builder(context)
                .withApplicationCode(configuration.applicationCode);

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
            MessageStoreAdapter.reactContext = reactContext;
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
        }

        builder.build(new MobileMessaging.InitListener() {
            @SuppressLint("MissingPermission")
            @Override
            public void onSuccess() {
                if (configuration.geofencingEnabled) {
                    MobileGeo.getInstance(context).activateGeofencing();
                }

                NotificationCategory categories[] = notificationCategoriesFromConfiguration(configuration.notificationCategories);
                if (categories.length > 0) {
                    MobileInteractive.getInstance(context).setNotificationCategories(categories);
                }

                successCallback.invoke();
            }

            @Override
            public void onError(InternalSdkError e, @Nullable Integer googleErrorCode) {
                errorCallback.invoke(e.get(), googleErrorCode);
                Log.e(Utils.TAG, "Cannot start SDK: " + e.get() + " errorCode: " + googleErrorCode);
            }
        });
    }

    private void registerBroadcastReceiver() {

        IntentFilter commonLibIntentFilter = new IntentFilter();
        for (String action : broadcastEventMap.keySet()) {
            commonLibIntentFilter.addAction(action);
        }

        reactContext.registerReceiver(commonLibraryBroadcastReceiver, commonLibIntentFilter);

        IntentFilter messageActionIntentFilter = new IntentFilter();
        for (String action : messageBroadcastEventMap.keySet()) {
            messageActionIntentFilter.addAction(action);
        }

        reactContext.registerReceiver(messageActionReceiver, messageActionIntentFilter);

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
        Context context = reactContext.getCurrentActivity();
        MessageStore messageStore = MobileMessaging.getInstance(context).getMessageStore();
        if (messageStore == null) {
            onError.invoke("Message store does not exist");
            return;
        }

        for (Message m : messageStore.findAll(context)) {
            if (messageId.equals(m.getMessageId())) {
                onSuccess.invoke(ReactNativeJson.convertJsonToMap(MessageJson.toJSON(m)));
                return;
            }
        }
        onSuccess.invoke();
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_findAll(final Callback onSuccess, final Callback onError) throws JSONException {
        Context context = reactContext.getCurrentActivity();
        MessageStore messageStore = MobileMessaging.getInstance(context).getMessageStore();
        if (messageStore == null) {
            onError.invoke("Message store does not exist");
            return;
        }
        List<Message> messages = messageStore.findAll(context);
        onSuccess.invoke(ReactNativeJson.convertJsonToArray(MessageJson.toJSONArray(messages.toArray(new Message[messages.size()]))));
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_delete(String messageId, final Callback onSuccess, final Callback onError) throws JSONException {
        Context context = reactContext.getCurrentActivity();
        MessageStore messageStore = MobileMessaging.getInstance(context).getMessageStore();
        if (messageStore == null) {
            onError.invoke("Message store does not exist");
            return;
        }

        List<Message> messagesToKeep = new ArrayList<Message>();
        for (Message m : messageStore.findAll(context)) {
            if (messageId.equals(m.getMessageId())) {
                continue;
            }
            messagesToKeep.add(m);
        }
        messageStore.deleteAll(context);
        messageStore.save(context, messagesToKeep.toArray(new Message[messagesToKeep.size()]));
        onSuccess.invoke();
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_deleteAll(final Callback onSuccess, final Callback onError) {
        Context context = reactContext.getCurrentActivity();
        MessageStore messageStore = MobileMessaging.getInstance(context).getMessageStore();
        if (messageStore == null) {
            onError.invoke("Message store does not exist");
            return;
        }
        messageStore.deleteAll(context);
        onSuccess.invoke();
    }


    /*User Profile Management*/

    @ReactMethod
    public void saveUser(ReadableMap args, final Callback successCallback, final Callback errorCallback) throws JSONException {
        final User user = UserJson.resolveUser(ReactNativeJson.convertMapToJson(args));
        mobileMessaging().saveUser(user, userResultListener(successCallback, errorCallback));
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
                    errorCallback.invoke(result.getError().getMessage());
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
                    errorCallback.invoke(result.getError().getMessage());
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
        final PersonalizationCtx ctx = PersonalizationCtx.resolvePersonalizationCtx(ReactNativeJson.convertMapToJson(args));
        mobileMessaging().personalize(ctx.userIdentity, ctx.userAttributes, ctx.forceDepersonalize, new MobileMessaging.ResultListener<User>() {
            @Override
            public void onResult(Result<User, MobileMessagingError> result) {
                if (result.isSuccess()) {
                    ReadableMap readableMap = UserJson.toReadableMap(result.getData());
                    successCallback.invoke(readableMap);
                } else {
                    errorCallback.invoke(result.getError().getMessage());
                }
            }
        });
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
                    errorCallback.invoke(result.getError().getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void depersonalizeInstallation(final String pushRegistrationId, final Callback successCallback, final Callback errorCallback) {
        if (pushRegistrationId.isEmpty()) {
            errorCallback.invoke("Cannot resolve pushRegistrationId from arguments");
            return;
        }
        mobileMessaging().depersonalizeInstallation(pushRegistrationId, installationsResultListener(successCallback, errorCallback));
    }

    @ReactMethod
    public void setInstallationAsPrimary(final String pushRegistrationId, final Boolean primary, final Callback successCallback, final Callback errorCallback) {

        if (pushRegistrationId.isEmpty()) {
            errorCallback.invoke("Cannot resolve pushRegistrationId from arguments");
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
                    errorCallback.invoke(result.getError().getMessage());
                }
            }
        };
    }

    private MobileMessaging mobileMessaging() {
        return MobileMessaging.getInstance(this.reactContext.getApplicationContext());
    }

    /* Messages and Notifications management */

    @ReactMethod
    public void markMessagesSeen(final ReadableArray args, final Callback callback) throws JSONException {
        final String[] messageIds = Utils.resolveStringArray(args);
        runInBackground(new Runnable() {
            @Override
            public void run() {
                mobileMessaging().setMessagesSeen(messageIds);
                callback.invoke();
            }
        });
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
        Context context = reactContext.getCurrentActivity();
        MessageStore messageStore = MobileMessaging.getInstance(context).getMessageStore();
        if (messageStore == null) {
            callback.invoke();
            return;
        }

        for (Message m : messageStore.findAll(context)) {
            if (messageId.equals(m.getMessageId())) {
                callback.invoke(ReactNativeJson.convertJsonToMap(MessageJson.toJSON(m)));
                return;
            }
        }
        callback.invoke();
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_findAll(final Callback callback) throws JSONException {
        Context context = reactContext.getCurrentActivity();
        MessageStore messageStore = MobileMessaging.getInstance(context).getMessageStore();
        if (messageStore == null) {
            callback.invoke();
            return;
        }
        List<Message> messages = messageStore.findAll(context);
        callback.invoke(ReactNativeJson.convertJsonToArray(MessageJson.toJSONArray(messages.toArray(new Message[messages.size()]))));
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_delete(String messageId, final Callback callback) throws JSONException {
        Context context = reactContext.getCurrentActivity();
        MessageStore messageStore = MobileMessaging.getInstance(context).getMessageStore();
        if (messageStore == null) {
            callback.invoke();
            return;
        }

        List<Message> messagesToKeep = new ArrayList<Message>();
        for (Message m : messageStore.findAll(context)) {
            if (messageId.equals(m.getMessageId())) {
                continue;
            }
            messagesToKeep.add(m);
        }
        messageStore.deleteAll(context);
        messageStore.save(context, messagesToKeep.toArray(new Message[messagesToKeep.size()]));
        callback.invoke();
    }

    @ReactMethod
    public synchronized void defaultMessageStorage_deleteAll(final Callback callback) {
        Context context = reactContext.getCurrentActivity();
        MessageStore messageStore = MobileMessaging.getInstance(context).getMessageStore();
        if (messageStore == null) {
            callback.invoke();
            return;
        }
        messageStore.deleteAll(context);
        callback.invoke();
    }

    /**
     * Message store adapter for JS layer
     */

    //TODO: CacheManager not used, mb needed?
    public static class MessageStoreAdapter implements MessageStore {

        //NOTE: 'stop' and 'find' events are not needed for android
        private static final String EVENT_MESSAGESTORAGE_START = "messageStorage.start";
        private static final String EVENT_MESSAGESTORAGE_SAVE = "messageStorage.save";
        private static final String EVENT_MESSAGESTORAGE_FIND_ALL = "messageStorage.findAll";

        static ReactApplicationContext reactContext;
        private static final long SYNC_CALL_TIMEOUT_MS = 30000;
        private static final List<JSONArray> messageStorage_findAllResults = new LinkedList<JSONArray>();

        public MessageStoreAdapter() {
            ReactNativeEvent.send(EVENT_MESSAGESTORAGE_START, reactContext);
        }

        @Override
        public List<Message> findAll(Context context) {
            synchronized (messageStorage_findAllResults) {
                messageStorage_findAllResults.clear();
                ReactNativeEvent.send(EVENT_MESSAGESTORAGE_FIND_ALL, reactContext);
                try {
                    messageStorage_findAllResults.wait(SYNC_CALL_TIMEOUT_MS);
                    if (!messageStorage_findAllResults.isEmpty()) {
                        return MessageJson.resolveMessages(messageStorage_findAllResults.get(0));
                    }
                } catch (Exception e) {
                    Log.e(Utils.TAG, "Cannot find messages: " + e);
                }
                return new ArrayList<Message>();
            }
        }

        @Override
        public long countAll(Context context) {
            return findAll(context).size();
        }

        @Override
        public void save(Context context, Message... messages) {
            try {
                ReactNativeEvent.send(EVENT_MESSAGESTORAGE_SAVE, reactContext, ReactNativeJson.convertJsonToArray(MessageJson.toJSONArray(messages)));
            } catch (JSONException e) {
                ReactNativeEvent.send(EVENT_MESSAGESTORAGE_SAVE, reactContext);
            }
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
        synchronized (MessageStoreAdapter.messageStorage_findAllResults) {
            try {
                MessageStoreAdapter.messageStorage_findAllResults.add(ReactNativeJson.convertArrayToJson(result));
            } catch (JSONException e) {
                Log.e(Utils.TAG, "Provided results can't be parsed");
            }
            MessageStoreAdapter.messageStorage_findAllResults.notifyAll();
        }
    }

    @ReactMethod
    void messageStorage_provideFindResult(ReadableMap result) {
        //not needed for android
    }

}
