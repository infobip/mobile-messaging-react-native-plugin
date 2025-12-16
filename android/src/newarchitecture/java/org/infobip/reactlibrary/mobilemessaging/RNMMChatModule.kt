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
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RNMMChatModule.NAME)
class RNMMChatModule(reactContext: ReactApplicationContext) : NativeRNMMChatSpec(reactContext) {

    companion object {
        const val NAME = "RNMMChat"
        private const val TAG = "RNMMChatNewModule"
    }

    private val service: RNMMChatService = RNMMChatService(reactContext)

    @NonNull
    override fun getName(): String = NAME

    override fun showChat(args: ReadableMap?) {
        RNMMLogger.i(TAG, "showChat()")
        service.showChat(args)
    }

    override fun showThreadsList() {
        RNMMLogger.i(TAG, "showThreadsList()")
        // iOS only
    }

    override fun getMessageCounter(onSuccess: Callback) {
        RNMMLogger.i(TAG, "getMessageCounter()")
        service.getMessageCounter(onSuccess)
    }

    override fun resetMessageCounter() {
        RNMMLogger.i(TAG, "resetMessageCounter()")
        service.resetMessageCounter()
    }

    override fun setLanguage(localeString: String, onSuccess: Callback, onError: Callback) {
        RNMMLogger.i(TAG, "setLanguage()")
        service.setLanguage(localeString, onSuccess, onError)
    }

    override fun sendContextualData(data: String, multithreadStrategyFlag: String, onSuccess: Callback, onError: Callback) {
        RNMMLogger.i(TAG, "sendContextualData()")
        service.sendContextualData(data, multithreadStrategyFlag, onSuccess, onError)
    }

    override fun setWidgetTheme(widgetTheme: String?) {
        RNMMLogger.i(TAG, "setWidgetTheme()")
        service.setWidgetTheme(widgetTheme)
    }

    override fun setChatCustomization(map: ReadableMap?) {
        RNMMLogger.i(TAG, "setChatCustomization()")
        service.setChatCustomization(map)
    }

    override fun setChatPushTitle(title: String?) {
        RNMMLogger.i(TAG, "setChatPushTitle()")
        service.setChatPushTitle(title)
    }

    override fun setChatPushBody(body: String?) {
        RNMMLogger.i(TAG, "setChatPushBody()")
        service.setChatPushBody(body)
    }

    override fun restartConnection() {
        RNMMLogger.i(TAG, "restartConnection()")
        // iOS only
    }

    override fun stopConnection() {
        RNMMLogger.i(TAG, "stopConnection()")
        // iOS only
    }

    override fun setChatJwtProvider() {
        RNMMLogger.i(TAG, "setChatJwtProvider()")
        service.setChatJwtProvider()
    }

    override fun setChatJwt(jwt: String?) {
        RNMMLogger.i(TAG, "setChatJwt()")
        service.setChatJwt(jwt)
    }

    override fun setChatExceptionHandler(isHandlerPresent: Boolean) {
        RNMMLogger.i(TAG, "setChatExceptionHandler()")
        service.setChatExceptionHandler(isHandlerPresent)
    }

}