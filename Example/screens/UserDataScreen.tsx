//
//  UserDataScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import JsonDetails from '../components/JsonDetails';
import Notice from '../components/Notice';
import ScreenContainer from '../components/ScreenContainer';
import TextField from '../components/TextField';
import Colors from '../constants/Colors';
import {errorFeedback} from '../utils/feedback';
import type {Feedback} from '../utils/feedback';

type UserData = MobileMessagingReactNative.UserData;
type Gender = MobileMessagingReactNative.Gender;

const genders: Gender[] = ['Male', 'Female'];

const emptyForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  birthday: '',
  gender: undefined as Gender | undefined,
};

/** Empty form fields preserve the corresponding values fetched before saving. */
function buildUserData(form: typeof emptyForm): UserData {
  const userData: UserData = {};
  if (form.firstName.trim()) {
    userData.firstName = form.firstName.trim();
  }
  if (form.middleName.trim()) {
    userData.middleName = form.middleName.trim();
  }
  if (form.lastName.trim()) {
    userData.lastName = form.lastName.trim();
  }
  if (form.birthday.trim()) {
    userData.birthday = form.birthday.trim();
  }
  if (form.gender) {
    userData.gender = form.gender;
  }
  return userData;
}

const UserDataScreen: React.FC = () => {
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<Feedback>();
  const [result, setResult] = useState<UserData>();
  const [saving, setSaving] = useState(false);
  const update = (change: Partial<typeof emptyForm>) =>
    setForm(previous => ({...previous, ...change}));

  const save = () => {
    const userData = buildUserData(form);
    if (Object.keys(userData).length === 0) {
      setFeedback({tone: 'error', title: 'Fill in at least one field'});
      return;
    }
    setResult(undefined);
    setFeedback(undefined);
    setSaving(true);
    const onError = (
      error: MobileMessagingReactNative.MobileMessagingError,
    ) => {
      setSaving(false);
      setFeedback(errorFeedback('Save failed', error));
    };
    // iOS builds a complete user from this object; omitted existing fields can become null updates.
    mobileMessaging.fetchUser(currentUser => {
      const currentData: UserData = Object.fromEntries(
        Object.entries(currentUser).filter(
          ([, value]) => value != null && value !== 'null',
        ),
      );
      mobileMessaging.saveUser(
        {...currentData, ...userData},
        saved => {
          setSaving(false);
          setResult(saved);
          setFeedback({tone: 'success', title: 'User data saved'});
        },
        onError,
      );
    }, onError);
  };

  return (
    <ScreenContainer>
      <Card
        title="User data"
        description="Saved with saveUser for the current user. Empty fields are left unchanged.">
        <TextField
          label="First name"
          value={form.firstName}
          onChangeText={firstName => update({firstName})}
        />
        <TextField
          label="Middle name"
          value={form.middleName}
          onChangeText={middleName => update({middleName})}
        />
        <TextField
          label="Last name"
          value={form.lastName}
          onChangeText={lastName => update({lastName})}
        />
        <TextField
          label="Birthday"
          placeholder="1985-01-15"
          hint="Format YYYY-MM-DD"
          value={form.birthday}
          onChangeText={birthday => update({birthday})}
          autoCapitalize="none"
        />
        <View style={styles.genders}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chips} accessibilityRole="radiogroup">
            {genders.map(gender => (
              <Chip
                key={gender}
                label={gender}
                selected={form.gender === gender}
                onPress={() =>
                  update({gender: form.gender === gender ? undefined : gender})
                }
              />
            ))}
          </View>
        </View>
      </Card>

      {feedback ? <Notice {...feedback} /> : null}
      {result ? <JsonDetails label="saved user" value={result} /> : null}

      <Button
        title={saving ? 'Saving…' : 'Save user data'}
        onPress={save}
        disabled={saving}
      />
      <Button
        variant="secondary"
        title="Clear form"
        onPress={() => setForm(emptyForm)}
        disabled={saving}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  genders: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default UserDataScreen;
