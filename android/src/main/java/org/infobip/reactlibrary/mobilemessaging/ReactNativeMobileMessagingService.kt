//
//  ReactNativeMobileMessagingService.kt
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.Application
import android.content.BroadcastReceiver
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log

import androidx.localbroadcastmanager.content.LocalBroadcastManager

import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability

import org.infobip.mobile.messaging.BroadcastParameter
import org.infobip.mobile.messaging.CustomEvent
import org.infobip.mobile.messaging.Event
import org.infobip.mobile.messaging.Installation
import org.infobip.mobile.messaging.Message
import org.infobip.mobile.messaging.MobileMessaging
import org.infobip.mobile.messaging.MobileMessagingProperty
import org.infobip.mobile.messaging.NotificationSettings
import org.infobip.mobile.messaging.SuccessPending
import org.infobip.mobile.messaging.User
import org.infobip.mobile.messaging.chat.InAppChat
import org.infobip.mobile.messaging.chat.core.InAppChatEvent
import org.infobip.mobile.messaging.dal.bundle.MessageBundleMapper
import org.infobip.mobile.messaging.inbox.Inbox
import org.infobip.mobile.messaging.inbox.InboxMapper
import org.infobip.mobile.messaging.inbox.MobileInbox
import org.infobip.mobile.messaging.inbox.MobileInboxFilterOptionsJson
import org.infobip.mobile.messaging.interactive.InteractiveEvent
import org.infobip.mobile.messaging.interactive.MobileInteractive
import org.infobip.mobile.messaging.interactive.NotificationAction
import org.infobip.mobile.messaging.interactive.NotificationCategory
import org.infobip.mobile.messaging.logging.MobileMessagingLogger
import org.infobip.mobile.messaging.mobileapi.InternalSdkError
import org.infobip.mobile.messaging.mobileapi.MobileMessagingError
import org.infobip.mobile.messaging.mobileapi.Result
import org.infobip.mobile.messaging.plugins.CustomEventJson
import org.infobip.mobile.messaging.plugins.MessageJson
import org.infobip.mobile.messaging.plugins.PersonalizationCtx
import org.infobip.mobile.messaging.plugins.UserJson
import org.infobip.mobile.messaging.storage.MessageStore
import org.infobip.mobile.messaging.storage.SQLiteMessageStore
import org.infobip.mobile.messaging.util.Cryptor
import org.infobip.mobile.messaging.util.DeviceInformation
import org.infobip.mobile.messaging.util.PreferenceHelper
import org.infobip.mobile.messaging.plugins.InstallationJson

import org.infobip.reactlibrary.mobilemessaging.datamappers.ReactNativeJson
import org.infobip.reactlibrary.mobilemessaging.ReactNativeBroadcastReceiver

import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.util.*
import java.util.concurrent.CopyOnWriteArrayList
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlin.collections.isNotEmpty

class ReactNativeMobileMessagingService(
    private val reactContext: ReactApplicationContext
) : PermissionsRequestManager.PermissionsRequester, PermissionListener, ActivityEventListener {

    companion object {

        // Event constants
        const val EVENT_TOKEN_RECEIVED = "tokenReceived"
        const val EVENT_REGISTRATION_UPDATED = "registrationUpdated"
        const val EVENT_INSTALLATION_UPDATED = "installationUpdated"
        const val EVENT_USER_UPDATED = "userUpdated"
        const val EVENT_PERSONALIZED = "personalized"
        const val EVENT_DEPERSONALIZED = "depersonalized"

        const val EVENT_NOTIFICATION_TAPPED = "notificationTapped"
        const val EVENT_NOTIFICATION_ACTION_TAPPED = "actionTapped"
        const val EVENT_MESSAGE_RECEIVED = "messageReceived"

        const val EVENT_INAPPCHAT_UNREAD_MESSAGES_COUNT_UPDATED = "inAppChat.unreadMessageCounterUpdated"
        const val EVENT_INAPPCHAT_VIEW_STATE_CHANGED = "inAppChat.viewStateChanged"
        const val EVENT_INAPPCHAT_CONFIGURATION_SYNCED = "inAppChat.configurationSynced"
        const val EVENT_INAPPCHAT_LIVECHAT_REGISTRATION_ID_UPDATED = "inAppChat.livechatRegistrationIdUpdated"
        const val EVENT_INAPPCHAT_AVAILABILITY_UPDATED = "inAppChat.availabilityUpdated"

        @JvmStatic
        @Volatile
        var jsHasListeners = false

        @JvmStatic
        @Volatile
        var pluginInitialized = false

        @Volatile
        var lastReactContext: ReactApplicationContext? = null

        @Volatile
        private var broadcastReceiverRegistered = false

        @JvmStatic
        fun registerService(context: ReactApplicationContext) {
            lastReactContext = context
        }

        @JvmStatic
        fun unregisterService(context: ReactApplicationContext) {
            if (lastReactContext === context) {
                lastReactContext = null
            }
        }

        // Event mappings
        private val messageStorageEventMap = mapOf(
            MessageStoreAdapter.EVENT_MESSAGESTORAGE_START to MessageStoreAdapter.EVENT_MESSAGESTORAGE_START,
            MessageStoreAdapter.EVENT_MESSAGESTORAGE_SAVE to MessageStoreAdapter.EVENT_MESSAGESTORAGE_SAVE,
            MessageStoreAdapter.EVENT_MESSAGESTORAGE_FIND_ALL to MessageStoreAdapter.EVENT_MESSAGESTORAGE_FIND_ALL
        )

        private val broadcastEventMap = mapOf(
            Event.TOKEN_RECEIVED.key to EVENT_TOKEN_RECEIVED,
            Event.REGISTRATION_CREATED.key to EVENT_REGISTRATION_UPDATED,
            Event.INSTALLATION_UPDATED.key to EVENT_INSTALLATION_UPDATED,
            Event.USER_UPDATED.key to EVENT_USER_UPDATED,
            Event.PERSONALIZED.key to EVENT_PERSONALIZED,
            Event.DEPERSONALIZED.key to EVENT_DEPERSONALIZED
        )

        private fun getMessageStorageBroadcastEvent(intent: Intent?): String? {
            if (intent?.action == null) {
                Log.w(Utils.TAG, "Cannot process event for broadcast, cause intent or action is null")
                return null
            }
            return messageStorageEventMap[intent.action]
        }
    }

    private val mobileMessaging: MobileMessaging
        get() = MobileMessaging.getInstance(reactContext.applicationContext)
    private val permissionsRequestManager: PermissionsRequestManager = PermissionsRequestManager(this)
    private val showErrorDialogContext = Utils.ReactNativeCallContext()

    init {
        registerService(reactContext)
    }

    private val messageStorageReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val event = getMessageStorageBroadcastEvent(intent)
            if (event == null) {
                Log.w(Utils.TAG, "Cannot process event for messageStorageReceiver: ${intent.action}")
                return
            }
            Log.i(Utils.TAG, "messageStorageReceiver event: $event")
            if (intent.extras == null) {
                ReactNativeEvent.send(event, reactContext)
                return
            }
            val messages = Message.createFrom(intent.getParcelableArrayListExtra<Bundle>(BroadcastParameter.EXTRA_MESSAGES))
            if (messages == null) {
                Log.w(Utils.TAG, "messageStorageReceiver messages is null")
                ReactNativeEvent.send(event, reactContext)
                return
            }
            Log.i(Utils.TAG, "messageStorageReceiver messages: $messages")
            try {
                ReactNativeEvent.send(event, reactContext, ReactNativeJson.convertJsonToArray(MessageJson.toJSONArray(messages.toTypedArray())))
            } catch (e: JSONException) {
                ReactNativeEvent.send(event, reactContext)
            }
        }
    }

    private val commonLibraryBroadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val event = broadcastEventMap[intent.action]
            if (event == null) {
                Log.w(Utils.TAG, "Cannot process event for broadcast: ${intent.action}")
                return
            }

            if (Event.INSTALLATION_UPDATED.key == intent.action) {
                val updatedInstallation = InstallationJson.toJSON(Installation.createFrom(intent.extras))
                ReactNativeEvent.send(event, reactContext, updatedInstallation)
                return
            }

            if (Event.USER_UPDATED.key == intent.action || Event.PERSONALIZED.key == intent.action) {
                val updatedUser = UserJson.toJSON(User.createFrom(intent.extras))
                ReactNativeEvent.send(event, reactContext, updatedUser)
                return
            }

            if (Event.DEPERSONALIZED.key == intent.action) {
                ReactNativeEvent.send(event, reactContext)
                return
            }

            var data: String? = null
            when (intent.action) {
                Event.TOKEN_RECEIVED.key -> {
                    data = intent.getStringExtra(BroadcastParameter.EXTRA_CLOUD_TOKEN)
                }
                Event.REGISTRATION_CREATED.key -> {
                    data = intent.getStringExtra(BroadcastParameter.EXTRA_INFOBIP_ID)
                }
            }

            if (data == null) {
                ReactNativeEvent.send(event, reactContext)
            } else {
                ReactNativeEvent.send(event, reactContext, data)
            }
        }
    }

    private var _chatBroadcastReceiver: BroadcastReceiver? = null
    private val chatBroadcastReceiver: BroadcastReceiver
        get() = _chatBroadcastReceiver ?: RNMMChatService.getChatBroadcastReceiver(reactContext).also { _chatBroadcastReceiver = it }

    private val chatBroadcastReceiverIntentFilter: IntentFilter by lazy { RNMMChatService.getChatBroadcastIntentFilter() }

    fun init(args: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        try {
            Log.d(Utils.TAG, "Init mobile messaging...")
            val configuration = Configuration.resolveConfiguration(ReactNativeJson.convertMapToJson(args))
            ConfigCache.configuration = configuration

            val context = reactContext.applicationContext as Application

            if (configuration.loggingEnabled) {
                MobileMessagingLogger.enforce()
            }

            PreferenceHelper.saveString(context, MobileMessagingProperty.SYSTEM_DATA_VERSION_POSTFIX, "reactNative ${configuration.reactNativePluginVersion}")

            val builder = MobileMessaging.Builder(context)
                .withoutRegisteringForRemoteNotifications()
                .withApplicationCode(configuration.applicationCode)

            if (configuration.fullFeaturedInAppsEnabled) {
                builder.withFullFeaturedInApps()
            }
            if (configuration.privacySettings.userDataPersistingDisabled) {
                builder.withoutStoringUserData()
            }
            if (configuration.privacySettings.carrierInfoSendingDisabled) {
                builder.withoutCarrierInfo()
            }
            if (configuration.privacySettings.systemInfoSendingDisabled) {
                builder.withoutSystemInfo()
            }

            if (configuration.messageStorage != null) {
                MessageStoreAdapter.init(context)
                builder.withMessageStore(MessageStoreAdapter::class.java)
            } else if (configuration.defaultMessageStorage) {
                builder.withMessageStore(SQLiteMessageStore::class.java)
            }

            configuration.android?.let { androidConfig ->
                val notificationBuilder = NotificationSettings.Builder(context)

                androidConfig.notificationIcon?.let { icon ->
                    val resId = Utils.getResId(context.resources, icon, context.packageName)
                    if (resId != 0) {
                        notificationBuilder.withDefaultIcon(resId)
                    }
                }

                if (androidConfig.multipleNotifications) {
                    notificationBuilder.withMultipleNotifications()
                }

                androidConfig.notificationAccentColor?.let { color ->
                    val parsedColor = Color.parseColor(color)
                    notificationBuilder.withColor(parsedColor)
                }

                val notificationChannelId = androidConfig.notificationChannelId
                val notificationChannelName = androidConfig.notificationChannelName
                val notificationSound = androidConfig.notificationSound
                if (notificationChannelId != null && notificationChannelName != null && notificationSound != null) {
                    builder.withCustomNotificationChannel(notificationChannelId, notificationChannelName, notificationSound)
                }

                builder.withDisplayNotification(notificationBuilder.build())

                androidConfig.firebaseOptions?.let { options ->
                    builder.withFirebaseOptions(options)
                }
            }

            configuration.userDataJwt?.let { jwt ->
                builder.withJwtSupplier { jwt }
            }

            var cryptor: Cryptor? = null
            try {
                val cls = Class.forName("org.infobip.mobile.messaging.cryptor.ECBCryptorImpl")
                cryptor = cls.getDeclaredConstructor(String::class.java).newInstance(DeviceInformation.getDeviceID(context)) as Cryptor
            } catch (e: Exception) {
                Log.d(Utils.TAG, "Will not migrate cryptor :")
                e.printStackTrace()
            }
            cryptor?.let { c ->
                builder.withCryptorMigration(c)
            }

            builder.build(object : MobileMessaging.InitListener {
                @SuppressLint("MissingPermission")
                override fun onSuccess() {
                    val categories = notificationCategoriesFromConfiguration(configuration.notificationCategories)
                    if (categories.isNotEmpty()) {
                        MobileInteractive.getInstance(context).setNotificationCategories(*categories)
                    }
                    successCallback.invoke()
                }

                override fun onError(e: InternalSdkError, googleErrorCode: Int?) {
                    errorCallback.invoke(Utils.callbackError(e.get(), googleErrorCode))
                    Log.e(Utils.TAG, "Cannot start SDK: ${e.get()} errorCode: $googleErrorCode")
                }
            })

            if (configuration.inAppChatEnabled) {
                InAppChat.getInstance(context).activate()
            }
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun saveInstallation(installation: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Save installation...")
        try {
            val resolvedInstallation = InstallationJson.resolveInstallation(ReactNativeJson.convertMapToJson(installation))
            mobileMessaging.saveInstallation(resolvedInstallation, installationResultListener(successCallback, errorCallback))
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun fetchInstallation(successCallback: Callback, errorCallback: Callback) {
        try {
            mobileMessaging.fetchInstallation(installationResultListener(successCallback, errorCallback))
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun getInstallation(successCallback: Callback) {
        Log.d(Utils.TAG, "Get installation...")
        val installation = mobileMessaging.getInstallation()
        var readableMap: ReadableMap? = null
        try {
            readableMap = ReactNativeJson.convertJsonToMap(InstallationJson.toJSON(installation))
        } catch (e: JSONException) {
            e.printStackTrace()
        }
        successCallback.invoke(readableMap)
    }

    fun setInstallationAsPrimary(pushRegistrationId: String, primary: Boolean, successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Set primary installation...")
        if (pushRegistrationId.isEmpty()) {
            errorCallback.invoke(Utils.callbackError("Cannot resolve pushRegistrationId from arguments", null))
            return
        }
        try {
            mobileMessaging.setInstallationAsPrimary(pushRegistrationId, primary, installationsResultListener(successCallback, errorCallback))
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun personalize(args: ReadableMap?, successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Personalize...")
        try {
            val ctx: PersonalizationCtx = PersonalizationCtx.resolvePersonalizationCtx(ReactNativeJson.convertMapToJson(args))
            mobileMessaging.personalize(
                ctx.userIdentity,
                ctx.userAttributes,
                ctx.forceDepersonalize,
                ctx.keepAsLead,
                object : MobileMessaging.ResultListener<User>() {
                    override fun onResult(result: Result<User, MobileMessagingError>) {
                        if (result.isSuccess()) {
                            var readableMap: ReadableMap? = null
                            try {
                                readableMap = ReactNativeJson.convertJsonToMap(UserJson.toJSON(result.getData()))
                            } catch (e: JSONException) {
                                e.printStackTrace()
                            }
                            successCallback.invoke(readableMap)
                        } else {
                            errorCallback.invoke(
                                Utils.callbackErrorWithStringErrorCode(
                                    result.getError().getMessage(),
                                    result.getError().getCode()
                                )
                            )
                        }
                    }
                })
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun depersonalize(successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Depersonalize...")
        try {
            mobileMessaging.depersonalize(object : MobileMessaging.ResultListener<SuccessPending>() {
                override fun onResult(result: Result<SuccessPending, MobileMessagingError>) {
                    if (result.isSuccess) {
                        val state = when (result.data) {
                            SuccessPending.Pending -> "pending"
                            SuccessPending.Success -> "success"
                        }
                        successCallback.invoke(state)
                    } else {
                        errorCallback.invoke(Utils.callbackError(result.error.message, null))
                    }
                }
            })
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun depersonalizeInstallation(pushRegistrationId: String, successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Depersonalize installation...")
        if (pushRegistrationId.isEmpty()) {
            errorCallback.invoke(Utils.callbackError("Cannot resolve pushRegistrationId from arguments", null))
            return
        }
        try {
            mobileMessaging.depersonalizeInstallation(
                pushRegistrationId,
                installationsResultListener(successCallback, errorCallback)
            )
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun saveUser(args: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Save user...")
        try {
            val user = UserJson.resolveUser(ReactNativeJson.convertMapToJson(args))
            mobileMessaging.saveUser(user, userResultListener(successCallback, errorCallback))
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun fetchUser(successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Fetch user...")
        try {
            mobileMessaging.fetchUser(userResultListener(successCallback, errorCallback))
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun getUser(successCallback: Callback) {
        Log.d(Utils.TAG, "Get user...")
        val user = mobileMessaging.getUser()
        var readableMap: ReadableMap? = null
        try {
            readableMap = ReactNativeJson.convertJsonToMap(UserJson.toJSON(user))
        } catch (e: JSONException) {
            e.printStackTrace()
        }
        successCallback.invoke(readableMap)
    }

    fun setUserDataJwt(jwt: String?, successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "SetUserDataJwt...")
        try {
            mobileMessaging.setJwtSupplier({ jwt })
            successCallback.invoke()
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun markMessagesSeen(args: ReadableArray, successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Mark messages seen...")
        try {
            val messageIds = Utils.resolveStringArray(args)
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    mobileMessaging.setMessagesSeen(*messageIds)
                    successCallback.invoke()
                } catch (e: Exception) {
                    errorCallback.invoke(Utils.callbackError(e.message, null))
                }
            }
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    fun registerForAndroidRemoteNotifications() {
        Log.d(Utils.TAG, "Register for Android remote notifications...")
        val activity = reactContext.currentActivity
        if (activity != null && activity is PermissionAwareActivity) {
            permissionsRequestManager.isRequiredPermissionsGranted(activity, this)
        } else {
            Log.e(Utils.TAG, "Cannot register for remote notifications because activity isn't exist")
        }
    }

    // PermissionsRequester interface implementation

    override fun onPermissionGranted() {
        Log.i(Utils.TAG, "Post Notifications permission granted")
    }

    override fun requiredPermissions(): Array<String> {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arrayOf(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            emptyArray()
        }
    }

    override fun shouldShowPermissionsNotGrantedDialogIfShownOnce(): Boolean {
        return true
    }

    override fun permissionsNotGrantedDialogTitle(): Int {
        return org.infobip.mobile.messaging.resources.R.string.mm_post_notifications_settings_title
    }

    override fun permissionsNotGrantedDialogMessage(): Int {
        return org.infobip.mobile.messaging.resources.R.string.mm_post_notifications_settings_message
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray): Boolean {
        if (requestCode == PermissionsRequestManager.REQ_CODE_POST_NOTIFICATIONS_PERMISSIONS) {
            permissionsRequestManager.onRequestPermissionsResult(permissions, grantResults)
        }
        return true
    }

    fun showDialogForError(errorCodeDouble: Double, successCallback: Callback, errorCallback: Callback) {
        try {
            val errorCode = errorCodeDouble.toInt()
            Log.d(Utils.TAG, "Show dialog for error: $errorCode")
            val googleApiAvailability = GoogleApiAvailability.getInstance()
            if (!googleApiAvailability.isUserResolvableError(errorCode)) {
                errorCallback.invoke(Utils.callbackError("Error code [$errorCode] is not user resolvable", null))
                return
            }

            showErrorDialogContext.onSuccess = successCallback
            showErrorDialogContext.onError = errorCallback
            reactContext.addActivityEventListener(this)

            val activity = reactContext.currentActivity
            if (activity != null) {
                googleApiAvailability.getErrorDialog(
                    activity,
                    errorCode,
                    Utils.REQ_CODE_RESOLVE_GOOGLE_ERROR,
                    DialogInterface.OnCancelListener { dialog ->
                        showErrorDialogContext.reset()
                        errorCallback.invoke(Utils.callbackError("Error dialog was cancelled by user", null))
                    }
                )?.show()
            } else {
                errorCallback.invoke(Utils.callbackError("Cannot show error dialog - no current activity", null))
            }
        } catch (e: Exception) {
            errorCallback.invoke(Utils.callbackError(e.message, null))
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != Utils.REQ_CODE_RESOLVE_GOOGLE_ERROR) {
            return
        }

        if (!showErrorDialogContext.isValid()) {
            Log.e(Utils.TAG, "Show dialog context is invalid, cannot forward information to React Native")
            return
        }

        val successCallback = showErrorDialogContext.onSuccess
        val errorCallback = showErrorDialogContext.onError

        showErrorDialogContext.reset()
        reactContext.removeActivityEventListener(this)

        val googleApiAvailability = GoogleApiAvailability.getInstance()
        val playServicesAvailabilityResult = googleApiAvailability.isGooglePlayServicesAvailable(reactContext)
        if (playServicesAvailabilityResult != ConnectionResult.SUCCESS) {
            try {
                showDialogForError(playServicesAvailabilityResult.toDouble(), successCallback, errorCallback)
            } catch (e: JSONException) {
                errorCallback.invoke(e.message)
            }
        } else {
            successCallback.invoke()
        }
    }

    override fun onNewIntent(intent: Intent) {
        Log.d("TAG", "onNewIntent()")
        // Handle new intents if needed in the future
    }


    private fun installationResultListener(successCallback: Callback, errorCallback: Callback): MobileMessaging.ResultListener<Installation> {
        return object : MobileMessaging.ResultListener<Installation>() {
            override fun onResult(result: Result<Installation, MobileMessagingError>) {
                if (result.isSuccess) {
                    try {
                        val readableMap = ReactNativeJson.convertJsonToMap(InstallationJson.toJSON(result.data))
                        successCallback.invoke(readableMap)
                    } catch (e: JSONException) {
                        errorCallback.invoke(Utils.callbackError(e.message, null))
                    }
                } else {
                    errorCallback.invoke(Utils.callbackError(result.error.message, null))
                }
            }
        }
    }

    private fun installationsResultListener(successCallback: Callback, errorCallback: Callback): MobileMessaging.ResultListener<List<Installation>> {
        return object : MobileMessaging.ResultListener<List<Installation>>() {
            override fun onResult(result: Result<List<Installation>, MobileMessagingError>) {
                if (result.isSuccess) {
                    try {
                        val readableArray = ReactNativeJson.convertJsonToArray(InstallationJson.toJSON(result.data))
                        successCallback.invoke(readableArray)
                    } catch (e: JSONException) {
                        errorCallback.invoke(Utils.callbackError(e.message, null))
                    }
                } else {
                    errorCallback.invoke(Utils.callbackError(result.error.message, null))
                }
            }
        }
    }

    private fun userResultListener(successCallback: Callback, errorCallback: Callback): MobileMessaging.ResultListener<User> {
        return object : MobileMessaging.ResultListener<User>() {
            override fun onResult(result: Result<User, MobileMessagingError>) {
                if (result.isSuccess) {
                    var readableMap: ReadableMap? = null
                    try {
                        readableMap = ReactNativeJson.convertJsonToMap(UserJson.toJSON(result.data))
                    } catch (e: JSONException) {
                        e.printStackTrace()
                    }
                    successCallback.invoke(readableMap)
                } else {
                    errorCallback.invoke(Utils.callbackErrorWithStringErrorCode(result.error.message, result.error.code))
                }
            }
        }
    }

    private fun notificationCategoriesFromConfiguration(categories: List<Configuration.Category>): Array<NotificationCategory> {
        return categories.map { category: Configuration.Category ->
            NotificationCategory(
                category.identifier,
                *notificationActionsFromConfiguration(category.actions)
            )
        }.toTypedArray()
    }

    private fun notificationActionsFromConfiguration(actions: List<Configuration.Action>): Array<NotificationAction> {
        return actions.map { action: Configuration.Action ->
            NotificationAction.Builder()
                .withId(action.identifier)
                .withIcon(reactContext, action.icon)
                .withTitleText(action.title)
                .withBringingAppToForeground(action.foreground)
                .withInput(action.textInputPlaceholder)
                .withMoMessage(action.moRequired)
                .build()
        }.toTypedArray()
    }

    // Default message storage methods
    @Synchronized
    fun defaultMessageStorage_find(messageId: String, onSuccess: Callback, onError: Callback) {
        Log.d(Utils.TAG, "Default message storage find: $messageId")
        val messageStore = mobileMessaging.messageStore
        if (messageStore == null) {
            onError.invoke(Utils.callbackError("Message store does not exist", null))
            return
        }

        try {
            val messages = messageStore.findAll(reactContext)
            for (message in messages) {
                if (messageId == message.messageId) {
                    val readableMap = ReactNativeJson.convertJsonToMap(MessageJson.toJSON(message))
                    onSuccess.invoke(readableMap)
                    return
                }
            }
            onSuccess.invoke()
        } catch (e: Exception) {
            Log.e(Utils.TAG, "Error finding message: ${e.message}", e)
            onError.invoke(Utils.callbackError("Error finding message: ${e.message}", null))
        }
    }

    fun defaultMessageStorage_findAll(onSuccess: Callback, onError: Callback) {
        Log.d(Utils.TAG, "Default message storage find all...")
        val messageStore = mobileMessaging.messageStore
        if (messageStore == null) {
            onError.invoke(Utils.callbackError("Message store does not exist", null))
            return
        }

        try {
            val messages = messageStore.findAll(reactContext)
            val readableArray = ReactNativeJson.convertJsonToArray(MessageJson.toJSONArray(messages.toTypedArray()))
            onSuccess.invoke(readableArray)
        } catch (e: Exception) {
            Log.e(Utils.TAG, "Error finding all messages: ${e.message}", e)
            onError.invoke(Utils.callbackError("Error finding all messages: ${e.message}", null))
        }
    }

    @Synchronized
    fun defaultMessageStorage_delete(messageId: String, onSuccess: Callback, onError: Callback) {
        Log.d(Utils.TAG, "Default message storage delete: $messageId")
        val messageStore = mobileMessaging.messageStore
        if (messageStore == null) {
            onError.invoke(Utils.callbackError("Message store does not exist", null))
            return
        }

        try {
            val messagesToKeep = mutableListOf<Message>()
            val allMessages = messageStore.findAll(reactContext)

            for (message in allMessages) {
                if (messageId != message.messageId) {
                    messagesToKeep.add(message)
                }
            }

            messageStore.deleteAll(reactContext)
            messageStore.save(reactContext, *messagesToKeep.toTypedArray())
            onSuccess.invoke()
        } catch (e: Exception) {
            Log.e(Utils.TAG, "Error deleting message: ${e.message}", e)
            onError.invoke(Utils.callbackError("Error deleting message: ${e.message}", null))
        }
    }

    @Synchronized
    fun defaultMessageStorage_deleteAll(onSuccess: Callback, onError: Callback) {
        Log.d(Utils.TAG, "Default message storage delete all...")
        val messageStore = mobileMessaging.messageStore
        if (messageStore == null) {
            onError.invoke(Utils.callbackError("Message store does not exist", null))
            return
        }

        try {
            messageStore.deleteAll(reactContext)
            onSuccess.invoke()
        } catch (e: Exception) {
            Log.e(Utils.TAG, "Error deleting all messages: ${e.message}", e)
            onError.invoke(Utils.callbackError("Error deleting all messages: ${e.message}", null))
        }
    }

    // Inbox methods
    private val mobileMessagingInbox: MobileInbox
        get() = MobileInbox.getInstance(reactContext.applicationContext)

    private fun convertReadableArrayToStringArray(readableArray: ReadableArray): Array<String> {
        val stringArray = Array(readableArray.size()) { "" }
        for (i in 0 until readableArray.size()) {
            stringArray[i] = readableArray.getString(i) ?: ""
        }
        return stringArray
    }

    fun fetchInboxMessages(token: String, externalUserId: String, args: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Fetch inbox messages with token...")
        try {
            val filterOptions = MobileInboxFilterOptionsJson.mobileInboxFilterOptionsFromJSON(ReactNativeJson.convertMapToJson(args))
            mobileMessagingInbox.fetchInbox(token, externalUserId, filterOptions, inboxResultListener(successCallback, errorCallback))
        } catch (e: Exception) {
            Log.d(Utils.TAG, "Error fetching inbox: ${e.message}")
            errorCallback.invoke(Utils.callbackError("Error fetching inbox: ${e.message}", null))
        }
    }

    fun fetchInboxMessagesWithoutToken(externalUserId: String, args: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Fetch inbox messages without token...")
        try {
            val filterOptions = MobileInboxFilterOptionsJson.mobileInboxFilterOptionsFromJSON(
                ReactNativeJson.convertMapToJson(args)
            )
            mobileMessagingInbox.fetchInbox(externalUserId, filterOptions, inboxResultListener(successCallback, errorCallback))
        } catch (e: Exception) {
            Log.d(Utils.TAG, "Error fetching inbox: ${e.message}")
            errorCallback.invoke(Utils.callbackError("Error fetching inbox: ${e.message}", null))
        }
    }

    fun setInboxMessagesSeen(externalUserId: String, args: ReadableArray, successCallback: Callback, errorCallback: Callback) {
        Log.d(Utils.TAG, "Set inbox messages seen...")
        try {
            val messageIds = convertReadableArrayToStringArray(args)
            mobileMessagingInbox.setSeen(externalUserId, messageIds, setSeenResultListener(successCallback, errorCallback))
        } catch (e: Exception) {
            Log.e(Utils.TAG, "Error setting messages seen: ${e.message}", e)
            errorCallback.invoke(Utils.callbackError("Error setting messages seen: ${e.message}", null))
        }
    }

    private fun inboxResultListener(successCallback: Callback, errorCallback: Callback): MobileMessaging.ResultListener<Inbox> {
        return object : MobileMessaging.ResultListener<Inbox>() {
            override fun onResult(result: Result<Inbox, MobileMessagingError>) {
                if (result.isSuccess) {
                    try {
                        val readableMap = ReactNativeJson.convertJsonToMap(InboxMapper.toJSON(result.data))
                        successCallback.invoke(readableMap)
                    } catch (e: JSONException) {
                        Log.e(Utils.TAG, "Error converting inbox result: ${e.message}", e)
                        errorCallback.invoke(Utils.callbackError("Error converting inbox result: ${e.message}", null))
                    }
                } else {
                    errorCallback.invoke(Utils.callbackError(result.error.message, null))
                }
            }
        }
    }

    private fun setSeenResultListener(successCallback: Callback, errorCallback: Callback): MobileMessaging.ResultListener<Array<String>> {
        return object : MobileMessaging.ResultListener<Array<String>>() {
            override fun onResult(result: Result<Array<String>, MobileMessagingError>) {
                if (result.isSuccess) {
                    val messagesSetSeen = result.data
                    val writableMap = Arguments.createMap()

                    messagesSetSeen.forEachIndexed { index, messageId ->
                        writableMap.putString(index.toString(), messageId)
                    }

                    successCallback.invoke(writableMap)
                } else {
                    errorCallback.invoke(Utils.callbackError(result.error.message, null))
                }
            }
        }
    }

    // Event submission methods
    fun submitEvent(eventData: ReadableMap, onError: Callback) {
        Log.d(Utils.TAG, "Submit event...")
        try {
            val customEvent = CustomEventJson.fromJSON(ReactNativeJson.convertMapToJson(eventData))
            mobileMessaging.submitEvent(customEvent)
        } catch (e: Exception) {
            Log.e(Utils.TAG, "Error submitting event: ${e.message}", e)
            onError.invoke(Utils.callbackError("Error submitting event: ${e.message}", null))
        }
    }

    fun submitEventImmediately(eventData: ReadableMap, onSuccess: Callback, onError: Callback) {
        Log.d(Utils.TAG, "Submit event immediately...")
        try {
            val customEvent = CustomEventJson.fromJSON(ReactNativeJson.convertMapToJson(eventData))
            mobileMessaging.submitEvent(customEvent, customEventResultListener(onSuccess, onError))
        } catch (e: Exception) {
            Log.e(Utils.TAG, "Error submitting event immediately: ${e.message}", e)
            onError.invoke(Utils.callbackError("Error submitting event immediately: ${e.message}", null))
        }
    }

    private fun customEventResultListener(successCallback: Callback, errorCallback: Callback): MobileMessaging.ResultListener<CustomEvent> {
        return object : MobileMessaging.ResultListener<CustomEvent>() {
            override fun onResult(result: Result<CustomEvent, MobileMessagingError>) {
                if (result.isSuccess) {
                    successCallback.invoke()
                } else {
                    errorCallback.invoke(Utils.callbackError(result.error.message, null))
                }
            }
        }
    }

    // Custom message storage: methods to provide results to Native Bridge from JS
    fun messageStorage_provideFindAllResult(result: ReadableArray) {
        Log.d(Utils.TAG, "messageStorage_provideFindAllResult")
        MessageStoreAdapter.init(reactContext)

        try {
            val jsonArray = ReactNativeJson.convertArrayToJson(result)
            MessageStoreAdapter.messageStorage_findAllResults.addIfAbsent(jsonArray)
        } catch (e: JSONException) {
            Log.e(Utils.TAG, "Provided results can't be parsed: ${e.message}", e)
        }
    }

    fun messageStorage_provideFindResult(result: ReadableMap) {
        // Not needed for Android - keep for API parity
        Log.d(Utils.TAG, "messageStorage_provideFindResult: no-op on Android")
    }

    // Event system methods (required for React Native EventEmitter)
    fun addListener(eventName: String) {
        Log.d(Utils.TAG, "addListener: $eventName")
        jsHasListeners = true
        val events = CacheManager.loadEvents(reactContext, eventName)
        for (event in events) {
            if (eventName == event.type) {
                ReactNativeEvent.send(event.type, reactContext, event.jsonObject, *event.objects)
            }
        }
    }

    fun removeListeners(count: Int) {
        Log.d(Utils.TAG, "removeListeners: $count")
        // Keep: Required for RN built in Event Emitter Calls
    }

    // Broadcast receiver management
    fun registerBroadcastReceiver() {
        val commonLibIntentFilter = IntentFilter()
        for (action in broadcastEventMap.keys) {
            commonLibIntentFilter.addAction(action)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(commonLibraryBroadcastReceiver, commonLibIntentFilter, Context.RECEIVER_NOT_EXPORTED)
            reactContext.registerReceiver(chatBroadcastReceiver, chatBroadcastReceiverIntentFilter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            reactContext.registerReceiver(commonLibraryBroadcastReceiver, commonLibIntentFilter)
            reactContext.registerReceiver(chatBroadcastReceiver, chatBroadcastReceiverIntentFilter)
        }

        val messageStorageIntentFilter = IntentFilter()
        for (action in messageStorageEventMap.keys) {
            messageStorageIntentFilter.addAction(action)
        }

        LocalBroadcastManager.getInstance(reactContext).registerReceiver(messageStorageReceiver, messageStorageIntentFilter)
        broadcastReceiverRegistered = true
    }

    fun unregisterBroadcastReceiver() {
        if (!broadcastReceiverRegistered) return
        try {
            reactContext.unregisterReceiver(commonLibraryBroadcastReceiver)
            reactContext.unregisterReceiver(chatBroadcastReceiver)
            LocalBroadcastManager.getInstance(reactContext).unregisterReceiver(messageStorageReceiver)
        } catch (e: IllegalArgumentException) {
            Log.d(Utils.TAG, "Can't unregister broadcast receivers")
        }
        broadcastReceiverRegistered = false
    }

    /**
     * Message store adapter for JS layer
     */
    class MessageStoreAdapter : MessageStore {

        companion object {
            //NOTE: 'stop' and 'find' events are not needed for android
            const val EVENT_MESSAGESTORAGE_START = "messageStorage.start"
            const val EVENT_MESSAGESTORAGE_SAVE = "messageStorage.save"
            const val EVENT_MESSAGESTORAGE_FIND_ALL = "messageStorage.findAll"

            private const val SYNC_CALL_TIMEOUT_MS = 30000L
            val messageStorage_findAllResults = CopyOnWriteArrayList<JSONArray>()

            @JvmStatic
            fun init(context: Context) {
                LocalBroadcastManager.getInstance(context).sendBroadcast(Intent(EVENT_MESSAGESTORAGE_START))
            }
        }

        override fun findAll(context: Context): List<Message> {
            Log.i(Utils.TAG, "MessageStoreAdapter findAll...")

            messageStorage_findAllResults.clear()
            LocalBroadcastManager.getInstance(context).sendBroadcast(Intent(EVENT_MESSAGESTORAGE_FIND_ALL))
            return try {
                if (messageStorage_findAllResults.isNotEmpty()) {
                    MessageJson.resolveMessages(messageStorage_findAllResults[0])
                } else {
                    CopyOnWriteArrayList()
                }
            } catch (e: Exception) {
                Log.e(Utils.TAG, "Cannot find messages: $e")
                CopyOnWriteArrayList()
            }
        }

        override fun countAll(context: Context): Long {
            return findAll(context).size.toLong()
        }

        override fun save(context: Context, vararg messages: Message) {
            Log.i(Utils.TAG, "MessageStoreAdapter save messages...")
            val saveMessageIntent = Intent(EVENT_MESSAGESTORAGE_SAVE)
            saveMessageIntent.putParcelableArrayListExtra(
                BroadcastParameter.EXTRA_MESSAGES,
                MessageBundleMapper.messagesToBundles(listOf(*messages))
            )
            LocalBroadcastManager.getInstance(context).sendBroadcast(saveMessageIntent)
        }

        override fun deleteAll(context: Context) {
            Log.e(Utils.TAG, "deleteAll is not implemented because it should not be called from within library")
        }
    }
}

/**
 * Static broadcast receiver for global message events
 * Registered in AndroidManifest.xml to receive system-wide messaging events
 */
class MessageEventReceiver : ReactNativeBroadcastReceiver() {

    private val messageBroadcastEventMap: Map<String, String> = mapOf(
        Event.MESSAGE_RECEIVED.key to ReactNativeMobileMessagingService.EVENT_MESSAGE_RECEIVED,
        Event.NOTIFICATION_TAPPED.key to ReactNativeMobileMessagingService.EVENT_NOTIFICATION_TAPPED,
        InteractiveEvent.NOTIFICATION_ACTION_TAPPED.key to ReactNativeMobileMessagingService.EVENT_NOTIFICATION_ACTION_TAPPED
    )

    override fun onReceive(context: Context?, intent: Intent?) {
        val event = messageBroadcastEventMap[intent?.action]
        if (event == null) {
            Log.w(Utils.TAG, "Cannot process event for broadcast: ${intent?.action}")
            return
        }

        val message = MessageJson.bundleToJSON(intent?.extras)
        var actionId: String? = null
        var actionInputText: String? = null

        if (InteractiveEvent.NOTIFICATION_ACTION_TAPPED.key == intent?.action) {
            val notificationAction = NotificationAction.createFrom(intent?.extras)
            actionId = notificationAction.id
            actionInputText = notificationAction.inputText
        }
        emitOrCache(event, context, message, actionId, actionInputText)
    }

    private fun emitOrCache(eventType: String, context: Context?, message: JSONObject?, actionId: String?, actionInputText: String?) {
        val reactContext: ReactContext? = getReactContext(context)
        if (!pluginInitialized || reactContext == null) {
            CacheManager.saveEvent(context, eventType, message, actionId, actionInputText)
        } else if (jsHasListeners && reactContext != null) {
            ReactNativeEvent.send(eventType, reactContext, message, actionId, actionInputText)
        } else if (reactContext != null) {
            CacheManager.saveEvent(reactContext, eventType, message, actionId, actionInputText)
        } else if (context != null) {
            CacheManager.saveEvent(context, eventType, message, actionId, actionInputText)
        } else {
            Log.e(Utils.TAG, "Both reactContext and androidContext are null, can't emit or cache event " + eventType)
        }
    }

}
