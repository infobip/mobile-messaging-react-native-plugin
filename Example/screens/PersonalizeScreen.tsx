//
//  PersonalizeScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useState} from 'react';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import Button from '../components/Button';
import Card from '../components/Card';
import JsonDetails from '../components/JsonDetails';
import Notice from '../components/Notice';
import ScreenContainer from '../components/ScreenContainer';
import SwitchRow from '../components/SwitchRow';
import TextField from '../components/TextField';
import {errorFeedback} from '../utils/feedback';
import type {Feedback} from '../utils/feedback';
import {testConfig} from '../utils/JWTUtils';

type UserIdentity = MobileMessagingReactNative.UserIdentity;
type PersonalizeContext = MobileMessagingReactNative.PersonalizeContext;

const emptyForm = {
  externalUserId: '',
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  forceDepersonalize: false,
  keepAsLead: false,
  setDeviceAsPrimary: false,
};

/** Builds the personalize request from the filled-in fields only. */
function buildPersonalizeContext(form: typeof emptyForm): PersonalizeContext {
  const userIdentity: UserIdentity = {};
  if (form.externalUserId.trim()) {
    userIdentity.externalUserId = form.externalUserId.trim();
  }
  if (form.email.trim()) {
    userIdentity.emails = [form.email.trim()];
  }
  if (form.phone.trim()) {
    userIdentity.phones = [form.phone.trim()];
  }
  const userAttributes: Record<string, string> = {};
  if (form.firstName.trim()) {
    userAttributes.firstName = form.firstName.trim();
  }
  if (form.lastName.trim()) {
    userAttributes.lastName = form.lastName.trim();
  }
  return {
    userIdentity,
    userAttributes,
    forceDepersonalize: form.forceDepersonalize,
    keepAsLead: form.keepAsLead,
    setDeviceAsPrimary: form.setDeviceAsPrimary,
  };
}

const PersonalizeScreen: React.FC = () => {
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<Feedback>();
  const [result, setResult] = useState<PersonalizeContext>();
  const update = (change: Partial<typeof emptyForm>) =>
    setForm(previous => ({...previous, ...change}));

  const personalize = () => {
    const context = buildPersonalizeContext(form);
    if (Object.keys(context.userIdentity).length === 0) {
      setFeedback({
        tone: 'error',
        title: 'Enter at least one identity: external user ID, email or phone',
      });
      return;
    }
    setResult(undefined);
    testConfig.externalPersonId = context.userIdentity.externalUserId ?? '';
    mobileMessaging.personalize(
      context,
      personalized => {
        setResult(personalized);
        setFeedback({tone: 'success', title: 'Personalized'});
      },
      error => setFeedback(errorFeedback('Personalize failed', error)),
    );
  };

  return (
    <ScreenContainer>
      <Card
        title="User identity"
        description="Identifies the person in People. The inbox requires an external user ID.">
        <TextField
          label="External user ID"
          value={form.externalUserId}
          onChangeText={externalUserId => update({externalUserId})}
          autoCapitalize="none"
        />
        <TextField
          label="Email"
          value={form.email}
          onChangeText={email => update({email})}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="Phone"
          hint="International format, for example 385981234567"
          value={form.phone}
          onChangeText={phone => update({phone})}
          keyboardType="phone-pad"
        />
      </Card>

      <Card
        title="User attributes"
        description="Optional data stored with the person.">
        <TextField
          label="First name"
          value={form.firstName}
          onChangeText={firstName => update({firstName})}
        />
        <TextField
          label="Last name"
          value={form.lastName}
          onChangeText={lastName => update({lastName})}
        />
      </Card>

      <Card title="Options">
        <SwitchRow
          label="Force depersonalize"
          description="Unlink this installation from a different person first."
          value={form.forceDepersonalize}
          onValueChange={forceDepersonalize => update({forceDepersonalize})}
        />
        <SwitchRow
          label="Keep as lead"
          description="Keep the person as a lead instead of a customer."
          value={form.keepAsLead}
          onValueChange={keepAsLead => update({keepAsLead})}
        />
        <SwitchRow
          label="Set device as primary"
          value={form.setDeviceAsPrimary}
          onValueChange={setDeviceAsPrimary => update({setDeviceAsPrimary})}
        />
      </Card>

      {feedback ? <Notice {...feedback} /> : null}
      {result ? (
        <JsonDetails label="personalize result" value={result} />
      ) : null}

      <Button title="Personalize" onPress={personalize} />
      <Button
        variant="secondary"
        title="Clear form"
        onPress={() => setForm(emptyForm)}
      />
    </ScreenContainer>
  );
};

export default PersonalizeScreen;
