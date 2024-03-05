package org.infobip.reactlibrary.mobilemessaging;

import android.util.Log;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.infobip.reactlibrary.mobilemessaging.datamappers.ReactNativeJson;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


class ReactNativeEvent {

    static void send(String eventName, ReactContext reactContext, Object... objects) {
        send(eventName, reactContext, null, objects);
    }

    static void send(String eventName, ReactContext reactContext, JSONObject jsonObject, Object... objects) {
        if (jsonObject == null && objects == null) {
            Log.d(Utils.TAG, "objects are null, so another method should be used");
            send(eventName, reactContext);
            return;
        }

        WritableArray array = new WritableNativeArray();

        try {

            if (jsonObject != null) {
                array.pushMap(ReactNativeJson.convertJsonToMap(jsonObject));
            }

            for (Object value : objects) {
                if (value == null) {
                    continue;
                }
                if (value instanceof JSONObject) {
                    array.pushMap(ReactNativeJson.convertJsonToMap((JSONObject) value));
                } else if (value instanceof JSONArray) {
                    array.pushArray(ReactNativeJson.convertJsonToArray((JSONArray) value));
                } else if (value instanceof Boolean) {
                    array.pushBoolean((Boolean) value);
                } else if (value instanceof Integer) {
                    array.pushInt((Integer) value);
                } else if (value instanceof Double) {
                    array.pushDouble((Double) value);
                } else if (value instanceof String) {
                    array.pushString((String) value);
                } else {
                    array.pushString(value.toString());
                }
            }
        } catch (JSONException e) {
            Log.e(Utils.TAG, "Arguments can't be converted to JS types");
        }
        send(eventName, reactContext, array);
    }

    static void send(String eventName, ReactContext reactContext, ReadableMap map) {
        if (eventName == null || map == null) {
            return;
        }

        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, map);
    }

    static void send(String eventName, ReactContext reactContext, ReadableArray array) {
        if (eventName == null || array == null) {
            return;
        }

        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, array);
    }

    static void send(String eventName, ReactContext reactContext) {
        if (eventName == null) {
            return;
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, null);
    }

}
