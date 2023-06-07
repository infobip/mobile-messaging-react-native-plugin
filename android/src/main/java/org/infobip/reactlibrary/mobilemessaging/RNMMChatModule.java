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

import org.infobip.mobile.messaging.MobileMessaging;
import org.infobip.mobile.messaging.chat.InAppChat;
import org.infobip.mobile.messaging.mobileapi.MobileMessagingError;
import org.infobip.mobile.messaging.mobileapi.Result;
import org.infobip.mobile.messaging.util.StringUtils;

public class RNMMChatModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {

    private static final String EVENT_INAPPCHAT_JWT_REQUESTED = "inAppChat.jwtRequested";

    private static ReactApplicationContext reactContext;

    private String jwt = null;
    private boolean isJwtProviderInitialInvocation = true;
    private final InAppChat.JwtProvider jwtProvider = () -> {
        if (!isJwtProviderInitialInvocation) {
            //send event to JS to generate new JWT and invoke native setter, then wait 150ms and return generated JWT
            ReactNativeEvent.send(EVENT_INAPPCHAT_JWT_REQUESTED, reactContext);
            try {
                Thread waitThread = new Thread(() -> {
                    try {
                        Thread.sleep(150);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        Log.e(Utils.TAG, "Thread Interrupted");
                    }
                });
                waitThread.start();
                waitThread.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                Log.e(Utils.TAG, "Thread Interrupted");
            }
        }
        isJwtProviderInitialInvocation = false;
        return this.jwt;
    };

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
    public void setLanguage(String localeString, final Callback onSuccess, final Callback onError) {
        InAppChat.getInstance(reactContext).setLanguage(localeString, new MobileMessaging.ResultListener<String>() {
            @Override
            public void onResult(Result<String, MobileMessagingError> result) {
                if (result.isSuccess()) {
                    onSuccess.invoke(result.getData());
                }
                else {
                    onError.invoke(Utils.callbackError(result.getError().getMessage(), null));
                }
            }
        });
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

    @ReactMethod
    public void setJwt(String jwt) {
        this.jwt = jwt;
        InAppChat inAppChat = InAppChat.getInstance(reactContext);
        if (inAppChat.getJwtProvider() == null) {
            inAppChat.setJwtProvider(jwtProvider);
            this.isJwtProviderInitialInvocation = true;
        }
        else if (inAppChat.getJwtProvider() != null && StringUtils.isBlank(jwt)) {
            inAppChat.setJwtProvider(null);
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
