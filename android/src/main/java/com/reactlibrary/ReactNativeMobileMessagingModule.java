package com.reactlibrary;

import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
//import com.facebook.react.module.annotations.ReactModule;

import com.facebook.react.bridge.Callback;

import org.infobip.mobile.messaging.Message;
import org.infobip.mobile.messaging.MobileMessaging;
import org.infobip.mobile.messaging.NotificationSettings;
import org.infobip.mobile.messaging.storage.SQLiteMessageStore;


//MobileMessaging
import android.annotation.SuppressLint;
import android.content.IntentFilter;
import android.content.res.Resources;
import android.graphics.Color;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

//import android.support.annotation.NonNull;
//import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.ReadableMap;
import com.reactlibrary.userdatamappers.InstallationJson;
import com.reactlibrary.userdatamappers.MessageJson;
import com.reactlibrary.userdatamappers.ReactNativeJson;
import com.reactlibrary.userdatamappers.UserJson;

import org.infobip.mobile.messaging.BroadcastParameter;
import org.infobip.mobile.messaging.Event;
import org.infobip.mobile.messaging.Installation;
import org.infobip.mobile.messaging.MobileMessagingProperty;
import org.infobip.mobile.messaging.User;

import org.infobip.mobile.messaging.geo.GeoEvent;
import org.infobip.mobile.messaging.geo.MobileGeo;
import org.infobip.mobile.messaging.interactive.InteractiveEvent;
import org.infobip.mobile.messaging.interactive.MobileInteractive;
import org.infobip.mobile.messaging.interactive.NotificationAction;
import org.infobip.mobile.messaging.interactive.NotificationCategory;
import org.infobip.mobile.messaging.logging.MobileMessagingLogger;
import org.infobip.mobile.messaging.mobile.InternalSdkError;
import org.infobip.mobile.messaging.util.PreferenceHelper;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


//@ReactModule(name = ReactNativeMobileMessagingModule.MODULE_NAME)
public class  ReactNativeMobileMessagingModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
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
    public void onHostPause() {}

    @Override
    public void onHostDestroy() {
        reactContext.unregisterReceiver(commonLibraryBroadcastReceiver);
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
        put(Event.MESSAGE_RECEIVED.getKey(), EVENT_MESSAGE_RECEIVED);
        put(Event.NOTIFICATION_TAPPED.getKey(), EVENT_NOTIFICATION_TAPPED);
    }};

    private final BroadcastReceiver commonLibraryBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String event = broadcastEventMap.get(intent.getAction());
            Log.e(Utils.TAG, event);
            if (event == null) {
                return;
            }

//TODO: Later
//      if (GeoEvent.GEOFENCE_AREA_ENTERED.getKey().equals(intent.getAction())) {
//        for (JSONObject geo : geosFromBundle(intent.getExtras())) {
//          if (libraryEventReceiver != null) {
//            CallbackEvent.send(event, libraryEventReceiver, geo);
//          }
//        }
//        return;
//      }

            if (InteractiveEvent.NOTIFICATION_ACTION_TAPPED.getKey().equals(intent.getAction())) {
                Message message = Message.createFrom(intent.getExtras());
                NotificationAction notificationAction = NotificationAction.createFrom(intent.getExtras());
                CallbackEvent.send(event, reactContext, MessageJson.toJSON(message), notificationAction.getId(), notificationAction.getInputText());
                return;
            }

            if (Event.INSTALLATION_UPDATED.getKey().equals(intent.getAction())) {
                JSONObject updatedInstallation = InstallationJson.toJSON(Installation.createFrom(intent.getExtras()));
                CallbackEvent.send(event, reactContext, updatedInstallation);
                return;
            }

            if (Event.USER_UPDATED.getKey().equals(intent.getAction()) || Event.PERSONALIZED.getKey().equals(intent.getAction())) {
                JSONObject updatedUser = UserJson.toJSON(User.createFrom(intent.getExtras()));
                CallbackEvent.send(event, reactContext, updatedUser);
                return;
            }

            String data = null;
            if (Event.TOKEN_RECEIVED.getKey().equals(intent.getAction())) {
                data = intent.getStringExtra(BroadcastParameter.EXTRA_CLOUD_TOKEN);
            } else if (Event.REGISTRATION_CREATED.getKey().equals(intent.getAction())) {
                data = intent.getStringExtra(BroadcastParameter.EXTRA_INFOBIP_ID);
            }

            if (data == null) {
                CallbackEvent.send(event, reactContext);
            } else {
                CallbackEvent.send(event, reactContext, data);
            }
        }
    };

    @ReactMethod
    public void init(ReadableMap args, final Callback successCallback, final Callback errorCallback) throws JSONException {
            final Configuration configuration = Configuration.resolveConfiguration(ReactNativeJson.convertMapToJson(args));
            Log.e(Utils.TAG, configuration.applicationCode);

//TODO: check how to request permissions
//    if (configuration.geofencingEnabled && (!cordova.hasPermission(Manifest.permission.ACCESS_FINE_LOCATION) ||
//            ActivityCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED)) {
//      initContext.args = args;
//      initContext.callbackContext = callbackContext;
//      cordova.requestPermission(this, REQ_CODE_LOC_PERMISSION_FOR_INIT, Manifest.permission.ACCESS_FINE_LOCATION);
//      return;
//    }

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

            //TODO: MessageStoreAdapter
    /*if (configuration.messageStorage != null) {
      builder.withMessageStore(MessageStoreAdapter.class);
    } else*/
            if (configuration.defaultMessageStorage) {
                builder.withMessageStore(SQLiteMessageStore.class);
            }

            if (configuration.android != null) {
                NotificationSettings.Builder notificationBuilder = new NotificationSettings.Builder(context);
                if (configuration.android.notificationIcon != null) {
                    int resId = getResId(context.getResources(), configuration.android.notificationIcon, context.getPackageName());
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

        IntentFilter intentFilter = new IntentFilter();
        for (String action : broadcastEventMap.keySet()) {
            intentFilter.addAction(action);
        }

        reactContext.registerReceiver(commonLibraryBroadcastReceiver,intentFilter);

    }

    /**
     * Gets resource ID
     *
     * @param res         the resources where to look for
     * @param resPath     the name of the resource
     * @param packageName name of the package where the resource should be searched for
     * @return resource identifier or 0 if not found
     */
    private int getResId(Resources res, String resPath, String packageName) {
        int resId = res.getIdentifier(resPath, "mipmap", packageName);
        if (resId == 0) {
            resId = res.getIdentifier(resPath, "drawable", packageName);
        }
        if (resId == 0) {
            resId = res.getIdentifier(resPath, "raw", packageName);
        }

        return resId;
    }

    /**
     * Converts notification categories in configuration into library format
     *
     * @param categories notification categories from cordova
     * @return library-understandable categories
     */
    @NonNull
    private NotificationCategory[] notificationCategoriesFromConfiguration(@NonNull List<Configuration.Category> categories) {
        NotificationCategory notificationCategories[] = new NotificationCategory[categories.size()];
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
        NotificationAction notificationActions[] = new NotificationAction[actions.size()];
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

}

