package org.infobip.reactlibrary.mobilemessaging.datamappers;

import org.infobip.mobile.messaging.UserAttributes;
import org.infobip.mobile.messaging.UserIdentity;
import org.json.JSONException;
import org.json.JSONObject;

public class PersonalizationCtx {
    public UserIdentity userIdentity;
    public UserAttributes userAttributes;
    public boolean forceDepersonalize;

    public static PersonalizationCtx resolvePersonalizationCtx(JSONObject args) throws JSONException, IllegalArgumentException {
        if (args == null) {
            throw new IllegalArgumentException("Cannot resolve personalization context from arguments");
        }

        PersonalizationCtx ctx = new PersonalizationCtx();
        ctx.forceDepersonalize = args.optBoolean("forceDepersonalize", false);
        ctx.userIdentity = UserJson.userIdentityFromJson(args.getJSONObject("userIdentity"));
        ctx.userAttributes = UserJson.userAttributesFromJson(args.optJSONObject("userAttributes"));
        return ctx;
    }
}
