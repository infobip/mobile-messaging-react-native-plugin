//
//  RNMMChatViewManager.kt
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging

import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.viewmanagers.RNMMChatViewManagerInterface
import com.facebook.react.viewmanagers.RNMMChatViewManagerDelegate


@ReactModule(name = RNMMChatViewManager.NAME)
class RNMMChatViewManager(
    private val reactContext: ReactApplicationContext
) : ViewGroupManager<RNMMChatView>(), RNMMChatViewManagerInterface<RNMMChatView> {

    companion object {
        const val NAME = "RNMMChatView"
        private const val TAG = "RNMMChatViewNewManager"
    }

    private val delegate: RNMMChatViewManagerDelegate<RNMMChatView, RNMMChatViewManager> = RNMMChatViewManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<RNMMChatView> = delegate

    override fun getName(): String = NAME

    override fun createViewInstance(reactContext: ThemedReactContext): RNMMChatView = RNMMChatView(reactContext)

    @ReactProp(name = "sendButtonColor")
    override fun setSendButtonColor(view: RNMMChatView, value: String?) {
        RNMMLogger.i(TAG, "setSendButtonColor($value) is not supported in Android")
        // iOS only prop, no-op on Android
    }
 
    override fun add(view: RNMMChatView) {
        RNMMLogger.i(TAG, "add()")
        view.add(reactContext, Utils.getFragmentActivity(reactContext))
    }

    override fun remove(view: RNMMChatView) {
        RNMMLogger.i(TAG, "remove()")
        view.remove(Utils.getFragmentActivity(reactContext))
    }

    override fun setExceptionHandler(view: RNMMChatView, isHandlerPresent: Boolean) {
        RNMMLogger.i(TAG, "setExceptionHandler()")
        view.setExceptionHandler(isHandlerPresent, reactContext, Utils.getFragmentActivity(reactContext))
    }

    override fun showThreadsList(view: RNMMChatView) {
        RNMMLogger.i(TAG, "showThreadsList()")
        view.showThreadsList(Utils.getFragmentActivity(reactContext))
    }

}