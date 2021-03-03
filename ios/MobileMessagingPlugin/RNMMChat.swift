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

     @objc(setupChatSettings:)
     func setupChatSettings(settings: NSDictionary) {
          if let chatSettings = settings as? [String: AnyObject] {
               MobileMessaging.inAppChat?.settings.configureWith(rawConfig: chatSettings)
          }
      }
}
