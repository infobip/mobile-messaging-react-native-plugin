import React from 'react';
import {Button, Linking, Platform, StyleSheet, Text, View} from 'react-native';
import {URL} from 'react-native-url-polyfill';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';

class HomeScreen extends React.Component {
  androidViewId;

  componentDidMount() {
    this.registerForDeeplinkEvents();
    this.handleInitialDeeplinkUrl();
  }

  componentWillUnmount() {
    this.unregisterFromDeeplinkEvents();
  }

  render() {
    let button = <View />;

    if (Platform.OS === 'android' && Platform.constants.Release === '13') {
      button = (
        <Button
          onPress={() => {
            console.log('trying to register for remote notifications');
            mobileMessaging.registerForAndroidRemoteNotifications();
          }}>
          Register for Android 13 Notifications
        </Button>
      );
    }
    return (
      <View style={styles.infoView}>
        <Text style={styles.infoText}>
          Welcome to the{'\n'}
          Mobile Messaging Example app!
        </Text>
        <Button
          title="Show chat (native VC/Activity)"
          onPress={() => {
            mobileMessaging.setLanguage('en');
            setTimeout(() => {
              mobileMessaging.sendContextualData(
                "{'metadata': 'from react demo'}",
                false,
                () => console.log('MobileMessaging metadata sent'),
                error =>
                  console.log('MobileMessaging metadata error: ' + error),
              );
            }, 1000);
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
          title="Show chat (React Component)"
          onPress={() => this.props.navigation.navigate('Chat')}
        />
        <Button
          title="Show chat (React Component as subview)"
          onPress={() => this.props.navigation.navigate('SubviewChat')}
        />
        <View>{button}</View>
      </View>
    );
  }

  /*
      Deeplinking
     */

  registerForDeeplinkEvents(): void {
    mobileMessaging.subscribe('notificationTapped', message => {
      if (!message.deeplink) {
        return;
      }
      this.handleDeeplinkEvent(message.deeplink);
    });
    mobileMessaging.subscribe(
      'notificationTapped',
      this.handleNotificationTappedEvent,
    );
    Linking.addEventListener('url', initialUrlDict => {
      this.handleDeeplinkEvent(initialUrlDict.url);
    });
  }

  unregisterFromDeeplinkEvents() {
    mobileMessaging.unregister(
      'notificationTapped',
      this.handleNotificationTappedEvent,
    );
    Linking.removeAllListeners('url');
  }

  handleInitialDeeplinkUrl() {
    Linking.getInitialURL()
      .then(initialUrl => {
        if (!initialUrl) {
          return;
        }
        this.handleDeeplinkEvent(initialUrl);
      })
      .catch(() => {
        console.log('Initial URL is not provided');
      });
  }

  handleNotificationTappedEvent = message => {
    if (!message.deeplink) {
      return;
    }
    this.handleDeeplinkEvent(message.deeplink);
  };

  handleDeeplinkEvent = deeplinkUrl => {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
