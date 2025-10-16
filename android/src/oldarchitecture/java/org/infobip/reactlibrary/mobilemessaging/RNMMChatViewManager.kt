package org.infobip.reactlibrary.mobilemessaging

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import org.infobip.reactlibrary.mobilemessaging.RNMMChatView
import org.infobip.reactlibrary.mobilemessaging.Utils.getFragmentActivity
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.common.MapBuilder


@ReactModule(name = RNMMChatViewManager.NAME)
class RNMMChatViewManager(
    private val reactContext: ReactApplicationContext,
) : ViewGroupManager<RNMMChatView>() {

    companion object {
        const val NAME = "RNMMChatView"
        private const val TAG = "RNMMChatViewOldManager"
        private const val COMMAND_ADD = 1
        private const val COMMAND_REMOVE = 2
        private const val COMMAND_SHOW_THREADS_LIST = 3
        private const val COMMAND_SET_EXCEPTION_HANDLER = 4
    }

    override fun getName(): String = NAME

    override fun createViewInstance(reactContext: ThemedReactContext): RNMMChatView = RNMMChatView(reactContext)

    override fun getCommandsMap(): MutableMap<String, Int> =
        MapBuilder.of(
            "add", COMMAND_ADD,
            "remove", COMMAND_REMOVE,
            "showThreadsList", COMMAND_SHOW_THREADS_LIST,
            "setExceptionHandler", COMMAND_SET_EXCEPTION_HANDLER
        )

    @Override
    override fun receiveCommand(view: RNMMChatView, commandId: Int, args: ReadableArray?) {
        super.receiveCommand(view, commandId, args)
        when (commandId) {
            COMMAND_ADD -> add(view)
            COMMAND_REMOVE -> remove(view)
            COMMAND_SHOW_THREADS_LIST -> showThreadsList(view)
            COMMAND_SET_EXCEPTION_HANDLER -> setExceptionHandler(view, args?.getBoolean(0))
            else -> {
                Log.w(TAG, "RNMMChatViewManager received unsupported command with Id: $commandId")
            }
        }
    }

    @ReactProp(name = "sendButtonColor")
    fun setSendButtonColor(view: RNMMChatView, value: String?) {
        Log.i(TAG, "setSendButtonColor($value) is not supported in Android")
        // iOS only prop, no-op on Android
    }
 
    private fun add(view: RNMMChatView) {
        Log.i(TAG, "add()")
        view.add(reactContext, Utils.getFragmentActivity(reactContext))
    }

    private fun remove(view: RNMMChatView) {
        Log.i(TAG, "remove()")
        view.remove(Utils.getFragmentActivity(reactContext))
    }

    private fun setExceptionHandler(view: RNMMChatView, isHandlerPresent: Boolean?) {
        Log.i(TAG, "setExceptionHandler()")
        view.setExceptionHandler(isHandlerPresent ?: false, reactContext, Utils.getFragmentActivity(reactContext))
    }

    private fun showThreadsList(view: RNMMChatView) {
        Log.i(TAG, "showThreadsList()")
        view.showThreadsList(Utils.getFragmentActivity(reactContext))
    }

    override fun needsCustomLayoutForChildren(): Boolean = true

}