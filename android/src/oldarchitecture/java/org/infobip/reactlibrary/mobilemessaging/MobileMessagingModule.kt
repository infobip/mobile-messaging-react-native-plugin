//
//  MobileMessagingModule.kt
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging

import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReactMethod

class MobileMessagingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    companion object {
        const val NAME = "MobileMessaging"
        const val TAG = "MobileMessagingOldArchModule"
    }

    private val service: ReactNativeMobileMessagingService = ReactNativeMobileMessagingService(reactContext)

    init {
        reactApplicationContext.addLifecycleEventListener(this)
        ReactNativeMobileMessagingService.pluginInitialized = true
        service.registerBroadcastReceiver()
    }

    override fun getName(): String = NAME

    // Initialization
    @ReactMethod
    fun init(config: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "Init...")
        service.init(config, successCallback, errorCallback)
    }

    // Default message storage
    @ReactMethod
    fun defaultMessageStorage_find(messageId: String, onSuccess: Callback, onError: Callback) {
        RNMMLogger.d(TAG, "defaultMessageStorage_find...")
        service.defaultMessageStorage_find(messageId, onSuccess, onError)
    }

    @ReactMethod
    fun defaultMessageStorage_findAll(onSuccess: Callback, onError: Callback) {
        RNMMLogger.d(TAG, "defaultMessageStorage_findAll...")
        service.defaultMessageStorage_findAll(onSuccess, onError)
    }

    @ReactMethod
    fun defaultMessageStorage_delete(messageId: String, onSuccess: Callback, onError: Callback) {
        RNMMLogger.d(TAG, "defaultMessageStorage_delete...")
        service.defaultMessageStorage_delete(messageId, onSuccess, onError)
    }

    @ReactMethod
    fun defaultMessageStorage_deleteAll(onSuccess: Callback, onError: Callback) {
        RNMMLogger.d(TAG, "defaultMessageStorage_deleteAll...")
        service.defaultMessageStorage_deleteAll(onSuccess, onError)
    }

    // Inbox
    @ReactMethod
    fun fetchInboxMessages(token: String, externalUserId: String, filterOptions: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "fetchInboxMessages...")
        service.fetchInboxMessages(token, externalUserId, filterOptions, successCallback, errorCallback)
    }

    @ReactMethod
    fun fetchInboxMessagesWithoutToken(externalUserId: String, filterOptions: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "fetchInboxMessagesWithoutToken...")
        service.fetchInboxMessagesWithoutToken(externalUserId, filterOptions, successCallback, errorCallback)
    }

    @ReactMethod
    fun setInboxMessagesSeen(externalUserId: String, messageIds: ReadableArray, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "setInboxMessagesSeen...")
        service.setInboxMessagesSeen(externalUserId, messageIds, successCallback, errorCallback)
    }

    // User profile
    @ReactMethod
    fun saveUser(userData: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "Save user...")
        service.saveUser(userData, successCallback, errorCallback)
    }

    @ReactMethod
    fun fetchUser(successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "Fetch user...")
        service.fetchUser(successCallback, errorCallback)
    }

    @ReactMethod
    fun getUser(successCallback: Callback) {
        RNMMLogger.d(TAG, "Get user...")
        service.getUser(successCallback)
    }

    // Installation
    @ReactMethod
    fun saveInstallation(installation: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "Save installation...")
        service.saveInstallation(installation, successCallback, errorCallback)
    }

    @ReactMethod
    fun fetchInstallation(successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "Fetch installation...")
        service.fetchInstallation(successCallback, errorCallback)
    }

    @ReactMethod
    fun getInstallation(successCallback: Callback) {
        RNMMLogger.d(TAG, "Get installation...")
        service.getInstallation(successCallback)
    }

    @ReactMethod
    fun setInstallationAsPrimary(
        pushRegistrationId: String,
        primary: Boolean,
        successCallback: Callback,
        errorCallback: Callback
    ) {
        service.setInstallationAsPrimary(pushRegistrationId, primary, successCallback, errorCallback)
    }

    // Personalization
    @ReactMethod
    fun personalize(context: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "Personalize...")
        service.personalize(context, successCallback, errorCallback)
    }

    @ReactMethod
    fun depersonalize(successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "Depersonalize...")
        service.depersonalize(successCallback, errorCallback)
    }

    @ReactMethod
    fun depersonalizeInstallation(pushRegistrationId: String, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "Depersonalize installation...")
        service.depersonalizeInstallation(pushRegistrationId, successCallback, errorCallback)
    }

    // Messages and notifications
    @ReactMethod
    fun markMessagesSeen(messageIds: ReadableArray, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "MarkMessagesSeen...")
        service.markMessagesSeen(messageIds, successCallback, errorCallback)
    }

    // Remote notifications (permissions/UI)
    @ReactMethod
    fun registerForAndroidRemoteNotifications() {
        RNMMLogger.d(TAG, "Register for Android remote notifications...")
        service.registerForAndroidRemoteNotifications()
    }

    // Dialog for error (UI)
    @ReactMethod
    fun showDialogForError(errorCode: Double, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "ShowDialogForError...")
        service.showDialogForError(errorCode, successCallback, errorCallback)
    }

    // Events
    @ReactMethod
    fun submitEvent(eventData: ReadableMap, errorCallback: Callback) {
        RNMMLogger.d(TAG, "submitEvent...")
        service.submitEvent(eventData, errorCallback)
    }

    @ReactMethod
    fun submitEventImmediately(eventData: ReadableMap, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "submitEventImmediately...")
        service.submitEventImmediately(eventData, successCallback, errorCallback)
    }

    // JWT
    @ReactMethod
    fun setUserDataJwt(jwt: String?, successCallback: Callback, errorCallback: Callback) {
        RNMMLogger.d(TAG, "SetUserDataJwt...")
        service.setUserDataJwt(jwt, successCallback, errorCallback)
    }

    // Custom message storage from JS
    @ReactMethod
    fun messageStorage_provideFindAllResult(messages: ReadableArray) {
        RNMMLogger.d(TAG, "messageStorage_provideFindAllResult...")
        service.messageStorage_provideFindAllResult(messages)
    }

    @ReactMethod
    fun messageStorage_provideFindResult(message: ReadableMap) {
        RNMMLogger.d(TAG, "messageStorage_provideFindResult...")
        service.messageStorage_provideFindResult(message)
    }

    // Event system methods (required for React Native EventEmitter)
    @ReactMethod
    fun addListener(eventName: String) {
        RNMMLogger.d(TAG, "addListener: $eventName")
        service.addListener(eventName)
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        RNMMLogger.d(TAG, "removeListeners: $count")
        service.removeListeners(count)
    }

    // LifecycleEventListener - thin delegation to service
    override fun onHostResume() {
        // No specific action needed
    }

    override fun onHostPause() {
        // No specific action needed
    }

    override fun onHostDestroy() {
        service.unregisterBroadcastReceiver()
        reactApplicationContext.removeLifecycleEventListener(this)
        ReactNativeMobileMessagingService.pluginInitialized = false
        ReactNativeMobileMessagingService.unregisterService(reactApplicationContext)
    }
}
