package org.infobip.reactlibrary.mobilemessaging;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Application;
import android.content.*;
import android.graphics.Color;
import android.os.AsyncTask;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.*;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import org.infobip.mobile.messaging.*;
import org.infobip.mobile.messaging.geo.GeoEvent;
import org.infobip.mobile.messaging.geo.MobileGeo;
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
import org.infobip.mobile.messaging.util.PreferenceHelper;
import org.infobip.reactlibrary.mobilemessaging.datamappers.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.*;

public class ReactNativeMobileMessagingModule extends ReactContextBaseJavaModule implements LifecycleEventListener, ActivityEventListener {
    public static final String MODULE_NAME = "ReactNativeMobileMessaging";

    private final ReactApplicationContext reactContext;

    private static volatile Boolean broadcastReceiverRegistered = false;

    public ReactNativeMobileMessagingModule(ReactApplicationContext reactContext) {
        super(reactContext);

        while (getReactApplicationContext() == null);
        reactContext = getReactApplicationContext();

        this.reactContext = reactContext;
        reactContext.addLifecycleEventListener(this);
    }

    @Override
    public void initialize() {
        super.initialize();
        for (CacheManager.Event event : CacheManager.loadEvents(reactContext)) {
            ReactNativeEvent.send(event.type, reactContext, event.object, event.actionId, event.actionInputText);
        }
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
        unregisterBroadcastReceiver();
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
    }};

    private static final Map<String, String> messageBroadcastEventMap = new HashMap<String, String>() {{
        put(Event.MESSAGE_RECEIVED.getKey(), EVENT_MESSAGE_RECEIVED);
        put(Event.NOTIFICATION_TAPPED.getKey(), EVENT_NOTIFICATION_TAPPED);
        put(InteractiveEvent.NOTIFICATION_ACTION_TAPPED.getKey(), EVENT_NOTIFICATION_ACTION_TAPPED);
    }};

    private final BroadcastReceiver messageActionReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String event = getMessageBroadcastEvent(intent);
            if (event == null) {
                Log.w(Utils.TAG, "Cannot process event for broadcast: " + intent.getAction());
                return;
            }
            JSONObject message = MessageJson.bundleToJSON(intent.getExtras());
            if (InteractiveEvent.NOTIFICATION_ACTION_TAPPED.getKey().equals(intent.getAction())) {
                NotificationAction notificationAction = NotificationAction.createFrom(intent.getExtras());
                ReactNativeEvent.send(event, reactContext, message, notificationAction.getId(), notificationAction.getInputText());
            } else {
                ReactNativeEvent.send(event, reactContext, message);
            }
        }
    };

    private static String getMessageBroadcastEvent(Intent intent) {
        if (intent == null || intent.getAction() == null) {
            Log.w(Utils.TAG, "Cannot process event for broadcast, cause intent or action is null");
            return null;
        }
        return messageBroadcastEventMap.get(intent.getAction());
    }

    /*
    For event caching, if plugin not yet initialized
    */

    public static class MessageActionReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            String event = getMessageBroadcastEvent(intent);
            if (event == null) {
                Log.w(Utils.TAG, "Cannot process event for broadcast: " + intent.getAction());
                return;
            }
            JSONObject message = MessageJson.bundleToJSON(intent.getExtras());
            if (!broadcastReceiverRegistered) {
                String actionId = null;
                String actionInputText = null;
                if (InteractiveEvent.NOTIFICATION_ACTION_TAPPED.getKey().equals(intent.getAction())) {
                    NotificationAction notificationAction = NotificationAction.createFrom(intent.getExtras());
                    actionId = notificationAction.getId();
                    actionInputText = notificationAction.getInputText();
                }
                CacheManager.saveEvent(context, event, message, actionId, actionInputText);
            }
        }
    }

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

        if (reactContext == null) {
            Log.i(Utils.TAG, "reactContext: IS NULL");
        } else {
            Log.i(Utils.TAG, "reactContext.toString():");
            Log.i(Utils.TAG, reactContext.toString());
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
                errorCallback.invoke(Utils.callbackError(e.get(), googleErrorCode));
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
        broadcastReceiverRegistered = true;
    }

    private void unregisterBroadcastReceiver() {
        reactContext.unregisterReceiver(commonLibraryBroadcastReceiver);
        reactContext.unregisterReceiver(messageActionReceiver);
        broadcastReceiverRegistered = false;
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
            onError.invoke(Utils.callbackError("Message store does not exist", null));
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
            onError.invoke(Utils.callbackError("Message store does not exist", null));
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
            onError.invoke(Utils.callbackError("Message store does not exist", null));
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
            onError.invoke(Utils.callbackError("Message store does not exist", null));
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
        int playServicesAvailabilityResult = googleApiAvailability.isGooglePlayServicesAvailable(getCurrentActivity());
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
}
