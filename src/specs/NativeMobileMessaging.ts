import {type TurboModule, TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
    // Initialization
    init(config: Object, onSuccess: () => void, onError: (error: Object) => void): void;

    // Message storage
    defaultMessageStorage_find(messageId: string, onSuccess: (message?: Object) => void, onError: (error: Object) => void): void;
    defaultMessageStorage_findAll(onSuccess: (messages: Array<Object>) => void, onError: (error: Object) => void): void;
    defaultMessageStorage_delete(messageId: string, onSuccess: () => void, onError: (error: Object) => void): void;
    defaultMessageStorage_deleteAll(onSuccess: () => void, onError: (error: Object) => void): void;

    // Inbox
    fetchInboxMessages(token: string, externalUserId: string, filterOptions: Object, onSuccess: (inbox: Object) => void, onError: (error: Object) => void): void;
    fetchInboxMessagesWithoutToken(externalUserId: string, filterOptions: Object, onSuccess: (inbox: Object) => void, onError: (error: Object) => void): void;
    setInboxMessagesSeen(externalUserId: string, messageIds: Array<string>, onSuccess: (seenMap: {[index: string]: string}) => void, onError: (error: Object) => void): void;

    // User profile
    saveUser(userData: Object, onSuccess: (user: Object) => void, onError: (error: Object) => void): void;
    fetchUser(onSuccess: (user: Object) => void, onError: (error: Object) => void): void;
    getUser(onSuccess: (user: Object) => void): void;

    // Installation
    saveInstallation(installation: Object, onSuccess: (installation: Object) => void, onError: (error: Object) => void): void;
    fetchInstallation(onSuccess: (installation: Object) => void, onError: (error: Object) => void): void;
    getInstallation(onSuccess: (installation: Object) => void): void;
    setInstallationAsPrimary(pushRegistrationId: string, primary: boolean, onSuccess: (installations: Array<Object>) => void, onError: (error: Object) => void): void;

    // Personalization
    personalize(context: Object, onSuccess: (user: Object) => void, onError: (error: Object) => void): void;
    depersonalize(onSuccess: (state: string) => void, onError: (error: Object) => void): void;
    depersonalizeInstallation(pushRegistrationId: string, onSuccess: (installations: Array<Object>) => void, onError: (error: Object) => void): void;

    // Mark messages as seen
    markMessagesSeen(messageIds: Array<string>, onSuccess: () => void, onError: (error: Object) => void): void;

    // Remote notifications
    registerForAndroidRemoteNotifications(): void;

    // Dialog for error
    showDialogForError(errorCode: number, onSuccess: () => void, onError: (error: Object) => void): void;

    // Events
    submitEvent(eventData: Object, onError: (error: Object) => void): void;
    submitEventImmediately(eventData: Object, onSuccess: () => void, onError: (error: Object) => void): void;

    // JWT
    setUserDataJwt(jwt: string, onSuccess: () => void, onError: (error: Object) => void): void;

    // For custom message storage (calls from JS to native)
    messageStorage_provideFindAllResult(messages: Array<Object>): void;
    messageStorage_provideFindResult(message: Object): void;

    // Event system (required for React Native EventEmitter)
    addListener(eventName: string): void;
    removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MobileMessaging');
