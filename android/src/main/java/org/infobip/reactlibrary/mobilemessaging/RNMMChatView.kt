package org.infobip.reactlibrary.mobilemessaging

import android.content.Context
import android.os.Build
import android.util.AttributeSet
import android.util.Log
import android.view.ViewGroup
import android.view.ViewParent
import android.widget.FrameLayout
import android.view.ViewTreeObserver
import androidx.annotation.NonNull
import androidx.annotation.Nullable
import androidx.annotation.RequiresApi
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentContainerView
import androidx.fragment.app.FragmentTransaction
import org.infobip.mobile.messaging.chat.InAppChat
import org.infobip.mobile.messaging.chat.view.InAppChatFragment
import org.infobip.mobile.messaging.chat.core.InAppChatException
import org.infobip.mobile.messaging.chat.view.InAppChatErrorsHandler
import com.facebook.react.bridge.ReactApplicationContext

/**
 * RNMMChatView is a custom view that integrates the InAppChatFragment from the Infobip Mobile Messaging Chat SDK into a React Native application.
 */
class RNMMChatView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
    defStyleRes: Int = 0
) : FrameLayout(context, attrs, defStyleAttr, defStyleRes) {

    private var cachedFragment: InAppChatFragment? = null
    private var useCustomErrorHandler = false

    companion object {
        private const val TAG = "RNMMChatView"
        private const val EVENT_INAPPCHAT_EXCEPTION_RECEIVED = "inAppChat.internal.exceptionReceived"
    }

    private fun getFragment(fragmentActivity: FragmentActivity?): InAppChatFragment? {
        return cachedFragment ?: (fragmentActivity?.supportFragmentManager?.findFragmentByTag(Utils.RN_IN_APP_CHAT_FRAGMENT_TAG) as? InAppChatFragment)
    }

    fun add(reactContext: ReactApplicationContext?, fragmentActivity: FragmentActivity?) {
        runCatchingExceptions("add()") {
            val fragment = getFragment(fragmentActivity) ?: InAppChatFragment()
            cachedFragment = fragment
            fragment.withToolbar = false
            fragment.withInput = true
            if (useCustomErrorHandler && reactContext != null) {
                fragment.errorsHandler = createErrorsHandler(reactContext)
            }

            val parent: ViewParent? = this.parent
            if (parent is ViewGroup) {
                setupLayoutHack(parent)
            } else {
                Log.e(TAG, "Parent is not ViewGroup, cannot show InAppChatFragment.")
            }

            val fragmentManager = fragmentActivity?.supportFragmentManager
            if (fragmentManager != null) {
                fragmentManager.beginTransaction()
                    .replace(this.id, fragment, Utils.RN_IN_APP_CHAT_FRAGMENT_TAG)
                    .commitNow()
            } else {
                Log.e(TAG, "FragmentManager is null, cannot add InAppChatFragment.")
            }
        }
    }

    fun remove(fragmentActivity: FragmentActivity?) {
        runCatchingExceptions("remove()") {
            useCustomErrorHandler = false
            val fragmentManager = fragmentActivity?.supportFragmentManager
            val fragment = getFragment(fragmentActivity)
            if (fragment != null && fragmentManager != null) {
                fragmentManager.beginTransaction()
                    .remove(fragment)
                    .commitNow()
                cachedFragment = null
            } else {
                Log.e(TAG, "InAppChatFragment or FragmentManager is null, cannot remove InAppChatFragment.")
            }
        }
    }

    fun showThreadsList(fragmentActivity: FragmentActivity?) {
        runCatchingExceptions("showThreadsList()") {
            val fragment = getFragment(fragmentActivity)
            if (fragment != null) {
                fragment.showThreadList()
            } else {
                Log.e(TAG, "InAppChatFragment is null, cannot show threads list.")
            }
        }
    }

    fun setExceptionHandler(isHandlerPresent: Boolean, reactContext: ReactApplicationContext?, fragmentActivity: FragmentActivity?) {
        runCatchingExceptions("setExceptionHandler()", arrayOf(isHandlerPresent)) {
            useCustomErrorHandler = isHandlerPresent
            val fragment = getFragment(fragmentActivity)
            if (fragment != null && reactContext != null) {
                if (isHandlerPresent) {
                    fragment.errorsHandler = createErrorsHandler(reactContext)
                } else {
                    fragment.errorsHandler = fragment.defaultErrorsHandler
                }
            }
        }
    }

    private fun createErrorsHandler(reactContext: ReactApplicationContext): InAppChatFragment.ErrorsHandler {
        return object : InAppChatFragment.ErrorsHandler {
            override fun handlerError(error: String) {
                // Deprecated method
            }

            override fun handlerWidgetError(error: String) {
                // Deprecated method
            }

            override fun handlerNoInternetConnectionError(hasConnection: Boolean) {
                // Deprecated method
            }

            override fun handleError(exception: InAppChatException): Boolean {
                ReactNativeEvent.send(EVENT_INAPPCHAT_EXCEPTION_RECEIVED, reactContext, exception.toJSON())
                return true
            }
        }
    }

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

    private fun setupLayoutHack(view: ViewGroup) {
        view.viewTreeObserver.addOnGlobalLayoutListener { view.requestLayout() }
    }

    override fun requestLayout() {
        super.requestLayout()
        // RN issue https://github.com/facebook/react-native/issues/17968
        // Without this layout will not be called and view will not be displayed,
        // because RN doesn't dispatches events to android views properly
        post(measureAndLayout)
    }

    private val measureAndLayout = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }
    //endregion
}