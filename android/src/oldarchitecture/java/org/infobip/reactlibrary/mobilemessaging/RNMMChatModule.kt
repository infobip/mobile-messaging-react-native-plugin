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
        Log.i(TAG, "showChat()")
        service.showChat(args)
    }

    @ReactMethod
    fun showThreadsList() {
        Log.i(TAG, "showThreadsList()")
        // iOS only
    }

    @ReactMethod
    fun getMessageCounter(onSuccess: Callback) {
        Log.i(TAG, "getMessageCounter()")
        service.getMessageCounter(onSuccess)
    }

    @ReactMethod
    fun resetMessageCounter() {
        Log.i(TAG, "resetMessageCounter()")
        service.resetMessageCounter()
    }

    @ReactMethod
    fun setLanguage(localeString: String, onSuccess: Callback, onError: Callback) {
        Log.i(TAG, "setLanguage()")
        service.setLanguage(localeString, onSuccess, onError)
    }

    @ReactMethod
    fun sendContextualData(data: String, multithreadStrategyFlag: String, onSuccess: Callback, onError: Callback) {
        Log.i(TAG, "sendContextualData()")
        service.sendContextualData(data, multithreadStrategyFlag, onSuccess, onError)
    }

    @ReactMethod
    fun setWidgetTheme(widgetTheme: String?) {
        Log.i(TAG, "setWidgetTheme()")
        service.setWidgetTheme(widgetTheme)
    }

    @ReactMethod
    fun setChatCustomization(map: ReadableMap?) {
        Log.i(TAG, "setChatCustomization()")
        service.setChatCustomization(map)
    }

    @ReactMethod
    fun setChatPushTitle(title: String?) {
        Log.i(TAG, "setChatPushTitle()")
        service.setChatPushTitle(title)
    }

    @ReactMethod
    fun setChatPushBody(body: String?) {
        Log.i(TAG, "setChatPushBody()")
        service.setChatPushBody(body)
    }

    @ReactMethod
    fun restartConnection() {
        Log.i(TAG, "restartConnection()")
        // iOS only
    }

    @ReactMethod
    fun stopConnection() {
        Log.i(TAG, "stopConnection()")
        // iOS only
    }

    @ReactMethod
    fun setChatJwtProvider() {
        Log.i(TAG, "setChatJwtProvider()")
        service.setChatJwtProvider()
    }

    @ReactMethod
    fun setChatJwt(jwt: String?) {
        Log.i(TAG, "setChatJwt()")
        service.setChatJwt(jwt)
    }

    @ReactMethod
    fun setChatExceptionHandler(isHandlerPresent: Boolean) {
        Log.i(TAG, "setChatExceptionHandler()")
        service.setChatExceptionHandler(isHandlerPresent)
    }

}