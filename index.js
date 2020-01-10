import { NativeModules } from 'react-native';

const { ReactNativeMobileMessaging } = NativeModules;

/**
 * Constructor
 */
export class MobileMessaging {
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
    init(config, onInitError) {
        var messageStorage = config.messageStorage;
        var _onInitErrorHandler = onInitError || function() {};

        this.configuration = config;

        if (!config.applicationCode) {
            console.error('No application code provided');
            _onInitErrorHandler('No application code provided');
            return;
        }

        ReactNativeMobileMessaging.init(
            config,
            () => {},
            (code, error) => {
                _onInitErrorHandler();
            },
        );
    };
}
