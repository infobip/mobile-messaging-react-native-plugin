//
//  useDeeplinkNavigation.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import {useCallback, useEffect, useRef} from 'react';
import {Linking} from 'react-native';
import type {NavigationContainerRefWithCurrent} from '@react-navigation/native';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {RootStackParamList} from '../constants/RootStackParamList';
import {
  getDeeplinkFromTapEvent,
  getDeeplinkScreens,
} from '../utils/DeeplinkUtils';

/**
 * Opens screens from deeplinks in tapped notifications and in-app message buttons,
 * and from URLs that open the app. Returns the handler for NavigationContainer's onReady,
 * so a deeplink that launched the app is opened once navigation is ready.
 */
export default function useDeeplinkNavigation(
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>,
) {
  const pendingDeeplink = useRef<string | null>(null);

  const openDeeplink = useCallback(
    (deeplink: string) => {
      if (!navigationRef.isReady()) {
        pendingDeeplink.current = deeplink;
        return;
      }
      getDeeplinkScreens(deeplink).forEach(screen =>
        navigationRef.navigate(screen),
      );
    },
    [navigationRef],
  );

  useEffect(() => {
    const openTappedDeeplink = (eventData: unknown) => {
      const deeplink = getDeeplinkFromTapEvent(eventData);
      if (deeplink) {
        openDeeplink(deeplink);
      }
    };
    const tapSubscriptions = ['notificationTapped', 'actionTapped'].map(event =>
      mobileMessaging.subscribe(event, openTappedDeeplink),
    );
    const urlSubscription = Linking.addEventListener('url', ({url}) =>
      openDeeplink(url),
    );
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          openDeeplink(url);
        }
      })
      .catch(error => console.warn('Could not read the initial URL', error));

    return () => {
      tapSubscriptions.forEach(subscription =>
        mobileMessaging.unsubscribe(subscription),
      );
      urlSubscription.remove();
    };
  }, [openDeeplink]);

  return useCallback(() => {
    const deeplink = pendingDeeplink.current;
    pendingDeeplink.current = null;
    if (deeplink) {
      openDeeplink(deeplink);
    }
  }, [openDeeplink]);
}
