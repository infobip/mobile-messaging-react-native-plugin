//
//  RNMobileMessagingConfiguration.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 04.02.2020.
//

import Foundation
import MobileMessaging

class RNMobileMessagingConfiguration {
    struct Keys {
        static let privacySettings = "privacySettings"
        static let userDataPersistingDisabled = "userDataPersistingDisabled"
        static let carrierInfoSendingDisabled = "carrierInfoSendingDisabled"
        static let systemInfoSendingDisabled = "systemInfoSendingDisabled"
        static let applicationCodePersistingDisabled = "applicationCodePersistingDisabled"
        static let geofencingEnabled = "geofencingEnabled"
        static let applicationCode = "applicationCode"
        static let forceCleanup = "forceCleanup"
        static let logging = "logging"
        static let defaultMessageStorage = "defaultMessageStorage"
        static let notificationTypes = "notificationTypes"
        static let messageStorage = "messageStorage"
        static let reactNativePluginVersion = "reactNativePluginVersion"
        static let notificationCategories = "notificationCategories"
    }

    let appCode: String
    let geofencingEnabled: Bool
    let messageStorageEnabled: Bool
    let defaultMessageStorage: Bool
    let notificationType: UserNotificationType
    let forceCleanup: Bool
    let logging: Bool
    let privacySettings: [String: Any]
    let reactNativePluginVersion: String
    let categories: [NotificationCategory]?

    init?(rawConfig: [String: AnyObject]) {
        guard let appCode = rawConfig[RNMobileMessagingConfiguration.Keys.applicationCode] as? String,
            let ios = rawConfig["ios"] as? [String: AnyObject] else
        {
            return nil
        }

        self.appCode = appCode
        self.geofencingEnabled = rawConfig[RNMobileMessagingConfiguration.Keys.geofencingEnabled].unwrap(orDefault: false)
        self.forceCleanup = ios[RNMobileMessagingConfiguration.Keys.forceCleanup].unwrap(orDefault: false)
        self.logging = ios[RNMobileMessagingConfiguration.Keys.logging].unwrap(orDefault: false)
        self.defaultMessageStorage = rawConfig[RNMobileMessagingConfiguration.Keys.defaultMessageStorage].unwrap(orDefault: false)
        self.messageStorageEnabled = rawConfig[RNMobileMessagingConfiguration.Keys.messageStorage] != nil ? true : false

        if let rawPrivacySettings = rawConfig[RNMobileMessagingConfiguration.Keys.privacySettings] as? [String: Any] {
            var ps = [String: Any]()
            ps[RNMobileMessagingConfiguration.Keys.userDataPersistingDisabled] = rawPrivacySettings[RNMobileMessagingConfiguration.Keys.userDataPersistingDisabled].unwrap(orDefault: false)
            ps[RNMobileMessagingConfiguration.Keys.carrierInfoSendingDisabled] = rawPrivacySettings[RNMobileMessagingConfiguration.Keys.carrierInfoSendingDisabled].unwrap(orDefault: false)
            ps[RNMobileMessagingConfiguration.Keys.systemInfoSendingDisabled] = rawPrivacySettings[RNMobileMessagingConfiguration.Keys.systemInfoSendingDisabled].unwrap(orDefault: false)
            ps[RNMobileMessagingConfiguration.Keys.applicationCodePersistingDisabled] = rawPrivacySettings[RNMobileMessagingConfiguration.Keys.applicationCodePersistingDisabled].unwrap(orDefault: false)

            privacySettings = ps
        } else {
            privacySettings = [:]
        }

        self.reactNativePluginVersion = rawConfig[RNMobileMessagingConfiguration.Keys.reactNativePluginVersion].unwrap(orDefault: "unknown")

        self.categories = (rawConfig[RNMobileMessagingConfiguration.Keys.notificationCategories] as? [[String: Any]])?.compactMap(NotificationCategory.init)

        if let notificationTypeNames =  ios[RNMobileMessagingConfiguration.Keys.notificationTypes] as? [String] {
            let options = notificationTypeNames.reduce([], { (result, notificationTypeName) -> [UserNotificationType] in
                var result = result
                switch notificationTypeName {
                case "badge": result.append(UserNotificationType.badge)
                case "sound": result.append(UserNotificationType.sound)
                case "alert": result.append(UserNotificationType.alert)
                default: break
                }
                return result
            })

            self.notificationType = UserNotificationType(options: options)
        } else {
            self.notificationType = UserNotificationType.none
        }
    }
}
