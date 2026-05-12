//
//  RNMobileMessagingConfiguration.swift
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import Foundation
import MobileMessaging

class RNMobileMessagingConfiguration {
    static let userDefaultsConfigKey = "com.mobile-messaging.reactNativePluginConfiguration"
    static let ignoreKeysWhenComparing: [String] = [Keys.reactNativePluginVersion]

    struct Keys {
        static let privacySettings = "privacySettings"
        static let userDataPersistingDisabled = "userDataPersistingDisabled"
        static let carrierInfoSendingDisabled = "carrierInfoSendingDisabled"
        static let systemInfoSendingDisabled = "systemInfoSendingDisabled"
        static let applicationCodePersistingDisabled = "applicationCodePersistingDisabled"
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
        static let userDataJwt = "userDataJwt"
        static let backendBaseURL = "backendBaseURL"
    }

    let webRTCUI: [String: AnyObject]?
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
    let userDataJwt: String?
    let backendBaseURL: String?

    init?(rawConfig: [String: AnyObject]) {
        guard let ios = rawConfig["ios"] as? [String: AnyObject] else
        {
            return nil
        }

        self.webRTCUI = rawConfig[RNMobileMessagingConfiguration.Keys.webRTCUI] as? [String: AnyObject]
        self.logging = rawConfig[RNMobileMessagingConfiguration.Keys.logging].unwrap(orDefault: false)
        self.defaultMessageStorage = rawConfig[RNMobileMessagingConfiguration.Keys.defaultMessageStorage].unwrap(orDefault: false)
        self.messageStorageEnabled = rawConfig[RNMobileMessagingConfiguration.Keys.messageStorage] != nil ? true : false
        self.inAppChatEnabled = rawConfig[RNMobileMessagingConfiguration.Keys.inAppChatEnabled].unwrap(orDefault: false)
        self.fullFeaturedInAppsEnabled = rawConfig[RNMobileMessagingConfiguration.Keys.fullFeaturedInAppsEnabled].unwrap(orDefault: false)
        self.backendBaseURL = rawConfig[RNMobileMessagingConfiguration.Keys.backendBaseURL] as? String

        if let rawPrivacySettings = rawConfig[RNMobileMessagingConfiguration.Keys.privacySettings] as? [String: Any] {
            var ps = [String: Any]()
            ps[RNMobileMessagingConfiguration.Keys.userDataPersistingDisabled] = rawPrivacySettings[RNMobileMessagingConfiguration.Keys.userDataPersistingDisabled].unwrap(orDefault: false)
            ps[RNMobileMessagingConfiguration.Keys.carrierInfoSendingDisabled] = rawPrivacySettings[RNMobileMessagingConfiguration.Keys.carrierInfoSendingDisabled].unwrap(orDefault: false)
            ps[RNMobileMessagingConfiguration.Keys.systemInfoSendingDisabled] = rawPrivacySettings[RNMobileMessagingConfiguration.Keys.systemInfoSendingDisabled].unwrap(orDefault: false)

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

        self.userDataJwt = rawConfig[RNMobileMessagingConfiguration.Keys.userDataJwt] as? String
    }

    static func saveConfigToDefaults(rawConfig: [String: AnyObject]) {
        let serializableConfig = serializedConfig(from: rawConfig)

        do {
            let data: Data = try NSKeyedArchiver.archivedData(withRootObject: serializableConfig, requiringSecureCoding: false)
            UserDefaults.standard.set(data, forKey: userDefaultsConfigKey)
        } catch {
            MMLogError("[MobileMessaging] Failed to archive config to UserDefaults: \(error)")
        }
    }

    static func getRawConfigFromDefaults() -> [String: AnyObject]? {
        let data = UserDefaults.standard.data(forKey: userDefaultsConfigKey)
        guard let data = data else {
            return nil
        }

        do {
            guard let rawConfig = try NSKeyedUnarchiver.unarchiveTopLevelObjectWithData(data) as? [String: AnyObject] else {
                return nil
            }

            let normalizedConfig = serializedConfig(from: rawConfig)
            if (normalizedConfig as NSDictionary) != (rawConfig as NSDictionary) {
                saveConfigToDefaults(rawConfig: normalizedConfig)
            }

            return normalizedConfig
        } catch {
            MMLogError("[MobileMessaging] Failed to unarchive config from UserDefaults: \(error)")
            return nil
        }
    }

    static func didConfigurationChange(userConfigDict: [String: AnyObject]) -> Bool {
        var serializedUserConfig = serializedConfig(from: userConfigDict)
        guard let cachedConfigDict = getRawConfigFromDefaults() else {
            return false
        }
        var serializedCachedConfig = serializedConfig(from: cachedConfigDict)

        removeIgnoredKeys(from: &serializedUserConfig)
        removeIgnoredKeys(from: &serializedCachedConfig)

        return (serializedUserConfig as NSDictionary) != (serializedCachedConfig as NSDictionary)
    }

    private static func serializedConfig(from rawConfig: [String: AnyObject]) -> [String: AnyObject] {
        var rawConfig = rawConfig
        rawConfig.removeValue(forKey: RNMobileMessagingConfiguration.Keys.applicationCode)
        sanitizePrivacySettings(in: &rawConfig)

        var serializableConfig = rawConfig.compactMapValues { value -> AnyObject? in
            if value is NSString || value is NSNumber || value is NSArray || value is NSDictionary || value is NSDate || value is NSData {
                return value
            }
            return nil
        }

        if rawConfig[RNMobileMessagingConfiguration.Keys.messageStorage] != nil {
            // Preserve the fact that custom message storage was configured without persisting the JS callbacks.
            serializableConfig[RNMobileMessagingConfiguration.Keys.messageStorage] = NSString(string: "message_storage")
        }

        return serializableConfig
    }

    private static func removeIgnoredKeys(from config: inout [String: AnyObject]) {
        ignoreKeysWhenComparing.forEach { config.removeValue(forKey: $0) }
    }

    private static func sanitizePrivacySettings(in rawConfig: inout [String: AnyObject]) {
        guard var rawPrivacySettings = rawConfig[RNMobileMessagingConfiguration.Keys.privacySettings] as? [String: Any] else {
            return
        }

        rawPrivacySettings.removeValue(forKey: RNMobileMessagingConfiguration.Keys.applicationCodePersistingDisabled)

        if rawPrivacySettings.isEmpty {
            rawConfig.removeValue(forKey: RNMobileMessagingConfiguration.Keys.privacySettings)
        } else {
            rawConfig[RNMobileMessagingConfiguration.Keys.privacySettings] = rawPrivacySettings as NSDictionary
        }
    }
}
