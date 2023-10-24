import React, {useEffect} from 'react';
import {
  Button,
  EmitterSubscription,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  mobileMessaging,
  MobileMessagingReactNative,
} from 'infobip-mobile-messaging-react-native-plugin';

function App(): React.JSX.Element {
  let subscriptions: EmitterSubscription[];
  subscriptions = [];

  useEffect(() => {
    mobileMessaging.supportedEvents.forEach(event => {
      let subscription = mobileMessaging.subscribe(event, eventData =>
        handleMobileMessagingEvent(eventData),
      );
      subscriptions.push(subscription);
    });
  }, [subscriptions]);

  useEffect(() => {
    return () => {
      subscriptions.forEach(subscription => {
        mobileMessaging.unsubscribe(subscription);
      });
    };
  }, [subscriptions]);

  let handleMobileMessagingEvent = (value: any) => {
    console.log('Event: ' + JSON.stringify(value));
  };

  mobileMessaging.init(
    {
      inAppChatEnabled: false,
      defaultMessageStorage: false,
      applicationCode: 'Your application code',
      ios: {
        notificationTypes: ['alert', 'badge', 'sound'],
        logging: true,
      },
      android: {
        // For manual integration
        // firebaseOptions: {
        //   apiKey: 'apiKey',
        //   applicationId: 'applicationId',
        //   projectId: 'projectId',
        // },
      },
    },
    () => {
      console.log('MobileMessaging started');
    },
    (error: MobileMessagingReactNative.MobileMessagingError) => {
      console.log('MobileMessaging error: ', error);
    },
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{backgroundColor: 'white'}}>
      <View
        style={{
          height: 50,
          backgroundColor: '#ff5a00',
        }}
      />
      <View style={styles.container}>
        <Button
          title={'Press Me'}
          onPress={() => {
            console.log('The button has been pressed.');
          }}
        />
      </View>
    </ScrollView>
  );
}

export default App;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
