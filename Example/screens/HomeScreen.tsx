import React, {useEffect} from 'react';
import {Alert, Linking, Platform, ScrollView, View} from 'react-native';
import {
  Message,
  UserData,
  MobileMessagingError,
  mobileMessaging,
  webRTCUI,
  ChatMultithreadStrategy,
} from 'infobip-mobile-messaging-react-native-plugin';
import PrimaryButton from '../components/PrimaryButton';
import {URL} from 'react-native-url-polyfill';
import {handleJWTError} from "../utils/JWTErrorHandler.ts";

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen = ({navigation}: HomeScreenProps) => {
  useEffect(() => {
    registerForDeeplinkEvents();
    handleInitialDeeplinkUrl();

    return () => {
      unregisterFromDeeplinkEvents();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler Functions

  const personalizeHandler = () => {
    navigation.navigate('PersonalizeScreen');
  };

  const depersonalizeHandler = () => {
    mobileMessaging.depersonalize(
      personalizeContext => {
        Alert.alert(
          'Depersonalized',
          JSON.stringify(personalizeContext, null, 2),
        );
        console.log('Depersonalized');
      },
      (error: MobileMessagingError) => {
        Alert.alert('Error', error.code + ': ' + error.description);
        console.log('Error depersonalizing: ' + error);
      },
    );
  };

  const getInstallationDataHandler = () => {
    mobileMessaging.getInstallation((installation: any) => {
      console.log(installation);
      Alert.alert(
        'Installation Information',
        JSON.stringify(installation, null, 2),
        [{text: 'Ok', style: 'destructive'}],
      );
    });
  };

  const editUserDataHandler = () => {
    navigation.navigate('UserDataScreen');
  };

  const fetchUserDataHandler = () => {
    mobileMessaging.fetchUser(
      (user: UserData) => {
        console.log(user);
        Alert.alert('Fetched User Information', JSON.stringify(user, null, 2), [
          {text: 'Ok', style: 'destructive'},
        ]);
      },
      (error: MobileMessagingError) =>
        handleJWTError(error),
    );
  };

  const getUserDataHandler = () => {
    mobileMessaging.getUser((user: any) => {
      console.log(user);
      Alert.alert('User Information', JSON.stringify(user, null, 2), [
        {text: 'Ok', style: 'destructive'},
      ]);
    });
  };

  const fetchInbox = () => {
    mobileMessaging.getUser((user: any) => {
      const filterOptions = {
        fromDateTime: formatInboxFilterDate(new Date(2024, 3, 13, 0, 0, 0)),
        toDateTime: formatInboxFilterDate(new Date(2025, 3, 15, 0, 0, 0)),
        topic: 'test',
        limit: 10,
      };
      mobileMessaging.fetchInboxMessagesWithoutToken(
        user.externalUserId,
        filterOptions,
        (inbox: any) => {
          console.log('filterOptions' + filterOptions.fromDateTime);
          console.log('Successfully fetched inbox messages');
          console.log(inbox);
          Alert.alert('Inbox Messages', JSON.stringify(inbox, null, 2), [
            {text: 'Ok', style: 'destructive'},
          ]);
        },
        (error: MobileMessagingError) =>
          console.log('Error fetching inbox messages: ' + error.description),
      );
    });
  };

  const setInboxSeen = () => {
    mobileMessaging.getUser((user: UserData) => {
      const setSeenMessages: Message[] = [];
      mobileMessaging.setInboxMessagesSeen(
        user.externalUserId,
        setSeenMessages,
        (messages: any) => {
          console.log('Successfully set messages as seen');
          console.log(messages);
          Alert.alert('Inbox Messages', JSON.stringify(messages), [
            {text: 'Ok', style: 'destructive'},
          ]);
        },
        (error: MobileMessagingError) =>
          console.log('Error setting messages as seen: ' + error.description),
      );
    });
  };

  const formatInboxFilterDate = (date: Date) => {
    const pad = (num: number) => (num < 10 ? '0' + num : num.toString());
    const yyyy = date.getUTCFullYear();
    const MM = pad(date.getUTCMonth() + 1); // Months are zero-based
    const dd = pad(date.getUTCDate());
    const HH = pad(date.getUTCHours());
    const mm = pad(date.getUTCMinutes());
    const ss = pad(date.getUTCSeconds());

    // Timezone offset
    const timezoneOffsetMinutes = date.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(timezoneOffsetMinutes / 60));
    const offsetMinutes = Math.abs(timezoneOffsetMinutes % 60);
    const timezoneOffset =
      (timezoneOffsetMinutes > 0 ? '-' : '+') +
      pad(offsetHours) +
      ':' +
      pad(offsetMinutes);

    return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}${timezoneOffset}`;
  };

  const registerForAndroidNotificationsHandler = () => {
    console.log('Trying to register for remote notifications');
    mobileMessaging.registerForAndroidRemoteNotifications();
  };

  const setInstallationAsPrimaryHandler = () => {
    mobileMessaging.getInstallation((installation: any) => {
      installation.isPrimaryDevice = true;
      mobileMessaging.saveInstallation(
        installation,
        (updatedInstallation: any) => {
          console.log('Installation set as primary' + updatedInstallation);
          Alert.alert(
            'Installation set as primary',
            JSON.stringify(updatedInstallation, null, 2),
          );
        },
        (error: MobileMessagingError) =>
          console.log('Error setting installation as primary: ' + error),
      );
    });
  };

  const showChatOptionsScreen = () => {
    navigation.navigate('ChatOptionsScreen');
  };

  // Subscriptions
  let subscriptionDeeplink: any;
  let subscriptionNotificationTapped: any;

  // Button for Android 13 Notification Registration
  let button = <View />;
  if (
    Platform.OS === 'android' &&
    parseInt(Platform.constants.Release, 10) >= 13
  ) {
    button = (
      <PrimaryButton onPress={registerForAndroidNotificationsHandler}>
        Register for Android 13+ Notifications
      </PrimaryButton>
    );
  }

  // Deeplink Event Handlers
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
    Linking.addEventListener('url', handleDeepLinkUrl);
  }

  function handleDeeplink(eventData: any) {
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
        console.log('Initial URL is not provided' + error);
      });
  }

  function handleDeepLinkUrl(event: {url: string}) {
    handleDeeplinkEvent(event.url);
  }

  function handleDeeplinkEvent(deeplinkUrl: string) {
    console.log(deeplinkUrl);
    let pathSegments = new URL(deeplinkUrl).pathname.split('/').filter(Boolean);
    for (let pathSegment of pathSegments) {
      console.log('Deeplink path segment: ' + pathSegment);
      navigation.navigate(pathSegment);
    }
  }

  // Render
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <ScrollView style={{marginTop: 10}}>
      <View>{button}</View>
      <PrimaryButton onPress={personalizeHandler}>Personalize</PrimaryButton>
      <PrimaryButton onPress={depersonalizeHandler}>Depersonalize</PrimaryButton>
      <PrimaryButton onPress={getInstallationDataHandler}>Get Installation Data</PrimaryButton>
      <PrimaryButton onPress={editUserDataHandler}>Edit User Data</PrimaryButton>
      <PrimaryButton onPress={fetchUserDataHandler}>Fetch User Data</PrimaryButton>
      <PrimaryButton onPress={getUserDataHandler}>Get User Data</PrimaryButton>
      <PrimaryButton onPress={setInstallationAsPrimaryHandler}>Set This Installation as Primary</PrimaryButton>
      <PrimaryButton onPress={fetchInbox}>Fetch Inbox</PrimaryButton>
      <PrimaryButton onPress={setInboxSeen}>Set Inbox Seen</PrimaryButton>
      <PrimaryButton onPress={showChatOptionsScreen}>Chat options</PrimaryButton>
    </ScrollView>
  );
};

export default HomeScreen;
