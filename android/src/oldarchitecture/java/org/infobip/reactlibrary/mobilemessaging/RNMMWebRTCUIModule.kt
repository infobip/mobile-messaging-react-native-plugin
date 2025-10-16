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

@ReactModule(name = RNMMWebRTCUIModule.NAME)
class RNMMWebRTCUIModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "RNMMWebRTCUI"
        private const val TAG = "RNMMWebRTCUIOldModule"
    }

    private val service = RNMMWebRTCUIService(reactContext)

    override fun getName(): String = NAME

    @ReactMethod
    fun enableChatCalls(onSuccess: Callback, onError: Callback) {
        Log.i(TAG, "enableChatCalls()")
        service.enableChatCalls(onSuccess, onError)
    }

    @ReactMethod
    fun enableCalls(identity: String, onSuccess: Callback, onError: Callback) {
        Log.i(TAG, "enableCalls()")
        service.enableCalls(identity, onSuccess, onError)
    }

    @ReactMethod
    fun disableCalls(onSuccess: Callback, onError: Callback) {
        Log.i(TAG, "disableCalls()")
        service.disableCalls(onSuccess, onError)
    }
}