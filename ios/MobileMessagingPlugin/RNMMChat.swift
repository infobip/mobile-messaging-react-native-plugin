//
//  RNMMChat.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 26.05.2020.
//

import Foundation
import MobileMessaging

@objc(RNMMChat)
class RNMMChat: NSObject  {

    @objc(showChat:)
    func showChat(presentingOptions: NSDictionary) {
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
        let chatsettings = MMChatSettings.sharedInstance
        if let chatToolbar = ChatCustomizationKeys.chatToolbar.getDict(from: settings) {
            setNotNil(&chatsettings.navBarColor, ToolbarCustomizationKeys.backgroundColor.getColor(from: chatToolbar))
            setNotNil(&chatsettings.navBarTitleColor, ToolbarCustomizationKeys.titleTextColor.getColor(from: chatToolbar))
            setNotNil(&chatsettings.title, ToolbarCustomizationKeys.titleText.getString(from: chatToolbar))
            setNotNil(&chatsettings.navBarItemsTintColor, ToolbarCustomizationKeys.navigationIconTint.getColor(from: chatToolbar))
        }
        if let attachmentPreviewToolbar = ChatCustomizationKeys.attachmentPreviewToolbar.getDict(from: settings) {
            setNotNil(&chatsettings.attachmentPreviewBarsColor, ToolbarCustomizationKeys.backgroundColor.getColor(from: attachmentPreviewToolbar))
            setNotNil(&chatsettings.attachmentPreviewItemsColor, ToolbarCustomizationKeys.navigationIconTint.getColor(from: attachmentPreviewToolbar))
        }
        setNotNil(&chatsettings.backgroundColor, ChatCustomizationKeys.chatBackgroundColor.getColor(from: settings))
        setNotNil(&chatsettings.advancedSettings.mainTextColor, ChatCustomizationKeys.chatInputTextColor.getColor(from: settings))
        setNotNil(&chatsettings.advancedSettings.textInputBackgroundColor, ChatCustomizationKeys.chatInputBackgroundColor.getColor(from: settings))
        setNotNil(&chatsettings.advancedSettings.attachmentButtonIcon,
                  ChatCustomizationKeys.chatInputAttachmentIcon.getImage(from: settings))
        setNotNil(&chatsettings.advancedSettings.sendButtonIcon,
                  ChatCustomizationKeys.chatInputSendIcon.getImage(from: settings))
        setNotNil(&chatsettings.sendButtonTintColor, ChatCustomizationKeys.chatInputSendIconTint.getColor(from: settings))
        setNotNil(&chatsettings.chatInputSeparatorLineColor, ChatCustomizationKeys.chatInputSeparatorLineColor.getColor(from: settings))
        setNotNil(&chatsettings.advancedSettings.isLineSeparatorHidden, ChatCustomizationKeys.chatInputSeparatorLineVisible.getBool(from: settings))
        setNotNil(&chatsettings.advancedSettings.typingIndicatorColor, ChatCustomizationKeys.chatInputCursorColor.getColor(from: settings))
        setNotNil(&chatsettings.errorLabelTextColor, ChatCustomizationKeys.networkErrorTextColor.getColor(from: settings))
        setNotNil(&chatsettings.errorLabelBackgroundColor, ChatCustomizationKeys.networkErrorLabelBackgroundColor.getColor(from: settings))
        setNotNil(&chatsettings.advancedSettings.mainPlaceholderTextColor, ChatCustomizationKeys.chatInputHintTextColor.getColor(from: settings))
        func setNotNil<T>(_ forVariable: inout T, _ value:T?) {
           if let value = value { forVariable = value }
        }
    }

    @objc(setupChatSettings:)
    func setupChatSettings(settings: NSDictionary) {
        guard let settings = settings as? [String: AnyObject] else { return }
        let chatSettings = MMChatSettings.sharedInstance        
        
        setNotNil(&chatSettings.title, CustomizationKeys.toolbarTitle.getString(from: settings))
        /// Colors
        setNotNil(&chatSettings.navBarItemsTintColor, CustomizationKeys.toolbarTintColor.getColor(from: settings))
        setNotNil(&chatSettings.navBarColor, CustomizationKeys.toolbarBackgroundColor.getColor(from: settings))
        setNotNil(&chatSettings.navBarTitleColor, CustomizationKeys.toolbarTitleColor.getColor(from: settings))
        setNotNil(&chatSettings.advancedSettings.mainTextColor, CustomizationKeys.inputTextColor.getColor(from: settings))
    
        setNotNil(&chatSettings.sendButtonTintColor, CustomizationKeys.sendButtonTintColor.getColor(from: settings))
        setNotNil(&chatSettings.backgroundColor, CustomizationKeys.chatBackgroundColor.getColor(from: settings))
        setNotNil(&chatSettings.errorLabelTextColor, CustomizationKeys.noConnectionAlertTextColor.getColor(from: settings))
        setNotNil(&chatSettings.errorLabelBackgroundColor, CustomizationKeys.noConnectionAlertBackgroundColor.getColor(from: settings))
        setNotNil(&chatSettings.widgetTheme, CustomizationKeys.widgetTheme.getString(from: settings))

        setNotNil(&chatSettings.advancedSettings.mainPlaceholderTextColor, CustomizationKeys.chatInputPlaceholderTextColor.getColor(from: settings))
        setNotNil(&chatSettings.advancedSettings.typingIndicatorColor, CustomizationKeys.chatInputCursorColor.getColor(from: settings))
        /// Icons
        setNotNil(&chatSettings.advancedSettings.sendButtonIcon, CustomizationKeys.sendButtonIcon.getImage(from: settings))
        setNotNil(&chatSettings.advancedSettings.attachmentButtonIcon, CustomizationKeys.attachmentButtonIcon.getImage(from: settings))
        /// Attachment colors
        setNotNil(&chatSettings.attachmentPreviewBarsColor, CustomizationKeys.attachmentPreviewBarsColor.getColor(from: settings))
        setNotNil(&chatSettings.attachmentPreviewItemsColor, CustomizationKeys.attachmentPreviewItemsColor.getColor(from: settings))
        
        if let chatInputSeparatorVisible = CustomizationKeys.chatInputSeparatorVisible.getBool(from: settings) {
            chatSettings.advancedSettings.isLineSeparatorHidden = !chatInputSeparatorVisible
        }
        /// Sizes
        setNotNil(&chatSettings.advancedSettings.textContainerTopMargin, CustomizationKeys.textContainerTopMargin.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.textContainerLeftPadding, CustomizationKeys.textContainerLeftPadding.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.textContainerCornerRadius, CustomizationKeys.textContainerCornerRadius.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.textViewTopMargin, CustomizationKeys.textViewTopMargin.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.placeholderHeight, CustomizationKeys.placeholderHeight.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.placeholderSideMargin, CustomizationKeys.placeholderSideMargin.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.buttonHeight, CustomizationKeys.buttonHeight.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.buttonTouchableOverlap, CustomizationKeys.buttonTouchableOverlap.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.buttonRightMargin, CustomizationKeys.buttonRightMargin.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.utilityButtonWidth, CustomizationKeys.utilityButtonWidth.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.utilityButtonBottomMargin, CustomizationKeys.utilityButtonBottomMargin.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.initialHeight, CustomizationKeys.initialHeight.getCGFloat(from: settings))
        /// Fonts
        if let mainFontSize = chatSettings.advancedSettings.mainFont?.pointSize {
            setNotNil(&chatSettings.advancedSettings.mainFont, CustomizationKeys.mainFont.getFont(from: settings, with: mainFontSize))
        }
        if let charCountFontSize = chatSettings.advancedSettings.charCountFont?.pointSize {
            setNotNil(&chatSettings.advancedSettings.charCountFont, CustomizationKeys.chatCountFont.getFont(from: settings, with: charCountFontSize))
        }
        func setNotNil<T>(_ forVariable: inout T, _ value:T?) {
            if let value = value { forVariable = value }
        }
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

    @objc(setJwt:)
    func setJwt(jwt: String) {
        MobileMessaging.inAppChat?.jwt = jwt
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
