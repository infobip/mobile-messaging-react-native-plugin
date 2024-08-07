import {EmitterSubscription, Rationale} from "react-native";

declare namespace MobileMessagingReactNative {
    export type OS = 'Android' | 'iOS';
    export type Gender = 'Male' | 'Female';
    export type Event = 'messageReceived' |
        'notificationTapped' |
        'tokenReceived' |
        'registrationUpdated' |
        'geofenceEntered' |
        'actionTapped' |
        'installationUpdated' |
        'userUpdated' |
        'personalized' |
        'depersonalized' |
        'inAppChat.availabilityUpdated' |
        'inAppChat.unreadMessageCounterUpdated' |
        'deeplink' |
        'inAppChat.viewStateChanged';

    export interface Configuration {
        /**
         * The application code of your Application from Push Portal website
         */
        applicationCode: string;
        webRTCUI?: {
            configurationId: string;
        } | undefined;
        geofencingEnabled?: boolean | undefined;
        inAppChatEnabled?: boolean | undefined;
        fullFeaturedInAppsEnabled?: boolean | undefined;
        /**
         * Message storage save callback
         */
        messageStorage?: CustomMessageStorage;
        defaultMessageStorage?: boolean | undefined;
        ios?: {
            notificationTypes?: string[] | undefined;
            logging?: boolean | undefined
        } | undefined;
        android?: {
            notificationIcon?: string; // a resource name for a status bar icon (without extension), located in 'android/src/main/res/mipmap'
            multipleNotifications?: boolean;
            notificationAccentColor?: string;
            firebaseOptions?: {
                apiKey: string;
                applicationId: string;
                databaseUrl?: string;
                gaTrackingId?: string;
                gcmSenderId?: string;
                storageBucket?: string;
                projectId: string;
            };
        } | undefined;
        privacySettings?: {
            applicationCodePersistingDisabled?: boolean | undefined;
            userDataPersistingDisabled?: boolean | undefined;
            carrierInfoSendingDisabled?: boolean | undefined;
            systemInfoSendingDisabled?: boolean | undefined
        } | undefined;
        notificationCategories?: [
            {
                identifier: string | undefined;
                actions?: [
                    {
                        identifier: string | undefined;
                        title?: string | undefined;
                        foreground?: boolean | undefined;
                        authenticationRequired?: boolean | undefined;
                        moRequired?: boolean | undefined;
                        destructive?: boolean | undefined;
                        icon?: string | undefined;
                        textInputActionButtonTitle?: string | undefined;
                        textInputPlaceholder?: string | undefined
                    }] | undefined
            }] | undefined;
    }

    export interface UserData {
        externalUserId?: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        middleName?: string | undefined;
        gender?: Gender | undefined;
        birthday?: string | undefined;
        phones?: string[] | undefined;
        emails?: string[] | undefined;
        tags?: string[] | undefined;
        customAttributes?: Record<string, string | number | boolean | object[]> | undefined;
    }

    export interface Installation {
        pushRegistrationId?: string | undefined;
        isPrimaryDevice?: boolean | undefined;
        isPushRegistrationEnabled?: boolean | undefined;
        notificationsEnabled?: boolean | undefined;
        geoEnabled?: boolean | undefined;
        sdkVersion?: string | undefined;
        appVersion?: string | undefined;
        os?: OS | undefined;
        osVersion?: string;
        deviceManufacturer?: string | undefined;
        deviceModel?: string | undefined;
        deviceSecure?: boolean | undefined;
        language?: string | undefined;
        deviceTimezoneId?: string | undefined;
        applicationUserId?: string | undefined;
        deviceName?: string | undefined;
        customAttributes?: Record<string, string | number | boolean> | undefined;
    }

    export interface UserIdentity {
        phones?: string[] | undefined;
        emails?: string[] | undefined;
        externalUserId?: string;
    }

    export interface MMInbox {
        countTotal: number;
        countUnread: number;
        messages?: [Message] | undefined;
    }

    export interface MMInboxFilterOptions {
        fromDateTime?: String | undefined;
        toDateTime?: String | undefined;
        topic?: string | undefined;
        limit?: number | undefined;
    }

    export interface PersonalizeContext {
        userIdentity: UserIdentity;
        userAttributes?: Record<string, string | number | boolean | object[]> | undefined;
        forceDepersonalize?: boolean | undefined;
    }

    export interface GeoData {
        area: GeoArea;
    }

    export interface GeoArea {
        id: string;
        center: GeoCenter;
        radius: number;
        title: string;
    }

    export interface GeoCenter {
        lat: number;
        lon: number;
    }

    export interface Message {
        messageId: string;
        title?: string | undefined;
        body: string | undefined;
        sound?: string | undefined;
        silent?: string | undefined;
        customPayload?: Record<string, string> | undefined;
        internalData?: string | undefined;
        receivedTimestamp?: number | undefined;
        seenDate?: number | undefined;
        contentUrl?: string | undefined;
        seen?: boolean | undefined;
        geo?: boolean | undefined;
        originalPayload?: Record<string, string> | undefined; // iOS only
        vibrate?: boolean | undefined; // Android only
        icon?: string | undefined; // Android only
        category?: string | undefined; // Android only
        chat?: boolean | undefined;
        browserUrl?: string | undefined;
        deeplink?: string | undefined;
        webViewUrl?: string | undefined;
        inAppOpenTitle?: string | undefined;
        inAppDismissTitle?: string | undefined;
    }

    export interface MobileMessagingError {
        code: string;
        description: string;
        domain?: string;
    }

    export interface ChatConfig {
        ios?: {
            showModally: boolean;
        } | undefined;
    }

    export interface DefaultMessageStorage {
        find(messageId: string, callback: (message: Message) => void): void;

        findAll(callback: (messages: Message[]) => void): void;

        delete(messageId: string, callback: () => void): void;

        deleteAll(callback: () => void): void;
    }

    export interface CustomMessageStorage {
        /**
         * Will be called by the plugin when messages are received and it's time to save them to the storage
         *
         * @param array of message objects to save to storage
         */
        save(messages: Message[]): void;

        /**
         * Will be called by the plugin to find a message by message id
         *
         * @param callback has to be called on completion with one parameter - found message object
         */
        find(messageId: string, callback: (message: Message) => void): void;

        /**
         * Will be called by the plugin to find all messages in the storage
         *
         * @param callback has to be called on completion with one parameter - an array of available messages
         */
        findAll(callback: (messages: Message[]) => void): void;

        /**
         * Will be called by the plugin when its time to initialize the storage
         */
        start(): void;

        /**
         * Will be called by the plugin when its time to deinitialize the storage
         */
        stop(): void;
    }

    export interface CustomEvent {
        definitionId: string;
        properties: Record<string, any>;
    }

    export interface ChatCustomizationConfiguration {
        toolbarTitle: string;
        toolbarTintColor: string;
        toolbarBackgroundColor: string;
        toolbarTitleColor: string;
        chatBackgroundColor: string;
        widgetTheme: string;
        noConnectionAlertTextColor: string;
        noConnectionAlertBackgroundColor: string;
        chatInputPlaceholderTextColor: string;
        chatInputCursorColor: string;
        chatInputBackgroundColor: string;
        sendButtonIconUri: string;
        attachmentButtonIconUri: string;
        chatInputSeparatorVisible: boolean;
        // iOS only properties
        attachmentPreviewBarsColor: string;
        attachmentPreviewItemsColor: string;
        textContainerTopMargin: double;
        textContainerLeftPadding: double;
        textContainerCornerRadius: double;
        textViewTopMargin: double;
        placeholderHeight: double;
        placeholderSideMargin: double;
        buttonHeight: double;
        buttonTouchableOverlap: double;
        buttonRightMargin: double;
        utilityButtonWidth: double;
        utilityButtonBottomMargin: double;
        initialHeight: double;
        mainFont: string;
        charCountFont: string;
        //android only properties
        //status bar properties
        statusBarColorLight: boolean;
        statusBarBackgroundColor: string;
        //toolbar properties
        navigationIconUri: string;
        navigationIconTint: string;
        subtitleText: string;
        subtitleTextColor: string;
        subtitleTextAppearanceRes: string;
        subtitleCentered: boolean;
        titleTextAppearanceRes: string;
        titleCentered: boolean;
        menuItemsIconTint: string;
        menuItemSaveAttachmentIcon: string;
        //chat properties
        progressBarColor: string;
        networkConnectionErrorTextAppearanceRes: string;
        networkConnectionErrorText: string;
        //chat input properties
        inputTextColor: string;
        inputAttachmentIconTint: string;
        inputAttachmentBackgroundColor: string;
        inputAttachmentBackgroundDrawable: string;
        inputSendIconTint: string;
        inputSendBackgroundColor: string;
        inputSendBackgroundDrawable: string;
        inputSeparatorLineColor: string;
        inputHintText: string;
        inputTextAppearance: string;
    }

    interface Api {

        inAppChatEvents: [
            "inAppChat.availabilityUpdated",
            "inAppChat.unreadMessageCounterUpdated",
            "inAppChat.viewStateChanged",
            "inAppChat.configurationSynced",
            "inAppChat.livechatRegistrationIdUpdated"
        ];

        supportedEvents: [
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
        messageStorageEvents: [
            "messageStorage.start",
            "messageStorage.stop",
            "messageStorage.save",
            "messageStorage.find",
            "messageStorage.findAll"
        ];

        constructor();

        /**
         * Starts a new Mobile Messaging session.
         *
         * @param config. Configuration for Mobile Messaging
         * @param callback. callback
         * @param onInitError. Error callback
         */
        init(config: Configuration, callback: () => void, onInitError?: (error: MobileMessagingError) => void): void;

        /**
         * Add subscription to event coming from MobileMessaging library.
         *
         * @param eventName
         * @param handler will be called when event occurs
         * @return subscription, to unregister from this subscription call `unsubscribe(subscription)`
         */
        subscribe(eventName: string, handler: (data: any) => void): EmitterSubscription;

        /**
         * Unsubscribe from MobileMessaging library event.
         * This method should be used for react-native versions >= 0.65.
         */
        unsubscribe(subscription: EmitterSubscription): void;

        /**
         * Unregister all handlers from MobileMessaging library event.
         *
         */
        unregisterAllHandlers(eventName: string): void;

        /**
         * Sends an event to the server eventually, handles possible errors and do retries for you.
         *
         * @param eventData. An object containing event data
         * {
         *   definitionId: "eventDefinitionId"
         *   properties: {
         *     "stringAttribute": "string",
         *     "numberAttribute": 1,
         *     "dateAttribute": "2020-02-26T09:41:57Z",
         *     "booleanAttribute": true
         *   }
         * }
         */
        submitEvent(eventData: CustomEvent): void;

        /**
         * Sends an event to the server immediately.
         * You have to handle possible connection or server errors, do retries yourself.
         *
         * @param eventData. An object containing event data
         * {
         *   definitionId: "eventDefinitionId"
         *   properties: {
         *     "stringAttribute": "string",
         *     "numberAttribute": 1,
         *     "dateAttribute": "2020-02-26T09:41:57Z",
         *     "booleanAttribute": true
         *   }
         * }
         * @param callback will be called on result
         * @param errorCallback will be called on error, you have to handle error and do retries yourself
         */
        submitEventImmediately(eventData: CustomEvent,
                               callback: () => void,
                               errorCallback: () => void): void;


        /**
         * Saves user data to the server.
         *
         * @param userData. An object containing user data
         * @param callback will be called on success
         * @param errorCallback will be called on error
         */
        saveUser(userData: UserData,
                 callback: (userData: UserData) => void,
                 errorCallback: (error: MobileMessagingError) => void): void;

        /**
         * Fetch user data from the server.
         *
         * @param callback will be called with fetched user data on success
         * @param errorCallback will be called on error
         */
        fetchUser(callback: (userData: UserData) => void, errorCallback: (error: MobileMessagingError) => void): void;


        /**
         *Fetch mobile inbox data from the server.
         *@name fetchInboxMessages
         *@param token access token (JWT in a strictly predefined format) required for current user to have access to the Inbox messages
         *@param externalUserId External User ID is meant to be an ID of a user in an external (non-Infobip) service
         *@param filterOptions filtering options applied to messages list in response. Nullable, will return default number of messages
         *@param callback will be called on success
         *@param {Function} errorCallback will be called on error
         */
        fetchInboxMessages(token: String, externalUserId: String, filterOptions: MMInboxFilterOptions, callback: (inbox: MMInbox) => void, errorCallback: (error: MobileMessagingError) => void): void;

        /**
         *Fetch mobile inbox data from the server.
         *@name fetchInboxMessagesWithoutToken
         *@param externalUserId External User ID is meant to be an ID of a user in an external (non-Infobip) service
         *@param filterOptions filtering options applied to messages list in response. Nullable, will return default number of messages
         *@param callback will be called on success
         *@param {Function} errorCallback will be called on error
         */
        fetchInboxMessagesWithoutToken(externalUserId: String, filterOptions: MMInboxFilterOptions, callback: (inbox: MMInbox) => void, errorCallback: (error: MobileMessagingError) => void): void;

        /**
         * Set inbox messages as seen.
         *
         * @name setInboxMessagesSeen
         * @param externalUserId External User ID is meant to be an ID of a user in an external (non-Infobip) service
         * @param {Function} messages list of message identifiers to mark as seen
         * @param callback will be called on success
         * @param {Function} errorCallback will be called on error
         */
        setInboxMessagesSeen(externalUserId: String, messages: String[], callback: (messages: String[]) => void, errorCallback: (error: MobileMessagingError) => void): void;

        /**
         * Gets user data from the locally stored cache.
         *
         * @param callback will be called with fetched user data on success
         * @param errorCallback will be called on error
         */
        getUser(callback: (userData: UserData) => void): void;

        /**
         * Saves installation to the server.
         *
         * @param installation. An object containing installation data
         * @param callback will be called on success
         * @param errorCallback will be called on error
         */
        saveInstallation(installation: Installation, callback: (data: Installation) => void, errorCallback: (error: MobileMessagingError) => void): void;

        /**
         * Fetches installation from the server.
         *
         * @param callback will be called on success
         * @param errorCallback will be called on error
         */
        fetchInstallation(callback: (installation: Installation) => void, errorCallback: (error: MobileMessagingError) => void): void;

        /**
         * Gets locally cached installation.
         *
         * @param callback will be called on success
         * @param errorCallback will be called on error
         */
        getInstallation(callback: (installation: Installation) => void): void;

        /**
         * Sets any installation as primary for this user.
         *
         * @param pushRegistrationId of an installation
         * @param primary or not
         * @param callback will be called on success
         * @param errorCallback will be called on error
         */
        setInstallationAsPrimary(pushRegistrationId: string, primary: boolean, callback: (installation: Installation) => void, errorCallback: (error: MobileMessagingError) => void): void;

        /**
         * Performs personalization of the current installation on the platform.
         *
         * @param context. An object containing user identity information as well as additional user attributes.
         * @param callback will be called on success
         * @param errorCallback will be called on error
         */
        personalize(context: PersonalizeContext, callback: (personalizeContext: PersonalizeContext) => void, errorCallback: (error: MobileMessagingError) => void): void;

        /**
         * Performs depersonalization of the current installation on the platform.
         *
         * @param callback will be called on success
         * @param errorCallback will be called on error
         */
        depersonalize(callback: (personalizeContext: PersonalizeContext) => void, errorCallback: (error: MobileMessagingError) => void): void;

        /**
         * Performs depersonalization of the installation referenced by pushRegistrationId.
         *
         * @param pushRegistrationId of the remote installation to depersonalize
         * @param callback will be called on success
         * @param errorCallback will be called on error
         */
        depersonalizeInstallation(pushRegistrationId: string, callback: (installation: Installation) => void, errorCallback: (error: MobileMessagingError) => void): void;

        /**
         * Mark messages as seen
         *
         * @param messageIds of identifiers of message to mark as seen
         * @param callback will be called upon completion
         * @param errorCallback will be called on error
         */
        markMessagesSeen(messageIds: string[], callback: (messages: Message[]) => void, errorCallback: (error: MobileMessagingError) => void): void;

        /**
         * Displays built-in error dialog so that user can resolve errors during sdk initialization.
         *
         * @param errorCode to display dialog for
         * @param callback will be called upon completion
         * @param errorCallback will be called on error
         */
        showDialogForError(errorCode: number, callback: () => void, errorCallback: (error: MobileMessagingError) => void): void;

        defaultMessageStorage(): DefaultMessageStorage | undefined;

        /**
         * Displays chat view
         * @param config
         */
        showChat(config ?: ChatConfig): void;

        /**
         * Set custom style of In-app chat
         * @param configuration various colors in hex format, texts, margins etc.
         * example:
         * {
         *   toolbarTitle: "Chat",
         *   toolbarTitleColor: "#FFFFFF",
         *   toolbarTintColor: "#FFFFFF",
         *   ...
         * }
         */
        setupChatSettings(configuration: ChatCustomizationConfiguration): void;

        /**
         * Set contextual data of the Livechat Widget.
         * If the function is called when the chat is loaded, data will be sent immediately, otherwise they will be sent to the chat once it is loaded.
         * Every function invocation will overwrite the previous contextual data.
         *
         * @name sendContextualData
         * @param data contextual data in the form of JSON string
         * @param allMultiThreadStrategy multi-thread strategy flag, true -> ALL, false -> ACTIVE
         * @param {Function} onSuccess success callback
         * @param {Function} onError error callback
         */
        sendContextualData(data: string, allMultiThreadStrategy: boolean, onSuccess: () => void, onError: (error: MobileMessagingError) => void): void;

        /**
         * Set chat language
         * @name setLanguage
         * @param localeString locale code to be set
         * @param {Function} onSuccess success callback
         * @param {Function} onError error callback
         */
        setLanguage(localeString: string, onSuccess: () => void, onError: (error: MobileMessagingError) => void): void;

        /**
         * Returns unread in-app chat push messages counter.
         * The counter increments each time the application receives in-app chat push message
         * (this usually happens when chat screen is inactive or the application is in background/terminated state).
         * @name getMessageCounter
         * @param {Function} onResult message count callback
         */
        getMessageCounter(onResult: (counter: number) => void): void;

        /**
         * MobileMessaging plugin automatically resets the counter to 0 whenever user opens the in-app chat screen.
         * However, use the following API in case you need to manually reset the counter.
         * @name resetMessageCounter
         */
        resetMessageCounter(): void;

        /**
         * Navigates to THREAD_LIST view in multithread widget if in-app chat is shown as React Component.
         * @name showThreadsList
         */
        showThreadsList(): void;

        /**
         * Provides JSON Web Token (JWT), to give in-app chat ability to authenticate.
         *
         * In android app, function can be triggered multiple times during in-app chat lifetime, due to various events like screen orientation change, internet re-connection.
         * If you can ensure JWT expiration time is longer than in-app chat lifetime, you can return cached token, otherwise it is important to provide fresh new token for each invocation.
         *
         * @name setJwtProvider
         * @param {Function} jwtProvider callback returning JWT token
         */
        setJwtProvider(jwtProvider: () => string): void;

        /**
         * This is used for requesting Location permissions for Android
         * @param rationale rationale to display if it's needed. Describing why this permissions required.
         * Mobile Messaging SDK requires following permissions to be able to send geo targeted notifications, even if application is killed or on background.
         * ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION, ACCESS_BACKGROUND_LOCATION
         * @return
         */
        requestAndroidLocationPermissions(rationale ?: Rationale): Promise<boolean>;

        /**
         * Registering for POST_NOTIFICATIONS permission for Android 13+
         */
        registerForAndroidRemoteNotifications(): void;

        /**
         * This method is iOS only and it has no effect in Android.
         * Used to reset the In-app chat connection. The correct usage is to call it after stopConnection, when we want the messages to reappear, and push
         * notifications to stop.
         * In Android In-app chat connection is automatically established and stopped based on component lifecycle. Chat connection is active only when Lifecycle.State is at least Lifecycle.State.STARTED. Chat connection is stopped when Lifecycle.State is below Lifecycle.State.STARTED.
         * @name restartConnection
         */
        restartConnection(): void;

        /**
         * This method is iOS only and it has no effect in Android.
         * Used to stop In-app chat connection. This has two effects: the chat message is cleared, and push notifications from incoming messages events
         * start coming again to the device, even with the In-app chat in foreground. In order for the chat messages to reappear, simply call restartConnection.
         * In Android In-app chat connection is automatically established and stopped based on component lifecycle. Chat connection is active only when Lifecycle.State is at least Lifecycle.State.STARTED. Chat connection is stopped when Lifecycle.State is below Lifecycle.State.STARTED.
         * @name stopConnection
         */
        stopConnection(): void;
    }
}

declare var mobileMessaging: MobileMessagingReactNative.Api;

declare namespace WebRTCUI {
    import MobileMessagingError = MobileMessagingReactNative.MobileMessagingError;
    /**
     * Manually enable WebRTCUI calls.
     * @name enableCalls
     * @param identity String to be used as identity for the WebRTC registration. If left empty, push registration Id will be used instead
     * @param {Function} onSuccess success callback
     * @param {Function} onError error callback
     */
    enableCalls(identity:string, onSuccess:() => void, onError:(error: MobileMessagingError) => void):void;

    /**
     * Manually enable WebRTCUI LiveChat calls.
     * @name enableChatCalls
     * @param {Function} onSuccess success callback
     * @param {Function} onError error callback
     */
    enableChatCalls(onSuccess:() => void, onError:(error: MobileMessagingError) => void):void;

    /**
     * Manually disable WebRTCUI calls if they were previously enabled. Note: This action may need up to half a minute to be completed,
     * and calls may still be received in the meantime.
     * @name disableCalls
     * @param {Function} onSuccess success callback
     * @param {Function} onError error callback
     */
    disableCalls(onSuccess:() => void, onError:(error: MobileMessagingError) => void):void;
}