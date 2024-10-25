import {Alert, Linking, Platform, ScrollView, View} from 'react-native';
import {
  mobileMessaging,
  webRTCUI,
} from 'infobip-mobile-messaging-react-native-plugin';
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
    mobileMessaging.getUser(user => {
      console.log(user);
      Alert.alert('User Information', JSON.stringify(user), [
        {text: 'Ok', style: 'destructive'},
      ]);
      user.externalUserId = 'someExternalUserId';
      mobileMessaging.saveUser(
        user,
        updatedUser => {
          console.log(updatedUser);
          Alert.alert('User Information', JSON.stringify(updatedUser), [
            {text: 'Ok', style: 'destructive'},
          ]);
        },
        error => console.log('Error saving user: ' + error),
      );
    });
  }

  function fetchUserDataHandler() {
    mobileMessaging.fetchUser(user => {
      console.log(user);
      Alert.alert('Fetched User Information', JSON.stringify(user), [
        {text: 'Ok', style: 'destructive'},
      ]);
      return;
    });
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

  function fetchInbox() {
    mobileMessaging.getUser(user => {
      let filterOptions = {
        fromDateTime: formatInboxFilterDate(new Date(2024, 3, 13, 0, 0, 0)),
        toDateTime: formatInboxFilterDate(new Date(2024, 3, 15, 0, 0, 0)),
        topic: 'test',
        limit: 10,
      };
      mobileMessaging.fetchInboxMessagesWithoutToken(
        user.externalUserId,
        filterOptions,
        inbox => {
          console.log('filterOptions' + filterOptions.fromDateTime),
            console.log('Successfully fetched inbox messages'),
            console.log(inbox);
          Alert.alert('Inbox Messages', JSON.stringify(inbox), [
            {text: 'Ok', style: 'destructive'},
          ]);
        },
        error =>
          console.log('Error fetching inbox messages: ' + error.description),
      );
    });
  }

  function setInboxSeen() {
    mobileMessaging.getUser(user => {
      let setSeenMessages = [];
      mobileMessaging.setInboxMessagesSeen(
        user.externalUserId,
        setSeenMessages,
        messages => {
          console.log('Successfully set messages as seen'),
            console.log(messages);
          Alert.alert('Inbox Messages', JSON.stringify(messages), [
            {text: 'Ok', style: 'destructive'},
          ]);
        },
        error =>
          console.log('Error setting messages as seen: ' + error.description),
      );
    });
  }

  function formatInboxFilterDate(date) {
    const pad = num => (num < 10 ? '0' + num : num);

    const yyyy = date.getUTCFullYear();
    const MM = pad(date.getUTCMonth() + 1); // Months are zero indexed, so +1
    const dd = pad(date.getUTCDate());
    const HH = pad(date.getUTCHours());
    const mm = pad(date.getUTCMinutes());
    const ss = pad(date.getUTCSeconds());

    // Construct timezone offset in '+hh:mm' format
    const timezoneOffsetMinutes = date.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(timezoneOffsetMinutes / 60));
    const offsetMinutes = Math.abs(timezoneOffsetMinutes % 60);
    const timezoneOffset =
      (timezoneOffsetMinutes > 0 ? '-' : '+') +
      pad(offsetHours) + ':' + pad(offsetMinutes);

    return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}${timezoneOffset}`;
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
    mobileMessaging.sendContextualData(
      "{'metadata': 'from react demo'}",
      false,
      () => console.log('MobileMessaging metadata sent'),
      error => console.log('MobileMessaging metadata error: ' + error),
    );
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
      error =>
        console.log(
          'WebRTCUI could not enable chat calls, error: ' +
            JSON.stringify(error),
        ),
    );
  }

  function disableWebRTC() {
    webRTCUI.disableCalls(
      () => console.log('WebRTCUI disabled calls'),
      error =>
        console.log(
          'WebRTCUI could not disable calls, error: ' + JSON.stringify(error),
        ),
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
      'actionTapped',
      handleDeeplink,
    );
    subscriptionNotificationTapped = mobileMessaging.subscribe(
      'notificationTapped',
      handleDeeplink,
    );
    // Needed for opening from Intent / webPage, check Linking documentation
    Linking.addEventListener('url', initialUrlDict => {
      handleDeeplinkEvent(initialUrlDict.url);
    });
  }

  // If eventData contains deeplink, proceeding to open it
  function handleDeeplink(eventData) {
    if (!eventData[0].deeplink) {
      return;
    }
    handleDeeplinkEvent(eventData[0].deeplink);
  }

  function unregisterFromDeeplinkEvents() {
    mobileMessaging.unsubscribe(subscriptionNotificationTapped);
    mobileMessaging.unsubscribe(subscriptionDeeplink);
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

  function handleDeeplinkEvent(deeplinkUrl) {
    console.log(deeplinkUrl);
    let pathSegments = new URL(deeplinkUrl).pathname.split('/').filter(Boolean);
    for (let pathSegment of pathSegments) {
      console.log('Deeplink path segment: ' + pathSegment);
      navigation.navigate(pathSegment);
    }
  }

  function customize() {
    const sendButtonIcon = require('../assets/ic_send.png');
    const attachmentIcon = require('../assets/ic_add_circle.png');
    const navigationIcon = require('../assets/ic_back.png');
    const downloadIcon = require('../assets/ic_download.png');
    const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');

    const settings = {
      chatStatusBarBackgroundColor: "#673AB7",
          chatStatusBarIconsColorMode: "dark",
          attachmentPreviewToolbarSaveMenuItemIcon: resolveAssetSource(downloadIcon).uri,
          attachmentPreviewToolbarMenuItemsIconTint: '#9E9E9E',
          chatToolbar: {
            titleTextAppearance: 'TextAppearance_AppCompat_Title',
            titleTextColor: '#FFFFFF',
            titleText: 'Some new title',
            titleCentered: true,
            backgroundColor: '#673AB7',
            navigationIcon: resolveAssetSource(navigationIcon).uri,
            navigationIconTint: '#FFFFFF',        
            subtitleTextAppearance: 'TextAppearance_AppCompat_Subtitle',
            subtitleTextColor: '#FFFFFF',
            subtitleText: '#1',
            subtitleCentered: true,
    
          },
          attachmentPreviewToolbar: {
            titleTextAppearance: 'TextAppearance_AppCompat_Title',
            titleTextColor: '#212121',
            titleText: 'Attachment preview',
            titleCentered: true,
            backgroundColor: '#673AB7',
            navigationIcon: resolveAssetSource(navigationIcon).uri,
            navigationIconTint: '#FFFFFF',          
            subtitleTextAppearance: 'TextAppearance_AppCompat_Subtitle',
            subtitleTextColor: '#FFFFFF',
            subtitleText: 'Attachment preview subtitle',
            subtitleCentered: false,
    
          },

          networkErrorText: 'Network error',
          networkErrorTextColor: '#FFFFFF',
          networkErrorLabelBackgroundColor: '#212121',

          chatProgressBarColor: '#9E9E9E',
          chatInputTextColor: '#212121',
          chatInputBackgroundColor: '#D1C4E9',
          chatInputHintText: 'Input Message',
          chatInputHintTextColor: '#212121',
          chatInputAttachmentIcon: resolveAssetSource(attachmentIcon).uri,
          chatInputAttachmentIconTint: '#9E9E9E',
          chatInputAttachmentBackgroundColor: '#673AB7',
          chatInputSendIcon: resolveAssetSource(sendButtonIcon).uri,
          chatInputSendIconTint: '#9E9E9E',
          chatInputSendBackgroundColor: '#673AB7',
          chatInputSeparatorLineColor: '#BDBDBD',
          chatInputSeparatorLineVisible: true,
          chatInputCursorColor: '#9E9E9E',
    };
    mobileMessaging.setChatCustomization(settings);
    mobileMessaging.setWidgetTheme('dark');

    console.log('Style applied');
  }

  return (
    <ScrollView style={{marginTop: 100}}>
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
      <PrimaryButton onPress={fetchUserDataHandler}>
        Fetch User Data
      </PrimaryButton>
      <PrimaryButton onPress={getUserDataHandler}>
        Get User Data
      </PrimaryButton>
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
      <PrimaryButton onPress={enableWebRTC}>Enable calls</PrimaryButton>
      <PrimaryButton onPress={disableWebRTC}>Disable calls</PrimaryButton>
      <PrimaryButton onPress={customize}>Runtime customization</PrimaryButton>
      <PrimaryButton onPress={fetchInbox}>Fetch Inbox</PrimaryButton>
      <PrimaryButton onPress={setInboxSeen}>Set Inbox Seen</PrimaryButton>
    </ScrollView>
  );
}

export default HomeScreen;
