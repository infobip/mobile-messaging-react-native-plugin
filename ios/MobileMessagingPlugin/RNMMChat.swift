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
    
    @objc(setupChatSettings:)
    func setupChatSettings(settings: NSDictionary) {
        guard let settings = settings as? [String: AnyObject] else { return }
        let chatSettings = MMChatSettings.sharedInstance        
        
        setNotNil(&chatSettings.title, CustomisationKeys.toolbarTitle.getString(from: settings))
        /// Colors
        setNotNil(&chatSettings.navBarItemsTintColor, CustomisationKeys.toolbarTintColor.getColor(from: settings))
        setNotNil(&chatSettings.navBarColor, CustomisationKeys.toolbarBackgroundColor.getColor(from: settings))
        setNotNil(&chatSettings.navBarTitleColor, CustomisationKeys.toolbarTitleColor.getColor(from: settings))
        setNotNil(&chatSettings.advancedSettings.mainTextColor, CustomisationKeys.inputTextColor.getColor(from: settings))
    
        setNotNil(&chatSettings.sendButtonTintColor, CustomisationKeys.sendButtonTintColor.getColor(from: settings))
        setNotNil(&chatSettings.backgroundColor, CustomisationKeys.chatBackgroundColor.getColor(from: settings))
        setNotNil(&chatSettings.errorLabelTextColor, CustomisationKeys.noConnectionAlertTextColor.getColor(from: settings))
        setNotNil(&chatSettings.errorLabelBackgroundColor, CustomisationKeys.noConnectionAlertBackgroundColor.getColor(from: settings))
        setNotNil(&chatSettings.widgetTheme, CustomisationKeys.widgetTheme.getString(from: settings))

        setNotNil(&chatSettings.advancedSettings.mainPlaceholderTextColor, CustomisationKeys.chatInputPlaceholderTextColor.getColor(from: settings))
        setNotNil(&chatSettings.advancedSettings.typingIndicatorColor, CustomisationKeys.chatInputCursorColor.getColor(from: settings))
        /// Icons
        setNotNil(&chatSettings.advancedSettings.sendButtonIcon, CustomisationKeys.sendButtonIcon.getImage(from: settings))
        setNotNil(&chatSettings.advancedSettings.attachmentButtonIcon, CustomisationKeys.attachmentButtonIcon.getImage(from: settings))
        /// Attachment colors
        setNotNil(&chatSettings.attachmentPreviewBarsColor, CustomisationKeys.attachmentPreviewBarsColor.getColor(from: settings))
        setNotNil(&chatSettings.attachmentPreviewItemsColor, CustomisationKeys.attachmentPreviewItemsColor.getColor(from: settings))
        
        if let chatInputSeparatorVisible = CustomisationKeys.chatInputSeparatorVisible.getBool(from: settings) {
            chatSettings.advancedSettings.isLineSeparatorHidden = !chatInputSeparatorVisible
        }
        /// Sizes
        setNotNil(&chatSettings.advancedSettings.textContainerTopMargin, CustomisationKeys.textContainerTopMargin.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.textContainerLeftPadding, CustomisationKeys.textContainerLeftPadding.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.textContainerCornerRadius, CustomisationKeys.textContainerCornerRadius.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.textViewTopMargin, CustomisationKeys.textViewTopMargin.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.placeholderHeight, CustomisationKeys.placeholderHeight.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.placeholderSideMargin, CustomisationKeys.placeholderSideMargin.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.buttonHeight, CustomisationKeys.buttonHeight.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.buttonTouchableOverlap, CustomisationKeys.buttonTouchableOverlap.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.buttonRightMargin, CustomisationKeys.buttonRightMargin.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.utilityButtonWidth, CustomisationKeys.utilityButtonWidth.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.utilityButtonBottomMargin, CustomisationKeys.utilityButtonBottomMargin.getCGFloat(from: settings))
        setNotNil(&chatSettings.advancedSettings.initialHeight, CustomisationKeys.initialHeight.getCGFloat(from: settings))
        /// Fonts
        if let mainFontSize = chatSettings.advancedSettings.mainFont?.pointSize {
            setNotNil(&chatSettings.advancedSettings.mainFont, CustomisationKeys.mainFont.getFont(from: settings, with: mainFontSize))
        }
        if let charCountFontSize = chatSettings.advancedSettings.charCountFont?.pointSize {
            setNotNil(&chatSettings.advancedSettings.charCountFont, CustomisationKeys.chatCountFont.getFont(from: settings, with: charCountFontSize))
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

    @objc(sendContextualData:multiThreadStrategy:onSuccess:onError:)
    func sendContextualData(data: NSString, multiThreadStrategy: Bool,  onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        if let chatVC = RNMMChatView.viewController  {
            chatVC.sendContextualData(String(data), multiThreadStrategy: multiThreadStrategy ? .ALL : .ACTIVE) { error in
                if let error = error {
                    onError([error.reactNativeObject])
                } else {
                    onSuccess(nil)
                }
            }
        } else if let inAppChat = MobileMessaging.inAppChat {
            inAppChat.sendContextualData(String(data), multiThreadStrategy: multiThreadStrategy ? .ALL : .ACTIVE)
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
