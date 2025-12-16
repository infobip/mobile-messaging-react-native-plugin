//
//  RNMMWebRTCUIService.kt
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

package org.infobip.reactlibrary.mobilemessaging

import android.content.Context
import androidx.annotation.NonNull
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import org.infobip.mobile.messaging.util.StringUtils
import java.lang.reflect.Proxy

/**
 * RNMMWebRTCUIService is a executor for React Native module that provides an interface to the InfobipRtcUi functionality.
 */
class RNMMWebRTCUIService(
    private val reactContext: ReactApplicationContext
) {

    companion object {
        private var infobipRtcUiInstance: Any? = null
        const val TAG = "RNMMWebRTCUI"

        fun resetLogger(reactContext: ReactApplicationContext?) {
            if (reactContext == null) {
                RNMMLogger.w(TAG, "ReactContext is null, cannot enable native logs for WebRTCUI")
                return
            }
            try {
                val rtcUiLoggerClass = Class.forName("com.infobip.webrtc.ui.logging.RtcUiLogger")
                val rtcUiLoggerInstance = rtcUiLoggerClass.getField("INSTANCE").get(null)

                val resetMethod = rtcUiLoggerClass.getDeclaredMethod("reset")
                resetMethod.isAccessible = true
                resetMethod.invoke(rtcUiLoggerInstance)
            } catch (e: ClassNotFoundException) {
                // Ignored - Android WebRtcUi not enabled - no logs to enable
            } catch (t: Throwable) {
                RNMMLogger.e(TAG, "Cannot reset logger for WebRTCUI. Something went wrong.", t)
            }
        }

        fun enforceLogsWriter(reactContext: ReactApplicationContext?, writer: RNMMLogWriter) {
            if (reactContext == null) {
                RNMMLogger.w(TAG, "ReactContext is null, cannot enable native logs for WebRTCUI")
                return
            }
            try {
                val rtcUiLoggerClass = Class.forName("com.infobip.webrtc.ui.logging.RtcUiLogger")
                val rtcUiLoggerInstance = rtcUiLoggerClass.getField("INSTANCE").get(null)

                val initMethod = rtcUiLoggerClass.getDeclaredMethod("init", Context::class.java)
                initMethod.isAccessible = true
                initMethod.invoke(rtcUiLoggerInstance, reactContext.applicationContext)

                val enforceMethod = rtcUiLoggerClass.getDeclaredMethod("enforce")
                enforceMethod.isAccessible = true
                enforceMethod.invoke(rtcUiLoggerInstance)

                val rtcUiWriterClass = Class.forName("com.infobip.webrtc.ui.logging.RtcUiWriter")
                val writerInstance = java.lang.reflect.Proxy.newProxyInstance(rtcUiWriterClass.classLoader, arrayOf(rtcUiWriterClass)) { _, method, args ->
                    if ("write" == method.name) {
                        val level: Any? = args?.getOrNull(0)
                        val levelName: String? = (level as? Enum<*>)?.name
                        val tag: String = args?.getOrNull(1) as? String ?: ""
                        val message: String = args?.getOrNull(2) as? String ?: ""
                        val throwable: Throwable? = args?.getOrNull(3) as? Throwable
                        writer.write(levelName, tag, message, throwable)
                    }
                    null
                }

                val setWriterMethod = rtcUiLoggerClass.getDeclaredMethod("setWriter", rtcUiWriterClass)
                setWriterMethod.isAccessible = true
                setWriterMethod.invoke(rtcUiLoggerInstance, writerInstance)
            } catch (e: ClassNotFoundException) {
                // Ignored - Android WebRtcUi not enabled - no logs to enable
            } catch (t: Throwable) {
                RNMMLogger.e(TAG, "Cannot enable native logs for WebRTCUI. Something went wrong.", t)
            }
        }

    }

    private var successListenerClass: Class<*>? = null
    private var errorListenerClass: Class<*>? = null
    private var listenTypeClass: Class<*>? = null

    fun enableChatCalls(onSuccess: Callback, onError: Callback) {
        enableCalls(true, null, onSuccess, onError)
    }

    fun enableCalls(identity: String, onSuccess: Callback, onError: Callback) {
        enableCalls(false, identity, onSuccess, onError)
    }

    private fun enableCalls(
        enableChatCalls: Boolean,
        identity: String?,
        onSuccess: Callback,
        onError: Callback
    ) {
        try {
            val configuration = ConfigCache.configuration
            if (configuration == null) {
                onError.invoke(Utils.callbackError("Mobile messaging not initialized. Please call mobileMessaging.init().", null))
            } else if (configuration.webRTCUI != null && configuration.webRTCUI.configurationId != null) {
                val rtcUiBuilderClass = Class.forName("com.infobip.webrtc.ui.InfobipRtcUi\$Builder")
                val rtcUiBuilderFinalStepClass = Class.forName("com.infobip.webrtc.ui.InfobipRtcUi\$BuilderFinalStep")
                val rtcUiBuilder = rtcUiBuilderClass.getDeclaredConstructor(Context::class.java).newInstance(reactContext)
                val successListener = successListenerProxy(onSuccess)
                val errorListener = errorListenerProxy(onError)
                rtcUiBuilderClass.getMethod("withConfigurationId", String::class.java).invoke(rtcUiBuilder, configuration.webRTCUI.configurationId)
                val rtcUiBuilderFinalStep = when {
                    enableChatCalls -> {
                        rtcUiBuilderClass.getMethod(
                            "withInAppChatCalls",
                            getSuccessListenerClass(),
                            getErrorListenerClass()
                        ).invoke(rtcUiBuilder, successListener, errorListener)
                    }
                    identity?.isNotBlank() == true -> {
                        rtcUiBuilderClass.getMethod(
                            "withCalls",
                            String::class.java,
                            getListenTypeClass(),
                            getSuccessListenerClass(),
                            getErrorListenerClass()
                        ).invoke(rtcUiBuilder, identity, pushListenType(), successListener, errorListener)
                    }
                    else -> {
                        rtcUiBuilderClass.getMethod(
                            "withCalls",
                            getSuccessListenerClass(),
                            getErrorListenerClass()
                        ).invoke(rtcUiBuilder, successListener, errorListener)
                    }
                }
                infobipRtcUiInstance = rtcUiBuilderFinalStepClass.getMethod("build").invoke(rtcUiBuilderFinalStep)
            } else {
                onError.invoke(Utils.callbackError("Configuration does not contain webRTCUI data.", null))
            }
        } catch (e: ClassNotFoundException) {
            onError.invoke(Utils.callbackError("Android WebRtcUi not enabled. Please set flag buildscript {ext { withWebRTCUI = true } } in your build.gradle.", null))
        } catch (e: ReflectiveOperationException) {
            onError.invoke(Utils.callbackError("Cannot enable calls. ${e.message}", null))
        } catch (t: Throwable) {
            onError.invoke(Utils.callbackError("Something went wrong. ${t.message}", null))
        }
    }

    @Throws(ClassNotFoundException::class)
    private fun getSuccessListenerClass(): Class<*> {
        return successListenerClass ?: Class.forName("com.infobip.webrtc.ui.SuccessListener").also { successListenerClass = it }
    }

    @Throws(ClassNotFoundException::class)
    private fun getErrorListenerClass(): Class<*> {
        return errorListenerClass ?: Class.forName("com.infobip.webrtc.ui.ErrorListener").also { errorListenerClass = it }
    }

    @Throws(ClassNotFoundException::class)
    private fun getListenTypeClass(): Class<*> {
        return listenTypeClass ?: Class.forName("com.infobip.webrtc.ui.model.ListenType").also { listenTypeClass = it }
    }

    @Throws(ClassNotFoundException::class)
    private fun errorListenerProxy(onError: Callback): Any {
        return Proxy.newProxyInstance(
            javaClass.classLoader,
            arrayOf(getErrorListenerClass())
        ) { _, method, args ->
            if (method.name == "onError" && args != null && args.isNotEmpty() && args[0] is Throwable) {
                val throwable = args[0] as Throwable
                onError.invoke(Utils.callbackError(throwable.message, null))
            }
            null
        }
    }

    @Throws(ClassNotFoundException::class)
    private fun successListenerProxy(onSuccess: Callback): Any {
        return Proxy.newProxyInstance(
            javaClass.classLoader,
            arrayOf(getSuccessListenerClass())
        ) { _, method, _ ->
            if (method.name == "onSuccess") {
                onSuccess.invoke()
            }
            null
        }
    }

    @Suppress("UNCHECKED_CAST")
    @Throws(ClassNotFoundException::class)
    private fun pushListenType(): Any {
        val enumClass = Class.forName("com.infobip.webrtc.ui.model.ListenType") as Class<out Enum<*>>
        return java.lang.Enum.valueOf(enumClass, "PUSH")
    }

    fun disableCalls(onSuccess: Callback, onError: Callback) {
        if (infobipRtcUiInstance == null) {
            onError.invoke(Utils.callbackError("Calls are not enabled.", null))
        } else {
            try {
                val infobipRtcUiClass = Class.forName("com.infobip.webrtc.ui.InfobipRtcUi")
                infobipRtcUiClass.getMethod(
                    "disableCalls",
                    getSuccessListenerClass(),
                    getErrorListenerClass()
                ).invoke(
                    infobipRtcUiInstance,
                    successListenerProxy(onSuccess),
                    errorListenerProxy(onError)
                )
            } catch (e: ClassNotFoundException) {
                onError.invoke(Utils.callbackError("Android WebRtcUi not enabled. Please set flag buildscript {ext { withWebRTCUI = true } } in your build.gradle.", null))
            } catch (e: ReflectiveOperationException) {
                onError.invoke(Utils.callbackError("Cannot disable calls. ${e.message}", null))
            } catch (t: Throwable) {
                onError.invoke(Utils.callbackError("Something went wrong. ${t.message}", null))
            }
        }
    }
}