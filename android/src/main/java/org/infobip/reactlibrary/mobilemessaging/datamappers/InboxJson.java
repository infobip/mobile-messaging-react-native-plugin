package org.infobip.reactlibrary.mobilemessaging.datamappers;

import com.facebook.react.bridge.ReadableMap;
import org.infobip.mobile.messaging.inbox.Inbox;
import org.infobip.mobile.messaging.inbox.InboxMapper;
import org.json.JSONException;
import org.json.JSONObject;

public class InboxJson extends Inbox {

    public static JSONObject toJSON(final Inbox inbox) {
        if (inbox == null) {
            return new JSONObject();
        }
        try {
            return new JSONObject(inbox.toString());
        } catch (JSONException e) {
            e.printStackTrace();
            return new JSONObject();
        }
    }

    public static ReadableMap toReadableMap(final Inbox inbox) {
        try {
            return ReactNativeJson.convertJsonToMap(toJSON(inbox));
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }
}
