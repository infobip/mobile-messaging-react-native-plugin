package org.infobip.reactlibrary.mobilemessaging

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.drawable.Drawable
import android.graphics.drawable.BitmapDrawable
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.annotation.NonNull
import com.facebook.react.bridge.*
import org.infobip.mobile.messaging.MobileMessaging
import org.infobip.mobile.messaging.chat.InAppChat
import org.infobip.mobile.messaging.chat.core.InAppChatException
import org.infobip.mobile.messaging.chat.core.JwtProvider
import org.infobip.mobile.messaging.chat.core.MultithreadStrategy
import org.infobip.mobile.messaging.chat.core.widget.LivechatWidgetLanguage
import org.infobip.mobile.messaging.chat.core.InAppChatEvent
import org.infobip.mobile.messaging.chat.view.InAppChatErrorsHandler
import org.infobip.mobile.messaging.chat.view.styles.PluginChatCustomization
import org.infobip.mobile.messaging.chat.view.styles.PluginChatCustomization.DrawableLoader
import org.infobip.mobile.messaging.mobileapi.MobileMessagingError
import org.infobip.mobile.messaging.mobileapi.Result
import org.infobip.mobile.messaging.BroadcastParameter

import org.infobip.reactlibrary.mobilemessaging.datamappers.ReactNativeJson
import org.infobip.reactlibrary.mobilemessaging.ReactNativeBroadcastReceiver
import com.facebook.react.bridge.ReactContext

import java.io.IOException
import java.net.URL
import java.util.Queue
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.atomic.AtomicBoolean

/**
 * RNMMChatService is a executor for React Native module that provides an interface to the In-App Chat functionality.
 */
class RNMMChatService(
    private val reactContext: ReactApplicationContext,
) : ActivityEventListener, LifecycleEventListener {

    companion object {
        private const val TAG = "RNMMChatService"
        private const val EVENT_INAPPCHAT_JWT_REQUESTED = "inAppChat.internal.jwtRequested"
        private const val EVENT_INAPPCHAT_EXCEPTION_RECEIVED = "inAppChat.internal.exceptionReceived"
        private const val EVENT_INAPPCHAT_CONFIGURATION_SYNCED = "inAppChat.configurationSynced"
        private const val EVENT_INAPPCHAT_VIEW_STATE_CHANGED = "inAppChat.viewStateChanged"
        private const val EVENT_INAPPCHAT_AVAILABILITY_UPDATED = "inAppChat.availabilityUpdated"
        private const val EVENT_INAPPCHAT_LIVECHAT_REGISTRATION_ID_UPDATED = "inAppChat.livechatRegistrationIdUpdated"
        const val EVENT_INAPPCHAT_UNREAD_MESSAGES_COUNT_UPDATED = "inAppChat.unreadMessageCounterUpdated"

        private val broadcastEventMap = mapOf(
            InAppChatEvent.CHAT_CONFIGURATION_SYNCED.key to EVENT_INAPPCHAT_CONFIGURATION_SYNCED,
            InAppChatEvent.CHAT_VIEW_CHANGED.key to EVENT_INAPPCHAT_VIEW_STATE_CHANGED,
            InAppChatEvent.IN_APP_CHAT_AVAILABILITY_UPDATED.key to EVENT_INAPPCHAT_AVAILABILITY_UPDATED,
            InAppChatEvent.LIVECHAT_REGISTRATION_ID_UPDATED.key to EVENT_INAPPCHAT_LIVECHAT_REGISTRATION_ID_UPDATED
        )

        fun getChatBroadcastIntentFilter(): IntentFilter {
            return IntentFilter().apply {
                broadcastEventMap
                    .keys
                    .forEach { addAction(it) }
            }
        }

        fun getChatBroadcastReceiver(reactContext: ReactApplicationContext): BroadcastReceiver {
            return object : BroadcastReceiver() {
                override fun onReceive(context: Context, intent: Intent) {
                    val event = broadcastEventMap[intent.action]
                    if (event == null) {
                        Log.w(TAG, "Cannot process event for broadcast: ${intent.action}")
                        return
                    }

                    var payload: String? = null
                    when (intent.action) {
                        InAppChatEvent.CHAT_VIEW_CHANGED.key -> {
                            payload = intent.getStringExtra(BroadcastParameter.EXTRA_CHAT_VIEW)
                        }
                        InAppChatEvent.LIVECHAT_REGISTRATION_ID_UPDATED.key -> {
                            payload = intent.getStringExtra(BroadcastParameter.EXTRA_LIVECHAT_REGISTRATION_ID)
                        }
                        InAppChatEvent.IN_APP_CHAT_AVAILABILITY_UPDATED.key -> {
                            payload = intent.getBooleanExtra(BroadcastParameter.EXTRA_IS_CHAT_AVAILABLE, false).toString()
                        }
                    }

                    if (payload == null) {
                        ReactNativeEvent.send(event, reactContext)
                    } else {
                        ReactNativeEvent.send(event, reactContext, payload)
                    }
                }
            }
        }

    }

    private val chatJwtCallbackHolder = ChatJwtCallbackHolder()

    private val inAppChat: InAppChat
        get() = InAppChat.getInstance(reactContext.applicationContext)

    init {
        runCatchingExceptions("Service initialization") {
            reactContext.addActivityEventListener(this)
            reactContext.addLifecycleEventListener(this)
        }
    }

    //region Chat module methods
    fun showChat(args: ReadableMap?) {
        runCatchingExceptions("showChat()") {
            inAppChat.inAppChatScreen().show()
        }
    }

    fun getMessageCounter(onSuccess: Callback) {
        runCatchingExceptions("getMessageCounter()") {
            onSuccess.invoke(inAppChat.messageCounter)
        } 
    }

    fun resetMessageCounter() {
        runCatchingExceptions("resetMessageCounter()") {
            inAppChat.resetMessageCounter()
        } 
    }

    fun setLanguage(localeString: String, onSuccess: Callback, onError: Callback) {
        runCatchingExceptions(
            functionName = "setLanguage()",
            args = arrayOf(localeString),
            block = {
                val widgetLanguage = LivechatWidgetLanguage.findLanguageOrDefault(localeString)
                inAppChat.setLanguage(widgetLanguage, object : MobileMessaging.ResultListener<LivechatWidgetLanguage>() {
                    override fun onResult(result: Result<LivechatWidgetLanguage, MobileMessagingError>) {
                        if (result.isSuccess) {
                            onSuccess.invoke(result.data?.toString())
                        } else {
                            onError.invoke(Utils.callbackError(result.error?.message, null))
                        }
                    }
                })
            },
            errorHandler = { t -> 
                onError.invoke(Utils.callbackError(t.message, null))
            }
        )
    }

    fun sendContextualData(data: String, multithreadStrategyFlag: String, onSuccess: Callback, onError: Callback) {
        runCatchingExceptions(
            functionName = "sendContextualData()",
            args = arrayOf(data, multithreadStrategyFlag),
            block = {
                inAppChat.sendContextualData(data, MultithreadStrategy.valueOf(multithreadStrategyFlag))
                onSuccess.invoke()
            },
            errorHandler = { t -> 
                onError.invoke(Utils.callbackError(t.message, null)) 
            }
         ) 
    }

    fun setWidgetTheme(widgetTheme: String?) {
        runCatchingExceptions("setWidgetTheme()", arrayOf(widgetTheme)) {
            inAppChat.setWidgetTheme(widgetTheme)
        }
    }

    private val reactNativeDrawableLoader = object : PluginChatCustomization.DrawableLoader {
        override fun loadDrawable(context: Context, drawableSrc: String?): Drawable? {
            if (drawableSrc.isNullOrBlank()) return null
            return try {
                URL(drawableSrc).openStream().use { drawableStream ->
                    BitmapDrawable(context.resources, drawableStream)
                }
            } catch (e: IOException) {
                Log.e("PluginChatCustomization.DrawableLoader", "Failed to load image $drawableSrc", e)
                null
            }
        }
    }

    fun setChatCustomization(map: ReadableMap?) {
        runCatchingExceptions("setChatCustomization()", arrayOf(map)) {
            val theme = map?.let { ReactNativeJson.convertMapToJson(it) }
                ?.let { PluginChatCustomization.parseOrNull(it) }
                ?.let { it.createTheme(reactContext, reactNativeDrawableLoader) }
            inAppChat.setTheme(theme)
        }
    }

    fun setChatPushTitle(title: String?) {
        runCatchingExceptions("setChatPushTitle()", arrayOf(title)) {
            inAppChat.setChatPushTitle(title)
        }
    }

    fun setChatPushBody(body: String?) {
        runCatchingExceptions("setChatPushBody()", arrayOf(body)) {
            inAppChat.setChatPushBody(body)
        }
    }

    private class ChatJwtCallbackHolder {
        private var reactContext: ReactApplicationContext? = null
        private val queue: Queue<JwtProvider.JwtCallback> = ConcurrentLinkedQueue()
        private val awaitingJwtFromJs = AtomicBoolean(false)

        private fun sendRequestEvent() {
            reactContext
                ?.let { ReactNativeEvent.send(EVENT_INAPPCHAT_JWT_REQUESTED, it)}
                ?: Log.e(TAG, "React context is null, cannot send request for JWT.")
        }

        fun requestJwt(callback: JwtProvider.JwtCallback) {
            queue.add(callback)
            if (awaitingJwtFromJs.compareAndSet(false, true)) {
                sendRequestEvent()
            }
        }

        fun resumeWithJwt(newJwt: String) {
            try {
                val runnable = Runnable {
                    queue.poll()?.onJwtReady(newJwt)
                    updateAwaitingState()
                }
                reactContext?.runOnUiQueueThread(runnable) ?: run {
                    Log.w(TAG, "React context is null, cannot resume with JWT value on UI thread.")
                    runnable.run()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Could not resume with JWT value $newJwt", e)
            }
        }

        fun resumeWithError(throwable: Throwable) {
            try {
                val runnable = Runnable {
                    queue.poll()?.onJwtError(throwable)
                    updateAwaitingState()
                }
                reactContext?.runOnUiQueueThread(runnable) ?: run {
                    Log.w(TAG, "React context is null, cannot resume with JWT error on UI thread.")
                    runnable.run()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Could not resume with JWT error ${throwable.message}", e)
            }
        }

        private fun updateAwaitingState() {
            if (queue.isEmpty()) {
                awaitingJwtFromJs.set(false)
            } else {
                awaitingJwtFromJs.set(true)
                sendRequestEvent()
            }
        }

        fun getReactContext(): ReactApplicationContext? = reactContext

        fun setReactContext(reactContext: ReactApplicationContext) {
            this.reactContext = reactContext
        }
    }

    fun setChatJwtProvider() {
        runCatchingExceptions("setChatJwtProvider()") {
            if (chatJwtCallbackHolder.getReactContext() == null) {
                chatJwtCallbackHolder.setReactContext(reactContext)
            }
            val jwtProvider = JwtProvider { callback ->
                chatJwtCallbackHolder.requestJwt(callback)
            }
            inAppChat.setWidgetJwtProvider(jwtProvider)
        }
    }

    fun setChatJwt(jwt: String?) {
        runCatchingExceptions("setChatJwt()", arrayOf(jwt)) {
            if (jwt.isNullOrEmpty()) {
                chatJwtCallbackHolder.resumeWithError(IllegalArgumentException("Provided chat JWT is null or empty."))
            } else {
                chatJwtCallbackHolder.resumeWithJwt(jwt)
            }
        }
    }

    fun setChatExceptionHandler(isHandlerPresent: Boolean) {
        runCatchingExceptions("setChatExceptionHandler()", arrayOf(isHandlerPresent)) {
            if (isHandlerPresent) {
                inAppChat.inAppChatScreen().errorHandler = createErrorsHandler()
            } else {
                inAppChat.inAppChatScreen().errorHandler = null
            }
        }
    }

    private fun createErrorsHandler(): InAppChatErrorsHandler {
        return object : InAppChatErrorsHandler {
            override fun handlerError(@NonNull error: String) {
                // Deprecated method
            }

            override fun handlerWidgetError(@NonNull error: String) {
                // Deprecated method
            }

            override fun handlerNoInternetConnectionError(hasConnection: Boolean) {
                // Deprecated method
            }

            override fun handleError(@NonNull exception: InAppChatException): Boolean {
                reactContext
                    ?.let { ReactNativeEvent.send(EVENT_INAPPCHAT_EXCEPTION_RECEIVED, it, exception.toJSON())}
                    ?: Log.e(Utils.TAG, "React context is null, cannot propagate chat exception.")
                return true
            }
        }
    }
    //endregion

    //region ActivityEventListener
    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        val fragmentActivity = Utils.getFragmentActivity(reactContext) ?: return
        val fragment = fragmentActivity.supportFragmentManager.findFragmentByTag(Utils.RN_IN_APP_CHAT_FRAGMENT_TAG)
        if (fragment == null) {
            Log.w(TAG, "Can't find ${Utils.RN_IN_APP_CHAT_FRAGMENT_TAG} to provide onActivityResult")
            return
        }
        fragment.onActivityResult(requestCode and 0xffff, resultCode, data)
    }

    override fun onNewIntent(intent: Intent?) {
        // Activity `onNewIntent` - no-op
    }
    //endregion

    //region LifecycleEventListener
    override fun onHostResume() {
        Log.d(TAG, "onHostResume()")
    }

    override fun onHostPause() {
        Log.d(TAG, "onHostPause()")
    }

    override fun onHostDestroy() {
        Log.d(TAG, "onHostDestroy()")
        reactContext.removeActivityEventListener(this)
        reactContext.removeLifecycleEventListener(this)
    }
    //endregion

    //region Helpers
    private fun runCatchingExceptions(functionName: String, args: Array<out Any?> = emptyArray(), errorHandler: ((Throwable) -> Unit)? = null, block: () -> Unit) {
        val argsLog = if (args.isEmpty()) "" else " Arguments: ${args.joinToString()}"
        Log.d(TAG, "$functionName$argsLog")
        try {
            block()
        } catch (throwable: Throwable) {
            errorHandler?.invoke(throwable) ?: Log.e(TAG, "$functionName error: ${throwable.message}", throwable)
        }
    }
    //endregion
}

class RNMMChatEventReceiver : ReactNativeBroadcastReceiver() {

    companion object {
        private const val TAG = "RNMMChatEventReceiver"
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (InAppChatEvent.UNREAD_MESSAGES_COUNTER_UPDATED.key != intent?.action) {
            Log.w(TAG, "Cannot process event for broadcast: ${intent?.action}")
            return
        }
        val unreadChatMessagesCounter = intent.getIntExtra(BroadcastParameter.EXTRA_UNREAD_CHAT_MESSAGES_COUNT, 0)
        emitOrCache(context, RNMMChatService.EVENT_INAPPCHAT_UNREAD_MESSAGES_COUNT_UPDATED, unreadChatMessagesCounter)
    }

    private fun emitOrCache(context: Context?, eventType: String, unreadMessagesCounter: Int) {
        val reactContext: ReactContext? = getReactContext(context)
        if (!pluginInitialized || reactContext == null) {
            CacheManager.saveEvent(context, eventType, unreadMessagesCounter)
        } else if (jsHasListeners && reactContext != null) {
            ReactNativeEvent.send(eventType, reactContext, unreadMessagesCounter)
        } else if (reactContext != null) {
            CacheManager.saveEvent(reactContext, eventType, unreadMessagesCounter)
        } else if (context != null) {
            CacheManager.saveEvent(context, eventType, unreadMessagesCounter)
        } else {
            Log.e(TAG, "Both reactContext and androidContext are null, can't emit or cache event " + eventType)
        }
    }
}