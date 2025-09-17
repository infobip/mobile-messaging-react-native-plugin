package org.infobip.reactlibrary.mobilemessaging;

import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.util.Log;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.FrameLayout;
import android.view.ViewTreeObserver;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentContainerView;
import androidx.fragment.app.FragmentActivity;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import org.infobip.mobile.messaging.chat.InAppChat;
import org.infobip.mobile.messaging.chat.view.InAppChatFragment;
import org.infobip.mobile.messaging.chat.core.InAppChatException;
import org.infobip.mobile.messaging.chat.view.InAppChatErrorsHandler;

import com.facebook.react.bridge.ReactApplicationContext;

class ReactChatView extends FrameLayout {

    private InAppChatFragment fragment;
    private boolean useCustomErrorHandler = false;
    private static final String EVENT_INAPPCHAT_EXCEPTION_RECEIVED = "inAppChat.internal.exceptionReceived";

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

    public void setSendButtonColor(String hexColorString, @Nullable FragmentActivity fragmentActivity) {
        Log.d(Utils.TAG, "Not implemented for Android, use IB_AppTheme.Chat theme instead");
    }

    private InAppChatFragment getFragment(FragmentActivity fragmentActivity) {
        if (this.fragment != null) {
            return this.fragment;
        }
        if (fragmentActivity != null) {
            FragmentManager fragmentManager = fragmentActivity.getSupportFragmentManager();
            if (fragmentManager != null) {
                Fragment fragment = fragmentManager.findFragmentByTag(Utils.RN_IN_APP_CHAT_FRAGMENT_TAG);
                if (fragment instanceof InAppChatFragment) {
                    return (InAppChatFragment) fragment;
                }
            } else {
                Log.e(Utils.TAG, "FragmentManager is null, cannot get InAppChatFragment.");
            }
        } else {
            Log.e(Utils.TAG, "FragmentActivity is null, cannot get InAppChatFragment.");
        }
        return null;
    }

    public void addChatFragment(@Nullable ReactApplicationContext reactContext, @Nullable FragmentActivity fragmentActivity) {
        fragment = getFragment(fragmentActivity);
        if (fragment == null) {
            fragment = new InAppChatFragment();
        }
        fragment.setWithToolbar(false);
        fragment.setWithInput(true);
        if (useCustomErrorHandler && reactContext != null) {
            fragment.setErrorsHandler(createErrorsHandler(reactContext));
        }

        ViewParent parent = this.getParent();
        if (parent instanceof ViewGroup) {
            setupLayoutHack((ViewGroup) parent);
        } else {
            Log.e(Utils.TAG, "Parent is not ViewGroup, cannot show InAppChatFragment.");
        }
        FragmentManager fragmentManager = fragmentActivity.getSupportFragmentManager();
        if (fragmentManager != null) {
            fragmentManager.beginTransaction()
                    .replace(this.getId(), fragment, Utils.RN_IN_APP_CHAT_FRAGMENT_TAG)
                    .commitNow();
        } else {
            Log.e(Utils.TAG, "FragmentManager is null, cannot add InAppChatFragment.");
        }
    }

    public void removeChatFragment(@Nullable FragmentActivity fragmentActivity) {
        useCustomErrorHandler = false;
        FragmentManager fragmentManager = fragmentActivity.getSupportFragmentManager();
        Fragment fragment = getFragment(fragmentActivity);
        if (fragment != null && fragmentManager != null) {
            fragmentManager.beginTransaction()
                    .remove(fragment)
                    .commitNow();
        } else {
            Log.e(Utils.TAG, "InAppChatFragment or FragmentManager is null, cannot remove InAppChatFragment.");
        }
    }

    public void showThreadsList(@Nullable FragmentActivity fragmentActivity) {
        InAppChatFragment fragment = getFragment(fragmentActivity);
        if (fragment != null) {
            fragment.showThreadList();
        } else {
            Log.e(Utils.TAG, "InAppChatFragment is null, cannot show threads list.");
        }
    }

    public void setExceptionHandler(boolean isHandlerPresent, @Nullable ReactApplicationContext reactContext, @Nullable FragmentActivity fragmentActivity) {
        //If exception handler is set before adding the fragment, it will be applied in addChatFragment()
        useCustomErrorHandler = isHandlerPresent;
        InAppChatFragment fragment = getFragment(fragmentActivity);
        if (fragment != null && reactContext != null) {
            if (isHandlerPresent) {
                fragment.setErrorsHandler(createErrorsHandler(reactContext));
            } else {
                fragment.setErrorsHandler(fragment.getDefaultErrorsHandler());
            }
        }
    }

    private InAppChatFragment.ErrorsHandler createErrorsHandler(ReactApplicationContext reactContext) {
        return new InAppChatFragment.ErrorsHandler() {
            @Override
            public void handlerError(@NonNull String error) {
                // Deprecated method
            }

            @Override
            public void handlerWidgetError(@NonNull String error) {
                // Deprecated method
            }

            @Override
            public void handlerNoInternetConnectionError(boolean hasConnection) {
                // Deprecated method
            }

            @Override
            public boolean handleError(@NonNull InAppChatException exception) {
                ReactNativeEvent.send(EVENT_INAPPCHAT_EXCEPTION_RECEIVED, reactContext, exception.toJSON());
                return true;
            }
        };
    }

    private void setupLayoutHack(final ViewGroup view) {
        view.getViewTreeObserver().addOnGlobalLayoutListener(view::requestLayout);
    }

    @Override
    public void requestLayout() {
        super.requestLayout();

        // RN issue https://github.com/facebook/react-native/issues/17968
        // Without this layout will not be called and view will not be displayed,
        // because RN doesn't dispatches events to android views properly
        post(measureAndLayout);
    }

    private final Runnable measureAndLayout = () -> {
        measure(
                MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY));
        layout(getLeft(), getTop(), getRight(), getBottom());
    };
}
