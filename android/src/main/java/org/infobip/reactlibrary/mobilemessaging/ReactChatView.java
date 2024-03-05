package org.infobip.reactlibrary.mobilemessaging;

import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import org.infobip.mobile.messaging.chat.InAppChat;
import org.infobip.mobile.messaging.chat.view.InAppChatFragment;

class ReactChatView extends FrameLayout {

    public ReactChatView(@NonNull Context context) {
        super(context);
    }

    public ReactChatView(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public ReactChatView(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public ReactChatView(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    @Override
    public void requestLayout() {
        super.requestLayout();

        //RN issue https://github.com/facebook/react-native/issues/17968
        //Without this layout will not be called and view will not be displayed, because RN doesn't dispatches events to android views properly
        post(measureAndLayout);
    }

    public void setSendButtonColor(String hexColorString, @Nullable FragmentActivity fragmentActivity) {
        Log.d(Utils.TAG, "Not implemented for Android, use IB_AppTheme.Chat theme instead");
    }

    public void addChatFragment(FrameLayout parentLayout, int reactNativeViewId, @Nullable FragmentActivity fragmentActivity) {
        if (fragmentActivity == null) {
            return;
        }

        //RN issue https://github.com/facebook/react-native/issues/17968
        //Without this layout will not be called and view will not be displayed, because RN doesn't dispatches events to android views properly
        ViewGroup parentView = (ViewGroup) parentLayout.findViewById(reactNativeViewId).getParent();
        setupLayoutHack(parentView);

        FragmentManager fragmentManager = fragmentActivity.getSupportFragmentManager();
        InAppChat.getInstance(fragmentActivity.getApplicationContext()).showInAppChatFragment(fragmentManager, reactNativeViewId);
        fragmentManager.executePendingTransactions();
        Fragment inAppChatFragment = fragmentManager.findFragmentByTag(Utils.RN_IN_APP_CHAT_FRAGMENT_TAG);
        Log.e(Utils.TAG, "InAppChatFragment found " + (inAppChatFragment != null));
        if (inAppChatFragment instanceof InAppChatFragment) {
            ((InAppChatFragment) inAppChatFragment).setWithToolbar(false);
        }
    }

    public void removeChatFragment(FrameLayout parentLayout, @Nullable FragmentActivity fragmentActivity) {
        if (fragmentActivity == null) {
            return;
        }
        FragmentManager fragmentManager = fragmentActivity.getSupportFragmentManager();
        FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
        Fragment fragment = fragmentManager.findFragmentByTag(Utils.RN_IN_APP_CHAT_FRAGMENT_TAG);
        if (fragment != null) {
            fragmentTransaction.remove(fragment);
        }
        fragmentTransaction.commit();
    }

    private void setupLayoutHack(final ViewGroup view) {
        view.getViewTreeObserver().addOnGlobalLayoutListener(view::requestLayout);
    }

    private final Runnable measureAndLayout = () -> {
        measure(
                MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY));
        layout(getLeft(), getTop(), getRight(), getBottom());
    };
}
