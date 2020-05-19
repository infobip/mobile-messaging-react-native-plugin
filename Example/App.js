/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';

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
      mobileMessaging.register(event, (value) => {
        console.log('Event: ', JSON.stringify(value));
        this.setState({logInfo: 'Event: ' + JSON.stringify(value)});
      });
    });
  }

  componentWillUnmount() {
    mobileMessaging.supportedEvents.forEach((event) => {
      mobileMessaging.unregister(event, {});
    });
  }

  initMobileMessaging(): void {
    mobileMessaging.init(
      {
        applicationCode: '<Your Application Code>',
        ios: {
          notificationTypes: ['alert', 'badge', 'sound'],
        },
      },
      () => {
        console.log('MobileMessaging started');
        this.setState({logInfo: 'MobileMessaging started'});
      },
      (error) => {
        console.log('MobileMessaging error: ', error);
        this.setState({logInfo: 'MobileMessaging error: ' + error});
      },
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>
          Welcome to the Mobile Messaging Example app!
        </Text>
        <Text style={styles.info}>{this.state.logInfo}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 5,
    backgroundColor: 'white',
    padding: 8,
  },
  info: {
    margin: 5,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },
});
