import PropTypes from 'prop-types';
import React, { useLayoutEffect, useRef, useImperativeHandle, forwardRef } from "react";
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import { requireNativeComponent, Platform, NativeEventEmitter, NativeModules } from 'react-native'
import { mobileMessaging } from 'infobip-mobile-messaging-react-native-plugin';

const RNMMChatViewCommands = codegenNativeCommands({
    supportedCommands: ["add", "remove", "showThreadsList", "setExceptionHandler"],
});


export const ChatView = forwardRef((props, ref) => {
    const CHAT_EVENT_EXCEPTION_RECEIVED = 'inAppChat.internal.exceptionReceived';
    const innerRef = useRef(null);
    let eventEmitter = new NativeEventEmitter(NativeModules.ReactNativeMobileMessaging);

    useImperativeHandle(ref, () => ({

        /**
         * Navigates to THREAD_LIST view in multithread widget.
         * @name showThreadsList
         */
        showThreadsList: () => {
            if (Platform.OS === "ios") {
                mobileMessaging.showThreadsList();
                return;
            }
            // Nothing to do if there is no chatView reference.
            let chatViewRef = innerRef.current;
            if (!chatViewRef) return;
            RNMMChatViewCommands.showThreadsList(chatViewRef);
        },

        /**
         * Sets the chat exception handler in case you want to intercept and
         * display the errors coming from the chat on your own (instead of relying on the prebuild error banners).
         * 
         * The `exceptionHandler` is a function that receives the exception. Passing `null` will remove the previously set handler.
         * 
         * ```ts
         * chatViewRef.current?.setChatExceptionHandler((exception) => {
         *   console.log("ChatView exception occurred:", exception);
         * });
         * ```
         * 
         * @param exceptionHandler A function that receives an ChatException when it happens. Passing `null` will remove the previously set handler.
         * @param onError Optional error handler for catching exceptions thrown when listening for exceptions.
         */
        setExceptionHandler(exceptionHandler, onError) {
            // Not needed for iOS.
            if (Platform.OS === "ios") {
                mobileMessaging.setChatExceptionHandler(
                 (exception) => console.log('ChatView exception received: ' + JSON.stringify(exception)),
                 (error) => console.log('ChatView exception handler error: ' + error)
                );
                return;
            }

            // Nothing to do if there is no chatView reference.
            let chatViewRef = innerRef.current;
            if (!chatViewRef) return;

            eventEmitter.removeAllListeners(CHAT_EVENT_EXCEPTION_RECEIVED);
            let isHandlerPresent = typeof exceptionHandler === 'function';
            if (isHandlerPresent) {
                const handleError = (e) => {
                    if (onError) {
                        onError(e);
                    } else {
                        console.error('[RNMobileMessaging] Could not handle chat exception:', e);
                    }
                };

                eventEmitter.addListener(CHAT_EVENT_EXCEPTION_RECEIVED, (chatException) => {
                    try {
                        exceptionHandler(chatException);
                    } catch (e) {
                        handleError(e);
                    }
                });
            }
            RNMMChatViewCommands.setExceptionHandler(chatViewRef, isHandlerPresent);
        }
    }));

    useLayoutEffect(() => {
        // Not needed for iOS.
        if (Platform.OS === "ios") return;

        // Nothing to do if there is no chatView reference.
        const chatViewRef = innerRef.current;
        if (!chatViewRef) return;

        // Fix for android, sometimes it can't get parent view, which is needed
        // for proper relayout.
        setTimeout(() => {
            console.log(`add command called`);
            RNMMChatViewCommands.add(chatViewRef);
        }, 100);

        return () => {
            console.log(`remove command called`);
            eventEmitter.removeAllListeners(CHAT_EVENT_EXCEPTION_RECEIVED);
            RNMMChatViewCommands.remove(chatViewRef);
        };
    }, []);

    return <RNMMChatView {...props} ref={innerRef} />;
});

ChatView.propTypes = {
    /**
     * Send button color can be set in hex format.
     * If it's not provided, color from Infobip Portal widget configuration will be set.
     */
    sendButtonColor: PropTypes.string,
};

export const RNMMChatView = requireNativeComponent('RNMMChatView', ChatView);
