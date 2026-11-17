//
//  HomeScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useEffect, useState} from 'react';
import {
  AppState,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import Button from '../components/Button';
import Card from '../components/Card';
import ScreenContainer from '../components/ScreenContainer';
import SDKStatusCard from '../components/SDKStatusCard';
import Colors from '../constants/Colors';
import type {
  RootStackParamList,
  ScreenProps,
} from '../constants/RootStackParamList';

type Feature = {
  screen: keyof RootStackParamList;
  title: string;
  description: string;
};

const featureSections: {title: string; features: Feature[]}[] = [
  {
    title: 'Push and user',
    features: [
      {
        screen: 'InstallationScreen',
        title: 'Installation',
        description:
          'Push registration of this device, primary device and push settings',
      },
      {
        screen: 'UserScreen',
        title: 'User',
        description: 'Personalize with a user identity and manage user data',
      },
    ],
  },
  {
    title: 'Messages',
    features: [
      {
        screen: 'InboxScreen',
        title: 'Inbox',
        description:
          'Server-side inbox with topics, pagination, seen status and deletion',
      },
      {
        screen: 'MessagesScreen',
        title: 'Received messages',
        description:
          'Push messages received on this device, kept in message storage',
      },
    ],
  },
  {
    title: 'Live chat',
    features: [
      {
        screen: 'ChatOptionsScreen',
        title: 'Live chat',
        description:
          'Native chat screen, ChatView component, calls and customization',
      },
    ],
  },
  {
    title: 'Developer tools',
    features: [
      {
        screen: 'EventLogScreen',
        title: 'Event log',
        description: 'Every event emitted by the SDK',
      },
    ],
  },
];

// Android 13 introduced the runtime notification permission.
const needsNotificationPermission =
  Platform.OS === 'android' && Platform.Version >= 33;

/** True while Android 13+ blocks notifications. Rechecked when the app returns from the permission dialog. */
function useNotificationPermissionMissing(): boolean {
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    if (!needsNotificationPermission) {
      return;
    }
    const check = () =>
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ).then(granted => setMissing(!granted));
    check();
    const subscription = AppState.addEventListener('focus', check);
    return () => subscription.remove();
  }, []);
  return missing;
}

const HomeScreen: React.FC<ScreenProps<'HomeScreen'>> = ({navigation}) => {
  const notificationPermissionMissing = useNotificationPermissionMissing();
  return (
    <ScreenContainer>
      <SDKStatusCard />

      {notificationPermissionMissing ? (
        <Card
          title="Notification permission"
          description="Android 13 and newer show notifications only after the user allows them.">
          <Button
            variant="secondary"
            title="Request permission"
            onPress={() =>
              mobileMessaging.registerForAndroidRemoteNotifications()
            }
          />
        </Card>
      ) : null}

      {featureSections.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.list}>
            {section.features.map((feature, index) => (
              <Pressable
                key={feature.screen}
                onPress={() => navigation.navigate(feature.screen)}
                accessibilityRole="button"
                accessibilityLabel={feature.title}
                accessibilityHint={feature.description}
                style={({pressed}) => [
                  styles.row,
                  index > 0 && styles.rowDivider,
                  pressed && styles.rowPressed,
                ]}>
                <View style={styles.rowTexts}>
                  <Text style={styles.rowTitle}>{feature.title}</Text>
                  <Text style={styles.rowDescription}>
                    {feature.description}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  list: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  rowPressed: {
    backgroundColor: Colors.surfaceMuted,
  },
  rowTexts: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: Colors.accent,
  },
});

export default HomeScreen;
