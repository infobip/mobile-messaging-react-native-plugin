import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

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
import NativeDialogManagerAndroid from 'react-native/Libraries/NativeModules/specs/NativeDialogManagerAndroid';
import {Rationale} from 'react-native';

const Stack = createNativeStackNavigator();

const myMessageStorage = MyMessageStorage;

export default class App extends Component {
  androidGeoProminentDisclosureAcceptedKey: string =
    'androidGeoProminentDisclosureAcceptedKey';

  isAndroidGeoProminentDisclosureAccepted(): Promise<Boolean> {
    return AsyncStorage.getItem(
      this.androidGeoProminentDisclosureAcceptedKey,
    ).then(value => {
      if (value === null) {
        return Promise.resolve(false);
      }
      return Promise.resolve(JSON.parse(value));
    });
  }

  configuration = {
    applicationCode: '12f6b57eb734984d42791daa8494f719-3ecdefbb-cead-42f1-853e-24d959b3572e',
    webRTCUI: {
      configurationId: '6decc5f9-1319-4f2c-89d9-fd01ce8a1e77'
    },
    ios: {
      notificationTypes: ['alert', 'badge', 'sound'],
      logging: true,
    },
    messageStorage: myMessageStorage,
    inAppChatEnabled: true,
    fullFeaturedInAppsEnabled: true,
    geofencingEnabled: false,
    loggingEnabled: true,
  };

  constructor() {
    super();
    this.state = {
      logInfo: '...',
    };
    this.subscriptions = [];

    if (Platform.OS === 'ios' || !this.configuration.geofencingEnabled) {
      this.initMobileMessaging();
      return;
    }

    /* Starting Mobile Messaging SDK for android in case geofencingEnabled: true */

    // 1. Setup geo disclosure dialog
    // Per Google requirements - "If your app accesses location in the background, you must provide an in-app disclosure of your data access, collection, use, and sharing."
    let androidGeoDisclosureDialog = {
      message:
        'This application collects location data to be able to trigger notification about entering geo region even when the app is closed or not in use.',
      buttonPositive: 'accept',
      buttonNeutral: 'decline',
    };

    // 2. Setup rationale which will be displayed if it's required for asking geofencing permissions.
    //It'll be displayed before showing settings screen with location permissions.
    let androidGeoPermissionsRationaleOptions = {
      title: 'Update location settings',
      message:
        'Allow application to access your location all the time to let it trigger geo notifications even when app is closed or not in use',
      buttonNegative: 'cancel',
      buttonPositive: 'settings',
    };

    // 3. Check was geo disclosure dialog accepted or not
    this.isAndroidGeoProminentDisclosureAccepted().then(accepted => {
      if (accepted === true) {
        this.initMobileMessagingWithRequestingGeoPermissions(
          androidGeoPermissionsRationaleOptions,
        );
        return;
      }

      // 4. Show geo disclosure dialog if it's not accepted
      // Example application displays this dialog until user accepts it.
      NativeDialogManagerAndroid.showAlert(
        androidGeoDisclosureDialog,
        () => {},
        (action, buttonKey) => {
          console.log('Button key: ' + buttonKey);
          if (buttonKey === -1) {
            //accepted
            AsyncStorage.setItem(
              this.androidGeoProminentDisclosureAcceptedKey,
              JSON.stringify(true),
            );

            // 4.1 Request geofencing permissions and initialize Mobile Messaging
            this.initMobileMessagingWithRequestingGeoPermissions(
              androidGeoPermissionsRationaleOptions,
            );
          } else {
            // 4.2 initialize Mobile Messaging
            // Initialize will be called with geofencingEnabled: true, user can give permissions later.
            // Geofencing won't work until permissions are granted.
            this.initMobileMessaging();
          }
        },
      );
    });
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

  initMobileMessagingWithRequestingGeoPermissions(
    androidGeoPermissionsRationale: Rationale,
  ) {
    //Request geofencing permissions using mobileMessaging method, you can create your own implementation if provided isn't suite.
    mobileMessaging
      .requestAndroidLocationPermissions(androidGeoPermissionsRationale)
      .then(granted => {
        if (!granted) {
          console.log('Required Geofencing permissions are not granted.');
        }

        // Initialize will be called with geofencingEnabled: true, user can give permissions later.
        // Geofencing won't work until permissions are granted.
        this.initMobileMessaging();
      });
  }

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
