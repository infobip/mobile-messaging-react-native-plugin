package org.infobip.reactlibrary.mobilemessaging;

import android.content.res.Resources;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import org.infobip.mobile.messaging.chat.view.InAppChatFragment;

public class Utils {
    public static final String TAG = "RNMobileMessaging";
    public static final String RN_IN_APP_CHAT_FRAGMENT_TAG = InAppChatFragment.class.getName();
    public static final int REQ_CODE_RESOLVE_GOOGLE_ERROR = 2;

    /**
     * Gets resource ID
     *
     * @param res         the resources where to look for
     * @param resPath     the name of the resource
     * @param packageName name of the package where the resource should be searched for
     * @return resource identifier or 0 if not found
     */
    static int getResId(Resources res, String resPath, String packageName) {
        int resId = res.getIdentifier(resPath, "mipmap", packageName);
        if (resId == 0) {
            resId = res.getIdentifier(resPath, "drawable", packageName);
        }
        if (resId == 0) {
            resId = res.getIdentifier(resPath, "raw", packageName);
        }
        if (resId == 0) {
            resId = res.getIdentifier(resPath, "style", packageName);
        }

        return resId;
    }

    static String[] resolveStringArray(ReadableArray args) {
        if (args.size() < 1 || args.getString(0) == null) {
            throw new IllegalArgumentException("Cannot resolve string parameters from arguments");
        }

        String[] array = new String[args.size()];
        for (int i = 0; i < args.size(); i++) {
            array[i] = args.getString(i);
        }

        return array;
    }

    public static class ReactNativeCallContext {
        Callback onSuccess;
        Callback onError;

        void reset() {
            onSuccess = null;
            onError = null;
        }

        boolean isValid() {
            return onSuccess != null && onError != null;
        }
    }

    public static WritableMap callbackError(String description, @Nullable Integer errorCode) {
        WritableMap errorMap = new WritableNativeMap();
        if (description != null && !description.isEmpty()) {
            errorMap.putString("description", description);
        }
        if (errorCode != null) {
            errorMap.putInt("code", errorCode);
        }
        return errorMap;
    }

    @Nullable
    public static FragmentActivity getFragmentActivity(ReactApplicationContext context) {
        FragmentActivity fragmentActivity = (FragmentActivity) context.getCurrentActivity();
        if (fragmentActivity == null) {
            Log.e(Utils.TAG, "RNMMChatViewManager can't get fragmentActivity");
            return null;
        }
        return fragmentActivity;
    }
}
