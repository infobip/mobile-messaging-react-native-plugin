//
//  RNMobileMessagingStorageAdapter.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 12.02.2020.
//

import Foundation
import MobileMessaging

class MessageStorageAdapter: MessageStorage {
    let queue = DispatchQueue(label: "MessageStoreAdapterQueue")
    let findSemaphore = DispatchSemaphore(value: 0)
    var foundMessage:BaseMessage?
    
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
    
    func insert(outgoing messages: [BaseMessage], completion: @escaping () -> Void) {
        // Implementation not needed. This method is intended for client usage.
    }
    
    func insert(incoming messages: [BaseMessage], completion: @escaping () -> Void) {
        eventEmitter.sendEvent(withName: EventName.messageStorage_save, body: messages.map({$0.dictionary()}))
        completion()
    }
    
    func findMessage(withId messageId: MessageId) -> BaseMessage? {
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
    
    func update(messageSentStatus status: MOMessageSentStatus, for messageId: MessageId, completion: @escaping () -> Void) {
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

        foundMessage = BaseMessage.createFrom(dictionary: messageDict)
        findSemaphore.signal()
    }
}
