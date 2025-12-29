//
//  RNMMChatModule.kt
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging

import android.util.Log
import androidx.annotation.NonNull
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReactMethod

@ReactModule(name = RNMMChatModule.NAME)
class RNMMChatModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "RNMMChat"
        private const val TAG = "RNMMChatOldModule"
    }

    private val service: RNMMChatService = RNMMChatService(reactContext)

    override fun getName(): String = NAME

    @ReactMethod
    fun showChat(args: ReadableMap?) {
        RNMMLogger.i(TAG, "showChat()")
        service.showChat(args)
    }

    @ReactMethod
    fun showThreadsList() {
        RNMMLogger.i(TAG, "showThreadsList()")
        // iOS only
    }

    @ReactMethod
    fun getMessageCounter(onSuccess: Callback) {
        RNMMLogger.i(TAG, "getMessageCounter()")
        service.getMessageCounter(onSuccess)
    }

    @ReactMethod
    fun isChatAvailable(onSuccess: Callback) {
        RNMMLogger.i(TAG, "isChatAvailable()")
        service.isChatAvailable(onSuccess)
    }

    @ReactMethod
    fun resetMessageCounter() {
        RNMMLogger.i(TAG, "resetMessageCounter()")
        service.resetMessageCounter()
    }

    @ReactMethod
    fun setLanguage(localeString: String, onSuccess: Callback, onError: Callback) {
        RNMMLogger.i(TAG, "setLanguage()")
        service.setLanguage(localeString, onSuccess, onError)
    }

    @ReactMethod
    fun sendContextualData(data: String, multithreadStrategyFlag: String, onSuccess: Callback, onError: Callback) {
        RNMMLogger.i(TAG, "sendContextualData()")
        service.sendContextualData(data, multithreadStrategyFlag, onSuccess, onError)
    }

    @ReactMethod
    fun setWidgetTheme(widgetTheme: String?) {
        RNMMLogger.i(TAG, "setWidgetTheme()")
        service.setWidgetTheme(widgetTheme)
    }

    @ReactMethod
    fun setChatCustomization(map: ReadableMap?) {
        RNMMLogger.i(TAG, "setChatCustomization()")
        service.setChatCustomization(map)
    }

    @ReactMethod
    fun setChatPushTitle(title: String?) {
        RNMMLogger.i(TAG, "setChatPushTitle()")
        service.setChatPushTitle(title)
    }

    @ReactMethod
    fun setChatPushBody(body: String?) {
        RNMMLogger.i(TAG, "setChatPushBody()")
        service.setChatPushBody(body)
    }

    @ReactMethod
    fun restartConnection() {
        RNMMLogger.i(TAG, "restartConnection()")
        // iOS only
    }

    @ReactMethod
    fun stopConnection() {
        RNMMLogger.i(TAG, "stopConnection()")
        // iOS only
    }

    @ReactMethod
    fun setChatJwtProvider() {
        RNMMLogger.i(TAG, "setChatJwtProvider()")
        service.setChatJwtProvider()
    }

    @ReactMethod
    fun setChatJwt(jwt: String?) {
        RNMMLogger.i(TAG, "setChatJwt()")
        service.setChatJwt(jwt)
    }

    @ReactMethod
    fun setChatExceptionHandler(isHandlerPresent: Boolean) {
        RNMMLogger.i(TAG, "setChatExceptionHandler()")
        service.setChatExceptionHandler(isHandlerPresent)
    }

    @ReactMethod
    fun setChatDomain(domain: String?) {
        RNMMLogger.i(TAG, "setChatDomain()")
        service.setChatDomain(domain)       
    }

}