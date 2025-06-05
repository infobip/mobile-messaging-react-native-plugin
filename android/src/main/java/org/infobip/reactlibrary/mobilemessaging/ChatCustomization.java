package org.infobip.reactlibrary.mobilemessaging;

import android.app.Activity;
import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;
import android.content.res.ColorStateList;
import android.content.res.Resources;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.annotation.NonNull;

import org.infobip.mobile.messaging.MobileMessaging;
import org.infobip.mobile.messaging.MobileMessagingCore;
import org.infobip.mobile.messaging.NotificationSettings;
import org.infobip.mobile.messaging.app.ActivityLifecycleMonitor;
import org.infobip.mobile.messaging.chat.InAppChat;
import org.infobip.mobile.messaging.chat.view.styles.InAppChatInputViewStyle;
import org.infobip.mobile.messaging.chat.view.styles.InAppChatStyle;
import org.infobip.mobile.messaging.chat.view.styles.InAppChatTheme;
import org.infobip.mobile.messaging.chat.view.styles.InAppChatToolbarStyle;
import org.infobip.mobile.messaging.interactive.NotificationAction;
import org.infobip.mobile.messaging.interactive.NotificationCategory;
import org.infobip.mobile.messaging.storage.SQLiteMessageStore;
import org.infobip.mobile.messaging.util.StringUtils;

import org.infobip.mobile.messaging.api.support.http.serialization.JsonSerializer;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;


public class ChatCustomization {
    // StatusBar
    private String chatStatusBarBackgroundColor;
    private String chatStatusBarIconsColorMode;
    // Toolbar
    private ToolbarCustomization chatToolbar;
    private ToolbarCustomization attachmentPreviewToolbar;
    private String attachmentPreviewToolbarSaveMenuItemIcon;
    private String attachmentPreviewToolbarMenuItemsIconTint;

    // NetworkError
    private String networkErrorText;
    private String networkErrorTextColor;
    private String networkErrorTextAppearance;
    private String networkErrorLabelBackgroundColor;
    // Chat
    private String chatBackgroundColor;
    private String chatProgressBarColor;
    // Input
    private String chatInputTextAppearance;
    private String chatInputTextColor;
    private String chatInputBackgroundColor;
    private String chatInputHintText;
    private String chatInputHintTextColor;
    private String chatInputAttachmentIcon;
    private String chatInputAttachmentIconTint;
    private String chatInputAttachmentBackgroundDrawable;
    private String chatInputAttachmentBackgroundColor;
    private String chatInputSendIcon;
    private String chatInputSendIconTint;
    private String chatInputSendBackgroundDrawable;
    private String chatInputSendBackgroundColor;
    private String chatInputSeparatorLineColor;
    private boolean chatInputSeparatorLineVisible;
    private String chatInputCursorColor;

    public static class ToolbarCustomization {
        private String titleTextAppearance;
        private String titleTextColor;
        private String titleText;
        private boolean titleCentered;
        private String backgroundColor;
        private String navigationIcon;
        private String navigationIconTint;
        private String subtitleTextAppearance; // android only
        private String subtitleTextColor; // android only
        private String subtitleText; // android only
        private boolean subtitleCentered;  // android only

        public String getTitleTextAppearance() {
            return titleTextAppearance;
        }

        public void setTitleTextAppearance(String titleTextAppearance) {
            this.titleTextAppearance = titleTextAppearance;
        }

        public String getTitleTextColor() {
            return titleTextColor;
        }

        public void setTitleTextColor(String titleTextColor) {
            this.titleTextColor = titleTextColor;
        }

        public String getTitleText() {
            return titleText;
        }

        public void setTitleText(String titleText) {
            this.titleText = titleText;
        }

        public boolean isTitleCentered() {
            return titleCentered;
        }

        public void setTitleCentered(boolean titleCentered) {
            this.titleCentered = titleCentered;
        }

        public String getBackgroundColor() {
            return backgroundColor;
        }

        public void setBackgroundColor(String backgroundColor) {
            this.backgroundColor = backgroundColor;
        }

        public String getNavigationIcon() {
            return navigationIcon;
        }

        public void setNavigationIcon(String navigationIcon) {
            this.navigationIcon = navigationIcon;
        }

        public String getNavigationIconTint() {
            return navigationIconTint;
        }

        public void setNavigationIconTint(String navigationIconTint) {
            this.navigationIconTint = navigationIconTint;
        }

        public String getSubtitleTextAppearance() {
            return subtitleTextAppearance;
        }

        public void setSubtitleTextAppearance(String subtitleTextAppearance) {
            this.subtitleTextAppearance = subtitleTextAppearance;
        }

        public String getSubtitleTextColor() {
            return subtitleTextColor;
        }

        public void setSubtitleTextColor(String subtitleTextColor) {
            this.subtitleTextColor = subtitleTextColor;
        }

        public String getSubtitleText() {
            return subtitleText;
        }

        public void setSubtitleText(String subtitleText) {
            this.subtitleText = subtitleText;
        }

        public boolean isSubtitleCentered() {
            return subtitleCentered;
        }

        public void setSubtitleCentered(boolean subtitleCentered) {
            this.subtitleCentered = subtitleCentered;
        }
    }

    @NonNull
    public static ChatCustomization resolve(JSONObject args) throws JSONException {
        if (args == null) {
            throw new IllegalArgumentException("Cannot resolve ChatCustomization from arguments");
        }

        ChatCustomization customization = new JsonSerializer().deserialize(args.toString(), ChatCustomization.class);
        if (customization == null) {
            throw new IllegalArgumentException("ChatCustomization is invalid");
        }

        return customization;
    }

    public InAppChatTheme createTheme(Context context) {

        InAppChatToolbarStyle chatToolbarStyle = new InAppChatToolbarStyle.Builder()
                .setStatusBarBackgroundColor(parseColor(chatStatusBarBackgroundColor))
                .setLightStatusBarIcons(chatStatusBarIconsColorMode == "light")
                .setToolbarBackgroundColor(parseColor(chatToolbar.backgroundColor))
                .setNavigationIcon(loadDrawable(chatToolbar.navigationIcon, context))
                .setNavigationIconTint(parseColor(chatToolbar.navigationIconTint))
                .setTitleTextAppearance(getResId(context.getResources(), chatToolbar.titleTextAppearance, context.getPackageName()))
                .setTitleTextColor(parseColor(chatToolbar.titleTextColor))
                .setTitleText(chatToolbar.titleText)
                .setIsTitleCentered(chatToolbar.titleCentered)
                .setSubtitleTextAppearance(getResId(context.getResources(), chatToolbar.subtitleTextAppearance, context.getPackageName()))
                .setSubtitleTextColor(parseColor(chatToolbar.subtitleTextColor))
                .setSubtitleText(chatToolbar.subtitleText)
                .setIsSubtitleCentered(chatToolbar.subtitleCentered)
                .build();

        InAppChatToolbarStyle attachmentPreviewToolbarStyle = new InAppChatToolbarStyle.Builder()
                .setStatusBarBackgroundColor(parseColor(chatStatusBarBackgroundColor))
                .setLightStatusBarIcons(chatStatusBarIconsColorMode == "light")
                .setToolbarBackgroundColor(parseColor(attachmentPreviewToolbar.backgroundColor))
                .setNavigationIcon(loadDrawable(attachmentPreviewToolbar.navigationIcon, context))
                .setNavigationIconTint(parseColor(attachmentPreviewToolbar.navigationIconTint))
                .setSaveAttachmentMenuItemIcon(loadDrawable(attachmentPreviewToolbarSaveMenuItemIcon, context))
                .setMenuItemsIconTint(parseColor(attachmentPreviewToolbarMenuItemsIconTint))
                .setTitleTextAppearance(getResId(context.getResources(), attachmentPreviewToolbar.titleTextAppearance, context.getPackageName()))
                .setTitleTextColor(parseColor(attachmentPreviewToolbar.titleTextColor))
                .setTitleText(attachmentPreviewToolbar.titleText)
                .setIsTitleCentered(attachmentPreviewToolbar.titleCentered)
                .setSubtitleTextAppearance(getResId(context.getResources(), attachmentPreviewToolbar.subtitleTextAppearance, context.getPackageName()))
                .setSubtitleTextColor(parseColor(attachmentPreviewToolbar.subtitleTextColor))
                .setSubtitleText(attachmentPreviewToolbar.subtitleText)
                .setIsSubtitleCentered(attachmentPreviewToolbar.subtitleCentered)
                .build();

        InAppChatStyle chatStyle = new InAppChatStyle.Builder()
                .setBackgroundColor(parseColor(chatBackgroundColor))
                .setProgressBarColor(parseColor(chatProgressBarColor))
                .setNetworkConnectionText(networkErrorText)
                .setNetworkConnectionTextAppearance(getResId(context.getResources(), networkErrorTextAppearance, context.getPackageName()))
                .setNetworkConnectionTextColor(parseColor(networkErrorTextColor))
                .setNetworkConnectionLabelBackgroundColor(parseColor(networkErrorLabelBackgroundColor))
                .build();

        InAppChatInputViewStyle.Builder inputViewStyleBuilder = new InAppChatInputViewStyle.Builder()
                .setTextAppearance(getResId(context.getResources(), chatInputTextAppearance, context.getPackageName()))
                .setTextColor(parseColor(chatInputTextColor))
                .setBackgroundColor(parseColor(chatInputBackgroundColor))
                .setHintText(chatInputHintText)
                .setHintTextColor(parseColor(chatInputHintTextColor))
                .setAttachmentIcon(loadDrawable(chatInputAttachmentIcon, context))
                .setAttachmentBackgroundDrawable(loadDrawable(chatInputAttachmentBackgroundDrawable, context))
                .setAttachmentBackgroundColor(parseColor(chatInputAttachmentBackgroundColor))
                .setSendIcon(loadDrawable(chatInputSendIcon, context))
                .setSendBackgroundDrawable(loadDrawable(chatInputSendBackgroundDrawable, context))
                .setSendBackgroundColor(parseColor(chatInputSendBackgroundColor))
                .setSeparatorLineColor(parseColor(chatInputSeparatorLineColor))
                .setIsSeparatorLineVisible(chatInputSeparatorLineVisible)
                .setCursorColor(parseColor(chatInputCursorColor));

        @Nullable Integer inputAttachmentIconTint = parseColor(chatInputAttachmentIconTint);
        if (inputAttachmentIconTint != null) {
            inputViewStyleBuilder.setAttachmentIconTint(ColorStateList.valueOf(inputAttachmentIconTint));
        }
        @Nullable Integer inputSendIconTint = parseColor(chatInputSendIconTint);
        if (inputSendIconTint != null) {
            inputViewStyleBuilder.setSendIconTint(ColorStateList.valueOf(inputSendIconTint));
        }

        return new InAppChatTheme(
                chatToolbarStyle,
                attachmentPreviewToolbarStyle,
                chatStyle,
                inputViewStyleBuilder.build()
        );
    }

    private @Nullable Integer parseColor(@Nullable String color) {
        if (StringUtils.isBlank(color)) {
            return null;
        }
        @Nullable Integer result = null;
        try {
            result = Integer.valueOf(Color.parseColor(color));
        } catch (IllegalArgumentException e) {
            Log.e(Utils.TAG, "parseColor: " + color + e.getMessage());
        }
        return result;
    }

    /**
     * Gets resource ID
     *
     * @param res         the resources where to look for
     * @param resPath     the name of the resource
     * @param packageName name of the package where the resource should be searched for
     * @return resource identifier or 0 if not found
     */
    private @Nullable Integer getResId(Resources res, String resPath, String packageName) {
        if (StringUtils.isBlank(resPath)) {
            return null;
        }
        try {
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
            return Integer.valueOf(resId);
        } catch (Exception e) {
            Log.e(Utils.TAG, "getResId: " + resPath + e.getMessage());
            return null;
        }
    }

    private @Nullable Drawable loadDrawable(String drawableUri, Context context) {
        if (StringUtils.isBlank(drawableUri)) {
            return null;
        }
        try (InputStream drawableStream = new URL(drawableUri).openStream()) {
            return new BitmapDrawable(context.getResources(), drawableStream);
        } catch (IOException e) {
            Log.e(Utils.TAG, "Failed to load image " + drawableUri, e);
            return null;
        }

    }

    // Getters and Setters
    public String getChatStatusBarBackgroundColor() {
        return chatStatusBarBackgroundColor;
    }

    public void setChatStatusBarBackgroundColor(String chatStatusBarBackgroundColor) {
        this.chatStatusBarBackgroundColor = chatStatusBarBackgroundColor;
    }

    public String getChatStatusBarIconsColorMode() {
        return chatStatusBarIconsColorMode;
    }

    public void setChatStatusBarIconsColorMode(String chatStatusBarIconsColorMode) {
        this.chatStatusBarIconsColorMode = chatStatusBarIconsColorMode;
    }

    public ToolbarCustomization getAttachmentPreviewToolbar() {
        return attachmentPreviewToolbar;
    }

    public void setAttachmentPreviewToolbar(ToolbarCustomization attachmentPreviewToolbar) {
        this.attachmentPreviewToolbar = attachmentPreviewToolbar;
    }

    public ToolbarCustomization getChatToolbar() {
        return chatToolbar;
    }

    public void setChatToolbar(ToolbarCustomization chatToolbar) {
        this.chatToolbar = chatToolbar;
    }

    public String getAttachmentPreviewToolbarSaveMenuItemIcon() {
        return attachmentPreviewToolbarSaveMenuItemIcon;
    }

    public void setAttachmentPreviewToolbarSaveMenuItemIcon(String attachmentPreviewToolbarSaveMenuItemIcon) {
        this.attachmentPreviewToolbarSaveMenuItemIcon = attachmentPreviewToolbarSaveMenuItemIcon;
    }

    public String getAttachmentPreviewToolbarMenuItemsIconTint() {
        return attachmentPreviewToolbarMenuItemsIconTint;
    }

    public void setAttachmentPreviewToolbarMenuItemsIconTint(String attachmentPreviewToolbarMenuItemsIconTint) {
        this.attachmentPreviewToolbarMenuItemsIconTint = attachmentPreviewToolbarMenuItemsIconTint;
    }

    public String getNetworkErrorText() {
        return networkErrorText;
    }

    public void setNetworkErrorText(String networkErrorText) {
        this.networkErrorText = networkErrorText;
    }

    public String getNetworkErrorTextColor() {
        return networkErrorTextColor;
    }

    public void setNetworkErrorTextColor(String networkErrorTextColor) {
        this.networkErrorTextColor = networkErrorTextColor;
    }

    public String getNetworkErrorTextAppearance() {
        return networkErrorTextAppearance;
    }

    public void setNetworkErrorTextAppearance(String networkErrorTextAppearance) {
        this.networkErrorTextAppearance = networkErrorTextAppearance;
    }

    public String getNetworkErrorLabelBackgroundColor() {
        return networkErrorLabelBackgroundColor;
    }

    public void setNetworkErrorLabelBackgroundColor(String networkErrorLabelBackgroundColor) {
        this.networkErrorLabelBackgroundColor = networkErrorLabelBackgroundColor;
    }

    public String getChatBackgroundColor() {
        return chatBackgroundColor;
    }

    public void setChatBackgroundColor(String chatBackgroundColor) {
        this.chatBackgroundColor = chatBackgroundColor;
    }

    public String getChatProgressBarColor() {
        return chatProgressBarColor;
    }

    public void setChatProgressBarColor(String chatProgressBarColor) {
        this.chatProgressBarColor = chatProgressBarColor;
    }

    public String getChatInputTextAppearance() {
        return chatInputTextAppearance;
    }

    public void setChatInputTextAppearance(String chatInputTextAppearance) {
        this.chatInputTextAppearance = chatInputTextAppearance;
    }

    public String getChatInputTextColor() {
        return chatInputTextColor;
    }

    public void setChatInputTextColor(String chatInputTextColor) {
        this.chatInputTextColor = chatInputTextColor;
    }

    public String getChatInputBackgroundColor() {
        return chatInputBackgroundColor;
    }

    public void setChatInputBackgroundColor(String chatInputBackgroundColor) {
        this.chatInputBackgroundColor = chatInputBackgroundColor;
    }

    public String getChatInputHintText() {
        return chatInputHintText;
    }

    public void setChatInputHintText(String chatInputHintText) {
        this.chatInputHintText = chatInputHintText;
    }

    public String getChatInputHintTextColor() {
        return chatInputHintTextColor;
    }

    public void setChatInputHintTextColor(String chatInputHintTextColor) {
        this.chatInputHintTextColor = chatInputHintTextColor;
    }

    public String getChatInputAttachmentIcon() {
        return chatInputAttachmentIcon;
    }

    public void setChatInputAttachmentIcon(String chatInputAttachmentIcon) {
        this.chatInputAttachmentIcon = chatInputAttachmentIcon;
    }

    public String getChatInputAttachmentIconTint() {
        return chatInputAttachmentIconTint;
    }

    public void setChatInputAttachmentIconTint(String chatInputAttachmentIconTint) {
        this.chatInputAttachmentIconTint = chatInputAttachmentIconTint;
    }

    public String getChatInputAttachmentBackgroundDrawable() {
        return chatInputAttachmentBackgroundDrawable;
    }

    public void setChatInputAttachmentBackgroundDrawable(String chatInputAttachmentBackgroundDrawable) {
        this.chatInputAttachmentBackgroundDrawable = chatInputAttachmentBackgroundDrawable;
    }

    public String getChatInputAttachmentBackgroundColor() {
        return chatInputAttachmentBackgroundColor;
    }

    public void setChatInputAttachmentBackgroundColor(String chatInputAttachmentBackgroundColor) {
        this.chatInputAttachmentBackgroundColor = chatInputAttachmentBackgroundColor;
    }

    public String getChatInputSendIcon() {
        return chatInputSendIcon;
    }

    public void setChatInputSendIcon(String chatInputSendIcon) {
        this.chatInputSendIcon = chatInputSendIcon;
    }

    public String getChatInputSendIconTint() {
        return chatInputSendIconTint;
    }

    public void setChatInputSendIconTint(String chatInputSendIconTint) {
        this.chatInputSendIconTint = chatInputSendIconTint;
    }

    public String getChatInputSendBackgroundDrawable() {
        return chatInputSendBackgroundDrawable;
    }

    public void setChatInputSendBackgroundDrawable(String chatInputSendBackgroundDrawable) {
        this.chatInputSendBackgroundDrawable = chatInputSendBackgroundDrawable;
    }

    public String getChatInputSendBackgroundColor() {
        return chatInputSendBackgroundColor;
    }

    public void setChatInputSendBackgroundColor(String chatInputSendBackgroundColor) {
        this.chatInputSendBackgroundColor = chatInputSendBackgroundColor;
    }

    public String getChatInputSeparatorLineColor() {
        return chatInputSeparatorLineColor;
    }

    public void setChatInputSeparatorLineColor(String chatInputSeparatorLineColor) {
        this.chatInputSeparatorLineColor = chatInputSeparatorLineColor;
    }

    public boolean isChatInputSeparatorLineVisible() {
        return chatInputSeparatorLineVisible;
    }

    public void setChatInputSeparatorLineVisible(boolean chatInputSeparatorLineVisible) {
        this.chatInputSeparatorLineVisible = chatInputSeparatorLineVisible;
    }

    public String getChatInputCursorColor() {
        return chatInputCursorColor;
    }

    public void setChatInputCursorColor(String chatInputCursorColor) {
        this.chatInputCursorColor = chatInputCursorColor;
    }
}