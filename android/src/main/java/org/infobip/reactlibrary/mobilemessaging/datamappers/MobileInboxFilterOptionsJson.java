package org.infobip.reactlibrary.mobilemessaging.datamappers;

import androidx.annotation.NonNull;
import android.util.Log;

import org.infobip.mobile.messaging.api.support.http.serialization.JsonSerializer;
import org.infobip.mobile.messaging.inbox.MobileInboxFilterOptions;
import org.infobip.reactlibrary.mobilemessaging.Utils;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Inbox filter data mapper for JSON conversion
 */
public class MobileInboxFilterOptionsJson extends MobileInboxFilterOptions {

    private static final JsonSerializer nullSerializer = new JsonSerializer(true);

    public MobileInboxFilterOptionsJson(Date fromDateTime, Date toDateTime, String topic, Integer limit) {
        super(fromDateTime, toDateTime, topic, limit);
    }

    public static JSONObject toJSON(final MobileInboxFilterOptions mobileInboxFilterOptions) {
        if (mobileInboxFilterOptions == null) {
            return new JSONObject();
        }
        try {
            return new JSONObject(nullSerializer.serialize(mobileInboxFilterOptions));
        } catch (JSONException e) {
            e.printStackTrace();
            return new JSONObject();
        }
    }

    @NonNull
    public static MobileInboxFilterOptions resolveMobileInboxFilterOptions(JSONObject args) throws IllegalArgumentException {
        if (args == null) {
            throw new IllegalArgumentException("Cannot resolve inbox filters from arguments");
        }
        return MobileInboxFilterOptionsJson.mobileInboxFilterOptionsFromJSON(args);
    }

    private static MobileInboxFilterOptions mobileInboxFilterOptionsFromJSON(JSONObject json) throws IllegalArgumentException {
        MobileInboxFilterOptions mobileInboxFilterOptions = null;
        String fromDate = null;
        String toDate = null;
        String topic = null;
        Integer limit = null;
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZZZZZ");
        try {
            if (json.has(MobileInboxFilterOptionsAttrs.fromDateTime)) {
                fromDate = json.optString(MobileInboxFilterOptionsAttrs.fromDateTime);
            }
            if (json.has(MobileInboxFilterOptionsAttrs.toDateTime)) {
                toDate = json.optString(MobileInboxFilterOptionsAttrs.toDateTime);
            }
            if (json.has(MobileInboxFilterOptionsAttrs.topic)) {
                topic = json.optString(MobileInboxFilterOptionsAttrs.topic);
            }
            if (json.has(MobileInboxFilterOptionsAttrs.limit)) {
                limit = json.optInt(MobileInboxFilterOptionsAttrs.limit);
            }
            mobileInboxFilterOptions = new MobileInboxFilterOptions(null, null, null, null);
            if(fromDate != null) {
                mobileInboxFilterOptions.setFromDateTime(sdf.parse(fromDate));
            }
            if(toDate != null) {
                mobileInboxFilterOptions.setToDateTime(sdf.parse(toDate));
            }
            if(topic != null) {
                mobileInboxFilterOptions.setTopic(topic);
            }
            if(limit != null) {
                mobileInboxFilterOptions.setLimit(limit);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return mobileInboxFilterOptions;
    }
}