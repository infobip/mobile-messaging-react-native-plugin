import {Alert, Linking, Platform, View, ScrollView} from 'react-native';
import {mobileMessaging, webRTCUI} from 'infobip-mobile-messaging-react-native-plugin';

import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import React, {useEffect} from 'react';
import {URL} from 'react-native-url-polyfill';

function HomeScreen({navigation}) {
  useEffect(() => {
    registerForDeeplinkEvents();
    handleInitialDeeplinkUrl();
    return () => {
      unregisterFromDeeplinkEvents();
    };
  });

  function personalizeHandler() {
    navigation.navigate('PersonalizeScreen');
  }

  function depersonalizeHandler() {
    mobileMessaging.depersonalize();
  }

  function getInstallationDataHandler() {
    mobileMessaging.getInstallation(installation => {
      console.log(installation);
      Alert.alert('Installation Information', JSON.stringify(installation), [
        {text: 'Ok', style: 'destructive'},
      ]);
      return;
    });
  }

  function saveUserDataHandler() {
    let user = {
      // phones: ['79123456789'],
      // emails: ['john.doe.123@infobip.com'],
      // externalUserId: 'someExternalUserId',
    };
    mobileMessaging.saveUser(user, returnedUser => {});
  }

  function getUserDataHandler() {
    mobileMessaging.getUser(user => {
      console.log(user);
      Alert.alert('User Information', JSON.stringify(user), [
        {text: 'Ok', style: 'destructive'},
      ]);
      return;
    });
  }

  function registerForAndroidNotificationsHandler() {
    console.log('Trying to register for remote notifications');
    mobileMessaging.registerForAndroidRemoteNotifications();
  }

  function setInstallationAsPrimaryHandler() {
    mobileMessaging.getInstallation(installation => {
      installation.isPrimaryDevice = true;
      mobileMessaging.saveInstallation(installation, updatedInstallation => {});
    });
  }

  function showChatHandler() {
//    call mobileMessaging.personalize() first, then setJwtProvider
//    mobileMessaging.setJwtProvider(() => {
//       return 'your JWT';
//    });
    mobileMessaging.setLanguage('en');
    setTimeout(() => {
      mobileMessaging.sendContextualData(
        "{'metadata': 'from react demo'}",
        false,
        () => console.log('MobileMessaging metadata sent'),
        error => console.log('MobileMessaging metadata error: ' + error),
      );
    }, 1000);
    mobileMessaging.showChat();
  }

  function showChatReactComponentHandler() {
    navigation.navigate('ChatScreen');
  }

  function showChatSubviewHandler() {
    navigation.navigate('SubviewChatScreen');
  }

  function showMTChatSubviewHandler() {
    navigation.navigate('MultiThreadChatScreen');
  }

  function enableWebRTC() {
    webRTCUI.enableChatCalls(
        () => console.log('WebRTCUI enabled chat calls'),
        error => console.log('WebRTCUI could not enable chat calls, error: ' + JSON.stringify(error)),
    );
  }

   function disableWebRTC() {
     webRTCUI.disableCalls(
        () => console.log('WebRTCUI disabled calls'),
        error => console.log('WebRTCUI could not disable calls, error: ' + JSON.stringify(error)),
    );
  }

  let subscriptionDeeplink;
  let subscriptionNotificationTapped;

  let button = <View />;

  if (Platform.OS === 'android' && Platform.constants.Release === '13') {
    button = (
      <PrimaryButton onPress={registerForAndroidNotificationsHandler}>
        Register for Android 13 Notifications
      </PrimaryButton>
    );
  }

  function registerForDeeplinkEvents() {
    subscriptionDeeplink = mobileMessaging.subscribe(
      'notificationTapped',
      message => {
        if (!message.deeplink) {
          return;
        }
        handleDeeplinkEvent(message.deeplink);
      },
    );
    subscriptionNotificationTapped = mobileMessaging.subscribe(
      'notificationTapped',
      handleNotificationTappedEvent,
    );
    Linking.addEventListener('url', initialUrlDict => {
      handleDeeplinkEvent(initialUrlDict.url);
    });
  }

  function unregisterFromDeeplinkEvents() {
    mobileMessaging.unsubscribe(subscriptionNotificationTapped);
    Linking.removeAllListeners('url');
  }

  function handleInitialDeeplinkUrl() {
    Linking.getInitialURL()
      .then(initialUrl => {
        if (!initialUrl) {
          return;
        }
        handleDeeplinkEvent(initialUrl);
      })
      .catch(error => {
        console.log('Initial URL is not provided');
      });
  }

  function handleNotificationTappedEvent(message) {
    if (!message.deeplink) {
      return;
    }
    handleDeeplinkEvent(message.deeplink);
  }

  function handleDeeplinkEvent(deeplinkUrl) {
    console.log(deeplinkUrl);
    let pathSegments = new URL(deeplinkUrl).pathname.split('/').filter(Boolean);
    for (let pathSegment of pathSegments) {
      console.log('Deeplink path segment: ' + pathSegment);
      navigation.navigate(pathSegment);
    }
  }

  function customize(){
    const sendButtonIcon = require("../assets/ic_send.png");
    const attachmentIcon = require("../assets/ic_add_circle.png");
    const navigationIcon = require("../assets/ic_back.png");
    const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');

    const settings = {
     toolbarTitle: "Chat",
     toolbarTitleColor: "#FFFFFF",
     toolbarTintColor: "#FFFFFF",
     toolbarBackgroundColor: "#673AB7",
     sendButtonTintColor: "#9E9E9E",
     chatBackgroundColor: "#D1C4E9",
     noConnectionAlertTextColor: "#FFFFFF",
     noConnectionAlertBackgroundColor: "#212121",
     chatInputPlaceholderTextColor: "#757575",
     chatInputCursorColor: "#9E9E9E",
     chatInputBackgroundColor: "#D1C4E9",
     sendButtonIconUri: resolveAssetSource(sendButtonIcon).uri,
     attachmentButtonIconUri: resolveAssetSource(attachmentIcon).uri,
     chatInputSeparatorVisible: true,
     //android
     navigationIconTint: "#FFFFFF",
     subtitleTextColor: "#FFFFFF",
     inputTextColor: "#212121",
     progressBarColor: "#9E9E9E",
     sendBackgroundColor: "#71ea53",
     attachmentBackgroundColor: "#71ea53",
     inputAttachmentIconTint: "#9E9E9E",
     inputSendIconTint: "#9E9E9E",
     inputSeparatorLineColor: "#BDBDBD",
     inputHintText: "Message",
     subtitleText: "#1",
     subtitleTextAppearanceRes: "TextAppearance_AppCompat_Subtitle",
     subtitleCentered: true,
     titleCentered: true,
     inputTextAppearance: "TextAppearance_AppCompat",
     networkConnectionErrorTextAppearanceRes: "TextAppearance_AppCompat_Small",
     networkConnectionErrorText: "Offline",
     navigationIconUri: resolveAssetSource(navigationIcon).uri,
     statusBarColorLight: true,
     titleTextAppearanceRes: "TextAppearance_AppCompat_Title",
     statusBarBackgroundColor: "#673AB7",
     //ios
     initialHeightUri: 125,
     mainFont: 'Apple Chancery',
    };
    mobileMessaging.setupChatSettings(settings);

    console.log("Style applied");
  }

  return (
    <ScrollView>
      <PrimaryButton onPress={personalizeHandler}>Personalize</PrimaryButton>
      <View>{button}</View>
      <PrimaryButton onPress={depersonalizeHandler}>
        Depersonalize
      </PrimaryButton>
      <PrimaryButton onPress={getInstallationDataHandler}>
        Get Installation Data
      </PrimaryButton>
      <PrimaryButton onPress={saveUserDataHandler}>
        Save User Data
      </PrimaryButton>
      <PrimaryButton onPress={getUserDataHandler}>Get User Data</PrimaryButton>
      <PrimaryButton onPress={setInstallationAsPrimaryHandler}>
        Set This Installation as Primary
      </PrimaryButton>
      <PrimaryButton onPress={showChatHandler}>
        Show Chat (Native VC/Activity)
      </PrimaryButton>
      <PrimaryButton onPress={showChatReactComponentHandler}>
        Show Chat (React Component)
      </PrimaryButton>
      <PrimaryButton onPress={showChatSubviewHandler}>
        Show Chat (React Component as Subview)
      </PrimaryButton>
      <PrimaryButton onPress={showMTChatSubviewHandler}>
        Show Chat (React Component with Multi-thread handling)
      </PrimaryButton>
      <PrimaryButton onPress={enableWebRTC}>
        Enable calls
      </PrimaryButton>
      <PrimaryButton onPress={disableWebRTC}>
        Disable calls
      </PrimaryButton>
      <PrimaryButton onPress={customize}>
        Runtime customization
      </PrimaryButton>
    </ScrollView>
  );
}

export default HomeScreen;
