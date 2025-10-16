package org.infobip.reactlibrary.mobilemessaging;

import android.util.Log

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

import java.util.HashMap

class ReactNativeMobileMessagingPackage : BaseReactPackage() {

    companion object {
        private const val TAG = "ReactNativeMobileMessagingPackage"
    }

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        Log.i(TAG, "getModule...")
        return when (name) {
            MobileMessagingModule.NAME -> MobileMessagingModule(reactContext)
            RNMMChatModule.NAME -> RNMMChatModule(reactContext)
            RNMMWebRTCUIModule.NAME -> RNMMWebRTCUIModule(reactContext)
            RNMMChatViewManager.NAME -> RNMMChatViewManager(reactContext)
            else -> null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        Log.i("ReactNativeMobileMessagingPackage", "getReactModuleInfoProvider...")
        return ReactModuleInfoProvider {
            val reactModuleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
            val isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            reactModuleInfos.put(
                MobileMessagingModule.NAME,
                ReactModuleInfo(
                    MobileMessagingModule.NAME,
                    MobileMessagingModule.NAME,
                    false,          // canOverrideExistingModule
                    false,          // needsEagerInit
                    false,          // isCxxModule
                    isTurboModule   // isTurboModule
                )
            )
            reactModuleInfos.put(
                RNMMChatModule.NAME,
                ReactModuleInfo(
                    RNMMChatModule.NAME,
                    RNMMChatModule.NAME,
                    false,          // canOverrideExistingModule
                    false,          // needsEagerInit
                    false,          // isCxxModule
                    isTurboModule   // isTurboModule
                )
            )
            reactModuleInfos.put(
                RNMMWebRTCUIModule.NAME,
                ReactModuleInfo(
                    RNMMWebRTCUIModule.NAME,
                    RNMMWebRTCUIModule.NAME,
                    false,          // canOverrideExistingModule
                    false,          // needsEagerInit
                    false,          // isCxxModule
                    isTurboModule   // isTurboModule
                )
            )
            reactModuleInfos.put(
                RNMMChatViewManager.NAME,
                ReactModuleInfo(
                    RNMMChatViewManager.NAME,
                    RNMMChatViewManager.NAME,
                    false,          // canOverrideExistingModule
                    false,          // needsEagerInit
                    false,          // isCxxModule
                    isTurboModule   // isTurboModule
                )
            )
            Log.i(TAG, "ReactModuleInfos: " + reactModuleInfos.toString())
            reactModuleInfos
        }
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        Log.i(TAG, "createViewManagers...")
        return listOf(RNMMChatViewManager(reactContext))
    }
}
