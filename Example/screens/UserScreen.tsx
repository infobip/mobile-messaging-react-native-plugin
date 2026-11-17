//
//  UserScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useEffect, useState} from 'react';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import Button from '../components/Button';
import Card from '../components/Card';
import DetailRow from '../components/DetailRow';
import JsonDetails from '../components/JsonDetails';
import Notice from '../components/Notice';
import ScreenContainer from '../components/ScreenContainer';
import type {ScreenProps} from '../constants/RootStackParamList';
import {errorFeedback} from '../utils/feedback';
import type {Feedback} from '../utils/feedback';
import {withoutNullStrings} from '../utils/format';
import {setCurrentUserJwt} from '../utils/JWTUtils';

type UserData = MobileMessagingReactNative.UserData;

const UserScreen: React.FC<ScreenProps<'UserScreen'>> = ({navigation}) => {
  const [user, setUser] = useState<UserData>();
  const [feedback, setFeedback] = useState<Feedback>();

  useEffect(() => {
    // Returns the user cached by the SDK, without a network request.
    const loadCachedUser = () =>
      mobileMessaging.getUser(cached => setUser(withoutNullStrings(cached)));
    loadCachedUser();
    const subscriptions = ['userUpdated', 'personalized', 'depersonalized'].map(
      event => mobileMessaging.subscribe(event, loadCachedUser),
    );
    return () =>
      subscriptions.forEach(subscription =>
        mobileMessaging.unsubscribe(subscription),
      );
  }, []);

  const fetchFromServer = () => {
    mobileMessaging.fetchUser(
      fetched => {
        setUser(withoutNullStrings(fetched));
        setFeedback({tone: 'success', title: 'User fetched from the server'});
      },
      error => setFeedback(errorFeedback('Fetch failed', error)),
    );
  };

  const depersonalize = () => {
    mobileMessaging.depersonalize(
      () => {
        // The user's token must not be reused for the next user.
        setCurrentUserJwt(null);
        setFeedback({tone: 'success', title: 'Depersonalized'});
      },
      error => setFeedback(errorFeedback('Depersonalize failed', error)),
    );
  };

  const fullName = [user?.firstName, user?.middleName, user?.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <ScreenContainer>
      <Card
        title="Current user"
        description="getUser returns the user cached by the SDK; fetchUser loads it from the server.">
        <DetailRow
          label="External user ID"
          value={user?.externalUserId}
          copyable
        />
        <DetailRow label="Name" value={fullName} />
        <DetailRow label="Emails" value={user?.emails?.join(', ')} />
        <DetailRow label="Phones" value={user?.phones?.join(', ')} />
        <DetailRow label="Gender" value={user?.gender} />
        <DetailRow label="Birthday" value={user?.birthday} />
        <Button
          variant="secondary"
          title="Fetch from server"
          onPress={fetchFromServer}
        />
        {user ? <JsonDetails value={user} /> : null}
      </Card>

      <Card
        title="Personalization"
        description="Personalize links this installation to a person, for example after login. Depersonalize unlinks it, for example after logout.">
        <Button
          title="Personalize"
          onPress={() => navigation.navigate('PersonalizeScreen')}
        />
        <Button
          variant="secondary"
          title="Edit user data"
          onPress={() => navigation.navigate('UserDataScreen')}
        />
        <Button
          variant="dangerSecondary"
          title="Depersonalize"
          onPress={depersonalize}
        />
      </Card>

      {feedback ? <Notice {...feedback} /> : null}
    </ScreenContainer>
  );
};

export default UserScreen;
