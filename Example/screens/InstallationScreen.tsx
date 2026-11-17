//
//  InstallationScreen.tsx
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
import SwitchRow from '../components/SwitchRow';
import {errorFeedback} from '../utils/feedback';
import type {Feedback} from '../utils/feedback';
import {withoutNullStrings} from '../utils/format';

type Installation = MobileMessagingReactNative.Installation;

const InstallationScreen: React.FC = () => {
  const [installation, setInstallation] = useState<Installation>();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>();

  useEffect(() => {
    // Returns the installation cached by the SDK, without a network request.
    mobileMessaging.getInstallation(cached =>
      setInstallation(withoutNullStrings(cached)),
    );
  }, []);

  const fetchFromServer = () => {
    mobileMessaging.fetchInstallation(
      fetched => {
        setInstallation(withoutNullStrings(fetched));
        setFeedback({
          tone: 'success',
          title: 'Installation fetched from the server',
        });
      },
      error => setFeedback(errorFeedback('Fetch failed', error)),
    );
  };

  const saveChange = (change: Partial<Installation>, successTitle: string) => {
    if (!installation) {
      return;
    }
    setSaving(true);
    mobileMessaging.saveInstallation(
      {...installation, ...change},
      saved => {
        setSaving(false);
        setInstallation(withoutNullStrings(saved));
        setFeedback({tone: 'success', title: successTitle});
      },
      error => {
        setSaving(false);
        setFeedback(errorFeedback('Save failed', error));
      },
    );
  };

  return (
    <ScreenContainer>
      <Card
        title="This device"
        description="An installation is this app on this device. getInstallation returns the copy cached by the SDK; fetchInstallation loads it from the server.">
        <DetailRow
          label="Registration ID"
          value={installation?.pushRegistrationId}
          copyable
        />
        <DetailRow
          label="Notifications"
          value={installation?.notificationsEnabled ? 'Allowed' : 'Not allowed'}
        />
        <DetailRow
          label="Device"
          value={[installation?.deviceManufacturer, installation?.deviceModel]
            .filter(Boolean)
            .join(' ')}
        />
        <DetailRow
          label="OS"
          value={[installation?.os, installation?.osVersion]
            .filter(Boolean)
            .join(' ')}
        />
        <DetailRow label="App version" value={installation?.appVersion} />
        <DetailRow label="SDK version" value={installation?.sdkVersion} />
        <Button
          variant="secondary"
          title="Fetch from server"
          onPress={fetchFromServer}
        />
        {installation ? <JsonDetails value={installation} /> : null}
      </Card>

      <Card
        title="Settings"
        description="Changes are saved with saveInstallation.">
        <SwitchRow
          label="Primary device"
          description="Only one installation of a user can be primary."
          value={installation?.isPrimaryDevice ?? false}
          disabled={!installation || saving}
          onValueChange={isPrimaryDevice =>
            saveChange(
              {isPrimaryDevice},
              isPrimaryDevice
                ? 'Set as primary device'
                : 'No longer the primary device',
            )
          }
        />
        <SwitchRow
          label="Push registration"
          description="When disabled, this device receives no push messages."
          value={installation?.isPushRegistrationEnabled ?? true}
          disabled={!installation || saving}
          onValueChange={isPushRegistrationEnabled =>
            saveChange(
              {isPushRegistrationEnabled},
              isPushRegistrationEnabled
                ? 'Push registration enabled'
                : 'Push registration disabled',
            )
          }
        />
      </Card>

      {feedback ? <Notice {...feedback} /> : null}
    </ScreenContainer>
  );
};

export default InstallationScreen;
