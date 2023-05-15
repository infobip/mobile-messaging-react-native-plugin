package org.infobip.reactlibrary.mobilemessaging;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import org.infobip.mobile.messaging.chat.InAppChat;

public class RNMMChatModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {

    private static ReactApplicationContext reactContext;

    RNMMChatModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        reactContext.addActivityEventListener(this);
        reactContext.addLifecycleEventListener(this);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNMMChat";
    }

    @ReactMethod
    public void showChat(ReadableMap args) {
        InAppChat.getInstance(reactContext).inAppChatScreen().show();
    }

    @ReactMethod
    public void showThreadsList() {
        InAppChat.getInstance(reactContext).showThreadsList();
    }

    @ReactMethod
    public void getMessageCounter(final Callback successCallback) {
        successCallback.invoke(InAppChat.getInstance(reactContext).getMessageCounter());
    }

    @ReactMethod
    public void resetMessageCounter() {
        InAppChat.getInstance(reactContext).resetMessageCounter();
    }

    @ReactMethod
    public void setLanguage(String localeString) {
        InAppChat.getInstance(reactContext).setLanguage(localeString);
    }

    @ReactMethod
    public void sendContextualData(String data, Boolean allMultiThreadStrategy, Callback onSuccess, Callback onError) {
        try {
            InAppChat.getInstance(reactContext).sendContextualData(data, allMultiThreadStrategy);
            onSuccess.invoke();
        } catch (Throwable t) {
            onError.invoke(Utils.callbackError(t.getMessage(), null));
        }
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        FragmentActivity fragmentActivity = Utils.getFragmentActivity(reactContext);
        if (fragmentActivity == null) {
            return;
        }

        Fragment fragment = fragmentActivity.getSupportFragmentManager().findFragmentByTag(Utils.RN_IN_APP_CHAT_FRAGMENT_TAG);
        if (fragment == null) {
            Log.e(Utils.TAG, "RNMMChatModule can't find fragment to provide onActivityResult");
            return;
        }

        // ReactActivity's onActivityResult doesn't call it's super (FragmentActivity), so provided requestCode will be incorrect,
        // each fragment, started from an activity will increment a P value which will be appended to the requestCode provided.
        // that's why requestCode = requestCode & 0xffff
        fragment.onActivityResult(requestCode & 0xffff, resultCode, data);
    }

    @Override
    public void onNewIntent(Intent intent) {

    }

    @Override
    public void onHostResume() {

    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {
        reactContext.removeActivityEventListener(this);
        reactContext.removeLifecycleEventListener(this);
    }
}
