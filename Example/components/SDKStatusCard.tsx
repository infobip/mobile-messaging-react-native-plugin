//
//  SDKStatusCard.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  NativeModules,
  Pressable,
  Platform,
} from 'react-native';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import Colors from '../constants/Colors';
import Clipboard from '@react-native-clipboard/clipboard';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pluginPackage = require('infobip-mobile-messaging-react-native-plugin/package.json');
const pluginVersion: string =
  pluginPackage?.version != null ? String(pluginPackage.version) : 'Unknown';

export interface SDKStatusCardRef {
  refresh: () => void;
}

const isNewArchitectureEnabled =
  (() => {
    const globalScope = globalThis as any;
    const turboModulesOn = typeof globalScope.__turboModuleProxy === 'function';
    const fabricOn = globalScope.nativeFabricUIManager != null;
    const bridgelessOn = globalScope.RN$Bridgeless === true;

    const toBool = (value: unknown) => {
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      if (typeof value === 'number') {
        return value === 1;
      }
      return false;
    };

    const platformConstants = NativeModules?.PlatformConstants;
    const platformReported =
      platformConstants?.getConstants?.().isNewArchitectureEnabled ??
      platformConstants?.isNewArchitectureEnabled;

    return (
      turboModulesOn ||
      fabricOn ||
      bridgelessOn ||
      toBool(platformReported) ||
      globalScope.RNNewArchitectureEnabled === true
    );
  })();

const SDKStatusCard = forwardRef<SDKStatusCardRef>((props, ref) => {
  const [status, setStatus] = useState({
    isConnected: null as boolean | null,
    pushServiceToken: null as string | null,
    pushRegistrationId: null as string | null,
    personalizedWith: null as string[] | null,
  });
  const [expanded, setExpanded] = useState(false);

  const checkConnectivity = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://api.infobip.com', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setStatus(prev => ({...prev, isConnected: response.ok}));
    } catch (error) {
      setStatus(prev => ({...prev, isConnected: false}));
    }
  }, []);

  const refreshStatus = useCallback(() => {
    mobileMessaging.getInstallation((installation: any) => {
      const pushRegId = installation.pushRegistrationId;
      const pushToken = installation.pushServiceToken;

      setStatus(prev => ({
        ...prev,
        pushRegistrationId: pushRegId && pushRegId !== 'null' ? pushRegId : null,
        pushServiceToken: pushToken && pushToken !== 'null' ? pushToken : null,
      }));
    });

    mobileMessaging.getUser((user: any) => {
      const identifiers: string[] = [];

      if (user.externalUserId && user.externalUserId !== 'null') {
        identifiers.push(user.externalUserId);
      }
      if (user.emails && Array.isArray(user.emails) && user.emails.length > 0) {
        identifiers.push(...user.emails);
      }
      if (user.phones && Array.isArray(user.phones) && user.phones.length > 0) {
        identifiers.push(...user.phones);
      }

      setStatus(prev => ({
        ...prev,
        personalizedWith: identifiers.length > 0 ? identifiers : null,
      }));
    });
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      checkConnectivity();
      refreshStatus();
    },
  }));

  useEffect(() => {
    checkConnectivity();
    refreshStatus();

    const subscriptions = [
      mobileMessaging.subscribe('registrationUpdated', refreshStatus),
      mobileMessaging.subscribe('installationUpdated', refreshStatus),
      mobileMessaging.subscribe('userUpdated', refreshStatus),
      mobileMessaging.subscribe('personalized', refreshStatus),
      mobileMessaging.subscribe('depersonalized', refreshStatus),
    ];

    return () => {
      subscriptions.forEach(sub => mobileMessaging.unsubscribe(sub));
    };
  }, [refreshStatus, checkConnectivity]);

  const copyPushId = () => {
    if (status.pushRegistrationId) {
      Clipboard.setString(status.pushRegistrationId);
      Alert.alert('Copied', 'Push Registration ID copied to clipboard');
    }
  };

  const copyDeviceToken = () => {
    if (status.pushServiceToken) {
      Clipboard.setString(status.pushServiceToken);
      Alert.alert('Copied', 'Device Token copied to clipboard');
    }
  };

  const reactNativeVersion = (() => {
    const version = Platform.constants?.reactNativeVersion;
    if (version) {
      const {major, minor, patch, prerelease} = version;
      const parts = [major, minor, patch].filter(
        value => value !== undefined && value !== null,
      );
      const base = parts.join('.');
      return prerelease ? `${base}-${prerelease}` : base;
    }
    if (typeof Platform.Version === 'string') {
      return Platform.Version;
    }
    if (typeof Platform.Version === 'number') {
      return Platform.Version.toString();
    }
    return 'Unknown';
  })();

  return (
    <Pressable
      onPress={() => setExpanded(prev => !prev)}
      style={({pressed}) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Internet:</Text>
        <Text
          style={[
            styles.statusValue,
            {
              color:
                status.isConnected === null
                  ? '#777'
                  : status.isConnected
                  ? '#4CAF50'
                  : '#F44336',
            },
          ]}>
          {status.isConnected === null
            ? 'Checking...'
            : status.isConnected
            ? 'Connected ✓'
            : 'Not connected ✘'}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Device Token:</Text>
        {status.pushServiceToken ? (
          <TouchableOpacity onPress={copyDeviceToken} style={styles.pushIdTouchable}>
            <Text style={styles.pushIdText} numberOfLines={1}>
              {status.pushServiceToken}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.statusValue, {color: '#777'}]}>
            Not available
          </Text>
        )}
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Push Reg ID:</Text>
        {status.pushRegistrationId ? (
          <TouchableOpacity onPress={copyPushId} style={styles.pushIdTouchable}>
            <Text style={styles.pushIdText} numberOfLines={1}>
              {status.pushRegistrationId}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.statusValue, {color: '#777'}]}>
            Not available
          </Text>
        )}
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Personalized:</Text>
        <Text
          style={[
            styles.statusValue,
            {color: status.personalizedWith ? Colors.primary500 : '#777'},
          ]}>
          {status.personalizedWith ? status.personalizedWith.join(', ') : 'Not personalized'}
        </Text>
      </View>

      <Text style={styles.expandHint}>
        {expanded ? 'Tap to collapse' : 'Tap to expand'}
      </Text>

      {expanded ? (
        <>
          <View style={styles.divider} />
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>RN Architecture:</Text>
            <Text
              style={[
                styles.statusValue,
                {color: isNewArchitectureEnabled ? Colors.primary500 : '#777'},
              ]}>
              {isNewArchitectureEnabled ? 'New' : 'Legacy'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>React Native:</Text>
            <Text style={styles.statusValue}>{reactNativeVersion}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Plugin:</Text>
            <Text style={styles.statusValue}>
              {`infobip-mobile-messaging-react-native-plugin ${pluginVersion}`}
            </Text>
          </View>
        </>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  containerPressed: {
    opacity: 0.95,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.primaryGray,
    fontWeight: '600',
    minWidth: 110,
  },
  statusValue: {
    fontSize: 14,
    color: Colors.primaryGray,
    flex: 1,
  },
  pushIdTouchable: {
    flex: 1,
  },
  pushIdText: {
    fontSize: 12,
    color: Colors.primary500,
    fontFamily: 'monospace',
  },
  expandHint: {
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
    marginTop: 4,
  },
});

export default SDKStatusCard;
