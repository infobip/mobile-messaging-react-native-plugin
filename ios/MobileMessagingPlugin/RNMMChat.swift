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
        let vc = presentVCModally ? ChatViewController.makeRootNavigationViewController(): ChatViewController.makeRootNavigationViewControllerWithCustomTransition()
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

extension ChatSettings {
    struct Keys {
        static let title = "title"
        static let sendButtonColor = "sendButtonColor"
        static let navigationBarItemsColor = "navigationBarItemsColor"
        static let navigationBarColor = "navigationBarColor"
        static let navigationBarTitleColor = "navigationBarTitleColor"
    }

    func configureWith(rawConfig: [String: AnyObject]) {
        if let title = rawConfig[ChatSettings.Keys.title] as? String {
            self.title = title
        }
        if let sendButtonColor = rawConfig[ChatSettings.Keys.sendButtonColor] as? String {
            self.sendButtonTintColor = UIColor(hexString: sendButtonColor)
        }
        if let navigationBarItemsColor = rawConfig[ChatSettings.Keys.navigationBarItemsColor] as? String {
            self.navBarItemsTintColor = UIColor(hexString: navigationBarItemsColor)
        }
        if let navigationBarColor = rawConfig[ChatSettings.Keys.navigationBarColor] as? String {
            self.navBarColor = UIColor(hexString: navigationBarColor)
        }
        if let navigationBarTitleColor = rawConfig[ChatSettings.Keys.navigationBarTitleColor] as? String {
            self.navBarTitleColor = UIColor(hexString: navigationBarTitleColor)
        }
    }
}
