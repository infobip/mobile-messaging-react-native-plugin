package com.reactlibrary;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

class CallbackEvent {
    @SuppressWarnings("UnusedReturnValue")
    static boolean send(String eventName, ReactContext reactContext, Object object1, Object... objects) {
        if (eventName == null || object1 == null) {
            return false;
        }

        WritableMap parameters = new WritableNativeMap();
        parameters.putString(eventName, "event");
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, parameters);
        return true;
    }

    @SuppressWarnings("UnusedReturnValue")
    static boolean send(String eventName, ReactContext reactContext) {
        if (eventName == null) {
            return false;
        }

        WritableMap parameters = new WritableNativeMap();
        parameters.putString(eventName, "event");
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, parameters);
        return true;
    }

}
