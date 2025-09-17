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
    public static final String COMMAND_SHOW_THREADS_LIST = "showThreadsList";
    public static final String COMMAND_SET_EXCEPTION_HANDLER = "setExceptionHandler";

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
        switch (commandId) {
            case COMMAND_ADD:
                addChatFragment(root);
                break;
            case COMMAND_REMOVE:
                removeChatFragment(root);
                break;
            case COMMAND_SHOW_THREADS_LIST:
                showThreadsList(root);
                break;
            case COMMAND_SET_EXCEPTION_HANDLER:
                setExceptionHandler(root, args.getBoolean(0));
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

    private void addChatFragment(ReactChatView chatView) {
        if (chatView != null) {
            chatView.addChatFragment(this.context, Utils.getFragmentActivity(this.context));
        }
    }

    private void removeChatFragment(ReactChatView chatView) {
        if (chatView != null) {
            chatView.removeChatFragment(Utils.getFragmentActivity(this.context));
        }
    }

    private void showThreadsList(ReactChatView chatView) {
        if (chatView != null) {
            chatView.showThreadsList(Utils.getFragmentActivity(this.context));
        }
    }

    private void setExceptionHandler(ReactChatView chatView, boolean isHandlerPresent) {
        if (chatView != null) {
            chatView.setExceptionHandler(isHandlerPresent, this.context, Utils.getFragmentActivity(this.context));
        }
    }
}
