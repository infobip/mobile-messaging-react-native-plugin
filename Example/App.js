import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

//Screens
import HomeScreen from './screens/HomeScreen';
import PersonalizeScreen from './screens/PersonalizeScreen';
import ChatScreen from './screens/ChatScreen';
import SubviewChatScreen from './screens/SubviewChatScreen';
import MultiThreadChatScreen from './screens/MultiThreadChatScreen';
import TestDeeplinkingScreen from './screens/testDeeplinkingScreen';
import TestDeeplinkingScreen2 from './screens/testDeeplinkingScreen2';

import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import {webRTCUI} from 'infobip-mobile-messaging-react-native-plugin';
import Colors from './constants/Colors';
import MyMessageStorage from './constants/MyMessageStorage';

const Stack = createNativeStackNavigator();

const myMessageStorage = MyMessageStorage;

export default class App extends Component {
  configuration = {
    applicationCode: 'Your mobile push profile application code',
    webRTCUI: {
      configurationId: 'Your webrtc push configuration id',
    },
    ios: {
      notificationTypes: ['alert', 'badge', 'sound'],
      logging: true,
    },
    messageStorage: myMessageStorage,
    inAppChatEnabled: true,
    fullFeaturedInAppsEnabled: true,
    loggingEnabled: true,
  };

  constructor() {
    super();
    this.state = {
      logInfo: '...',
    };
    this.subscriptions = [];

    this.initMobileMessaging();
  }

  componentDidMount() {
    mobileMessaging.supportedEvents
      .concat(mobileMessaging.inAppChatEvents)
      .forEach(event => {
        let subscription = mobileMessaging.subscribe(
          event,
          this.handleMobileMessagingEvent,
        );
        this.subscriptions.push(subscription);
      });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => {
      mobileMessaging.unsubscribe(subscription);
    });
  }

  handleMobileMessagingEvent = value => {
    this.updateLogInfo('Event: ' + JSON.stringify(value));
  };

  initMobileMessaging() {
    mobileMessaging.init(
      this.configuration,
      () => {
        this.updateLogInfo('MobileMessaging started');
        webRTCUI.enableChatCalls(
          () => console.log('Calls enabled'),
          error => console.log('Calls enable error ' + JSON.stringify(error)),
        );
      },
      error =>
        this.updateLogInfo('MobileMessaging error: ' + JSON.stringify(error)),
    );
  }

  updateLogInfo(info) {
    console.log(info);
    this.setState({logInfo: info});
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="HomeScreen"
          screenOptions={{
            contentStyle: {backgroundColor: Colors.tintWhite},
            headerTintColor: 'white',
            headerStyle: {backgroundColor: Colors.primary500},
          }}>
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
          />
          <Stack.Screen
            name="PersonalizeScreen"
            component={PersonalizeScreen}
            options={{title: 'Personalize'}}
          />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{
              title: 'My Chat Title',
              headerStyle: {
                backgroundColor: Colors.primary500,
              },
              headerTintColor: Colors.tintWhite,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="SubviewChatScreen"
            component={SubviewChatScreen}
            options={{
              title: 'Subview Chat',
              headerTintColor: Colors.tintWhite,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="MultiThreadChatScreen"
            component={MultiThreadChatScreen}
            options={{
              title: 'Multi-Thread Chat',
              headerTintColor: Colors.tintWhite,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="TestDeeplinking"
            component={TestDeeplinkingScreen}
            options={{
              title: 'Test Deeplinking',
              headerStyle: {
                backgroundColor: Colors.primary500,
              },
              headerTintColor: Colors.tintWhite,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="TestDeeplinking2"
            component={TestDeeplinkingScreen2}
            options={{
              title: 'Test Deeplinking2',
              headerStyle: {
                backgroundColor: Colors.primary500,
              },
              headerTintColor: Colors.tintWhite,
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
