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
     * @param {JSON} config. Configuration for Mobile Messaging
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
}

export let mobileMessaging = new MobileMessaging();
