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
import AsyncStorage from '@react-native-community/async-storage';

//screens
import HomeScreen from './components/homeScreen.js';
import TestDeeplinkingScreen from './components/testDeeplinkingScreen.js';
import TestDeeplinkingScreen2 from './components/testDeeplinkingScreen2.js';
import ChatScreen from './components/chatScreen.js';

import {
    mobileMessaging,
} from 'infobip-mobile-messaging-react-native-plugin';

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

    constructor() {
        super();
        this.state = {
            logInfo: '...',
        };

        this.initMobileMessaging();
    }

    componentDidMount() {
        mobileMessaging.supportedEvents.forEach((event) => {
            mobileMessaging.register(event, this.handleMobileMessagingEvent);
        });
    }

    componentWillUnmount() {
        mobileMessaging.supportedEvents.forEach((event) => {
            mobileMessaging.unregister(event, this.handleMobileMessagingEvent);
        });
    }

    handleMobileMessagingEvent = (value) => {
        this.updateLogInfo('Event: ' + JSON.stringify(value));
    };

    initMobileMessaging() {
        mobileMessaging.init(
            {
                applicationCode: '<Your Application Code>',
                ios: {
                    notificationTypes: ['alert', 'badge', 'sound'],
                    logging: true,
                },
                messageStorage: myMessageStorage,
                inAppChatEnabled: true,
            },
            () => {
                this.updateLogInfo('MobileMessaging started');
            },
            (error) => {
                this.updateLogInfo('MobileMessaging error: ' + error);
            },
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
