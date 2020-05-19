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
    MobileMessagingNotificationServiceExtension.startWithApplicationCode( <# Your Application Code #> )
		MobileMessagingNotificationServiceExtension.didReceive(request, withContentHandler: contentHandler)
	}

	override func serviceExtensionTimeWillExpire() {
		MobileMessagingNotificationServiceExtension.serviceExtensionTimeWillExpire()
		if let originalContent = originalContent {
			contentHandler?(originalContent)
		}
	}
}
