//
//  RNMMChat.swift
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import Foundation
import MobileMessaging

@objc(RNMMChat)
class RNMMChat: NSObject  {
    private var willUseJWT = false
    private var willUseChatExceptionHandler = false
    private var jwtRequestQueue: [((String?) -> Void)] = []
    private let jwtQueueLock = NSLock()

    @objc(showChat:)
    func showChat(presentingOptions: NSDictionary) {
        MobileMessaging.inAppChat?.delegate = self
        var presentVCModally = false
        if let presentingOptions = presentingOptions as? [String: Any],
           let iosOptions = presentingOptions["ios"] as? [String: Any],
           let shouldBePresentedModally = iosOptions["shouldBePresentedModally"] as? Bool {
            presentVCModally = shouldBePresentedModally
        }
        let vc = presentVCModally ? MMChatViewController.makeRootNavigationViewController(): MMChatViewController.makeRootNavigationViewControllerWithCustomTransition()
        if presentVCModally {
            vc.modalPresentationStyle = .fullScreen
        }
        if let rootVc = RCTKeyWindow()?.rootViewController {
            rootVc.present(vc, animated: true, completion: nil)
        } else {
            MMLogDebug("[InAppChat] could not define root vc to present in-app-chat")
        }
    }

    @objc(showThreadsList)
    func showThreadsList() {
        RNMMChatView.viewController?.showThreadsList()
    }
    
    @objc(getMessageCounter:)
    func getMessageCounter(onResult: @escaping RCTResponseSenderBlock) {
        onResult([MobileMessaging.inAppChat?.getMessageCounter ?? 0])
    }

    @objc(isChatAvailable:)
    func isChatAvailable(onResult: @escaping RCTResponseSenderBlock) {
        onResult([ReactNativeMobileMessaging.shared?.isChatAvailable ?? false])
    }

    @objc(resetMessageCounter)
    func resetMessageCounter() {
        MobileMessaging.inAppChat?.resetMessageCounter()
    }

    @objc(setWidgetTheme:)
    func setWidgetTheme(widgetTheme: String) {
        MMChatSettings.settings.widgetTheme = widgetTheme
    }

    @objc(setChatCustomization:)
    func setChatCustomization(settings: NSDictionary) {
        guard let settings = settings as? [String: AnyObject] else { return }
        Task { [weak self] in
            let chatsettings = MMChatSettings.sharedInstance
            if let chatToolbar = ChatCustomizationKeys.chatToolbar.getDict(from: settings) {
                self?.setNotNil(&chatsettings.navBarColor, ToolbarCustomizationKeys.backgroundColor.getColor(from: chatToolbar))
                self?.setNotNil(&chatsettings.navBarTitleColor, ToolbarCustomizationKeys.titleTextColor.getColor(from: chatToolbar))
                self?.setNotNil(&chatsettings.title, ToolbarCustomizationKeys.titleText.getString(from: chatToolbar))
                self?.setNotNil(&chatsettings.navBarItemsTintColor, ToolbarCustomizationKeys.navigationIconTint.getColor(from: chatToolbar))
            }
            if let attachmentPreviewToolbar = ChatCustomizationKeys.attachmentPreviewToolbar.getDict(from: settings) {
                self?.setNotNil(&chatsettings.attachmentPreviewBarsColor, ToolbarCustomizationKeys.backgroundColor.getColor(from: attachmentPreviewToolbar))
                self?.setNotNil(&chatsettings.attachmentPreviewItemsColor, ToolbarCustomizationKeys.navigationIconTint.getColor(from: attachmentPreviewToolbar))
            }
            self?.setNotNil(&chatsettings.backgroundColor, ChatCustomizationKeys.chatBackgroundColor.getColor(from: settings))
            self?.setNotNil(&chatsettings.advancedSettings.mainTextColor, ChatCustomizationKeys.chatInputTextColor.getColor(from: settings))
            self?.setNotNil(&chatsettings.advancedSettings.textInputBackgroundColor, ChatCustomizationKeys.chatInputBackgroundColor.getColor(from: settings))
            self?.setNotNil(&chatsettings.advancedSettings.attachmentButtonIcon,
                      ChatCustomizationKeys.chatInputAttachmentIcon.getImage(from: settings))
            self?.setNotNil(&chatsettings.advancedSettings.sendButtonIcon,
                      ChatCustomizationKeys.chatInputSendIcon.getImage(from: settings))
            self?.setNotNil(&chatsettings.sendButtonTintColor, ChatCustomizationKeys.chatInputSendIconTint.getColor(from: settings))
            self?.setNotNil(&chatsettings.chatInputSeparatorLineColor, ChatCustomizationKeys.chatInputSeparatorLineColor.getColor(from: settings))
            self?.setNotNil(&chatsettings.advancedSettings.isLineSeparatorHidden, ChatCustomizationKeys.chatInputSeparatorLineVisible.getBool(from: settings))
            self?.setNotNil(&chatsettings.advancedSettings.typingIndicatorColor, ChatCustomizationKeys.chatInputCursorColor.getColor(from: settings))
            self?.setNotNil(&chatsettings.errorLabelTextColor, ChatCustomizationKeys.networkErrorTextColor.getColor(from: settings))
            self?.setNotNil(&chatsettings.errorLabelBackgroundColor, ChatCustomizationKeys.networkErrorLabelBackgroundColor.getColor(from: settings))
            self?.setNotNil(&chatsettings.advancedSettings.mainPlaceholderTextColor, ChatCustomizationKeys.chatInputHintTextColor.getColor(from: settings))
            self?.setNotNil(&chatsettings.advancedSettings.charCounterDefaultColor, ChatCustomizationKeys.chatInputCharCounterDefaultColor.getColor(from: settings))
            self?.setNotNil(&chatsettings.advancedSettings.charCounterAlertColor, ChatCustomizationKeys.chatInputCharCounterAlertColor.getColor(from: settings))
        }
    }
    
    func setNotNil<T>(_ forVariable: inout T, _ value:T?) {
       if let value = value { forVariable = value }
    }
    
    @objc(setLanguage:onSuccess:onError:)
    func setLanguage(localeString: NSString, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        guard let chatVC = RNMMChatView.viewController else {
            MobileMessaging.inAppChat?.setLanguage(String(localeString))
            return
        }
        let localeS = String(localeString)
        let separator = localeS.contains("_") ? "_" : "-"
        let components = localeS.components(separatedBy: separator)
        let langCode = localeS.contains("zh") ? localeS : components.first
        let lang = MMLanguage.mapLanguage(from: langCode ??
                                                         String(localeS.prefix(2)))
        chatVC.setLanguage(lang) { error in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess(nil)
            }
        }    
    }

    @objc(sendContextualData:chatMultiThreadStrategy:onSuccess:onError:)
    func sendContextualData(data: NSString, chatMultiThreadStrategy: NSString, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        var strategy: MMChatMultiThreadStrategy
        switch chatMultiThreadStrategy {
            case "ACTIVE": strategy = .ACTIVE
            case "ALL": strategy = .ALL
            case "ALL_PLUS_NEW": strategy = .ALL_PLUS_NEW
            default: 
                onError([NSError(type: .InvalidArguments)])
                return
        }

        
         if let chatVC = RNMMChatView.viewController {
             chatVC.sendContextualData(String(data), multiThreadStrategy: strategy) { error in
                 if let error = error {
                     onError([error.reactNativeObject])
                 } else {
                     onSuccess(nil)
                 }
             }
         } else if let inAppChat = MobileMessaging.inAppChat {
             inAppChat.sendContextualData(String(data), multiThreadStrategy: strategy)
             onSuccess(nil)
         }
    }

    @objc(setChatJwtProvider)
    func setChatJwtProvider() {
        willUseJWT = true
    }

    @objc(setChatExceptionHandler:)
    func setChatExceptionHandler(isHandlerPresent: NSNumber) {
        // NSNumber due to how RN bridge wraps JavaScript booleans
        willUseChatExceptionHandler = isHandlerPresent.boolValue
    }
    
    @objc(setChatJwt:)
    func setChatJwt(jwt: String?) {
        jwtQueueLock.lock()
        if !jwtRequestQueue.isEmpty {
            let completion = jwtRequestQueue.removeFirst()
            completion(jwt)
        }
        jwtQueueLock.unlock()
    }

    @objc(restartConnection)
    func restartConnection() {
        RNMMChatView.viewController?.restartConnection()
    }

    @objc(stopConnection)
    func stopConnection() {
        RNMMChatView.viewController?.stopConnection()
    }
}

extension RNMMChat: MMInAppChatDelegate {
    @objc func getJWT() -> String? {
        guard willUseJWT else { return nil }
        var jwtResult: String?
        let semaphore = DispatchSemaphore(value: 0)

        jwtQueueLock.lock()
        jwtRequestQueue.append { jwt in
            jwtResult = jwt
            semaphore.signal()
        }
        jwtQueueLock.unlock()
        ReactNativeMobileMessaging.shared?.sendEvent(withName: EventName.inAppChat_jwtRequested, body: nil)
        _ = semaphore.wait(timeout: .now() + 45)
        return jwtResult
    }
    
    @objc public func didReceiveException(_ exception: MMChatException) -> MMChatExceptionDisplayMode {
        guard willUseChatExceptionHandler else { return .displayDefaultAlert }
        
        var payload: [String: Any] = [:]
        if let message = exception.message {
            payload["message"] = message
        }
        if let name = exception.name {
            payload["name"] = name
        }
        payload["code"] = exception.code
        payload["origin"] = "LiveChat"
        payload["platform"] = "React Native"
        
        ReactNativeMobileMessaging.shared?.sendEvent(withName: EventName.inAppChat_exceptionReceived, body: payload)
        return .noDisplay
    }
}
