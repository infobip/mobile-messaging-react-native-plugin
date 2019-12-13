package com.reactlibrary.userdatamappers;

import android.util.Log;

import org.infobip.mobile.messaging.Message;
import org.json.JSONException;
import org.json.JSONObject;

public class MessageJson {
    /**
     * Creates json from a message object
     *
     * @param message message object
     * @return message json
     */
    public static JSONObject toJSON(Message message) {
        try {
            return new JSONObject()
                    .putOpt("messageId", message.getMessageId())
                    .putOpt("title", message.getTitle())
                    .putOpt("body", message.getBody())
                    .putOpt("sound", message.getSound())
                    .putOpt("vibrate", message.isVibrate())
                    .putOpt("icon", message.getIcon())
                    .putOpt("silent", message.isSilent())
                    .putOpt("category", message.getCategory())
                    .putOpt("from", message.getFrom())
                    .putOpt("receivedTimestamp", message.getReceivedTimestamp())
                    .putOpt("customPayload", message.getCustomPayload())
                    .putOpt("contentUrl", message.getContentUrl())
                    .putOpt("seen", message.getSeenTimestamp() != 0)
                    .putOpt("seenDate", message.getSeenTimestamp())
                    .putOpt("geo", hasGeo(message));
        } catch (JSONException e) {
            Log.w(com.reactlibrary.Utils.TAG, "Cannot convert message to JSON: " + e.getMessage());
            Log.d(com.reactlibrary.Utils.TAG, Log.getStackTraceString(e));
            return null;
        }
    }

    private static boolean hasGeo(Message message) {
        if (message == null || message.getInternalData() == null) {
            return false;
        }

        try {
            JSONObject geo = new JSONObject(message.getInternalData());
            return geo.getJSONArray("geo") != null && geo.getJSONArray("geo").length() > 0;
        } catch (JSONException e) {
            return false;
        }
    }
}
