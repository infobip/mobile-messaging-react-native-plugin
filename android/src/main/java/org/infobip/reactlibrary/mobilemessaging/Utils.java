package org.infobip.reactlibrary.mobilemessaging;

import android.content.res.Resources;

import com.facebook.react.bridge.ReadableArray;

public class Utils {
    public static final String TAG = "RNMobileMessaging";

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
}
