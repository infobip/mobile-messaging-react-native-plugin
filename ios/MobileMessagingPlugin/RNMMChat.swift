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
    @objc(showChat)
    func showChat() {
        let vc = ChatViewController.makeRootNavigationViewController()
        vc.modalPresentationStyle = .fullScreen
        RCTKeyWindow()?.rootViewController?.present(vc, animated: true, completion: nil)
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
