//
//  File.swift
//  ReactNativeMobileMessaging
//
//  Created by Andrey Kadochnikov on 29.11.2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import MobileMessaging

@objc(ReactNativeMobileMessaging)
class ReactNativeMobileMessaging: NSObject {
	@objc
	static func requiresMainQueueSetup() -> Bool {
	  return true
	}

	@objc
	func start() {
		MobileMessaging.logger = MMDefaultLogger()
		MobileMessaging.withApplicationCode("972e7779962b5f243ac13a9ee961b76a-c6562969-042d-416b-8386-6d1c591fd3b7", notificationType: .alert)?.start()
	}

	@objc
	func constantsToExport() -> [AnyHashable : Any]! {
		return ["initialCount": 0]
	}

	@objc
	func currentTime(_ callback: RCTResponseSenderBlock) {
		callback([Date().timeIntervalSince1970])
	}
}
