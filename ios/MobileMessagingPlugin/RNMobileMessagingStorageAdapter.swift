//
//  RNMobileMessagingStorageAdapter.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 12.02.2020.
//

import Foundation
import MobileMessaging

class MessageStorageAdapter: MMMessageStorage {
    let queue = DispatchQueue(label: "MessageStoreAdapterQueue")
    let findSemaphore = DispatchSemaphore(value: 0)
    var foundMessage:MMBaseMessage?

    private var eventEmitter: RCTEventEmitter!

    init(eventEmitter: RCTEventEmitter) {
        self.eventEmitter = eventEmitter
    }

    func start() {
        eventEmitter.sendEvent(withName: EventName.messageStorage_start, body: nil)
    }

    func stop() {
        eventEmitter.sendEvent(withName: EventName.messageStorage_stop, body: nil)
    }

    func insert(outgoing messages: [MMBaseMessage], completion: @escaping () -> Void) {
        // Implementation not needed. This method is intended for client usage.
    }

    func insert(incoming messages: [MMBaseMessage], completion: @escaping () -> Void) {
        eventEmitter.sendEvent(withName: EventName.messageStorage_save, body: messages.map({$0.dictionary()}))
        completion()
    }

    func findMessage(withId messageId: MessageId) -> MMBaseMessage? {
        queue.sync() {
            eventEmitter.sendEvent(withName: EventName.messageStorage_find, body: [messageId])
            _ = findSemaphore.wait(wallTimeout: DispatchWallTime.now() + DispatchTimeInterval.seconds(30))
        }
        return foundMessage
    }

    func update(messageSeenStatus status: MMSeenStatus, for messageId: MessageId, completion: @escaping () -> Void) {
        completion()
        // Implementation not needed. This method is intended for client usage.
    }

    func update(deliveryReportStatus isDelivered: Bool, for messageId: MessageId, completion: @escaping () -> Void) {
        completion()
        // Implementation not needed. This method is intended for client usage.
    }

    func update(messageSentStatus status: MM_MOMessageSentStatus, for messageId: MessageId, completion: @escaping () -> Void) {
        completion()
        // Implementation not needed. This method is intended for client usage.
    }

    func findAllMessageIds(completion: @escaping ([String]) -> Void) {
        // Implementation not needed. This method is intended for client usage.
    }

    /*
       Methods to provide results to Native Bridge.
       Called from JS part.
    */

    public func findResult(messageDict: [String: Any]?) {
        guard let messageDict = messageDict else {
            foundMessage = nil
            findSemaphore.signal()
            return
        }

        foundMessage = MMBaseMessage.createFrom(dictionary: messageDict)
        findSemaphore.signal()
    }
}
