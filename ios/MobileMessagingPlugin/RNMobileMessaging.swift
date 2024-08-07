//
//  File.swift
//  ReactNativeMobileMessaging
//
//  Created by Andrey Kadochnikov on 29.11.2019.
//

import Foundation
import MobileMessaging

// It may happen that RN call module initialization more than once,
// Not needed to perform early start more than once per application session.
var isEarlyStartPerformed = false;

@objc(ReactNativeMobileMessaging)
class ReactNativeMobileMessaging: RCTEventEmitter  {
    private var messageStorageAdapter: MessageStorageAdapter?
    private var eventsManager: RNMobileMessagingEventsManager?
    private var isStarted: Bool = false

    @objc
    override func supportedEvents() -> [String]! {
        return [
            EventName.tokenReceived,
            EventName.registrationUpdated,
            EventName.installationUpdated,
            EventName.userUpdated,
            EventName.personalized,
            EventName.depersonalized,
            EventName.geofenceEntered,
            EventName.actionTapped,
            EventName.notificationTapped,
            EventName.messageReceived,
            EventName.messageStorage_start,
            EventName.messageStorage_stop,
            EventName.messageStorage_save,
            EventName.messageStorage_find,
            EventName.messageStorage_findAll,
            EventName.inAppChat_availabilityUpdated,
            EventName.inAppChat_unreadMessageCounterUpdated,
            EventName.inAppChat_viewStateChanged,
            EventName.inAppChat_configurationSynced,
            EventName.inAppChat_registrationIdUpdated
        ]
    }

    override func startObserving() {
        eventsManager?.startObserving()
        super.startObserving()
    }

    override func stopObserving() {
        eventsManager?.stopObserving()
        super.stopObserving()
    }

    override func sendEvent(withName name: String!, body: Any!) {
        guard let _eventsManager = eventsManager, _eventsManager.hasEventListeners == true else {
            return
        }
        super.sendEvent(withName: name, body: body)
    }

    @objc
    override static func requiresMainQueueSetup() -> Bool {
      return true
    }

    override init() {
        super.init()
        self.eventsManager = RNMobileMessagingEventsManager(eventEmitter: self)
        self.messageStorageAdapter = MessageStorageAdapter(eventEmitter: self)
        performEarlyStartIfPossible()
    }

    deinit {
        self.eventsManager?.stop()
    }

    @objc(init:onSuccess:onError:)
    func start(config: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        guard let config = config as? [String : AnyObject], let configuration = RNMobileMessagingConfiguration(rawConfig: config) else {
            onError([NSError(type: .InvalidArguments).reactNativeObject])
            return
        }

        let successCallback: RCTResponseSenderBlock = { [weak self] response in
            RNMobileMessagingConfiguration.saveConfigToDefaults(rawConfig: config)
            self?.isStarted = true
            onSuccess(response)
        }

        let cachedConfigDict = RNMobileMessagingConfiguration.getRawConfigFromDefaults()
        if let cachedConfigDict = cachedConfigDict, (config as NSDictionary) != (cachedConfigDict as NSDictionary)
        {
            stop {
                self.start(configuration: configuration, onSuccess: successCallback)
            }
        } else if cachedConfigDict == nil {
            start(configuration: configuration, onSuccess: successCallback)
        } else {
            successCallback(nil)
        }
    }

    private func performEarlyStartIfPossible() {
        if let cachedConfigDict = RNMobileMessagingConfiguration.getRawConfigFromDefaults(),
           let configuration = RNMobileMessagingConfiguration(rawConfig: cachedConfigDict),
           !self.isStarted,
           !isEarlyStartPerformed
        {
            MMLogDebug("[RNMobileMessaging] Performing early start")
            isEarlyStartPerformed = true
            start(configuration: configuration) { response in }
        }
    }

    private func start(configuration: RNMobileMessagingConfiguration, onSuccess: @escaping RCTResponseSenderBlock) {
        MobileMessaging.privacySettings.applicationCodePersistingDisabled = configuration.privacySettings[RNMobileMessagingConfiguration.Keys.applicationCodePersistingDisabled].unwrap(orDefault: false)
        MobileMessaging.privacySettings.systemInfoSendingDisabled = configuration.privacySettings[RNMobileMessagingConfiguration.Keys.systemInfoSendingDisabled].unwrap(orDefault: false)
        MobileMessaging.privacySettings.carrierInfoSendingDisabled = configuration.privacySettings[RNMobileMessagingConfiguration.Keys.carrierInfoSendingDisabled].unwrap(orDefault: false)
        MobileMessaging.privacySettings.userDataPersistingDisabled = configuration.privacySettings[RNMobileMessagingConfiguration.Keys.userDataPersistingDisabled].unwrap(orDefault: false)

        var mobileMessaging = MobileMessaging.withApplicationCode(configuration.appCode, notificationType: configuration.notificationType)

        if configuration.geofencingEnabled {
            mobileMessaging = mobileMessaging?.withGeofencingService()
        }

        if let storageAdapter = messageStorageAdapter, configuration.messageStorageEnabled {
            mobileMessaging = mobileMessaging?.withMessageStorage(storageAdapter)
        } else if configuration.defaultMessageStorage {
            mobileMessaging = mobileMessaging?.withDefaultMessageStorage()
        }
        if let categories = configuration.categories {
            mobileMessaging = mobileMessaging?.withInteractiveNotificationCategories(Set(categories))
        }
        MobileMessaging.userAgent.pluginVersion = "reactNative \(configuration.reactNativePluginVersion)"
        if configuration.logging {
            MobileMessaging.logger = MMDefaultLogger()
        }

        if configuration.inAppChatEnabled {
            mobileMessaging = mobileMessaging?.withInAppChat()
        }

        if let webViewSettings = configuration.webViewSettings {
            mobileMessaging?.webViewSettings.configureWith(rawConfig: webViewSettings)
        }
        mobileMessaging?.start({
            onSuccess(nil)
        })
    }

    private func stop(completion: @escaping () -> Void) {
        eventsManager?.stop()
        MobileMessaging.stop(false, completion: completion)
    }

    /*User Profile Management*/

    @objc(saveUser:onSuccess:onError:)
    func saveUser(userData: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        guard let userDataDictionary = userData as? [String: Any], let user = MMUser(dictRepresentation: userDataDictionary) else
        {
            onError([NSError(type: .InvalidArguments).reactNativeObject])
            return
        }

        MobileMessaging.saveUser(user, completion: { (error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess([MobileMessaging.getUser()?.dictionaryRepresentation ?? [:]])
            }
        })
    }
    
    @objc(fetchInboxMessages:externalUserId:inboxFilterOptions:onSuccess:onError:)
    func fetchInboxMessages(token: String, externalUserId: String, inboxFilterOptions: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        var filteringOptions: MMInboxFilterOptions? = nil
        if let inboxFilterOptionsDictionary = inboxFilterOptions as? [String: Any] {
            let inboxFilterOptions = MMInboxFilterOptions(dictRepresentation: inboxFilterOptionsDictionary)
             filteringOptions = inboxFilterOptions
        }
        MobileMessaging.inbox?.fetchInbox(token: token, externalUserId: externalUserId, options: filteringOptions, completion: { (inbox, error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess([inbox?.dictionary ?? [:]])
               }
        })
    }

    @objc(fetchInboxMessagesWithoutToken:inboxFilterOptions:onSuccess:onError:)
    func fetchInboxMessagesWithoutToken(externalUserId: String, inboxFilterOptions: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        var filteringOptions: MMInboxFilterOptions? = nil
        if let inboxFilterOptionsDictionary = inboxFilterOptions as? [String: Any] {
            let inboxFilterOptions = MMInboxFilterOptions(dictRepresentation: inboxFilterOptionsDictionary)
             filteringOptions = inboxFilterOptions
        }
        MobileMessaging.inbox?.fetchInbox(externalUserId: externalUserId, options: filteringOptions, completion: { (inbox, error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess([inbox?.dictionary ?? [:]])
               }
        })
    }

    @objc(setInboxMessagesSeen:messages:onSuccess:onError:)
    func setInboxMessagesSeen(externalUserId: String, messages: [String]?, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        guard let messagesIDs = messages else
        {
            onError([NSError(type: .InvalidArguments).reactNativeObject])
            return
        }
        MobileMessaging.inbox?.setSeen(externalUserId: externalUserId, messageIds: messagesIDs, completion: { (error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess(messagesIDs)
            }
        })
    }
    

    @objc(fetchUser:onError:)
    func fetchUser(onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        MobileMessaging.fetchUser(completion: { (user, error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess([MobileMessaging.getUser()?.dictionaryRepresentation ?? [:]])
            }
        })
    }

    @objc(getUser:)
    func getUser(onSuccess: RCTResponseSenderBlock) {
        onSuccess([MobileMessaging.getUser()?.dictionaryRepresentation ?? [:]])
    }

    @objc(saveInstallation:onSuccess:onError:)
    func saveInstallation(installation: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        guard let installationDictionary = installation as? [String: Any], let installation = MMInstallation(dictRepresentation: installationDictionary) else
        {
            onError([NSError(type: .InvalidArguments).reactNativeObject])
            return
        }

        MobileMessaging.saveInstallation(installation, completion: { (error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess([MobileMessaging.getInstallation()?.dictionaryRepresentation ?? [:]])
            }
        })
    }

    @objc(fetchInstallation:onError:)
    func fetchInstallation(onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        MobileMessaging.fetchInstallation(completion: { (installation, error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess([MobileMessaging.getInstallation()?.dictionaryRepresentation ?? [:]])
            }
        })
    }

    @objc(getInstallation:)
    func getInstallation(onSuccess: RCTResponseSenderBlock) {
        onSuccess([MobileMessaging.getInstallation()?.dictionaryRepresentation ?? [:]])
    }

    @objc(setInstallationAsPrimary:primary:onSuccess:onError:)
    func setInstallationAsPrimary(pushRegistrationId: NSString, primary: Bool, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        MobileMessaging.setInstallation(withPushRegistrationId: pushRegistrationId as String, asPrimary: primary, completion: { (installations, error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess(installations?.map({ $0.dictionaryRepresentation }) ?? [])
            }
        })
    }
    
    @objc(personalize:onSuccess:onError:)
    func personalize(context: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        guard let context = context as? [String: Any], let uiDict = context["userIdentity"] as? [String: Any] else
        {
            onError([NSError(type: .InvalidArguments).reactNativeObject])
            return
        }
        guard let ui = MMUserIdentity(phones: uiDict["phones"] as? [String], emails: uiDict["emails"] as? [String], externalUserId: uiDict["externalUserId"] as? String) else
        {
            onError([NSError(type: .InvalidUserIdentity).reactNativeObject])
            return
        }
        let uaDict = context["userAttributes"] as? [String: Any]
        let ua = uaDict == nil ? nil : MMUserAttributes(dictRepresentation: uaDict!)
        MobileMessaging.personalize(withUserIdentity: ui, userAttributes: ua) { (error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess([MobileMessaging.getUser()?.dictionaryRepresentation ?? [:]])
            }
        }
    }

    @objc(depersonalize:onError:)
    func depersonalize(onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        MobileMessaging.depersonalize(completion: { (status, error) in
            if (status == MMSuccessPending.pending) {
                onSuccess(["pending"])
            } else if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess(["success"])
            }
        })
    }

    @objc(depersonalizeInstallation:onSuccess:onError:)
    func depersonalizeInstallation(pushRegistrationId: NSString, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        MobileMessaging.depersonalizeInstallation(withPushRegistrationId: pushRegistrationId as String, completion: { (installations, error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess(installations?.map({ $0.dictionaryRepresentation }) ?? [])
            }
        })
    }

    /*Messages and Notifications*/

    @objc(markMessagesSeen:onSuccess:onError:)
    func markMessagesSeen(messageIds: [String], onSuccess: @escaping RCTResponseSenderBlock, onError: RCTResponseSenderBlock) {
        guard !messageIds.isEmpty else {
            onError([NSError(type: .InvalidArguments).reactNativeObject])
            return
        }
        MobileMessaging.setSeen(messageIds: messageIds, completion: {
            onSuccess(messageIds);
        })
    }

    @objc(defaultMessageStorage_find:onSuccess:onError:)
    func defaultMessageStorage_find(messageId: NSString, onSuccess: @escaping RCTResponseSenderBlock, onError: RCTResponseSenderBlock) {
        guard let storage = MobileMessaging.defaultMessageStorage else {
            onError([NSError(type: .DefaultStorageNotInitialized).reactNativeObject])
            return
        }

        storage.findMessages(withIds: [(messageId as MessageId)], completion: { messages in
            onSuccess([messages?[0].dictionary() ?? [:]])
        })
    }

    @objc(defaultMessageStorage_findAll:onError:)
    func defaultMessageStorage_findAll(onSuccess: @escaping RCTResponseSenderBlock, onError: RCTResponseSenderBlock) {
        guard let storage = MobileMessaging.defaultMessageStorage else {
            onError([NSError(type: .DefaultStorageNotInitialized).reactNativeObject])
            return
        }

        storage.findAllMessages(completion: { messages in
            let result = messages?.map({$0.dictionary()})
            onSuccess([result ?? []])
        })
    }

    @objc(defaultMessageStorage_delete:onSuccess:onError:)
    func defaultMessageStorage_delete(messageId: NSString, onSuccess: @escaping RCTResponseSenderBlock, onError: RCTResponseSenderBlock) {
        guard let storage = MobileMessaging.defaultMessageStorage else {
            onError([NSError(type: .DefaultStorageNotInitialized).reactNativeObject])
            return
        }

        storage.remove(withIds: [(messageId as MessageId)]) { _ in
            onSuccess(nil)
        }
    }

    @objc(defaultMessageStorage_deleteAll:onError:)
    func defaultMessageStorage_deleteAll(onSuccess: @escaping RCTResponseSenderBlock, onError: RCTResponseSenderBlock) {
        MobileMessaging.defaultMessageStorage?.removeAllMessages() { _ in
            onSuccess(nil)
        }
    }

    /*
       Custom message storage:
       methods to provide results to Native Bridge.
       Need to be called from JS part.
    */

    @objc(messageStorage_provideFindResult:)
    func messageStorage_provideFindResult(messageDict: [String: Any]?) {
        self.messageStorageAdapter?.findResult(messageDict: messageDict)
    }

    @objc(messageStorage_provideFindAllResult:)
    func messageStorage_provideFindAllResult(messages: [Any]?) {
        //not needed for iOS SDK
    }

    /* Events */

    @objc(submitEvent:onError:)
    func submitEvent(eventData: NSDictionary, onError: @escaping RCTResponseSenderBlock) {
        guard let eventDataDictionary = eventData as? [String: Any], let event = MMCustomEvent(dictRepresentation: eventDataDictionary) else
        {
            onError([NSError(type: .InvalidArguments).reactNativeObject])
            return
        }

        MobileMessaging.submitEvent(event)
    }

    @objc(submitEventImmediately:onSuccess:onError:)
    func submitEventImmediately(eventData: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
        guard let eventDataDictionary = eventData as? [String: Any], let event = MMCustomEvent(dictRepresentation: eventDataDictionary) else
        {
            onError([NSError(type: .InvalidArguments).reactNativeObject])
            return
        }

        MobileMessaging.submitEvent(event) { (error) in
            if let error = error {
                onError([error.reactNativeObject])
            } else {
                onSuccess(nil)
            }
        }
    }

    /*
     It's not supported for iOS, method created for compatibility
     */
    @objc(showDialogForError:onSuccess:onError:)
    func showDialogForError(errorCode: Int, onSuccess: RCTResponseSenderBlock, onError: RCTResponseSenderBlock) {
        onError([NSError(type: .NotSupported).reactNativeObject])
    }
}
