//
//  RNMMMessageHandlingDelegate.swift
//  ReactNativeMobileMessaging
//
//  Created by Olga Koroleva on 10.11.2020.
//

import Foundation
import MobileMessaging

class RNMMMessageHandlingDelegate : MessageHandlingDelegate {
    func inAppWebViewPresentingViewController(for message: MTMessage) -> UIViewController? {
        return RCTPresentedViewController()
    }
}
