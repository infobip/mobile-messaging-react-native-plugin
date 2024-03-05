package org.infobip.reactlibrary.mobilemessaging.datamappers;

import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;

import org.infobip.mobile.messaging.Message;
import org.infobip.reactlibrary.mobilemessaging.Utils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class MessageJson {
    /**
     * Creates new json object based on message bundle
     *
     * @param bundle message bundle
     * @return message object in json format
     */
    public static JSONObject bundleToJSON(Bundle bundle) {
        Message message = Message.createFrom(bundle);
        if (message == null) {
            return null;
        }

        return toJSON(message);
    }

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
                    .putOpt("geo", hasGeo(message))
                    .putOpt("chat", message.isChatMessage())
                    .putOpt("browserUrl", message.getBrowserUrl())
                    .putOpt("webViewUrl", message.getWebViewUrl())
                    .putOpt("deeplink", message.getDeeplink())
                    .putOpt("inAppOpenTitle", message.getInAppOpenTitle())
                    .putOpt("inAppDismissTitle", message.getInAppDismissTitle());
        } catch (JSONException e) {
            Log.w(Utils.TAG, "Cannot convert message to JSON: " + e.getMessage());
            Log.d(Utils.TAG, Log.getStackTraceString(e));
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

    /**
     * Creates array of json objects from list of messages
     *
     * @param messages list of messages
     * @return array of jsons representing messages
     */
    public static JSONArray toJSONArray(@NonNull Message messages[]) {
        JSONArray array = new JSONArray();
        for (Message message : messages) {
            JSONObject json = toJSON(message);
            if (json == null) {
                continue;
            }
            array.put(json);
        }
        return array;
    }

    /**
     * Creates new messages from json object
     *
     * @param json json object
     * @return new {@link Message} object.
     */
    private static Message fromJSON(JSONObject json) {
        if (json == null) {
            return null;
        }

        Message message = new Message();
        message.setMessageId(json.optString("messageId", null));
        message.setTitle(json.optString("title", null));
        message.setBody(json.optString("body", null));
        message.setSound(json.optString("sound", null));
        message.setVibrate(json.optBoolean("vibrate", true));
        message.setIcon(json.optString("icon", null));
        message.setSilent(json.optBoolean("silent", false));
        message.setCategory(json.optString("category", null));
        message.setFrom(json.optString("from", null));
        message.setReceivedTimestamp(json.optLong("receivedTimestamp", 0));
        message.setCustomPayload(json.optJSONObject("customPayload"));
        message.setContentUrl(json.optString("contentUrl", null));
        message.setSeenTimestamp(json.optLong("seenDate", 0));
        message.setBrowserUrl(json.optString("browserUrl", null));
        message.setWebViewUrl(json.optString("webViewUrl", null));
        message.setDeeplink(json.optString("deeplink", null));
        message.setInAppOpenTitle(json.optString("inAppOpenTitle", null));
        message.setInAppDismissTitle(json.optString("inAppDismissTitle", null));
        if (json.optBoolean("chat", false)) {
            message.setMessageType(Message.MESSAGE_TYPE_CHAT);
        }
        return message;
    }

    /**
     * Geo mapper
     *
     * @param bundle where to read geo objects from
     * @return list of json objects representing geo objects
     */
    @NonNull
    public static List<JSONObject> geosFromBundle(Bundle bundle) {
        try {
            Class<?> cls = Class.forName("org.infobip.mobile.messaging.geo.mapper.GeoBundleMapper");
            Method geosFromBundle_method = cls.getDeclaredMethod("geosFromBundle", Bundle.class);
            List<JSONObject> geos = (List<JSONObject>) geosFromBundle_method.invoke(cls, bundle);
            return geos;
        } catch (Exception e) {
            Log.w(Utils.TAG, "Cannot convert geo to JSON: " + e.getMessage());
            Log.d(Utils.TAG, Log.getStackTraceString(e));
        }
        return new ArrayList<JSONObject>();
    }

    @NonNull
    public static List<Message> resolveMessages(JSONArray args) throws JSONException {
        if (args == null || args.length() < 1 || args.getString(0) == null) {
            throw new IllegalArgumentException("Cannot resolve messages from arguments");
        }

        List<Message> messages = new ArrayList<Message>(args.length());
        for (int i = 0; i < args.length(); i++) {
            Message m = fromJSON(args.optJSONObject(i));
            if (m == null) {
                continue;
            }

            messages.add(m);
        }
        return messages;
    }
}
