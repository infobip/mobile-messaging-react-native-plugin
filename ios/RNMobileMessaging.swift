//
//  File.swift
//  ReactNativeMobileMessaging
//
//  Created by Andrey Kadochnikov on 29.11.2019.
//

import Foundation
import MobileMessaging

@objc(ReactNativeMobileMessaging)
class ReactNativeMobileMessaging: RCTEventEmitter  {
//    private var messageStorageAdapter: MessageStorageAdapter?
    private var eventsManager: MobileMessagingEventsManager?
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
      return true
    }
    
    override init() {
        super.init()
        self.eventsManager = MobileMessagingEventsManager(eventEmitter: self)
//        self.messageStorageAdapter = MessageStorageAdapter(eventEmitter: self)
    }
    
    deinit {
        self.eventsManager?.stop()
    }

    @objc(init:onSuccess:onError:)
    func start(config: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseErrorBlock) {
        guard let config = config as? [String : AnyObject], let configuration = MMConfiguration(rawConfig: config) else {
            onError(NSError(type: .InvalidArguments))
            return
        }
        start(configuration: configuration, onSuccess: onSuccess)
    }
    
    private func start(configuration: MMConfiguration, onSuccess: @escaping RCTResponseSenderBlock) {
        MobileMessaging.privacySettings.applicationCodePersistingDisabled = configuration.privacySettings[MMConfiguration.Keys.applicationCodePersistingDisabled].unwrap(orDefault: false)
        MobileMessaging.privacySettings.systemInfoSendingDisabled = configuration.privacySettings[MMConfiguration.Keys.systemInfoSendingDisabled].unwrap(orDefault: false)
        MobileMessaging.privacySettings.carrierInfoSendingDisabled = configuration.privacySettings[MMConfiguration.Keys.carrierInfoSendingDisabled].unwrap(orDefault: false)
        MobileMessaging.privacySettings.userDataPersistingDisabled = configuration.privacySettings[MMConfiguration.Keys.userDataPersistingDisabled].unwrap(orDefault: false)

        var mobileMessaging = MobileMessaging.withApplicationCode(configuration.appCode, notificationType: configuration.notificationType, forceCleanup: configuration.forceCleanup)

        //TODO: will be implemented later
        if configuration.geofencingEnabled {
//            mobileMessaging = mobileMessaging?.withGeofencingService()
        }
        
        //TODO: will be implemented later
        /*if let storageAdapter = messageStorageAdapter, configuration.messageStorageEnabled {
            mobileMessaging = mobileMessaging?.withMessageStorage(storageAdapter)
        } else */if configuration.defaultMessageStorage {
            mobileMessaging = mobileMessaging?.withDefaultMessageStorage()
        }
        if let categories = configuration.categories {
            mobileMessaging = mobileMessaging?.withInteractiveNotificationCategories(Set(categories))
        }
        MobileMessaging.userAgent.cordovaPluginVersion = configuration.reactNativePluginVersion
        if (configuration.logging) {
            MobileMessaging.logger = MMDefaultLogger()
        }
        mobileMessaging?.start({
            onSuccess(nil)
        })
        MobileMessaging.sync()
    }

    private func stop() {
        MobileMessaging.stop()
        eventsManager?.stop()
    }

    /*User Profile Management*/

    @objc(saveUser:onSuccess:onError:)
    func saveUser(userData: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseErrorBlock) {
        guard let userDataDictionary = userData as? [String: Any], let user = User(dictRepresentation: userDataDictionary) else
        {
            onError(NSError(type: .InvalidArguments))
            return
        }

        MobileMessaging.saveUser(user, completion: { (error) in
            if let error = error {
                onError(error)
            } else {
                onSuccess([MobileMessaging.getUser()?.dictionaryRepresentation ?? [:]])
            }
        })
    }

    @objc(fetchUser:onError:)
    func fetchUser(onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseErrorBlock) {
        MobileMessaging.fetchUser(completion: { (user, error) in
            if let error = error {
                onError(error)
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
    func saveInstallation(installation: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseErrorBlock) {
        guard let installationDictionary = installation as? [String: Any], let installation = Installation(dictRepresentation: installationDictionary) else
        {
            onError(NSError(type: .InvalidArguments))
            return
        }

        MobileMessaging.saveInstallation(installation, completion: { (error) in
            if let error = error {
                onError(error)
            } else {
                onSuccess([MobileMessaging.getInstallation()?.dictionaryRepresentation ?? [:]])
            }
        })
    }

    @objc(fetchInstallation:onError:)
    func fetchInstallation(onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseErrorBlock) {
        MobileMessaging.fetchInstallation(completion: { (installation, error) in
            if let error = error {
                onError(error)
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
    func setInstallationAsPrimary(pushRegistrationId: NSString, primary: Bool, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseErrorBlock) {
        MobileMessaging.setInstallation(withPushRegistrationId: pushRegistrationId as String, asPrimary: primary, completion: { (installations, error) in
            if let error = error {
                onError(error)
            } else {
                onSuccess(installations?.map({ $0.dictionaryRepresentation }) ?? [])
            }
        })
    }

    @objc(personalize:onSuccess:onError:)
    func personalize(context: NSDictionary, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseErrorBlock) {
        guard let context = context as? [String: Any], let uiDict = context["userIdentity"] as? [String: Any] else
        {
            onError(NSError(type: .InvalidArguments))
            return
        }
        guard let ui = UserIdentity(phones: uiDict["phones"] as? [String], emails: uiDict["emails"] as? [String], externalUserId: uiDict["externalUserId"] as? String) else
        {
            onError(NSError(type: .InvalidUserIdentity))
            return
        }
        let uaDict = context["userAttributes"] as? [String: Any]
        let ua = uaDict == nil ? nil : UserAttributes(dictRepresentation: uaDict!)
        MobileMessaging.personalize(withUserIdentity: ui, userAttributes: ua) { (error) in
            if let error = error {
                onError(error)
            } else {
                onSuccess([MobileMessaging.getUser()?.dictionaryRepresentation ?? [:]])
            }
        }
    }

    @objc(depersonalize:onError:)
    func depersonalize(onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseErrorBlock) {
        MobileMessaging.depersonalize(completion: { (status, error) in
            if (status == SuccessPending.pending) {
                onSuccess(["pending"])
            } else if let error = error {
                onError(error)
            } else {
                onSuccess(["success"])
            }
        })
    }

    @objc(depersonalizeInstallation:onSuccess:onError:)
    func depersonalizeInstallation(pushRegistrationId: NSString, onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseErrorBlock) {
        MobileMessaging.depersonalizeInstallation(withPushRegistrationId: pushRegistrationId as String, completion: { (installations, error) in
            if let error = error {
                onError(error)
            } else {
                onSuccess(installations?.map({ $0.dictionaryRepresentation }) ?? [])
            }
        })
    }

    /*Messages and Notifications*/
    
    @objc(markMessagesSeen:onSuccess:onError:)
    func markMessagesSeen(messageIds: [String], onSuccess: @escaping RCTResponseSenderBlock, onError: RCTResponseErrorBlock) {
        guard !messageIds.isEmpty else {
            onError(NSError(type: .InvalidArguments))
            return
        }
        MobileMessaging.setSeen(messageIds: messageIds, completion: {
            onSuccess(messageIds);
        })
    }
    
    @objc(defaultMessageStorage_find:onSuccess:onError:)
    func defaultMessageStorage_find(messageId: NSString, onSuccess: @escaping RCTResponseSenderBlock, onError: RCTResponseErrorBlock) {
        guard let storage = MobileMessaging.defaultMessageStorage else {
            onError(NSError(type: .DefaultStorageNotInitialized))
            return
        }

        storage.findMessages(withIds: [(messageId as MessageId)], completion: { messages in
            onSuccess([messages?[0].dictionary() ?? [:]])
        })
    }

    @objc(defaultMessageStorage_findAll:onError:)
    func defaultMessageStorage_findAll(onSuccess: @escaping RCTResponseSenderBlock, onError: RCTResponseErrorBlock) {
        guard let storage = MobileMessaging.defaultMessageStorage else {
            onError(NSError(type: .DefaultStorageNotInitialized))
            return
        }

        storage.findAllMessages(completion: { messages in
            let result = messages?.map({$0.dictionary()})
            onSuccess([result ?? []])
        })
    }

    @objc(defaultMessageStorage_delete:onSuccess:onError:)
    func defaultMessageStorage_delete(messageId: NSString, onSuccess: @escaping RCTResponseSenderBlock, onError: RCTResponseErrorBlock) {
        guard let storage = MobileMessaging.defaultMessageStorage else {
            onError(NSError(type: .DefaultStorageNotInitialized))
            return
        }

        storage.remove(withIds: [(messageId as MessageId)]) { _ in
            onSuccess(nil)
        }
    }

    @objc(defaultMessageStorage_deleteAll:onError:)
    func defaultMessageStorage_deleteAll(onSuccess: @escaping RCTResponseSenderBlock, onError: RCTResponseErrorBlock) {
        MobileMessaging.defaultMessageStorage?.removeAllMessages() { _ in
            onSuccess(nil)
        }
    }

}
