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
        if let chatSettings = settings as? [String: AnyObject] {
            MobileMessaging.inAppChat?.settings.configureWith(rawConfig: chatSettings)
        }
    }
    
    @objc(setLanguage:)
    func setLanguage(localeString: String) {
        MobileMessaging.inAppChat?.setLanguage(localeString)
    }

    @objc(sendContextualData:multiThreadStrategy:onSuccess:onError:)
    func sendContextualData(data: NSString, multiThreadStrategy: Bool,  onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        guard let chatVC = RNMMChatView.viewController else {
            return
        }
        chatVC.sendContextualData(String(data), multiThreadStrategy: multiThreadStrategy ? .ALL : .ACTIVE) { error in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess(nil)
            }
        }
    }
}
