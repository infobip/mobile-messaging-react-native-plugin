package org.infobip.reactlibrary.mobilemessaging;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.infobip.mobile.messaging.util.StringUtils;

import java.lang.reflect.Proxy;

public class RNMMWebRTCUI extends ReactContextBaseJavaModule {
    private static Object infobipRtcUiInstance = null;

    private Class<?> successListenerClass = null;
    private Class<?> errorListenerClass = null;
    private Class<?> listenTypeClass = null;

    public RNMMWebRTCUI(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNMMWebRTCUI";
    }

    @ReactMethod
    public void enableChatCalls(final Callback successCallback, final Callback errorCallback) {
        enableCalls(true, null, successCallback, errorCallback);
    }

    @ReactMethod
    public void enableCalls(String identity, final Callback successCallback, final Callback errorCallback) {
        enableCalls(false, identity, successCallback, errorCallback);
    }

    private void enableCalls(Boolean enableChatCalls, String identity, final Callback successCallback, final Callback errorCallback) {
        try {
            final Configuration configuration = ConfigCache.getInstance().getConfiguration();
            if (configuration == null) {
                errorCallback.invoke(Utils.callbackError("Mobile messaging not initialized. Please call mobileMessaging.init().", null));
            } else if (configuration.webRTCUI != null && configuration.webRTCUI.configurationId != null) {
                Class<?> rtcUiBuilderClass = Class.forName("com.infobip.webrtc.ui.InfobipRtcUi$Builder");
                Class<?> rtcUiBuilderFinalStepClass = Class.forName("com.infobip.webrtc.ui.InfobipRtcUi$BuilderFinalStep");
                Object rtcUiBuilder = rtcUiBuilderClass.getDeclaredConstructor(Context.class).newInstance(getReactApplicationContext());
                Object successListener = successListenerProxy(successCallback);
                Object errorListener = errorListenerProxy(errorCallback);
                rtcUiBuilderClass.getMethod("withConfigurationId", String.class).invoke(rtcUiBuilder, configuration.webRTCUI.configurationId);
                Object rtcUiBuilderFinalStep;
                if (enableChatCalls) {
                    rtcUiBuilderFinalStep = rtcUiBuilderClass.getMethod("withInAppChatCalls", getSuccessListenerClass(), getErrorListenerClass()).invoke(
                            rtcUiBuilder,
                            successListener,
                            errorListener
                    );
                } else if (!StringUtils.isBlank(identity)) {
                    rtcUiBuilderFinalStep = rtcUiBuilderClass.getMethod("withCalls", String.class, getListenTypeClass(), getSuccessListenerClass(), getErrorListenerClass()).invoke(
                            rtcUiBuilder,
                            identity,
                            pushListenType(),
                            successListener,
                            errorListener
                    );
                } else {
                    rtcUiBuilderFinalStep = rtcUiBuilderClass.getMethod("withCalls", getSuccessListenerClass(), getErrorListenerClass()).invoke(
                            rtcUiBuilder,
                            successListener,
                            errorListener
                    );
                }
                infobipRtcUiInstance = rtcUiBuilderFinalStepClass.getMethod("build").invoke(rtcUiBuilderFinalStep);
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

    @NonNull
    private Class<?> getListenTypeClass() throws ClassNotFoundException {
        if (listenTypeClass == null)
            listenTypeClass = Class.forName("com.infobip.webrtc.ui.model.ListenType");
        return listenTypeClass;
    }

    @SuppressWarnings("SuspiciousInvocationHandlerImplementation")
    @NonNull
    private Object errorListenerProxy(Callback errorCallback) throws ClassNotFoundException {
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

    /** @noinspection rawtypes*/
    @SuppressWarnings("unchecked")
    @NonNull
    private Object pushListenType() throws ClassNotFoundException {
        return Enum.valueOf((Class<? extends Enum>) Class.forName("com.infobip.webrtc.ui.model.ListenType"), "PUSH");
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
                                errorListenerProxy(errorCallback)
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
