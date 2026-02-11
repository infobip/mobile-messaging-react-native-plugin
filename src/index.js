//
//  index.js
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import {
    EmitterSubscription,
    NativeEventEmitter,
    Platform,
} from 'react-native';

const ReactNativeMobileMessaging = require('./specs/NativeMobileMessaging').default;
const RNMMChat = require('./specs/NativeRNMMChat').default
const RNMMWebRTCUI = require('./specs/NativeRNMMWebRTCUI').default;

export { default as ChatView, ChatViewHandle, ChatViewProps } from './components/ChatView';

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
            'inAppChat.unreadMessageCounterUpdated',
            'inAppChat.viewStateChanged',
            'inAppChat.configurationSynced',
            'inAppChat.livechatRegistrationIdUpdated'
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
     *	 - actionTapped
     *	 - installationUpdated
     *	 - userUpdated
     *   - personalized
     *   - depersonalized
     *   - inAppChat.availabilityUpdated
     *   - inAppChat.unreadMessageCounterUpdated
     *   - inAppChat.viewStateChanged
     *   - inAppChat.configurationSynced
     *   - inAppChat.livechatRegistrationIdUpdated
     *
     * @name subscribe
     * @param {String} eventName
     * @param {Function} handler will be called when event occurs
     */
    subscribe(eventName, handler) {
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
     * Private global variable holding reference to platform native logs subscription.
     */
    #platformNativeLogsSubscription = null;

    /**
     * Starts a new Mobile Messaging session.
     *
     * @name init
     * @param {Object} config. Configuration for Mobile Messaging
     * Configuration format:
     *	{
     *		applicationCode: '<The application code of your Application from Push Portal website>',
     *		webRTCUI: {
     *			configurationId: <String>
     *		},
     *		messageStorage: '<Message storage save callback>',
     *		defaultMessageStorage: true,
     *	    fullFeaturedInAppsEnabled: true,
     *		logging: <Boolean>,
     *		ios: {
     *			notificationTypes: ['alert', 'sound', 'badge']
     *		},
     *	    android: {
     *			notificationIcon: <String>,
     *			multipleNotifications: <Boolean>,
     *			notificationAccentColor: <String>,
     *			firebaseOptions: <Object>,
     *          notificationChannelId: <String>,
 *              notificationChannelName: <String>,
 *              notificationSound: <String>
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
     *		],
     *	   userDataJwt: '<JSON Web Token for user data operations and personalization>'
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

        config.reactNativePluginVersion = require('../package').version;
        
        ReactNativeMobileMessaging.init(config, onSuccess, onError);
        
        if (config.logging === true) {
            if (this.#platformNativeLogsSubscription != null) {
                this.unsubscribe(this.#platformNativeLogsSubscription);
                this.#platformNativeLogsSubscription = null;
            }
             this.#platformNativeLogsSubscription = this.subscribe('internal.platformNativeLogSent', (debugPayload) => {
                if (debugPayload.message.includes("RNMMERROR")) {
                    console.error(debugPayload.message.replace("RNMMERROR", ""));
                } else if (debugPayload.message.includes("RNMMWARN")) {
                    console.warn(debugPayload.message.replace("RNMMWARN", ""));
                } else {
                    console.log(debugPayload.message);
                }
            });
        }
    };

    /**
     *Fetch mobile inbox data from the server.
     *
     * @name fetchInboxMessages
     * @param token access token (JWT in a strictly predefined format) required for current user to have access to the Inbox messages
     * @param externalUserId External User ID is meant to be an ID of a user in an external (non-Infobip) service
     * @param filterOptions filtering options applied to messages list in response. Nullable, will return default number of messages
     * @param onSuccess will be called on success
     * @param {Function} onError will be called on error
     */
    fetchInboxMessages(token, externalUserId, filterOptions, onSuccess  = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.fetchInboxMessages(token, externalUserId, filterOptions, onSuccess, onError);
    };

    /**
     *Fetch mobile inbox data from the server.
     *
     * @name fetchInboxMessagesWithoutToken
     * @param externalUserId External User ID is meant to be an ID of a user in an external (non-Infobip) service
     * @param filterOptions filtering options applied to messages list in response. Nullable, will return default number of messages
     * @param onSuccess will be called on success
     * @param {Function} onError will be called on error
     */
    fetchInboxMessagesWithoutToken(externalUserId, filterOptions, onSuccess  = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.fetchInboxMessagesWithoutToken(externalUserId, filterOptions, onSuccess, onError);
    };

    /**
     * Set inbox messages as seen.
     *
     * @name setInboxMessagesSeen
     * @param externalUserId External User ID is meant to be an ID of a user in an external (non-Infobip) service
     * @param {Function} messages - array of inbox message IDs to be set seen
     * @param {Function} onSuccess will be called with fetched inbox seen messages data on success
     * @param {Function} onError will be called on error
     */
    setInboxMessagesSeen(externalUserId, messages, onSuccess, onError = function() {}) {
       ReactNativeMobileMessaging.setInboxMessagesSeen(externalUserId, messages, onSuccess, onError);
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
     *   forceDepersonalize: false,
     8   keepAsLead: false
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
            find (messageId, onSuccess, onError = function() {}) {
                ReactNativeMobileMessaging.defaultMessageStorage_find(messageId, onSuccess, onError);
            },

            findAll (onSuccess, onError = function() {}) {
                ReactNativeMobileMessaging.defaultMessageStorage_findAll(onSuccess, onError);
            },

            delete (messageId, onSuccess = function() {}, onError = function() {}) {
                ReactNativeMobileMessaging.defaultMessageStorage_delete(messageId, onSuccess, onError);
            },

            deleteAll (onSuccess = function() {}, onError = function() {}) {
                ReactNativeMobileMessaging.defaultMessageStorage_deleteAll(onSuccess, onError);
            },
        };
    };

    /**
     * Displays built-in error dialog so that user can resolve errors during SDK initialization.
     *
     * @name showDialogForError
     * @param {Number} errorCode to display dialog for
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
     * Set custom style of In-app chat
     * @param customization various colors in hex format, texts, margins etc.
     * example:
     * {
     *   toolbarTitle: "Chat",
     *   toolbarTitleColor: "#FFFFFF",
     *   toolbarTintColor: "#FFFFFF",
     *   ...
     * }
     */
    setChatCustomization(customization) {
        RNMMChat.setChatCustomization(customization)
    };

    /**
    * Set widget theme for In-app chat messages
    * @param widgetTheme the name of the existing widget theme to be applied to customize the chat messages.
    */
    setWidgetTheme(widgetTheme) {
        RNMMChat.setWidgetTheme(widgetTheme)
    }

    /**
     * The predefined messages prompted within the In-app chat (such as status updates, button titles, input field prompt) by default are
     * localized using system locale setting, but can be easily changed providing your locale string with the following formats:
     *  "es_ES", "es-ES" or "es"
     * @name setLanguage
     * @param localeString locale code to be set
     * @param {Function} onSuccess success callback
     * @param {Function} onError error callback
     */
    setLanguage(localeString, onSuccess = function() {}, onError = function() {}) {
        RNMMChat.setLanguage(localeString, onSuccess, onError);
    };

    /**
     * Set contextual data of the Livechat Widget.
     * If the function is called when the chat is loaded, data will be sent immediately, otherwise they will be sent to the chat once it is loaded.
     * Every function invocation will overwrite the previous contextual data.
     *
     * @name sendContextualData
     * @param data - contextual data in the form of JSON string
     * @param chatMultiThreadStrategy - multi-thread strategy flag: ACTIVE, ALL, ALL_PLUS_NEW
     * @param {Function} onSuccess success callback
     * @param {Function} onError error callback
    */
    sendContextualData(data, chatMultiThreadStrategy = 'ACTIVE', onSuccess = function() {}, onError = function() {}) {
        RNMMChat.sendContextualData(data, chatMultiThreadStrategy, onSuccess, onError);
    };

    /**
     * Returns unread in-app chat push messages counter.
     * The counter increments each time the application receives in-app chat push message
     * (this usually happens when chat screen is inactive or the application is in background/terminated state).
     * @name getMessageCounter
     * @param {Function} onResult message count callback
     */
    getMessageCounter(onResult) {
        RNMMChat.getMessageCounter(onResult);
    };

    /**
     * MobileMessaging plugin automatically resets the counter to 0 whenever user opens the in-app chat screen.
     * However, use the following API in case you need to manually reset the counter.
     * @name resetMessageCounter
     */
    resetMessageCounter() {
        RNMMChat.resetMessageCounter();
    };

    /**
     * Checks whether the in-app chat is ready to be shown to the user
     * In-app chat is considered ready when the widget configuration has been synced and Infobip's unique push registration ID has been issued.
     * @name isChatAvailable
     * @param {Function} onResult callback with boolean indicating if chat is available
     */
    isChatAvailable(onResult) {
        RNMMChat.isChatAvailable(onResult);
    };

    /**
     * This method is iOS only and it has no effect in Android.
     * Navigates to THREAD_LIST view in multithread widget if in-app chat is shown as React Component.
     * @name showThreadsList
     */
    showThreadsList() {
        if (Platform.OS === "android") {
            return;
        }
        RNMMChat.showThreadsList();
    };

    /**
     * Private global variable holding reference to jwt update events subscription.
     */
    #jwtSubscription = null;

    /**
     * Sets the JWT provider used to authenticate in-app chat sessions.
     *
     * The `jwtProvider` is a callback function that returns a JSON Web Token (JWT)
     * used for chat authentication. It supports both **synchronous** and **asynchronous** approaches:
     *
     * ### Synchronous usage:
     * ```ts
     * mobileMessaging.setChatJwtProvider(() => {
     *   return "your_token"; // Return a valid JWT string directly
     * });
     * ```
     *
     * ### Asynchronous usage:
     * ```ts
     * mobileMessaging.setChatJwtProvider(async () => {
     *   const jwt = await getChatToken(...);
     *   return jwt; // Return a Promise<string> that resolves to a valid JWT
     * });
     * ```
     *
     * > ⚠️ This callback may be invoked multiple times during the widget's lifecycle
     * (e.g., due to screen orientation changes or network reconnection).
     * It is important to return a **fresh and valid JWT** each time.
     *
     * @param jwtProvider A callback function that returns a JWT string or a Promise that resolves to one.
     * @param onError Optional error handler for catching exceptions thrown during JWT generation.
     */
    setChatJwtProvider(jwtProvider, onError) {
        if (this.#jwtSubscription != null) {
            this.unsubscribe(this.#jwtSubscription);
            this.#jwtSubscription = null;
        }
        if (jwtProvider) {
            RNMMChat.setChatJwtProvider();

            const handleError = (e) => {
                RNMMChat.setChatJwt(null);
                if (onError) {
                    onError(e);
                } else {
                    console.error('[RNMobileMessaging] Could not obtain chat JWT:', e);
                }
            };

            this.#jwtSubscription = this.subscribe('inAppChat.internal.jwtRequested', () => {
                try {
                    const jwtPromise = jwtProvider();
                    if (jwtPromise && typeof jwtPromise.then === 'function') { // Handle asynchronous JWT provider of type Promise<string>
                        jwtPromise
                            .then(jwt => RNMMChat.setChatJwt(jwt))
                            .catch(handleError);
                    } else { // Handle synchronous JWT provider of type () => string
                        RNMMChat.setChatJwt(jwtPromise);
                    }
                } catch (e) {
                    handleError(e);
                }
            });
        }
    }

    /**
     * Private global variable holding reference to chat exceptions subscription.
     */
    #chatExceptionHandlerSubscription = null;

    /**
     * Sets the chat exception handler in case you want to intercept and
     * display the errors coming from the chat on your own (instead of relying on the prebuild error banners).
     *
     * The `exceptionHandler` is a function that receives the exception. Passing `null` will remove the previously set handler.
     *
     * ```ts
     * mobileMessaging.setChatExceptionHandler((exception) => {
     *   console.log("Chat exception occurred:", exception);
     * });
     * ```
     *
     * @param exceptionHandler A function that receives an ChatException when it happens. Passing `null` will remove the previously set handler.
     * @param onError Optional error handler for catching exceptions thrown when listening for exceptions.
     */
    setChatExceptionHandler(exceptionHandler, onError) {
        if (this.#chatExceptionHandlerSubscription != null) {
            this.unsubscribe(this.#chatExceptionHandlerSubscription);
            this.#chatExceptionHandlerSubscription = null;
        }

        let isHandlerPresent = typeof exceptionHandler === 'function';
        if (isHandlerPresent) {
            const handleError = (e) => {
                if (onError) {
                    onError(e);
                } else {
                    console.error('[RNMobileMessaging] Could not handle chat exception:', e);
                }
            };

            this.#chatExceptionHandlerSubscription = this.subscribe('inAppChat.internal.exceptionReceived', (chatException) => {
                try {
                    exceptionHandler(chatException);
                } catch (e) {
                    handleError(e);
                }
            });
        }
        RNMMChat.setChatExceptionHandler(isHandlerPresent);
    }

    /**
     * Registering for POST_NOTIFICATIONS permission for Android 13+
     */
    registerForAndroidRemoteNotifications() {
        if (Platform.OS === "ios") {
            return;
        }
        ReactNativeMobileMessaging.registerForAndroidRemoteNotifications();
    };

    /**
     * This method is iOS only and it has no effect in Android.
     * Used to reset the In-app chat connection. The correct usage is to call it after stopConnection, when we want the messages to reappear, and push
     * notifications to stop.
     * In Android In-app chat connection is automatically established and stopped based on component lifecycle. Chat connection is active only when Lifecycle.State is at least Lifecycle.State.STARTED. Chat connection is stopped when Lifecycle.State is below Lifecycle.State.STARTED.
     * @name restartConnection
     */
    restartConnection() {
        if (Platform.OS === "android") {
             return;
        }
        RNMMChat.restartConnection();
    };

    /**
     * This method is iOS only and it has no effect in Android.
     * Used to stop In-app chat connection. This has two effects: the chat message is cleared, and push notifications from incoming messages events
     * start coming again to the device, even with the In-app chat in foreground. In order for the chat messages to reappear, simply call restartConnection.
     * In Android In-app chat connection is automatically established and stopped based on component lifecycle. Chat connection is active only when Lifecycle.State is at least Lifecycle.State.STARTED. Chat connection is stopped when Lifecycle.State is below Lifecycle.State.STARTED.
     * @name stopConnection
     */
    stopConnection() {
        if (Platform.OS === "android") {
             return;
        }
        RNMMChat.stopConnection();
    };

    /**
     * Set and override default push notification title for in-app chat messages. Only for Android.
     * @param title for notifications to be set
     * @name setChatPushTitle
     */
    setChatPushTitle(title) {
        if (Platform.OS === "ios") {
            return;
        }
        RNMMChat.setChatPushTitle(title);
    };

    /**
     * Set and override default push notification body for in-app chat messages. Only for Android.
     * @param body for notifications to be set
     * @name setChatPushBody
     */
    setChatPushBody(body) {
        if (Platform.OS === "ios") {
            return;
        }
        RNMMChat.setChatPushBody(body);
    };

    /**
     * Set chat domain to be used in in-app chat widget.
     * > ⚠️ Do not use this method if you are not instructed to do so by Infobip support.
     * @param domain for chat widget to be set
     * @name setChatDomain
     */
    setChatDomain(domain) {
        RNMMChat.setChatDomain(domain);
    }

    /**
     * Set JSON Web Token for user data operations and personalization.
     * @param {String} jwt JWT token in predefined format
     * @param {Function} onSuccess will be called on success
     * @param {Function} onError will be called on error
     * @name setUserDataJwt
     */
    setUserDataJwt(jwt, onSuccess = function() {}, onError = function() {}) {
        ReactNativeMobileMessaging.setUserDataJwt(jwt, onSuccess, onError);
    }
}

export const mobileMessaging = new MobileMessaging();

class WebRTCUI {
    /**
     * Manually enable WebRTCUI calls, provided a valid configuration Id exists in the webRTCUI configuration. This function is used to control when to start
     * calls, for example if you want to enabled it only after a successful user authentication. Note: Device settings, such as "Do not disturb" modes, will
     * ignore this method until the operating system allows calls.
     * @name enableCalls
     * @param identity String value to use as identity in the registration for WebRTC calls. If empty string is set, push registration Id will be used
     * @param {Function} onSuccess success callback
     * @param {Function} onError error callback
     */
    enableCalls(identity, onSuccess = function() {}, onError = function() {}){
        RNMMWebRTCUI.enableCalls(identity, onSuccess, onError);
    }

    /**
     * Manually enable WebRTCUI calls, provided a valid configuration Id exists in the webRTCUI configuration. This function is used to control when to start
     * calls, for example if you want to enabled it only after a successful user authentication. Note: Device settings, such as "Do not disturb" modes, will
     * ignore this method until the operating system allows calls.
     * @name enableChatCalls
     * @param {Function} onSuccess success callback
     * @param {Function} onError error callback
     */
    enableChatCalls(onSuccess = function() {}, onError = function() {}){
        RNMMWebRTCUI.enableChatCalls(onSuccess, onError);
    }

    /**
     * Manually disable WebRTCUI calls. This function is used to control when to stop the calls, for example after a user log out. Note: This action may need
     * up to half a minute to be completed, and calls may still be received in the meantime.
     * @name disableCalls
     * @param {Function} onSuccess success callback
     * @param {Function} onError error callback
     */
    disableCalls(onSuccess = function() {}, onError = function() {}) {
        RNMMWebRTCUI.disableCalls(onSuccess, onError);
    }
}

export const webRTCUI = new WebRTCUI();
