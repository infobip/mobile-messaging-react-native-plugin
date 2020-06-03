//
//  Utils.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 04.02.2020.
//

import Foundation
import MobileMessaging

extension MTMessage {
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
        return result
    }

    var isGeoMessage: Bool {
        let geoAreasDicts = (originalPayload["internalData"] as? [String: Any])?["geo"] as? [[String: Any]]
        return geoAreasDicts != nil
    }
}

extension BaseMessage {
    class func createFrom(dictionary: [String: Any]) -> BaseMessage? {
        guard let messageId = dictionary["messageId"] as? String,
            let originalPayload = dictionary["originalPayload"] as? StringKeyPayload else
        {
            return nil
        }

        return BaseMessage(messageId: messageId, direction: MessageDirection.MT, originalPayload: originalPayload, deliveryMethod: .undefined)
    }

    func dictionary() -> [String: Any] {
        var result = [String: Any]()
        result["messageId"] = messageId
        result["customPayload"] = originalPayload["customPayload"]
        result["originalPayload"] = originalPayload

        if let aps = originalPayload["aps"] as? StringKeyPayload {
            result["body"] = aps["body"]
            result["sound"] = aps["sound"]
        }

        if let internalData = originalPayload["internalData"] as? StringKeyPayload,
            let _ = internalData["silent"] as? StringKeyPayload {
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
}

extension UIColor {
    convenience init(hexString: String, alpha: CGFloat = 1.0) {
        let hexString: String = hexString.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
        let scanner = Scanner(string: hexString)
        if (hexString.hasPrefix("#")) {
            scanner.scanLocation = 1
        }
        var color: UInt32 = 0
        scanner.scanHexInt32(&color)
        let mask = 0x000000FF
        let r = Int(color >> 16) & mask
        let g = Int(color >> 8) & mask
        let b = Int(color) & mask
        let red   = CGFloat(r) / 255.0
        let green = CGFloat(g) / 255.0
        let blue  = CGFloat(b) / 255.0
        self.init(red:red, green:green, blue:blue, alpha:alpha)
    }
}
