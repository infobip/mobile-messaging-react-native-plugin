package org.infobip.reactlibrary.mobilemessaging;

import android.app.Activity;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import org.infobip.mobile.messaging.chat.InAppChat;

public class RNMMChatModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    RNMMChatModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "RNMMChat";
    }

    @ReactMethod
    public void showChat(ReadableMap args) {
        InAppChat.getInstance(reactContext).inAppChatView().show();
    }
}
