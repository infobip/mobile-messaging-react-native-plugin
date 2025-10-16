package org.infobip.reactlibrary.mobilemessaging

import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = MobileMessagingModule.NAME)
class MobileMessagingModule(reactContext: ReactApplicationContext) : NativeMobileMessagingSpec(reactContext), LifecycleEventListener {

    companion object {
        const val NAME = "MobileMessaging"
        const val TAG = "MobileMessagingNewArchModule"
    }

    private val service: ReactNativeMobileMessagingService = ReactNativeMobileMessagingService(reactApplicationContext)

    init {
        reactApplicationContext.addLifecycleEventListener(this)
        ReactNativeMobileMessagingService.pluginInitialized = true
        service.registerBroadcastReceiver()
    }

    override fun getName(): String = NAME

    // Initialization
    override fun init(config: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "Init...")
        service.init(config, successCallback, errorCallback)
    }

    // Default message storage
    override fun defaultMessageStorage_find(messageId: String, onSuccess: Callback, onError: Callback) {
        Log.d(TAG, "defaultMessageStorage_find...")
        service.defaultMessageStorage_find(messageId, onSuccess, onError)
    }

    override fun defaultMessageStorage_findAll(onSuccess: Callback, onError: Callback) {
        Log.d(TAG, "defaultMessageStorage_findAll...")
        service.defaultMessageStorage_findAll(onSuccess, onError)
    }

    override fun defaultMessageStorage_delete(messageId: String, onSuccess: Callback, onError: Callback) {
        Log.d(TAG, "defaultMessageStorage_delete...")
        service.defaultMessageStorage_delete(messageId, onSuccess, onError)
    }

    override fun defaultMessageStorage_deleteAll(onSuccess: Callback, onError: Callback) {
        Log.d(TAG, "defaultMessageStorage_deleteAll...")
        service.defaultMessageStorage_deleteAll(onSuccess, onError)
    }

    // Inbox
    override fun fetchInboxMessages(token: String, externalUserId: String, filterOptions: ReadableMap, onSuccess: Callback, onError: Callback) {
        Log.d(TAG, "fetchInboxMessages...")
        service.fetchInboxMessages(token, externalUserId, filterOptions, onSuccess, onError)
    }

    override fun fetchInboxMessagesWithoutToken(externalUserId: String, filterOptions: ReadableMap, onSuccess: Callback, onError: Callback) {
        Log.d(TAG, "fetchInboxMessagesWithoutToken...")
        service.fetchInboxMessagesWithoutToken(externalUserId, filterOptions, onSuccess, onError)
    }

    override fun setInboxMessagesSeen(externalUserId: String, messageIds: ReadableArray, onSuccess: Callback, onError: Callback) {
        Log.d(TAG, "setInboxMessagesSeen...")
        service.setInboxMessagesSeen(externalUserId, messageIds, onSuccess, onError)
    }

    override fun saveUser(userData: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "Save user...")
        service.saveUser(userData, successCallback, errorCallback)
    }

    override fun fetchUser(successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "Fetch user...")
        service.fetchUser(successCallback, errorCallback)
    }

    override fun getUser(successCallback: Callback) {
        Log.d(TAG, "Get user...")
        service.getUser(successCallback)
    }

    // Installation
    override fun saveInstallation(installation: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "Save installation...")
        service.saveInstallation(installation, successCallback, errorCallback)
    }

    override fun fetchInstallation(successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "Fetch installation...")
        service.fetchInstallation(successCallback, errorCallback)
    }

    override fun getInstallation(successCallback: Callback) {
        Log.d(TAG, "Get installation...")
        service.getInstallation(successCallback)
    }

    override fun setInstallationAsPrimary(
        pushRegistrationId: String,
        primary: Boolean,
        successCallback: Callback,
        errorCallback: Callback
    ) {
        service.setInstallationAsPrimary(pushRegistrationId, primary, successCallback, errorCallback)
    }

    override fun personalize(context: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "Personalize...")
        service.personalize(context, successCallback, errorCallback)
    }

    override fun depersonalize(successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "Depersonalize...")
        service.depersonalize(successCallback, errorCallback)
    }

    override fun depersonalizeInstallation(pushRegistrationId: String, successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "Depersonalize installation...")
        service.depersonalizeInstallation(pushRegistrationId, successCallback, errorCallback)
    }

    // Events
    override fun submitEvent(eventData: ReadableMap, onError: Callback) {
        Log.d(TAG, "submitEvent...")
        service.submitEvent(eventData, onError)
    }

    override fun submitEventImmediately(eventData: ReadableMap, onSuccess: Callback, onError: Callback) {
        Log.d(TAG, "submitEventImmediately...")
        service.submitEventImmediately(eventData, onSuccess, onError)
    }

    override fun markMessagesSeen(messageIds: ReadableArray, successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "MarkMessagesSeen...")
        service.markMessagesSeen(messageIds, successCallback, errorCallback)
    }

    // Remote notifications (Android specific)
    override fun registerForAndroidRemoteNotifications() {
        Log.d(TAG, "Register for Android remote notifications...")
        service.registerForAndroidRemoteNotifications()
    }

    // Dialog for error (UI)
    override fun showDialogForError(errorCode: Double, successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "ShowDialogForError...")
        service.showDialogForError(errorCode, successCallback, errorCallback)
    }

    // JWT
    override fun setUserDataJwt(jwt: String?, successCallback: Callback, errorCallback: Callback) {
        Log.d(TAG, "SetUserDataJwt...")
        service.setUserDataJwt(jwt, successCallback, errorCallback)
    }

    // Custom message storage from JS
    override fun messageStorage_provideFindAllResult(messages: ReadableArray) {
        Log.d(TAG, "MessageStorage_provideFindAllResult...")
        service.messageStorage_provideFindAllResult(messages)
    }

    override fun messageStorage_provideFindResult(message: ReadableMap) {
        Log.d(TAG, "MessageStorage_provideFindResult...")
        service.messageStorage_provideFindResult(message)
    }

    // Event system methods (required for React Native EventEmitter)
    override fun addListener(eventName: String) {
        Log.d(TAG, "addListener: $eventName")
        service.addListener(eventName)
    }

    override fun removeListeners(count: Double) {
        Log.d(TAG, "removeListeners: $count")
        service.removeListeners(count.toInt())
    }

    // LifecycleEventListener
    override fun onHostResume() {
        // no-op
    }

    override fun onHostPause() {
        // no-op
    }

    override fun onHostDestroy() {
        ReactNativeMobileMessagingService.pluginInitialized = false
        service.unregisterBroadcastReceiver()
        reactApplicationContext.removeLifecycleEventListener(this)
        ReactNativeMobileMessagingService.unregisterService(reactApplicationContext)
    }
}
