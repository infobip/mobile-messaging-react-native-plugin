//
//  MobileMessagingPluginApplicationDelegate.swift
//  MobileMessagingReactNative
//
// Copyright (c) 2016-2025 Infobip Limited
// Licensed under the Apache License, Version 2.0
//

import UIKit
import MobileMessaging

private let ApplicationLaunchedByNotification_Key = "com.mobile-messaging.application-launched-by-notification"

@objc(MobileMessagingPluginApplicationDelegate)
public class MobileMessagingPluginApplicationDelegate: UIResponder, UIApplicationDelegate {

    private var originalDelegate: (UIApplicationDelegate & NSObjectProtocol)?
    @objc public private(set) var installed = false

    private static let sharedInstaller = MobileMessagingPluginApplicationDelegate()

    @objc public static func install() {
        sharedInstaller.installDelegate()
    }

    private func installDelegate() {
        guard !installed else { return }
        originalDelegate = UIApplication.shared.delegate
        UIApplication.shared.delegate = self
        installed = true
    }

    public var window: UIWindow? {
        get { originalDelegate?.window ?? nil }
        set {
            let setter = #selector(setter: UIApplicationDelegate.window)
            if let delegate = originalDelegate, delegate.responds(to: setter) {
                delegate.perform(setter, with: newValue)
            }
        }
    }

    public override func forwardingTarget(for aSelector: Selector!) -> Any? {
        if let delegate = originalDelegate, delegate.responds(to: aSelector) {
            return delegate
        }
        return super.forwardingTarget(for: aSelector)
    }

    public override func responds(to aSelector: Selector!) -> Bool {
        return super.responds(to: aSelector) || (originalDelegate?.responds(to: aSelector) ?? false)
    }

    public func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        if MM_MTMessage.make(withPayload: userInfo) != nil {
            MobileMessaging.didReceiveRemoteNotification(extendedUserInfo(from: userInfo), fetchCompletionHandler: completionHandler)
        } else if let delegate = originalDelegate,
                  delegate.responds(to: #selector(application(_:didReceiveRemoteNotification:fetchCompletionHandler:))) {
            delegate.application?(application, didReceiveRemoteNotification: userInfo, fetchCompletionHandler: completionHandler)
        } else {
            completionHandler(.noData)
        }
    }

    public func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        MobileMessaging.didRegisterForRemoteNotificationsWithDeviceToken(deviceToken)
        if let delegate = originalDelegate,
           delegate.responds(to: #selector(application(_:didRegisterForRemoteNotificationsWithDeviceToken:))) {
            delegate.application?(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)
        }
    }

    private func extendedUserInfo(from userInfo: [AnyHashable: Any]) -> [AnyHashable: Any] {
        var result = userInfo
        if UIApplication.shared.applicationState == .inactive {
            result[ApplicationLaunchedByNotification_Key] = true
        }
        return result
    }
}
