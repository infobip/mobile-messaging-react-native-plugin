/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import {StyleSheet, View, Text, Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {
  mobileMessaging,
  ChatView,
} from 'infobip-mobile-messaging-react-native-plugin';

function homeScreen({navigation}) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text style={styles.info}>
        Welcome to the{'\n'}
        Mobile Messaging Example app!
      </Text>
      <Button
        title="Show chat"
        onPress={() => {
          mobileMessaging.showChat();
          mobileMessaging.setupiOSChatSettings({
            //If these values commented out, configuration will be set from web widget settings from the Infobip Portal
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
        onPress={() => navigation.navigate('Chat')}
      />
    </View>
  );
}

function chatScreen() {
  return <ChatView style={{flex: 1}} sendButtonColor={'#FF0000'} />;
}

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
      mobileMessaging.register(event, (value) => {
        this.updateLogInfo('Event: ' + JSON.stringify(value));
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
          logging: true,
        },
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
          <Stack.Screen name="Home" component={homeScreen} />
          <Stack.Screen
            name="Chat"
            component={chatScreen}
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
        </Stack.Navigator>
      </NavigationContainer>
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
