//
//  RNMMWebRTCUIModule.kt
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging

import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RNMMWebRTCUIModule.NAME)
class RNMMWebRTCUIModule(
    reactContext: ReactApplicationContext
) : NativeRNMMWebRTCUISpec(reactContext) {

    companion object {
        const val NAME = "RNMMWebRTCUI"
        private const val TAG = "RNMMWebRTCUINewModule"
    }

    private val service = RNMMWebRTCUIService(reactContext)

    override fun getName(): String = NAME

    override fun enableChatCalls(onSuccess: Callback, onError: Callback) {
        RNMMLogger.i(TAG, "enableChatCalls()")
        service.enableChatCalls(onSuccess, onError)
    }

    override fun enableCalls(identity: String, onSuccess: Callback, onError: Callback) {
        RNMMLogger.i(TAG, "enableCalls()")
        service.enableCalls(identity, onSuccess, onError)
    }

    override fun disableCalls(onSuccess: Callback, onError: Callback) {
        RNMMLogger.i(TAG, "disableCalls()")
        service.disableCalls(onSuccess, onError)
    }
}