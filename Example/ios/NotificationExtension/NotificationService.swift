//
//  NotificationService.swift
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import UserNotifications
import MobileMessaging

class NotificationService: UNNotificationServiceExtension {

	var contentHandler: ((UNNotificationContent) -> Void)?
	var originalContent: UNNotificationContent?

	override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
		self.contentHandler = contentHandler
		self.originalContent = request.content

		// Check if notification is from Infobip
    if MM_MTMessage.isCorrectPayload(request.content.userInfo) {
        MobileMessagingNotificationServiceExtension.didReceive(request, withContentHandler: contentHandler)
    } else {
        // Pass through non-Infobip notifications
        contentHandler(request.content)
    }
	}

	override func serviceExtensionTimeWillExpire() {
    MobileMessagingNotificationServiceExtension.serviceExtensionTimeWillExpire()
		if let originalContent = originalContent {
			contentHandler?(originalContent)
		}
	}
}
