//
//  Utils.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 04.02.2020.
//

import Foundation
import MobileMessaging

extension MM_MTMessage {
    override func dictionary() -> [String: Any] {
        var result = [String: Any]()
        result["messageId"] = messageId
        result["body"] = text
        result["sound"] = sound
        result["silent"] = isSilent
        result["receivedTimestamp"] = UInt64(sendDateTime * 1000)
        result["customPayload"] = customPayload
        result["originalPayload"] = originalPayload
        result["contentUrl"] = contentUrl
        result["seen"] = seenStatus != .NotSeen
        result["seenDate"] = seenDate?.timeIntervalSince1970
        result["geo"] = isGeoMessage
        result["chat"] = isChatMessage
        result["browserUrl"] = browserUrl?.absoluteString
        result["deeplink"] = deeplink?.absoluteString
        result["webViewUrl"] = webViewUrl?.absoluteString
        result["inAppOpenTitle"] = inAppOpenTitle
        result["inAppDismissTitle"] = inAppDismissTitle
        return result
    }

    var isGeoMessage: Bool {
        let geoAreasDicts = (originalPayload["internalData"] as? [String: Any])?["geo"] as? [[String: Any]]
        return geoAreasDicts != nil
    }
}

extension MMInbox {
    func dictionary() -> [String: Any] {
        var result = [String: Any]()
        result["countTotal"] = countTotal
        result["countUnread"] = countUnread
        result["messages"] = messages.map({ return $0.dictionaryRepresentation })
        return result
    }
}

extension MMBaseMessage {
    class func createFrom(dictionary: [String: Any]) -> MMBaseMessage? {
        guard let messageId = dictionary["messageId"] as? String,
            let originalPayload = dictionary["originalPayload"] as? MMStringKeyPayload else
        {
            return nil
        }

        return MMBaseMessage(messageId: messageId, direction: MMMessageDirection.MT, originalPayload: originalPayload, deliveryMethod: .undefined)
    }

    func dictionary() -> [String: Any] {
        var result = [String: Any]()
        result["messageId"] = messageId
        result["customPayload"] = originalPayload["customPayload"]
        result["originalPayload"] = originalPayload

        if let aps = originalPayload["aps"] as? MMStringKeyPayload {
            result["body"] = aps["body"]
            result["sound"] = aps["sound"]
        }

        if let internalData = originalPayload["internalData"] as? MMStringKeyPayload,
            let _ = internalData["silent"] as? MMStringKeyPayload {
            result["silent"] = true
        } else if let silent = originalPayload["silent"] as? Bool {
            result["silent"] = silent
        }

        return result
    }
}

extension MMRegion {
    func dictionary() -> [String: Any] {
        var areaCenter = [String: Any]()
        areaCenter["lat"] = center.latitude
        areaCenter["lon"] = center.longitude

        var area = [String: Any]()
        area["id"] = identifier
        area["center"] = areaCenter
        area["radius"] = radius
        area["title"] = title

        var result = [String: Any]()
        result["area"] = area
        return result
    }
}

extension Optional {
    func unwrap<T>(orDefault fallbackValue: T) -> T {
        switch self {
        case .some(let val as T):
            return val
        default:
            return fallbackValue
        }
    }
}

struct EventName {
    static let tokenReceived = "tokenReceived"
    static let registrationUpdated = "registrationUpdated"
    static let installationUpdated = "installationUpdated"
    static let userUpdated = "userUpdated"
    static let personalized = "personalized"
    static let depersonalized = "depersonalized"
    static let geofenceEntered = "geofenceEntered"
    static let actionTapped = "actionTapped"
    static let notificationTapped = "notificationTapped"
    static let messageReceived = "messageReceived"
    static let messageStorage_start = "messageStorage.start"
    static let messageStorage_stop = "messageStorage.stop"
    static let messageStorage_save = "messageStorage.save"
    static let messageStorage_find = "messageStorage.find"
    static let messageStorage_findAll = "messageStorage.findAll"
    static let inAppChat_availabilityUpdated = "inAppChat.availabilityUpdated"
    static let inAppChat_unreadMessageCounterUpdated = "inAppChat.unreadMessageCounterUpdated"
    static let inAppChat_viewStateChanged = "inAppChat.viewStateChanged"
    static let inAppChat_configurationSynced = "inAppChat.configurationSynced"
    static let inAppChat_registrationIdUpdated = "inAppChat.livechatRegistrationIdUpdated"
}

extension UIApplication {
    class func topViewController(controller: UIViewController? = UIApplication.shared.keyWindow?.rootViewController) -> UIViewController? {
        if let navigationController = controller as? UINavigationController {
            return topViewController(controller: navigationController.visibleViewController)
        }
        if let tabController = controller as? UITabBarController {
            if let selected = tabController.selectedViewController {
                return topViewController(controller: selected)
            }
        }
        if let presented = controller?.presentedViewController {
            return topViewController(controller: presented)
        }
        return controller
    }
}
