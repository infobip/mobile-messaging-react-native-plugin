//
//  RNMMLogWriter.kt
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging

import android.util.Log
import com.facebook.react.bridge.ReactContext
import org.infobip.mobile.messaging.logging.Writer
import org.infobip.mobile.messaging.logging.Level
import org.infobip.mobile.messaging.logging.LogcatWriter
import org.infobip.reactlibrary.mobilemessaging.datamappers.ReactNativeJson
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Custom log writer that proxies Android native SDK logs to React Native console
 * Implements the Writer interface from MobileMessagingLogger
 */
class RNMMLogWriter(private val reactContext: ReactContext?) : Writer {

    companion object {
        private val dateFormat = SimpleDateFormat("HH:mm:ss.SSS", Locale.US)
    }

    private val logcatWriter: LogcatWriter = LogcatWriter()

    /**
     * Called by MobileMessagingLogger for each log entry
     * Converts log level to prefix and emits event to React Native
     *
     * @param level Log level (VERBOSE, DEBUG, INFO, WARN, ERROR)
     * @param tag Log tag (usually SDK component name)
     * @param message Log message
     * @param throwable Optional exception/throwable
     */
    override fun write(level: Level, tag: String, message: String, throwable: Throwable?) {
        write(level.name, tag, message, throwable)
    }

    /**
     * Called by RNMMLogger for each log entry
     * Converts log level to prefix and emits event to React Native
     *
     * @param level Log level (VERBOSE, DEBUG, INFO, WARN, ERROR)
     * @param tag Log tag (usually SDK component name)
     * @param message Log message
     * @param throwable Optional exception/throwable
     */
    fun write(level: String?, tag: String?, message: String?, throwable: Throwable?) {
        if (message.isNullOrBlank()) 
            return

        if (reactContext == null) {
            // Fallback to Logcat if message cannot be logged by RN console
            runCatching {
                logcatWriter.write(Level.valueOf(level ?: Level.DEBUG.name), tag, message, throwable)
            }.onFailure { 
                logcatWriter.write(Level.DEBUG, tag, message, throwable)
            }
            return
        }
            
        val timestamp = dateFormat.format(Date())
        val fullMessage = if (throwable != null) {
            "$message\n${Log.getStackTraceString(throwable)}"
        } else {
            message
        }
        val tagLog = if(tag?.isNullOrBlank() == true) "" else " [$tag]"
        val logcatStyleMessage = "$timestamp$tagLog: $fullMessage"
        val prefixedMessage = when (level) {
            Level.WARN.name -> "RNMMWARN: $logcatStyleMessage"
            Level.ERROR.name -> "RNMMERROR: $logcatStyleMessage"
            else -> logcatStyleMessage
        }
        val payload = JSONObject().apply {
            put("message", prefixedMessage)
        }
        val payloadMap = ReactNativeJson.convertJsonToMap(payload)
        ReactNativeEvent.send(ReactNativeMobileMessagingService.EVENT_PLATFORM_NATIVE_LOG_SENT, reactContext, payloadMap)
    }


}
