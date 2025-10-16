package org.infobip.reactlibrary.mobilemessaging

import android.util.Log
import androidx.annotation.NonNull
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
        Log.i(TAG, "enableChatCalls()")
        service.enableChatCalls(onSuccess, onError)
    }

    override fun enableCalls(identity: String, onSuccess: Callback, onError: Callback) {
        Log.i(TAG, "enableCalls()")
        service.enableCalls(identity, onSuccess, onError)
    }

    override fun disableCalls(onSuccess: Callback, onError: Callback) {
        Log.i(TAG, "disableCalls()")
        service.disableCalls(onSuccess, onError)
    }
}