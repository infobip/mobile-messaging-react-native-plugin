import { NativeModules } from 'react-native';

const { ReactNativeMobileMessaging } = NativeModules;

/**
 * Constructor
 */
class MobileMessaging {
    constructor() {
        this.supportedEvents = ["messageReceived", "notificationTapped", "tokenReceived", "registrationUpdated", "geofenceEntered", "actionTapped", "installationUpdated", "userUpdated", "personalized", "depersonalized"];
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
     * @param {Function} onInitError. Error callback
     */
    init(config, onSuccess, onError) {
        var messageStorage = config.messageStorage;
        var _onErrorHandler = onError || function() {};
        var _onSuccessHandler = onSuccess || function() {};

        this.configuration = config;

        if (!config.applicationCode) {
            _onErrorHandler('No application code provided');
            console.error('No application code provided');
            return;
        }

        ReactNativeMobileMessaging.init(config, _onSuccessHandler, _onErrorHandler,);
    };
}

export var mobileMessaging = new MobileMessaging();
