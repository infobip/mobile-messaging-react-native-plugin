//
//  RNMobileMessagingErrorExtension.swift
//  MobileMessaging
//
//  Created by Olga Koroleva on 04.02.2020.
//

import Foundation

public let RNMobileMessagingErrorDomain = "com.mobile-messaging-react-native-plugin"

public enum RNMobileMessagingErrorType: Error {
    case InvalidArguments
    case InvalidUserIdentity
    case DefaultStorageNotInitialized
    case NotSupported
    case NoData

    fileprivate var errorCode: Int {
        switch self {
        case .InvalidArguments:
            return 0
        case .InvalidUserIdentity:
            return 1
        case .DefaultStorageNotInitialized:
            return 2
        case .NotSupported:
            return 3
        case .NoData:
            return 4
        }

    }

    fileprivate var errorDescription: String {
        var errorDescription: String = ""

        switch self {
        case .InvalidArguments:
            errorDescription = NSLocalizedString("Could not retrieve required arguments.", comment: "")
        case .InvalidUserIdentity:
            errorDescription = NSLocalizedString("userIdentity must have at least one non-nil property.", comment: "")
        case .DefaultStorageNotInitialized:
            errorDescription = NSLocalizedString("Default storage not initialized.", comment: "")
        case .NotSupported:
            errorDescription = NSLocalizedString("Functionality is not supported.", comment: "")
        case .NoData:
            errorDescription = NSLocalizedString("No data retrieved.", comment: "")
        }
        return errorDescription
    }

    var userInfo: [String: String] {
        return [NSLocalizedDescriptionKey: errorDescription]
    }

}

extension NSError {
    public convenience init(type: RNMobileMessagingErrorType) {
        self.init(domain: RNMobileMessagingErrorDomain, code: type.errorCode, userInfo: type.userInfo)
    }
    
    var reactNativeObject: [String: Any?] {
        return [
            "description": localizedDescription,
            "code": code,
            "domain": domain
        ]
    }
}
