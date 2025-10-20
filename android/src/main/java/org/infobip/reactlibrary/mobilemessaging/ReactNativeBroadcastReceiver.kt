//
//  ReactNativeBroadcastReceiver.kt
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging

import android.content.BroadcastReceiver
import android.content.Context
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactContext
import org.infobip.reactlibrary.mobilemessaging.ReactNativeMobileMessagingService

/**
 * Base class for BroadcastReceivers that need to interact with React Native.
 * It provides utility methods to check if the React Native plugin is initialized
 * and to retrieve the current ReactContext.
 */
abstract class ReactNativeBroadcastReceiver : BroadcastReceiver() {

    protected val pluginInitialized: Boolean
        get() = ReactNativeMobileMessagingService.pluginInitialized

    protected val jsHasListeners: Boolean
        get() = ReactNativeMobileMessagingService.jsHasListeners

    protected fun getReactContext(context: Context?): ReactContext? {
        return ReactNativeMobileMessagingService.lastReactContext
            ?: (context?.applicationContext as? ReactApplication)
                ?.reactNativeHost
                ?.reactInstanceManager
                ?.currentReactContext
    }

}   