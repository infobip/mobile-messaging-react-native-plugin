import React from 'react';
import {Button, Linking, StyleSheet, Text, View} from 'react-native';
import {URL} from 'react-native-url-polyfill';
import {mobileMessaging} from "infobip-mobile-messaging-react-native-plugin";

class HomeScreen extends React.Component {
    componentDidMount() {
        this.registerForDeeplinkEvents();
        this.handleInitialDeeplinkUrl();
    }

    componentWillUnmount() {
        this.unregisterFromDeeplinkEvents();
    }

    render() {
        return (
            <View style={styles.infoView}>
                <Text style={styles.infoText}>
                    Welcome to the{'\n'}
                    Mobile Messaging Example app!
                </Text>
                <Button
                    title="Show chat"
                    onPress={() => {
                        mobileMessaging.showChat();
                        mobileMessaging.setupiOSChatSettings({
                            //If these values are commented out, configuration will be set from web widget settings from the Infobip Portal
                            // title: 'My Chat Title',
                            // sendButtonColor: '#FF0000',
                            // navigationBarColor: '#FF0000',
                            navigationBarTitleColor: '#FFFFFF',
                            navigationBarItemsColor: '#FFFFFF',
                        });
                    }}
                />
                <Button
                    title="Show chat as React component"
                    onPress={() => this.props.navigation.navigate('Chat')}
                />
            </View>
        );
    }

    /*
      Deeplinking
     */

    registerForDeeplinkEvents(): void {
        mobileMessaging.register("notificationTapped", () => {
            if (!message.deeplink) {
                return;
            }
            this.handleDeeplinkEvent(message.deeplink)
        });
        mobileMessaging.register("notificationTapped", this.handleNotificationTappedEvent);
        Linking.addEventListener('url', (initialUrlDict) => {
            this.handleDeeplinkEvent(initialUrlDict.url);
        });
    }

    unregisterFromDeeplinkEvents() {
        mobileMessaging.unregister("notificationTapped", this.handleNotificationTappedEvent);
        Linking.removeAllListeners('url')
    }

    handleInitialDeeplinkUrl() {
        Linking.getInitialURL().then((initialUrl) => {
            if (!initialUrl) {
                return;
            }
            this.handleDeeplinkEvent(initialUrl);
        }).catch(error => {
            console.log('Initial URL is not provided');
        })
    }

    handleNotificationTappedEvent = (message) => {
        if (!message.deeplink) {
            return;
        }
        this.handleDeeplinkEvent(message.deeplink)
    };

    handleDeeplinkEvent = (deeplinkUrl) => {
        let pathSegments = new URL(deeplinkUrl).pathname.split('/').filter(Boolean);
        for (let pathSegment of pathSegments) {
            console.log('Deeplink path segment: ' + pathSegment);
            this.props.navigation.navigate(pathSegment);
        }
    };
}

const styles = StyleSheet.create({
    infoText: {
        margin: 5,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 40,
    },
    infoView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default HomeScreen;
