//
//  SDKStatusCard.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useEffect, useState} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import Card from './Card';
import DetailRow from './DetailRow';
import Colors from '../constants/Colors';
import {withoutNullStrings} from '../utils/format';

// The native SDKs also report the push service token, which the Installation type does not declare.
type Installation = MobileMessagingReactNative.Installation & {
  pushServiceToken?: string;
};
type UserData = MobileMessagingReactNative.UserData;

const pluginVersion: string =
  require('infobip-mobile-messaging-react-native-plugin/package.json').version;
const reactNativeVersion = (() => {
  const {major, minor, patch} = Platform.constants.reactNativeVersion;
  return `${major}.${minor}.${patch}`;
})();

const statusEvents = [
  'registrationUpdated',
  'tokenReceived',
  'installationUpdated',
  'userUpdated',
  'personalized',
  'depersonalized',
];

/** Cached installation and user, refreshed whenever the SDK reports a change. */
function useSdkStatus() {
  const [installation, setInstallation] = useState<Installation>();
  const [user, setUser] = useState<UserData>();

  useEffect(() => {
    const refresh = () => {
      mobileMessaging.getInstallation(cached =>
        setInstallation(withoutNullStrings(cached)),
      );
      mobileMessaging.getUser(cached => setUser(withoutNullStrings(cached)));
    };
    refresh();
    const subscriptions = statusEvents.map(event =>
      mobileMessaging.subscribe(event, refresh),
    );
    return () =>
      subscriptions.forEach(subscription =>
        mobileMessaging.unsubscribe(subscription),
      );
  }, []);

  return {installation, user};
}

function describeUser(user?: UserData): string | undefined {
  const identifiers = [
    user?.externalUserId,
    ...(user?.emails ?? []),
    ...(user?.phones ?? []),
  ];
  return identifiers.filter(Boolean).join(', ') || undefined;
}

const SDKStatusCard: React.FC = () => {
  const {installation, user} = useSdkStatus();
  const [expanded, setExpanded] = useState(false);
  const isRegistered = Boolean(installation?.pushRegistrationId);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>SDK status</Text>
        <Text
          style={[
            styles.badge,
            isRegistered ? styles.registered : styles.pending,
          ]}>
          {isRegistered ? 'Registered' : 'Not registered yet'}
        </Text>
      </View>
      <DetailRow
        label="Registration ID"
        value={installation?.pushRegistrationId}
        copyable
      />
      <DetailRow
        label="User"
        value={describeUser(user) ?? 'Not personalized'}
      />
      {expanded ? (
        <>
          <DetailRow
            label="Push token"
            value={installation?.pushServiceToken}
            copyable
          />
          <DetailRow
            label="Notifications"
            value={
              installation?.notificationsEnabled ? 'Allowed' : 'Not allowed'
            }
          />
          <DetailRow label="SDK" value={installation?.sdkVersion} />
          <DetailRow label="Plugin" value={pluginVersion} />
          <DetailRow label="React Native" value={reactNativeVersion} />
        </>
      ) : null}
      <Pressable
        onPress={() => setExpanded(previous => !previous)}
        accessibilityRole="button"
        accessibilityState={{expanded}}
        hitSlop={8}>
        <Text style={styles.toggle}>
          {expanded ? 'Show less' : 'Show more'}
        </Text>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  registered: {
    color: Colors.successText,
    backgroundColor: Colors.successSubdued,
  },
  pending: {
    color: Colors.infoText,
    backgroundColor: Colors.infoSubdued,
  },
  toggle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default SDKStatusCard;
