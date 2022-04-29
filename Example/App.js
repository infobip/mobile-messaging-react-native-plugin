/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

//screens
import HomeScreen from './components/homeScreen.js';
import TestDeeplinkingScreen from './components/testDeeplinkingScreen.js';
import TestDeeplinkingScreen2 from './components/testDeeplinkingScreen2.js';
import ChatScreen from './components/chatScreen.js';

import {
    mobileMessaging,
} from 'infobip-mobile-messaging-react-native-plugin';
import NativeDialogManagerAndroid from "react-native/Libraries/NativeModules/specs/NativeDialogManagerAndroid";
import {Platform} from "react-native";
import type {Rationale} from "react-native/Libraries/PermissionsAndroid/PermissionsAndroid";

const myMessageStorage = {
    save: function (messages) {
        for (const [index, message] of messages.entries()) {
            AsyncStorage.setItem(message.messageId, JSON.stringify(message));
        }
        console.log(
            '[CustomStorage] Saving messages: ' + JSON.stringify(messages),
        );
    },

    find: async function (messageId, callback) {
        console.log('[CustomStorage] Find message: ' + messageId);
        let message = await AsyncStorage.getItem(messageId);
        if (message) {
            console.log('[CustomStorage] Found message: ' + message);
            callback(JSON.parse(message));
        } else {
            callback({});
        }
    },

    findAll: function (callback) {
        console.log('[CustomStorage] Find all');
        this.getAllMessages(values => {
            console.log(
                '[CustomStorage] Find all messages result: ',
                values.toString(),
            );
            callback(values);
        });
    },

    start: function () {
        console.log('[CustomStorage] Start');
    },

    stop: function () {
        console.log('[CustomStorage] Stop');
    },

    getAllMessages(callback) {
        try {
            AsyncStorage.getAllKeys().then(keys => {
                console.log('Then AllKeys: ', keys);
                AsyncStorage.multiGet(keys).then(values => {
                    console.log('Then AllValues: ', values);
                    callback(values);
                });
            });
        } catch (error) {
            console.log('[CustomStorage] Error: ', error);
        }
    },
};

const Stack = createStackNavigator();

export default class App extends React.Component {
    androidGeoProminentDisclosureAcceptedKey: string = "androidGeoProminentDisclosureAcceptedKey";

    isAndroidGeoProminentDisclosureAccepted(): Promise<Boolean> {
        return AsyncStorage.getItem(this.androidGeoProminentDisclosureAcceptedKey).then(value => {
            if (value === null) return Promise.resolve(false);
            return Promise.resolve(JSON.parse(value));
        });
    };

    configuration = {
        applicationCode: 'Your application code',
        ios: {
            notificationTypes: ['alert', 'badge', 'sound'],
            logging: true,
        },
        messageStorage: myMessageStorage,
        inAppChatEnabled: true,
        geofencingEnabled: true,
    };

    constructor() {
        super();
        this.state = {
            logInfo: '...',
        };
        this.subscriptions = [];

        if (Platform.OS === "ios" || !this.configuration.geofencingEnabled) {
            this.initMobileMessaging();
            return;
        }

        /* Starting Mobile Messaging SDK for android in case geofencingEnabled: true */

        // 1. Setup geo disclosure dialog
        // Per Google requirements - "If your app accesses location in the background, you must provide an in-app disclosure of your data access, collection, use, and sharing."
        let androidGeoDisclosureDialog = {
            message: "This application collects location data to be able to trigger notification about entering geo region even when the app is closed or not in use.",
            buttonPositive: "accept",
            buttonNeutral: "decline"
        };

        // 2. Setup rationale which will be displayed if it's required for asking geofencing permissions.
        //It'll be displayed before showing settings screen with location permissions.
        let androidGeoPermissionsRationaleOptions = {
            title: "Update location settings",
            message: "Allow application to access your location all the time to let it trigger geo notifications even when app is closed or not in use",
            buttonNegative: "cancel",
            buttonPositive: "settings"
        };

        // 3. Check was geo disclosure dialog accepted or not
        this.isAndroidGeoProminentDisclosureAccepted().then(accepted => {
            if (accepted === true) {
                this.initMobileMessagingWithRequestingGeoPermissions(androidGeoPermissionsRationaleOptions);
                return;
            }

            // 4. Show geo disclosure dialog if it's not accepted
            // Example application displays this dialog until user accepts it.
            NativeDialogManagerAndroid.showAlert(
                androidGeoDisclosureDialog,
                () => {
                },
                (action, buttonKey) => {
                    console.log("Button key: " + buttonKey);
                    if (buttonKey === -1) { //accepted
                        AsyncStorage.setItem(this.androidGeoProminentDisclosureAcceptedKey, JSON.stringify(true));

                        // 4.1 Request geofencing permissions and initialize Mobile Messaging
                        this.initMobileMessagingWithRequestingGeoPermissions(androidGeoPermissionsRationaleOptions);
                    } else {
                        // 4.2 initialize Mobile Messaging
                        // Initialize will be called with geofencingEnabled: true, user can give permissions later.
                        // Geofencing won't work until permissions are granted.
                        this.initMobileMessaging();
                    }
                }
            );
        })
    }

    componentDidMount() {
        mobileMessaging.supportedEvents.forEach((event) => {
            let subscription = mobileMessaging.subscribe(event, this.handleMobileMessagingEvent);
            this.subscriptions.push(subscription);
        });
    }

    componentWillUnmount() {
        this.subscriptions.forEach((subscription) => {
            mobileMessaging.unsubscribe(subscription);
        });
    }

    handleMobileMessagingEvent = (value) => {
        this.updateLogInfo('Event: ' + JSON.stringify(value));
    };

    initMobileMessagingWithRequestingGeoPermissions(androidGeoPermissionsRationale: Rationale) {
        //Request geofencing permissions using mobileMessaging method, you can create your own implementation if provided isn't suite.
        mobileMessaging.requestAndroidPermissions(androidGeoPermissionsRationale).then(granted => {
            if (!granted) {
                console.log('Required Geofencing permissions are not granted.');
            }

            // Initialize will be called with geofencingEnabled: true, user can give permissions later.
            // Geofencing won't work until permissions are granted.
            this.initMobileMessaging();
        })
    }

    initMobileMessaging() {
        mobileMessaging.init(
            this.configuration,
            () => this.updateLogInfo('MobileMessaging started'),
            (error) => this.updateLogInfo('MobileMessaging error: ' + error)
        );
    }

    updateLogInfo(info) {
        console.log(info);
        this.setState({logInfo: info});
    }

    render() {
        return (
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Home">
                    <Stack.Screen name="Home" component={HomeScreen}/>
                    <Stack.Screen
                        name="Chat"
                        component={ChatScreen}
                        options={{
                            title: 'My Chat Title',
                            headerStyle: {
                                backgroundColor: '#FF0000',
                            },
                            headerTintColor: '#FFFFFF',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        }}
                    />
                    <Stack.Screen
                        name={'TestDeeplinking'}
                        component={TestDeeplinkingScreen}
                        options={{
                            title: 'Test Deeplinking',
                            headerStyle: {
                                backgroundColor: '#FF0000',
                            },
                            headerTintColor: '#FFFFFF',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        }}
                    />
                    <Stack.Screen
                        name={'TestDeeplinking2'}
                        component={TestDeeplinkingScreen2}
                        options={{
                            title: 'Test Deeplinking2',
                            headerStyle: {
                                backgroundColor: '#FF0000',
                            },
                            headerTintColor: '#FFFFFF',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }
}
