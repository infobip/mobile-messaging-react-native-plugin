//  NotificationService.swift

import UserNotifications
import MobileMessaging

@available(iOS 10.0, *)
class NotificationService: UNNotificationServiceExtension {

	var contentHandler: ((UNNotificationContent) -> Void)?
	var originalContent: UNNotificationContent?

	override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
		self.contentHandler = contentHandler
		self.originalContent = request.content

		// Check if notification is from Infobip
        if MM_MTMessage.isCorrectPayload(request.content.userInfo) {
            MobileMessagingNotificationServiceExtension.startWithApplicationCode("Your application code")
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
