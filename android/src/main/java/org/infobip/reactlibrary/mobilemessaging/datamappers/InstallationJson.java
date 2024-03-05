package org.infobip.reactlibrary.mobilemessaging.datamappers;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.google.gson.reflect.TypeToken;

import org.infobip.mobile.messaging.CustomAttributeValue;
import org.infobip.mobile.messaging.CustomAttributesMapper;
import org.infobip.mobile.messaging.Installation;
import org.infobip.mobile.messaging.InstallationMapper;
import org.infobip.mobile.messaging.api.support.http.serialization.JsonSerializer;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

public class InstallationJson extends Installation {

    public static JSONArray toJSON(final List<Installation> installations) {
        if (installations == null) {
            return null;
        }
        JSONArray installationsJson = new JSONArray();
        for (Installation installation : installations) {
            installationsJson.put(toJSON(installation));
        }
        return installationsJson;
    }

    @NonNull
    public static Installation resolveInstallation(JSONObject args) throws JSONException {
        if (args == null) {
            throw new IllegalArgumentException("Cannot resolve installation from arguments");
        }

        return InstallationJson.fromJSON(args);
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

    public static ReadableMap toReadableMap(final Installation installation) {
        try {
            return ReactNativeJson.convertJsonToMap(InstallationJson.toJSON(installation));
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static ReadableArray toReadableArray(final List<Installation> installations) {
        try {
            return ReactNativeJson.convertJsonToArray(InstallationJson.toJSON(installations));
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    private static Installation fromJSON(JSONObject json) {
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
                installation.setCustomAttributes(CustomAttributesMapper.customAttsFromBackend(customAttributes));
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
                jsonObject.put("customAttributes", new JSONObject(CustomAttributesMapper.customAttsToBackend(customAttributes)));
            }
        }
    }
}

