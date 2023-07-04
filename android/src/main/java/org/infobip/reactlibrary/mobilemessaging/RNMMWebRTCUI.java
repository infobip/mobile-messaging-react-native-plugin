package org.infobip.reactlibrary.mobilemessaging;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.lang.reflect.Proxy;

public class RNMMWebRTCUI extends ReactContextBaseJavaModule {
    private static Object infobipRtcUiInstance = null;

    private Class<?> successListenerClass = null;
    private Class<?> errorListenerClass = null;

    public RNMMWebRTCUI(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNMMWebRTCUI";
    }

    @ReactMethod
    public void enableCalls(final Callback successCallback, final Callback errorCallback) {
        try {
            final Configuration configuration = ConfigCache.getInstance().getConfiguration();
            if (configuration == null) {
                errorCallback.invoke(Utils.callbackError("Mobile messaging not initialized. Please call mobileMessaging.init().", null));
            } else if (configuration.webRTCUI != null && configuration.webRTCUI.applicationId != null) {
                Class<?> rtcUiBuilderClass = Class.forName("com.infobip.webrtc.ui.InfobipRtcUi$Builder");
                Object rtcUiBuilder = rtcUiBuilderClass.getDeclaredConstructor(Context.class).newInstance(getReactApplicationContext());
                Object successListener = successListenerProxy(successCallback);
                Object errorListener = errorListenerCallback(errorCallback);
                rtcUiBuilderClass.getMethod("applicationId", String.class).invoke(rtcUiBuilder, configuration.webRTCUI.applicationId);
                rtcUiBuilderClass.getMethod("enableInAppCalls", getSuccessListenerClass(), getErrorListenerClass()).invoke(
                        rtcUiBuilder,
                        successListener,
                        errorListener
                );
                infobipRtcUiInstance = rtcUiBuilderClass.getMethod("build").invoke(rtcUiBuilder);
            } else {
                errorCallback.invoke(Utils.callbackError("Configuration does not contain webRTCUI data.", null));
            }
        } catch (ClassNotFoundException e) {
            errorCallback.invoke(Utils.callbackError("Android WebRtcUi not enabled. Please set flag buildscript {ext { withWebRTCUI = true } } in your build.gradle.", null));
        } catch (ReflectiveOperationException e) {
            errorCallback.invoke(Utils.callbackError("Cannot enable calls. " + e.getMessage(), null));
        } catch (Throwable t) {
            errorCallback.invoke(Utils.callbackError("Something went wrong. " + t.getMessage(), null));
        }
    }

    @NonNull
    private Class<?> getSuccessListenerClass() throws ClassNotFoundException {
        if (successListenerClass == null)
            successListenerClass = Class.forName("com.infobip.webrtc.ui.SuccessListener");
        return successListenerClass;
    }

    @NonNull
    private Class<?> getErrorListenerClass() throws ClassNotFoundException {
        if (errorListenerClass == null)
            errorListenerClass = Class.forName("com.infobip.webrtc.ui.ErrorListener");
        return errorListenerClass;
    }

    @SuppressWarnings("SuspiciousInvocationHandlerImplementation")
    @NonNull
    private Object errorListenerCallback(Callback errorCallback) throws ClassNotFoundException {
        return Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class[]{getErrorListenerClass()},
                (proxy, method, args) -> {
                    if (method.getName().equals("onError") && args.length > 0 && args[0] instanceof Throwable) {
                        Throwable throwable = (Throwable) args[0];
                        errorCallback.invoke(Utils.callbackError(throwable.getMessage(), null));
                    }
                    return null;
                }
        );
    }

    @SuppressWarnings("SuspiciousInvocationHandlerImplementation")
    @NonNull
    private Object successListenerProxy(Callback successCallback) throws ClassNotFoundException {
        return Proxy.newProxyInstance(
                getClass().getClassLoader(),
                new Class[]{getSuccessListenerClass()},
                (proxy, method, args) -> {
                    if (method.getName().equals("onSuccess")) {
                        successCallback.invoke();
                    }
                    return null;
                }
        );
    }

    @ReactMethod
    public void disableCalls(final Callback successCallback, final Callback errorCallback) {
        if (infobipRtcUiInstance == null) {
            errorCallback.invoke(Utils.callbackError("Calls are not enabled.", null));
        } else {
            try {
                Class<?> infobipRtcUiClass = Class.forName("com.infobip.webrtc.ui.InfobipRtcUi");
                infobipRtcUiClass.getMethod("disableCalls", getSuccessListenerClass(), getErrorListenerClass())
                        .invoke(
                                infobipRtcUiInstance,
                                successListenerProxy(successCallback),
                                errorListenerCallback(errorCallback)
                        );
            } catch (ClassNotFoundException e) {
                errorCallback.invoke(Utils.callbackError("Android WebRtcUi not enabled. Please set flag buildscript {ext { withWebRTCUI = true } } in your build.gradle.", null));
            } catch (ReflectiveOperationException e) {
                errorCallback.invoke(Utils.callbackError("Cannot disable calls. " + e.getMessage(), null));
            } catch (Throwable t) {
                errorCallback.invoke(Utils.callbackError("Something went wrong. " + t.getMessage(), null));
            }
        }
    }
}
