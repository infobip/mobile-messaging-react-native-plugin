import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {
    NativeEventEmitter,
    NativeModules,
    PermissionsAndroid,
    Platform,
    requireNativeComponent,
    Text,
    View,
    findNodeHandle,
    UIManager,
    EmitterSubscription,
} from 'react-native';
import type {Rationale} from "react-native/Libraries/PermissionsAndroid/PermissionsAndroid";
import {Permission} from "react-native";

const { ReactNativeMobileMessaging, RNMMChat } = NativeModules;

export default ReactNativeMobileMessaging;

/**
 * Constructor
 */
class MobileMessaging {
    constructor() {
        this.supportedEvents = [
            "messageReceived",
            "notificationTapped",
            "tokenReceived",
            "registrationUpdated",
            "geofenceEntered",
            "actionTapped",
            "installationUpdated",
            "userUpdated",
            "personalized",
            "depersonalized"
        ];
        this.messageStorageEvents = [
            'messageStorage.start',
            'messageStorage.stop',
            'messageStorage.save',
            'messageStorage.find',
            'messageStorage.findAll'
        ];

        this.inAppChatEvents = [
            'inAppChat.availabilityUpdated',
            'inAppChat.unreadMessageCounterUpdated'
        ];

        this.eventEmitter = new NativeEventEmitter(ReactNativeMobileMessaging);
    }

    /**
     * Register to event coming from MobileMessaging library.
     * The following events are supported:
     *
     *   - messageReceived
     *   - notificationTapped
     *   - tokenReceived
     *   - registrationUpdated
     *	 - geofenceEntered
     *	 - actionTapped
     *	 - installationUpdated
     *	 - userUpdated
     *   - personalized
     *   - depersonalized
     *
     * @name register
     * @param {String} eventName
     * @param {Function} handler will be called when event occurs
     * @deprecated For react-native version >= 0.65 use `subscribe` instead.
     */
    register(eventName, handler) {
        this.eventEmitter.addListener(eventName, handler);
    }

    /**
     * Unregister from MobileMessaging library event.
     * This method left for compatibility with react-native versions < 0.65, for versions >=0.65 it'll not work.
     * @name unregister
     * @param {String} eventName
     * @param {Function} handler will be unregistered from event
     * @deprecated For react-native version >= 0.65 use `unsubscribe` instead.
     */
    unregister(eventName, handler) {
        this.eventEmitter.removeListener(eventName, handler);
    };

    /**
     * Add subscription to event coming from MobileMessaging library.
     * The following events are supported:
     *
     *   - messageReceived
     *   - notificationTapped
     *   - tokenReceived
     *   - registrationUpdated
     *	 - geofenceEntered
     *	 - actionTapped
     *	 - installationUpdated
     *	 - userUpdated
     *   - personalized
     *   - depersonalized
     *   - inAppChat.availabilityUpdated
     *   - inAppChat.unreadMessageCounterUpdated
     *
     * @name subscribe
     * @param {String} eventName
     * @param {Function} handler will be called when event occurs
     * @return {EmitterSubscription} subscription, to unregister from this subscription call `unsubscribe(subscription)`
     */
    subscribe(eventName, handler) : EmitterSubscription {
        return this.eventEmitter.addListener(eventName, handler);
    }

    /**
     * Unsubscribe from MobileMessaging library event.
     * This method should be used for react-native versions >= 0.65.
     * @name unsubscribe
     * @param {EmitterSubscription} subscription
     */
    unsubscribe(subscription) {
        subscription.remove();
    }

    /**
     * Unregister all handlers from MobileMessaging library event.
     *
     * @name unregisterAllHandlers
     * @param {String} eventName
     */
    unregisterAllHandlers(eventName) {
        this.eventEmitter.removeAllListeners(eventName);
    }

    /**
     * Starts a new Mobile Messaging session.
     *
     * @name init
     * @param {Object} config. Configuration for Mobile Messaging
     * Configuration format:
     *	{
     *		applicationCode: '<The application code of your Application from Push Portal website>',
     *		geofencingEnabled: true,
     *		messageStorage: '<Message storage save callback>',
     *		defaultMessageStorage: true,
     *		ios: {
     *			notificationTypes: ['alert', 'sound', 'badge'],
     *			forceCleanup: <Boolean>,
     *			logging: <Boolean>
     *		},
     *	    android: {
     *			notificationIcon: <String>,
     *			multipleNotifications: <Boolean>,
     *			notificationAccentColor: <String>
     *			firebaseOptions: <Object>
     *	    }
     *		privacySettings: {
     *			applicationCodePersistingDisabled: <Boolean>,
     *			userDataPersistingDisabled: <Boolean>,
     *			carrierInfoSendingDisabled: <Boolean>,
     *			systemInfoSendingDisabled: <Boolean>
     *		},
     *		notificationCategories: [
     *			{
     *				identifier: <String>,
     *				actions: [
     *					{
     *						identifier: <String>,
     *						title: <String>,
     *						foreground: <Boolean>,
     *						authenticationRequired: <Boolean>,
     *						moRequired: <Boolean>,
     *						destructive: <Boolean>,
     *						icon: <String>,
     *						textInputActionButtonTitle: <String>,
     *						textInputPlaceholder: <String>
     *					}
     *				]
     *			}
     *		]
     *	}
     * @param {Function} onSuccess. Success callback
     * @param {Function} onError. Error callback
     */
    init(config, onSuccess = function() {}, onError = function() {}) {
        let messageStorage = config.messageStorage;

        this.configuration = config;

        if (!config.applicationCode) {
            onError('No application code provided');
            console.error('[RNMobileMessaging] No application code provided');
            return;
        }

        if (messageStorage) {

            if (typeof messageStorage.start !== 'function') {
                console.error('[RNMobileMessaging] Missing messageStorage.start function definition');
                onError('Missing messageStorage.start function definition');
                return;
            }
            if (typeof messageStorage.stop !== 'function') {
                console.error('[RNMobileMessaging] Missing messageStorage.stop function definition');
                onError('Missing messageStorage.stop function definition');
                return;
            }
            if (typeof messageStorage.save !== 'function') {
                console.error('[RNMobileMessaging] Missing messageStorage.save function definition');
                onError('Missing messageStorage.save function definition');
                return;
            }
            if (typeof messageStorage.find !== 'function') {
                console.error('[RNMobileMessaging] Missing messageStorage.find function definition');
                onError('Missing messageStorage.find function definition');
                return;
            }
            if (typeof messageStorage.findAll !== 'function') {
                console.error('[RNMobileMessaging] Missing messageStorage.findAll function definition');
                onError('Missing messageStorage.findAll function definition');
                return;
            }

            this.eventEmitter.addListener('messageStorage.start', () => {
                messageStorage.start()
            });

            this.eventEmitter.addListener('messageStorage.stop', () => {
                messageStorage.stop();
            });

            this.eventEmitter.addListener('messageStorage.save', messages => {
                messageStorage.save(messages);
            });

            this.eventEmitter.addListener('messageStorage.find', messageId => {
                messageStorage.find(messageId, (message) => {
                    ReactNativeMobileMessaging.messageStorage_provideFindResult(message);
                });
            });

            this.eventEmitter.addListener('messageStorage.findAll', () => {
                messageStorage.findAll((messages) => {
                    ReactNativeMobileMessaging.messageStorage_provideFindAllResult(messages);
                });
            });
        }

        config.reactNativePluginVersion = require('./package').version;

        ReactNativeMobileMessaging.init(config, onSuccess, onError);
    };

    /**
     * Saves user data to the server.
     *
     * @name saveUser
     * @param {Object} userData. An object containing user data
     * {
     *   externalUserId: "myID",
     *   firstName: "John",
     *   lastName: "Smith",
     *   middleName: "D",
     *   gender: "Male",
     *   birthday: "1985-01-15"
     *   phones: ["79210000000", "79110000000"],
     *   emails: ["one@email.com", "two@email.com"],
     *   tags: ["Sports", "Food"],
     *   customAttributes: {
     *     "stringAttribute": "string",
     *     "numberAttribute": 1,
     *     "dateAttribute": "1985-01-15",
     *     "booleanAttribute": true
     *   }
     * }
     * @param {Function} onSuccess will be called on success
     * @param {Function} onError will be called on error
     */
    saveUser(userData, onSuccess = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.saveUser(userData, onSuccess, onError);
    };

    /**
     * Fetch user data from the server.
     *
     * @name fetchUser
     * @param {Function} onSuccess will be called with fetched user data on success
     * @param {Function} onError will be called on error
     */
    fetchUser(onSuccess, onError = function() {}) {
        ReactNativeMobileMessaging.fetchUser(onSuccess, onError);
    };

    /**
     * Gets user data from the locally stored cache.
     *
     * @name getUser
     * @param {Function} onSuccess will be called with fetched user data on success
     */
    getUser(onSuccess) {
        ReactNativeMobileMessaging.getUser(onSuccess);
    };

    /**
     * Saves installation to the server.
     *
     * @name saveInstallation
     * @param {Object} installation. An object containing installation data
     * {
     *   isPrimaryDevice: true,
     *   isPushRegistrationEnabled: true,
     *   notificationsEnabled: true,
     *   geoEnabled: false,
     *   sdkVersion: "1.2.3",
     *   appVersion: "2.3.4"
     *   os: "iOS",
     *   osVersion: "12",
     *   deviceManufacturer: "Apple",
     *   deviceModel: "iPhone 5s",
     *   deviceSecure: true,
     *   language: "EN",
     *   deviceTimezoneId: "GMT",
     *   applicationUserId: "MyID",
     *   deviceName: "John's iPhone 5s",
     *   customAttributes: {
     *     "stringAttribute": "string",
     *     "numberAttribute": 1,
     *     "dateAttribute": "1985-01-15",
     *     "booleanAttribute": true
     *   }
     * }
     * @param {Function} onSuccess will be called on success
     * @param {Function} onError will be called on error
     */
    saveInstallation(installation, onSuccess = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.saveInstallation(installation, onSuccess, onError);
    };

    /**
     * Fetches installation from the server.
     *
     * @name fetchInstallation
     * @param {Function} onSuccess will be called on success
     * @param {Function} onError will be called on error
     */
    fetchInstallation(onSuccess, onError = function() {}) {
        ReactNativeMobileMessaging.fetchInstallation(onSuccess, onError);
    };

    /**
     * Gets locally cached installation.
     *
     * @name getInstallation
     * @param {Function} onSuccess will be called on success
     */
    getInstallation(onSuccess) {
        ReactNativeMobileMessaging.getInstallation(onSuccess);
    };

    /**
     * Sets any installation as primary for this user.
     *
     * @name setInstallationAsPrimary
     * @param {String} pushRegistrationId of an installation
     * @param {Boolean} primary or not
     * @param {Function} onSuccess will be called on success
     * @param {Function} onError will be called on error
     */
    setInstallationAsPrimary(pushRegistrationId, primary, onSuccess = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.setInstallationAsPrimary(pushRegistrationId, primary, onSuccess, onError);
    };

    /**
     * Performs personalization of the current installation on the platform.
     *
     * @name personalize
     * @param {Object} context. An object containing user identity information as well as additional user attributes.
     * {
     *   userIdentity: {
     * 	   phones: ["79210000000", "79110000000"],
     *     emails: ["one@email.com", "two@email.com"],
     *     externalUserId: "myID"
     *   },
     *   userAttributes: {
     *	   firstName: "John",
     *     lastName: "Smith"
     *   },
     *   forceDepersonalize: false
     * }
     * @param {Function} onSuccess will be called on success
     * @param {Function} onError will be called on error
     */
    personalize(context, onSuccess = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.personalize(context, onSuccess, onError);
    };

    /**
     * Performs depersonalization of the current installation on the platform.
     *
     * @name depersonalize
     * @param {Function} onSuccess will be called on success
     * @param {Function} onError will be called on error
     */
    depersonalize(onSuccess = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.depersonalize(onSuccess, onError);
    };

    /**
     * Performs depersonalization of the installation referenced by pushRegistrationId.
     *
     * @param {String} pushRegistrationId of the remote installation to depersonalize
     * @param {Function} onSuccess will be called on success
     * @param {Function} onError will be called on error
     */
    depersonalizeInstallation(pushRegistrationId, onSuccess = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.depersonalizeInstallation(pushRegistrationId, onSuccess, onError);
    };

    /**
     * Mark messages as seen
     *
     * @name markMessagesSeen
     * @param {Array} messageIds of identifiers of message to mark as seen
     * @param {Function} onSuccess will be called on success
     * @param {Function} onError will be called on error
     */
    markMessagesSeen(messageIds, onSuccess = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.markMessagesSeen(messageIds, onSuccess, onError);
    };

    defaultMessageStorage = function() {
        let config = this.configuration;
        if (!config.defaultMessageStorage) {
            return undefined;
        }

        return {
            find: function (messageId, onSuccess, onError = function() {} ) {
                ReactNativeMobileMessaging.defaultMessageStorage_find(messageId, onSuccess, onError);
            },

            findAll: function (onSuccess, onError = function() {}) {
                ReactNativeMobileMessaging.defaultMessageStorage_findAll(onSuccess, onError);
            },

            delete: function (messageId, onSuccess = function() {}, onError = function() {}) {
                ReactNativeMobileMessaging.defaultMessageStorage_delete(messageId, onSuccess, onError);
            },

            deleteAll: function (onSuccess = function() {}, onError = function() {}) {
                ReactNativeMobileMessaging.defaultMessageStorage_deleteAll(onSuccess, onError);
            }
        };
    };

    /**
     * Displays built-in error dialog so that user can resolve errors during SDK initialization.
     *
     * @name showDialogForError
     * @param {Int} errorCode to display dialog for
     * @param {Function} onSuccess will be called upon completion
     * @param {Function} onError will be called on error
     */
    showDialogForError(errorCode, onSuccess = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.showDialogForError(errorCode, onSuccess, onError)
    };

    /**
     * Sends an event to the server eventually, handles possible errors and do retries for you.
     *
     * @name submitEvent
     * @param {Object} eventData. An object containing event data
     * {
     *   definitionId: "eventDefinitionId"
     *   properties: {
     *     "stringAttribute": "string",
     *     "numberAttribute": 1,
     *     "dateAttribute": "2020-02-26T09:41:57Z",
     *     "booleanAttribute": true
     *   }
     * }
     * @param onError will be called on error
     */
    submitEvent(eventData, onError = function() {}) {
        ReactNativeMobileMessaging.submitEvent(eventData, onError);
    };

    /**
     * Sends an event to the server immediately.
     * You have to handle possible connection or server errors, do retries yourself.
     *
     * @name submitEventImmediately
     * @param {Object} eventData. An object containing event data
     * {
     *   definitionId: "eventDefinitionId"
     *   properties: {
     *     "stringAttribute": "string",
     *     "numberAttribute": 1,
     *     "dateAttribute": "2020-02-26T09:41:57Z",
     *     "booleanAttribute": true
     *   }
     * }
     * @param onSuccess will be called upon completion
     * @param onError will be called on error
     */
    submitEventImmediately(eventData, onSuccess = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.submitEventImmediately(eventData, onSuccess, onError);
    };

    /**
     * Shows In-app chat screen.
     * iOS - it's screen with top bar and `x` button on the right corner.
     * Android - it's screen with top bar and back navigation button.
     * @name showChat
     * @param {Object} presentingOptions. You can configure how chat will be presented.
     * Now only one option for iOS is supported: `shouldBePresentedModally`, false by default.
     * If it's true - in-app chat View Controller for iOS will be presented modally.
     * example:
     * {
     *     ios: {
     *         shouldBePresentedModally: true
     *     }
     * }
     */
    showChat(presentingOptions= {}) {
        RNMMChat.showChat(presentingOptions);
    };

    /**
     * You can define custom appearance for iOS chat view by providing a chat settings.
     * Chat settings format:
     *	{
     *		title: '<chat title>',
     *	    sendButtonColor: '<hex color string>',
     *	    navigationBarItemsColor:'<hex color string>',
     *	    navigationBarColor:'<hex color string>',
     *	    navigationBarTitleColor:'<hex color string>',
     */
    setupiOSChatSettings(chatSettings) {
        if (Platform.OS === "ios") {
            RNMMChat.setupChatSettings(chatSettings);
        } else {
            console.log("method setupiOSChatSettings isn't supported for Android, use settings.xml to provide appearance settings.");
        }
    };

    /**
     * The predefined messages prompted within the In-app chat (such as status updates, button titles, input field prompt) by default are 
     * localized using system locale setting, but can be easily changed providing your locale string with the following formats:
     *  "es_ES", "es-ES" or "es"
     */
    setLanguage(localeString) {
        RNMMChat.setLanguage(localeString);
    };

    /**
     * Returns unread in-app chat push messages counter.
     * The counter increments each time the application receives in-app chat push message
     * (this usually happens when chat screen is inactive or the application is in background/terminated state).
     */
    getMessageCounter(onResult) {
        RNMMChat.getMessageCounter(onResult);
    };

    /**
     * MobileMessaging plugin automatically resets the counter to 0 whenever user opens the in-app chat screen.
     * However, use the following API in case you need to manually reset the counter.
     */
    resetMessageCounter() {
        RNMMChat.resetMessageCounter();
    }

    /* Geofencing permissions */

    /**
     * This is used for requesting Location permissions for Android
     * @param rationale rationale to display if it's needed. Describing why this permissions required.
     * Mobile Messaging SDK requires following permissions to be able to send geo targeted notifications, even if application is killed or on background.
     * ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION, ACCESS_BACKGROUND_LOCATION
     * @return {Promise<boolean>}
     */
    async requestAndroidPermissions(rationale?: Rationale): Promise<Boolean> {
        const requiredPermissions = await this.requiredAndroidLocationPermissions();
        if (requiredPermissions.length === 0) {
            return Promise.resolve(true);
        }

        return this.checkAndroidLocationPermission(requiredPermissions, rationale).then(granted => {
            if (!granted) {
                return Promise.resolve(false);
            } else {
                return this.requestAndroidPermissions(rationale);
            }
        });
    };

    async checkAndroidLocationPermission(permissions: Array<Permission>, rationale?: Rationale): Promise<Boolean> {
        for (permission of permissions) {
            const granted = await PermissionsAndroid.request(permission, rationale);
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permissions Result != Granted ", permission, granted);
                return Promise.resolve(false);
            }
        }
        console.log("Permissions Result == Granted ");
        return Promise.resolve(true);
    };

    async requiredAndroidLocationPermissions(): Promise<Array<Permission>> {
        let permissions: Array<Permission> = [];
        const fineLocationGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (!fineLocationGranted) {
            if (Platform.Version > 29) {
                permissions = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];
            } else if (Platform.Version === 29) {
                permissions = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION];
            } else {
                permissions = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
            }
        } else {
            const backgroundLocationGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
            if (!backgroundLocationGranted && Platform.Version > 29) {
                permissions = [PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION];
            }
        }

        return Promise.resolve(permissions);
    };

}

export class ChatView extends React.Component {
    androidViewId;

    componentDidMount() {
        if (Platform.OS === "ios") {
            this.add();
        } else {
            //fix for android, sometimes it can't get parent view, which is needed for properly relayout
            let _this = this;
            setTimeout(function() { _this.add(); }, 100);
        }
    }

    componentWillUnmount() {
        this.remove();
    }

    add = () => {
        //not needed for iOS
        if (Platform.OS === "ios") {
            return;
        }
        this.androidViewId = findNodeHandle(this.refs.rnmmChatViewRef);
        console.log('Native android viewId: ', this.androidViewId);

        UIManager.dispatchViewManagerCommand(
            this.androidViewId,
            UIManager.RNMMChatView.Commands.add.toString(),
            [this.androidViewId],
        );
    };

    remove = () => {
        //not needed for iOS
        if (Platform.OS === "ios") {
            return;
        }
        UIManager.dispatchViewManagerCommand(
            this.androidViewId,
            UIManager.RNMMChatView.Commands.remove.toString(),
            [this.androidViewId],
        );
    };

    render() {
        return (
            <RNMMChatView {...this.props}
                          ref="rnmmChatViewRef"
            />
        );
    }
}

ChatView.propTypes = {
    /**
     * Send button color can be set in hex format.
     * If it's not provided, color from Infobip Portal widget configuration will be set.
     */
    sendButtonColor: PropTypes.string,
}

export let RNMMChatView = requireNativeComponent('RNMMChatView', ChatView);

export let mobileMessaging = new MobileMessaging();
