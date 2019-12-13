package com.reactlibrary.userdatamappers;

import org.infobip.mobile.messaging.CustomAttributeValue;
import org.infobip.mobile.messaging.Installation;
import org.infobip.mobile.messaging.InstallationMapper;
import org.infobip.mobile.messaging.UserMapper;
import org.infobip.mobile.messaging.api.support.http.serialization.JsonSerializer;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;
import java.util.Map;
import java.lang.reflect.Type;

import com.google.gson.reflect.TypeToken;

public class InstallationJson extends Installation {

    static JSONArray toJSON(final List<Installation> installations) {
        JSONArray installationsJson = new JSONArray();
        for (Installation installation : installations) {
            installationsJson.put(toJSON(installation));
        }
        return installationsJson;
    }

    public static JSONObject toJSON(final Installation installation) {
        try {
            String json = InstallationMapper.toJson(installation);
            JSONObject jsonObject = new JSONObject(json);
            cleanupJsonMapForClient(installation.getCustomAttributes(), jsonObject);
            return jsonObject;
        } catch (JSONException e) {
            e.printStackTrace();
            return new JSONObject();
        }
    }

    static Installation fromJSON(JSONObject json) {
        Installation installation = new Installation();

        try {
            if (json.has("isPushRegistrationEnabled")) {
                installation.setPushRegistrationEnabled(json.optBoolean("isPushRegistrationEnabled"));
            }
            if (json.has("isPrimaryDevice")) {
                installation.setPrimaryDevice(json.optBoolean("isPrimaryDevice"));
            }
            if (json.has("customAttributes")) {
                Type type = new TypeToken<Map<String, Object>>() {
                }.getType();
                Map<String, Object> customAttributes = new JsonSerializer().deserialize(json.optString("customAttributes"), type);
                installation.setCustomAttributes(UserMapper.customAttsFromBackend(customAttributes));
            }
        } catch (Exception e) {
            //error parsing
        }

        return installation;
    }

    private static void cleanupJsonMapForClient(Map<String, CustomAttributeValue> customAttributes, JSONObject jsonObject) throws JSONException {
        jsonObject.remove("map");
        if (jsonObject.has("customAttributes")) {
            if (customAttributes != null) {
                jsonObject.put("customAttributes", new JSONObject(UserMapper.customAttsToBackend(customAttributes)));
            }
        }
    }
}

