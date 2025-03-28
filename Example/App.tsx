import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  mobileMessaging,
  MobileMessagingError,
} from 'infobip-mobile-messaging-react-native-plugin';
import type {Configuration} from 'infobip-mobile-messaging-react-native-plugin';

import MyMessageStorage from './constants/MyMessageStorage.ts';
import Colors from './constants/Colors.ts';

import HomeScreen from './screens/HomeScreen';
import PersonalizeScreen from './screens/PersonalizeScreen';
import ChatScreen from './screens/ChatScreen';
import SubviewChatScreen from './screens/SubviewChatScreen';
import MultiThreadChatScreen from './screens/MultiThreadChatScreen';
import TestDeeplinkingScreen from './screens/TestDeeplinkingScreen';
import TestDeeplinkingScreen2 from './screens/TestDeeplinkingScreen2';

interface AppState {
  logInfo: string;
}

type RootStackParamList = {
  HomeScreen: undefined;
  PersonalizeScreen: undefined;
  ChatScreen: undefined;
  SubviewChatScreen: undefined;
  MultiThreadChatScreen: undefined;
  TestDeeplinkingScreen: undefined;
  TestDeeplinkingScreen2: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const myMessageStorage = MyMessageStorage;

class App extends Component<{}, AppState> {
  configuration: Configuration = {
    applicationCode: 'Your application code',
    webRTCUI: {
      configurationId: 'Your webrtc push configuration id',
    },
    ios: {
      notificationTypes: ['alert', 'badge', 'sound'],
    },
    android: {
      // firebaseOptions: {
      //   apiKey: '',
      //   applicationId: '',
      //   projectId: '',
      // },
    },
    messageStorage: myMessageStorage,
    inAppChatEnabled: true,
    fullFeaturedInAppsEnabled: true,
    loggingEnabled: true,
  };

  subscriptions: any[] = [];

  constructor(props: {}) {
    super(props);
    this.state = {
      logInfo: '...',
    };
    this.initMobileMessaging();
  }

  componentDidMount() {
    const events = [
      ...mobileMessaging.supportedEvents,
      ...mobileMessaging.inAppChatEvents,
    ];

    events.forEach((event: string) => {
      const subscription = mobileMessaging.subscribe(event, (value: any) => {
        this.handleMobileMessagingEvent(event, value);
      });
      this.subscriptions.push(subscription);
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription: any) => {
      mobileMessaging.unsubscribe(subscription);
    });
  }

  handleMobileMessagingEvent = (eventName: string, value: any) => {
    const eventInfo = `Event: ${eventName}, Data: ${JSON.stringify(value)}`;
    this.updateLogInfo(eventInfo);
  };

  initMobileMessaging() {
    mobileMessaging.init(
      this.configuration,
      () => {
        this.updateLogInfo('MobileMessaging started');
      },
      (error: MobileMessagingError) => {
        this.updateLogInfo('MobileMessaging error: ' + JSON.stringify(error));
      },
    );
  }

  updateLogInfo(info: string) {
    console.log(info);
    this.setState({logInfo: info});
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="HomeScreen"
          screenOptions={{
            headerShown: true,
            contentStyle: {backgroundColor: Colors.tintWhite},
            headerTintColor: 'white',
            headerStyle: {backgroundColor: Colors.primary500},
          }}>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
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
            name="TestDeeplinkingScreen"
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
            name="TestDeeplinkingScreen2"
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

export default App;
