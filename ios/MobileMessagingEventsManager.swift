//
//  RNMobileMessagingEventsManager.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 04.02.2020.
//

import Foundation
import MobileMessaging

class MobileMessagingEventsManager {
    private var eventEmitter: RCTEventEmitter!
    
    private let supportedNotifications: [String: String] = [
        "messageReceived": MMNotificationMessageReceived,
        "tokenReceived":  MMNotificationDeviceTokenReceived,
        "registrationUpdated":  MMNotificationRegistrationUpdated,
        "geofenceEntered": MMNotificationGeographicalRegionDidEnter,
        "notificationTapped": MMNotificationMessageTapped,
        "actionTapped": MMNotificationActionTapped,
        "depersonalized": MMNotificationDepersonalized,
        "personalized": MMNotificationPersonalized,
        "installationUpdated": MMNotificationInstallationSynced,
        "userUpdated": MMNotificationUserSynced
    ]

    init(eventEmitter: RCTEventEmitter) {
        self.eventEmitter = eventEmitter
        setupObservingMMNotifications()
    }

    func stop() {
        setupObservingMMNotifications(stopObservations: true)
    }

    private func setupObservingMMNotifications(stopObservations: Bool = false) {
        supportedNotifications.forEach { (kv) in
            let name = NSNotification.Name(rawValue: kv.value)
            NotificationCenter.default.removeObserver(self, name: name, object: nil)
            if !stopObservations {
                NotificationCenter.default.addObserver(self, selector: #selector(handleMMNotification(notification:)), name: name, object: nil)
            }
        }
    }

    @objc func handleMMNotification(notification: Notification) {
        var eventName: String?
        var notificationResult: Any?
        switch notification.name.rawValue {
        case MMNotificationMessageReceived:
            eventName = "messageReceived"
            if let message = notification.userInfo?[MMNotificationKeyMessage] as? MTMessage {
                notificationResult = message.dictionary()
            }
        case MMNotificationDeviceTokenReceived:
            eventName = "tokenReceived"
            if let token = notification.userInfo?[MMNotificationKeyDeviceToken] as? String {
                notificationResult = token
            }
        case MMNotificationRegistrationUpdated:
            eventName = "registrationUpdated"
            if let internalId = notification.userInfo?[MMNotificationKeyRegistrationInternalId] as? String {
                notificationResult = internalId
            }
//        case MMNotificationGeographicalRegionDidEnter:
//            eventName = "geofenceEntered"
//            if let region = notification.userInfo?[MMNotificationKeyGeographicalRegion] as? MMRegion {
//                notificationResult = region.dictionary()
//            }
        case MMNotificationMessageTapped:
            eventName = "notificationTapped"
            if let message = notification.userInfo?[MMNotificationKeyMessage] as? MTMessage {
                notificationResult = message.dictionary()
            }
        case MMNotificationActionTapped:
            eventName = "actionTapped"
            if let message = notification.userInfo?[MMNotificationKeyMessage] as? MTMessage, let actionIdentifier = notification.userInfo?[MMNotificationKeyActionIdentifier] as? String {
                var parameters = [message.dictionary(), actionIdentifier] as [Any]
                if let textInput = notification.userInfo?[MMNotificationKeyActionTextInput] as? String {
                    parameters.append(textInput)
                }
                notificationResult = parameters
            }
        case MMNotificationDepersonalized:
            eventName = "depersonalized"
        case MMNotificationPersonalized:
            eventName = "personalized"
        case MMNotificationInstallationSynced, MMNotificationUserSynced :
            eventName = "installationUpdated"
            if let installation = notification.userInfo?[MMNotificationKeyInstallation] as? Installation {
                notificationResult = installation.dictionaryRepresentation
            } else if let user = notification.userInfo?[MMNotificationKeyUser] as? User {
                eventName = "userUpdated"
                notificationResult = user.dictionaryRepresentation
            }
        default: break
        }

        eventEmitter.sendEvent(withName: eventName, body: [eventName, notificationResult])
    }
}
