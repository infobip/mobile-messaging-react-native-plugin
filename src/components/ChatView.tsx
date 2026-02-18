//
//  ChatView.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

/**
 * ChatView
 *
 * Custom high-level React wrapper around the native Fabric component RNMMChatView.
 * Handles platform specific behavior differences.
 *
 * Usage:
 *  const chatRef = useRef<ChatViewHandle>(null);
 *  <ChatView ref={chatRef} sendButtonColor="#3478F6" style={{ flex: 1 }} />;
 *  chatRef.current?.showThreadsList();
 */
import {
  type ElementRef,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef
} from 'react';
import { Platform, NativeEventEmitter, NativeModules, UIManager, findNodeHandle } from 'react-native';
import RNMMChatView, { NativeProps as RNMMChatViewProps, Commands as RNMMChatViewCommands } from '../specs/RNMMChatViewNativeComponent';
import { MobileMessagingReactNative, mobileMessaging } from '../index';

type ChatException = MobileMessagingReactNative.ChatException;

export interface ChatViewHandle {
  /**
   * Navigates to THREAD_LIST view in multithread widget.
   * @name showThreadsList
   */
  showThreadsList(): void;

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
  setExceptionHandler(exceptionHandler: ((exception: ChatException) => void) | null, onError?: (error: Error) => void): void;

}

export interface ChatViewProps extends RNMMChatViewProps { }

const ChatView = forwardRef<ChatViewHandle, ChatViewProps>(({ sendButtonColor, style }, ref) => {
  const RNMMChatRef = useRef<ElementRef<typeof RNMMChatView>>(null);
  const CHAT_EVENT_EXCEPTION_RECEIVED = "inAppChat.internal.exceptionReceived";
  let eventEmitter = new NativeEventEmitter(NativeModules.ReactNativeMobileMessaging);
  const isFabric = (global as any).nativeFabricUIManager != null;


  function isChatException(obj: any): obj is ChatException {
    return (
      typeof obj === 'object' &&
      (typeof obj.code === 'number' || obj.code === undefined) &&
      (typeof obj.name === 'string' || obj.name === undefined) &&
      (typeof obj.message === 'string' || obj.message === undefined) &&
      (typeof obj.origin === 'string' || obj.origin === undefined) &&
      (typeof obj.platform === 'string' || obj.platform === undefined)
    );
  }

  function dispatchCommand(
    viewRef: ElementRef<typeof RNMMChatView> | null,
    command: 'add' | 'remove' | 'showThreadsList' | 'setExceptionHandler',
    params: any[] = [],
  ) {
    if (!viewRef) return;

    if (isFabric) {
      // New architecture (Fabric) – use codegen commands
      switch (command) {
        case 'add': RNMMChatViewCommands.add(viewRef); return;
        case 'remove': RNMMChatViewCommands.remove(viewRef); return;
        case 'showThreadsList': RNMMChatViewCommands.showThreadsList(viewRef); return;
        case 'setExceptionHandler': RNMMChatViewCommands.setExceptionHandler(viewRef, params[0]); return;
      }
      return;
    }

    // Old architecture – use UIManager
    const handle = findNodeHandle(viewRef);
    if (!handle) return;
    const config = UIManager.getViewManagerConfig('RNMMChatView');
    const id = config?.Commands?.[command];
    if (id == null) {
      console.warn(`[ChatView] Legacy command id not found for ${command}`);
      return;
    }
    UIManager.dispatchViewManagerCommand(handle, id, params);
  }

  useImperativeHandle(ref, () => ({

    showThreadsList() {
      if (Platform.OS === "ios") {
        mobileMessaging.showThreadsList();
        return;
      }
      // Nothing to do if there is no chatView reference.
      let chatViewRef = RNMMChatRef.current;
      if (!chatViewRef) return;
      dispatchCommand(chatViewRef, 'showThreadsList');
    },

    setExceptionHandler(
      exceptionHandler: ((exception: ChatException) => void) | null,
      onError?: (error: Error) => void
    ) {
      // Not needed for iOS.
      if (Platform.OS === "ios") {
        mobileMessaging.setChatExceptionHandler(
          (exception) => console.log('[ChatView] Exception received: ' + JSON.stringify(exception)),
          (error) => console.log('[ChatView] Exception handler error: ' + error)
        );
        return;
      }

      // Nothing to do if there is no chatView reference.
      let chatViewRef = RNMMChatRef.current;
      if (!chatViewRef) return;

      eventEmitter.removeAllListeners(CHAT_EVENT_EXCEPTION_RECEIVED);
      let isHandlerPresent = typeof exceptionHandler === 'function';
      if (isHandlerPresent) {
        const handleError = (e: unknown) => {
          if (onError) {
            if (e instanceof Error) {
              onError(e);
            } else {
              onError(new Error(String(e)));
            }
          } else {
            console.error('[ChatView] Could not handle chat exception:', e);
          }
        };

        eventEmitter.addListener(CHAT_EVENT_EXCEPTION_RECEIVED, (chatException) => {
          try {
            if (exceptionHandler && isChatException(chatException)) {
              exceptionHandler(chatException);
            } else {
              console.error('[ChatView] Received chat exception is not valid:', chatException);
            }
          } catch (e) {
            handleError(e);
          }
        });
      }
      dispatchCommand(chatViewRef, 'setExceptionHandler', [isHandlerPresent]);
    }

  }));

  useLayoutEffect(() => {
    // Not needed for iOS.
    if (Platform.OS === "ios") return;

    // Nothing to do if there is no chatView reference.
    const chatViewRef = RNMMChatRef.current;
    if (!chatViewRef) return;

    // Fix for android, sometimes it can't get parent view, which is needed
    // for proper relayout.
    setTimeout(() => {
      console.log(`[ChatView] Add command called`);
      dispatchCommand(chatViewRef, 'add');
    }, 100);

    return () => {
      console.log(`[ChatView] Remove command called`);
      eventEmitter.removeAllListeners(CHAT_EVENT_EXCEPTION_RECEIVED);
      dispatchCommand(chatViewRef, 'remove');
    };
  }, []);

  return (
    <RNMMChatView
      ref={RNMMChatRef}
      style={style}
      sendButtonColor={sendButtonColor}
    />
  );
}
);

export default ChatView;
