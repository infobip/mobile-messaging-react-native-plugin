//
//  RNMMChatViewManager.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 28.05.2020.
//

import Foundation
import MobileMessaging

@objc(RNMMChatViewManager)
class RNMMChatViewManager: RCTViewManager {
    override func view() -> UIView! {
        return RNMMChatView()
    }
}


@objc class RNMMChatView: UIView {
    override init(frame: CGRect) {
         super.init(frame: frame)
     }
     required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    weak var viewController: ChatViewController?
    
    @objc func setSendButtonColor(_ colorString: NSString) {
        MobileMessaging.inAppChat?.settings.configureWith(rawConfig: ["sendButtonColor": colorString])
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        viewController?.view.frame = bounds
    }
    
    override func didMoveToWindow() {
        embedViewController()
        super.didMoveToWindow()
    }
    
    override func removeFromSuperview() {
        self.viewController?.removeFromParent()
        super.removeFromSuperview()
    }
    
    private func embedViewController() {
        guard let parentVC = parentViewController else {
            return
        }

        let vc = ChatViewController.makeModalViewController()
        parentVC.addChild(vc)
        addSubview(vc.view)
        vc.didMove(toParent: parentVC)
        self.viewController = vc
    }
    
}

extension UIView {
    var parentViewController: UIViewController? {
        var parentResponder: UIResponder? = self
        while parentResponder != nil {
            parentResponder = parentResponder!.next
            if let viewController = parentResponder as? UIViewController {
                return viewController
            }
        }
        return nil
    }
}
