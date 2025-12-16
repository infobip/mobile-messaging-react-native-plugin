//
//  RNMMLogger.kt
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging

import org.infobip.mobile.messaging.logging.Level
import android.util.Log

/**
 * Centralized logging utility for React Native plugin code.
 * Routes logs to EITHER React Native console OR Android Logcat (mutually exclusive).
 */
object RNMMLogger {

    private var writer: RNMMLogWriter? = null

    /**
     * Route logs to React Native console via RNMMLogWriter.
     * When enabled, logs will NOT appear in Android Logcat.
     */
    fun useReactNativeConsole(writer: RNMMLogWriter) {
        this.writer = writer
    }

    /**
     * Route logs to Android Logcat (default behavior).
     * When enabled, logs will NOT appear in React Native console.s
     */
    fun useNativeLogcat() {
        this.writer = null
    }

    /**
     * Log a VERBOSE message.
     */
    @JvmStatic
    @JvmOverloads
    fun v(tag: String, message: String, throwable: Throwable? = null) {
        writer?.write(Level.VERBOSE.name, tag, message, throwable) ?: Log.v(tag, message, throwable)
    }

    /**
     * Log a DEBUG message.
     */
    @JvmStatic
    @JvmOverloads
    fun d(tag: String, message: String, throwable: Throwable? = null) {
        writer?.write(Level.DEBUG.name, tag, message, throwable) ?: Log.d(tag, message, throwable)
    }

    /**
     * Log an INFO message.
     */
    @JvmStatic
    @JvmOverloads
    fun i(tag: String, message: String, throwable: Throwable? = null) {
        writer?.write(Level.INFO.name, tag, message, throwable) ?: Log.i(tag, message, throwable)
    }

    /**
     * Log a WARN message.
     */
    @JvmStatic
    @JvmOverloads
    fun w(tag: String, message: String, throwable: Throwable? = null) {
        writer?.write(Level.WARN.name, tag, message, throwable) ?: Log.w(tag, message, throwable)
    }

    /**
     * Log an ERROR message.
     */
    @JvmStatic
    @JvmOverloads
    fun e(tag: String, message: String, throwable: Throwable? = null) {
        writer?.write(Level.ERROR.name, tag, message, throwable) ?: Log.e(tag, message, throwable)
    }
}
