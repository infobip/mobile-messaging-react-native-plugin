//
//  RNMMLogger.swift
//  ReactNativeMobileMessaging
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import MobileMessaging

class RNMMLogger: NSObject, MMLogging {
    public var logOutput: MMLogOutput
    public var logLevel: MMLogLevel = .All
    public var logFilePaths: [String]? = nil
    
    public override init() {
        self.logOutput = .Console
    }
    
    public func sendLogs(fromViewController vc: UIViewController) { /* Not needed */ }
    
    private func log(_ icon: LogIcons, _ message: String) {
        let stringLog = formattedLogEntry(date: Date(), icon: icon, message: message)
        print(stringLog)
        let rnMessage = message.replacingOccurrences(
            of: "https://github.com/infobip/mobile-messaging-sdk-ios/wiki/In%E2%80%90app-chat#library-events",
            with: "https://github.com/infobip/mobile-messaging-react-native-plugin/wiki/In%E2%80%90app-chat#in-app-chat-events")
        let payload: [String: Any] = ["message" : rnMessage]
        ReactNativeMobileMessaging.shared?.sendEvent(withName: EventName.debugLoggerMessageReceived, body: payload)
    }
    
    public func logDebug(message: String) {
        log(LogIcons.debug, message)
    }
    
    public func logInfo(message: String) {
        log(LogIcons.info, message)
    }
    
    public func logError(message: String) {
        log(LogIcons.error, "RNMMERROR: " + message)
    }
    
    public func logWarn(message: String) {
        log(LogIcons.warning, "RNMMWARN: " + message)
    }
    
    public func logVerbose(message: String) {
        log(LogIcons.verbose, message)
    }
}
