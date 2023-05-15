/*
    Example of subview multithread in-app chat screen as React Component
 */

import {React, useState, useEffect} from 'react';

import {ChatView} from 'infobip-mobile-messaging-react-native-plugin';
import {View, Text, KeyboardAvoidingView, SafeAreaView} from 'react-native';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import {NavigationContainer} from '@react-navigation/native';

function MultiThreadChatScreen({navigation}) {

  const [showButton, setShowButton] = useState(false);
  
   useEffect(()=>{
    let subscription = mobileMessaging.subscribe(
        'inAppChat.viewStateChanged',
        this.handleViewStateChangeEvent,
      );
    }, []);

  handleViewStateChangeEvent = value => {
    if(typeof(value) !== 'undefined' && value != null){
      let view = new String(value).split(",").pop().trim();
      console.log('Chat view changed to: ' + view);
      /*
      Possible views: LOADING, THREAD_LIST, LOADING_THREAD, THREAD, CLOSED_THREAD, SINGLE_MODE_THREAD, UNKNOWN
      */
      let isNestedDestination = view === "THREAD" || view === "LOADING_THREAD" || view === "CLOSED_THREAD";
      setShowButton(isNestedDestination);
      navigation.setOptions({headerShown: !isNestedDestination});
    }
  };

  function goBackToList() {
    mobileMessaging.showThreadsList();
  }

  return (
      <SafeAreaView style={{backgroundColor: Colors.primary500, flex: 1.0}}>
        {showButton && <PrimaryButton onPress={goBackToList}>Show Chat List</PrimaryButton>}
        <ChatView style={{flex: 1}} sendButtonColor={'#FF0000'} />
      </SafeAreaView>
  );
}

export default MultiThreadChatScreen;
