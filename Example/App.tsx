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
import UserDataScreen from './screens/UserDataScreen';
import ChatOptionsScreen from './screens/chat/ChatOptionsScreen';
import ChatViewScreen from './screens/chat/ChatViewScreen';
import ChatViewCustomLayoutScreen from './screens/chat/ChatViewCustomLayoutScreen';
import ChatViewMultithreadScreen from './screens/chat/ChatViewMultithreadScreen';
import TestDeeplinkingScreen from './screens/TestDeeplinkingScreen';
import TestDeeplinkingScreen2 from './screens/TestDeeplinkingScreen2';

interface AppState {
  logInfo: string;
}

type RootStackParamList = {
  HomeScreen: undefined;
  PersonalizeScreen: undefined;
  UserDataScreen: undefined;
  ChatOptionsScreen: undefined;
  ChatViewScreen: undefined;
  ChatViewCustomLayoutScreen: undefined;
  ChatViewMultithreadScreen: undefined;
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
      logging: true,
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
    // userDataJwt: '',
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
            name="UserDataScreen"
            component={UserDataScreen}
            options={{title: 'Edit User Data'}}
          />
          <Stack.Screen
            name="ChatOptionsScreen"
            component={ChatOptionsScreen}
            options={{
              title: 'Chat options',
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
            name="ChatViewScreen"
            component={ChatViewScreen}
            options={{
              title: 'ChatView React component fullscreen',
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
            name="ChatViewCustomLayoutScreen"
            component={ChatViewCustomLayoutScreen}
            options={{
              title: 'ChatView React component in custom layout',
              headerTintColor: Colors.tintWhite,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="ChatViewMultithreadScreen"
            component={ChatViewMultithreadScreen}
            options={{
              title: 'Multithread ChatView React component',
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
