import { NativeModules } from 'react-native';

const { ReactNativeMobileMessaging } = NativeModules;

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
     *          logging: <Boolean>
     *		},
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
            console.error('No application code provided');
            return;
        }

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

}

export let mobileMessaging = new MobileMessaging();
