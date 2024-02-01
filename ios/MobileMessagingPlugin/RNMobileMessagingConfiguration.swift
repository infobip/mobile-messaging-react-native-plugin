//
//  RNMobileMessagingConfiguration.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 04.02.2020.
//

import Foundation
import MobileMessaging

class RNMobileMessagingConfiguration {
    static let userDefaultsConfigKey = "com.mobile-messaging.reactNativePluginConfiguration"

    struct Keys {
        static let privacySettings = "privacySettings"
        static let userDataPersistingDisabled = "userDataPersistingDisabled"
        static let carrierInfoSendingDisabled = "carrierInfoSendingDisabled"
        static let systemInfoSendingDisabled = "systemInfoSendingDisabled"
        static let applicationCodePersistingDisabled = "applicationCodePersistingDisabled"
        static let geofencingEnabled = "geofencingEnabled"
        static let applicationCode = "applicationCode"
        static let webRTCUI = "webRTCUI"
        static let configurationId = "configurationId"
        static let logging = "logging"
        static let defaultMessageStorage = "defaultMessageStorage"
        static let notificationTypes = "notificationTypes"
        static let messageStorage = "messageStorage"
        static let reactNativePluginVersion = "reactNativePluginVersion"
        static let notificationCategories = "notificationCategories"
        static let inAppChatEnabled = "inAppChatEnabled"
        static let fullFeaturedInAppsEnabled = "fullFeaturedInAppsEnabled"
        static let webViewSettings = "webViewSettings"
    }

    let appCode: String
    let webRTCUI: [String: AnyObject]?
    let geofencingEnabled: Bool
    let messageStorageEnabled: Bool
    let defaultMessageStorage: Bool
    let notificationType: MMUserNotificationType
    let logging: Bool
    let privacySettings: [String: Any]
    let reactNativePluginVersion: String
    let categories: [MMNotificationCategory]?
    let inAppChatEnabled: Bool
    let fullFeaturedInAppsEnabled: Bool
    let webViewSettings: [String: AnyObject]?

    init?(rawConfig: [String: AnyObject]) {
        guard let appCode = rawConfig[RNMobileMessagingConfiguration.Keys.applicationCode] as? String,
            let ios = rawConfig["ios"] as? [String: AnyObject] else
        {
            return nil
        }

        self.appCode = appCode
        self.webRTCUI = rawConfig[RNMobileMessagingConfiguration.Keys.webRTCUI] as? [String: AnyObject]
        self.geofencingEnabled = rawConfig[RNMobileMessagingConfiguration.Keys.geofencingEnabled].unwrap(orDefault: false)
        self.logging = ios[RNMobileMessagingConfiguration.Keys.logging].unwrap(orDefault: false)
        self.defaultMessageStorage = rawConfig[RNMobileMessagingConfiguration.Keys.defaultMessageStorage].unwrap(orDefault: false)
        self.messageStorageEnabled = rawConfig[RNMobileMessagingConfiguration.Keys.messageStorage] != nil ? true : false
        self.inAppChatEnabled = rawConfig[RNMobileMessagingConfiguration.Keys.inAppChatEnabled].unwrap(orDefault: false)
        self.fullFeaturedInAppsEnabled = rawConfig[RNMobileMessagingConfiguration.Keys.fullFeaturedInAppsEnabled].unwrap(orDefault: false)

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

        self.categories = (rawConfig[RNMobileMessagingConfiguration.Keys.notificationCategories] as? [[String: Any]])?.compactMap(MMNotificationCategory.init)

        if let notificationTypeNames =  ios[RNMobileMessagingConfiguration.Keys.notificationTypes] as? [String] {
            let options = notificationTypeNames.reduce([], { (result, notificationTypeName) -> [MMUserNotificationType] in
                var result = result
                switch notificationTypeName {
                case "badge": result.append(MMUserNotificationType.badge)
                case "sound": result.append(MMUserNotificationType.sound)
                case "alert": result.append(MMUserNotificationType.alert)
                default: break
                }
                return result
            })

            self.notificationType = MMUserNotificationType(options: options)
        } else {
            self.notificationType = MMUserNotificationType.none
        }

        if let rawWebViewSettings = ios[RNMobileMessagingConfiguration.Keys.webViewSettings] as? [String: AnyObject] {
            self.webViewSettings = rawWebViewSettings
        } else {
            self.webViewSettings = nil
        }
    }

    static func saveConfigToDefaults(rawConfig: [String: AnyObject]) {
        let data: Data = NSKeyedArchiver.archivedData(withRootObject: rawConfig)
        UserDefaults.standard.set(data, forKey: userDefaultsConfigKey)
    }

    static func getRawConfigFromDefaults() -> [String: AnyObject]? {
        let data = UserDefaults.standard.data(forKey: userDefaultsConfigKey)
        guard let data = data else {
            return nil
        }
        return NSKeyedUnarchiver.unarchiveObject(with: data) as? [String : AnyObject]
    }
}
