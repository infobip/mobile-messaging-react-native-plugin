import React, {useEffect, useState, useRef} from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  View,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import {
  UserData,
  MobileMessagingError,
  mobileMessaging,
} from 'infobip-mobile-messaging-react-native-plugin';
import PrimaryButton from '../components/PrimaryButton';
import SDKStatusCard, {
  SDKStatusCardRef,
} from '../components/SDKStatusCard';
import {URL} from 'react-native-url-polyfill';
import {handleJWTError} from '../utils/JWTErrorHandler.ts';
import Colors from '../constants/Colors';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen = ({navigation}: HomeScreenProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const statusCardRef = useRef<SDKStatusCardRef>(null);

  useEffect(() => {
    registerForDeeplinkEvents();
    handleInitialDeeplinkUrl();

    return () => {
      unregisterFromDeeplinkEvents();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    statusCardRef.current?.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

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

  const fetchInstallationDataHandler = () => {
    mobileMessaging.fetchInstallation(
      (installation: any) => {
        console.log('Fetched installation from server', installation);
        Alert.alert(
          'Fetched Installation',
          JSON.stringify(installation, null, 2),
          [{text: 'Ok', style: 'destructive'}],
        );
      },
      (error: MobileMessagingError) => {
        Alert.alert(
          'Fetch installation failed',
          `${error.code}: ${error.description}`,
        );
        console.log('Error fetching installation:', error);
      },
    );
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

  const showInboxScreen = () => {
    navigation.navigate('InboxScreen');
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

  const togglePushRegistrationHandler = () => {
    mobileMessaging.getInstallation((installation: any) => {
      const currentState = installation.isPushRegistrationEnabled ?? true;
      const newState = !currentState;
      installation.isPushRegistrationEnabled = newState;

      mobileMessaging.saveInstallation(
        installation,
        (updatedInstallation: any) => {
          const status = newState ? 'enabled' : 'disabled';
          Alert.alert(
            `Push Registration ${status}`,
            JSON.stringify(updatedInstallation, null, 2),
          );
          statusCardRef.current?.refresh();
        },
        (error: MobileMessagingError) => {
          Alert.alert('Error', `${error.code}: ${error.description}`);
          console.log('Error toggling push registration:', error);
        },
      );
    });
  };

  const showChatOptionsScreen = () => {
    navigation.navigate('ChatOptionsScreen');
  };

  const showMessagesScreen = () => {
    navigation.navigate('MessagesScreen');
  };

  const showEventLogScreen = () => {
    navigation.navigate('EventLogScreen');
  };

  // Subscriptions
  let subscriptionDeeplink: any;
  let subscriptionNotificationTapped: any;

  // Button for Android 13 Notification Registration
  const androidRegistrationButton =
    Platform.OS === 'android' &&
    parseInt(Platform.constants.Release, 10) >= 13 ? (
      <PrimaryButton onPress={registerForAndroidNotificationsHandler}>
        Register for Android 13+ Notifications
      </PrimaryButton>
    ) : null;

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
    <ScrollView
      style={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <SDKStatusCard ref={statusCardRef} />

      {androidRegistrationButton ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Android Setup</Text>
          {androidRegistrationButton}
        </View>
      ) : null}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Installation</Text>
        <PrimaryButton onPress={getInstallationDataHandler}>
          Get Installation Data
        </PrimaryButton>
        <PrimaryButton onPress={fetchInstallationDataHandler}>
          Fetch Installation
        </PrimaryButton>
        <PrimaryButton onPress={setInstallationAsPrimaryHandler}>
          Set This Installation as Primary
        </PrimaryButton>
        <PrimaryButton onPress={togglePushRegistrationHandler}>
          Enable/Disable Push Registration
        </PrimaryButton>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personalization</Text>
        <PrimaryButton onPress={personalizeHandler}>Personalize</PrimaryButton>
        <PrimaryButton onPress={depersonalizeHandler}>
          Depersonalize
        </PrimaryButton>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>User Data</Text>
        <PrimaryButton onPress={getUserDataHandler}>Get User Data</PrimaryButton>
        <PrimaryButton onPress={fetchUserDataHandler}>
          Fetch User Data
        </PrimaryButton>
        <PrimaryButton onPress={editUserDataHandler}>Edit User Data</PrimaryButton>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Messaging</Text>
        <PrimaryButton onPress={showMessagesScreen}>Messages</PrimaryButton>
        <PrimaryButton onPress={showInboxScreen}>Inbox</PrimaryButton>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Chat</Text>
        <PrimaryButton onPress={showChatOptionsScreen}>Chat Options</PrimaryButton>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>More Tools</Text>
        <PrimaryButton onPress={showEventLogScreen}>Event Log</PrimaryButton>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryGray,
    marginHorizontal: 8,
    marginBottom: 4,
  },
});

export default HomeScreen;
