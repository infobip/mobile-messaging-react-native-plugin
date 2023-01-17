package org.infobip.reactlibrary.mobilemessaging;

import android.util.Log;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

class RNMMChatViewManager extends ViewGroupManager<ReactChatView> {
    public static final String COMMAND_ADD = "add";
    public static final String COMMAND_REMOVE = "remove";

    public static final String VIEW_GROUP_MANAGER_NAME = "RNMMChatView";
    private ReactApplicationContext context;

    @Nullable
    private ReactChatView chatView;

    @NonNull
    @Override
    public String getName() {
        return VIEW_GROUP_MANAGER_NAME;
    }

    public RNMMChatViewManager(ReactApplicationContext context) {
        this.context = context;
    }

    @NonNull
    @Override
    protected ReactChatView createViewInstance(@NonNull ThemedReactContext reactContext) {
        chatView = new ReactChatView(reactContext);
        return chatView;
    }

    @Override
    public void receiveCommand(@NonNull ReactChatView root, String commandId, @Nullable ReadableArray args) {
        super.receiveCommand(root, commandId, args);

        if (args == null) {
            Log.e(Utils.TAG, "RNMMChatViewManager received command without argumnents, Id: " + commandId);
            return;
        }
        int reactNativeViewId = args.getInt(0);

        switch (commandId) {
            case COMMAND_ADD:
                addChatFragment(root, reactNativeViewId);
                break;
            case COMMAND_REMOVE:
                removeChatFragment(root);
                break;
            default: {
                Log.w(Utils.TAG, "RNMMChatViewManager received unsupported command with Id: " + commandId);
            }
        }
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @ReactProp(name = "sendButtonColor")
    public void setSendButtonColor(ReactChatView view, String hexSendButtonColor) {
        view.setSendButtonColor(hexSendButtonColor, Utils.getFragmentActivity(this.context));
    }

    private void addChatFragment(FrameLayout parentLayout, int reactNativeViewId) {
        if (chatView != null) {
            chatView.addChatFragment(parentLayout, reactNativeViewId, Utils.getFragmentActivity(this.context));
        }
    }

    private void removeChatFragment(FrameLayout parentLayout) {
        if (chatView != null) {
            chatView.removeChatFragment(parentLayout, Utils.getFragmentActivity(this.context));
        }
    }
}
