import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
  ScrollView,
} from 'react-native';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {UserIdentity} from 'infobip-mobile-messaging-react-native-plugin';

const PersonalizeScreen: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [externalUserId, setExternalUserId] = useState<string>('');
  const [forceDepersonalize, setForceDepersonalize] = useState<boolean>(false);
  const [keepAsLead, setKeepAsLead] = useState<boolean>(false);

  const confirmPersonalizeHandler = () => {
    // Construct userIdentity with phones and emails if provided
    const userIdentity: UserIdentity = {};

    if (phoneNumber.trim() !== '') {
      userIdentity.phones = [phoneNumber.trim()];
    }
    if (email.trim() !== '') {
      userIdentity.emails = [email.trim()];
    }
    if (externalUserId.trim() !== '') {
      userIdentity.externalUserId = externalUserId.trim();
    }

    // Construct userAttributes with only provided fields
    const userAttributes: Record<string, string | number | boolean | object[]> = {};
    if (firstName.trim() !== '') {
      userAttributes.firstName = firstName.trim();
    }
    if (lastName.trim() !== '') {
      userAttributes.lastName = lastName.trim();
    }

    // Check if at least one of userIdentity or userAttributes is provided
    if (
      Object.keys(userIdentity).length === 0 &&
      Object.keys(userAttributes).length === 0
    ) {
      Alert.alert(
        'Validation Error',
        'Please provide at least one field to personalize.',
      );
      return;
    }

    mobileMessaging.personalize(
      {
        userIdentity: userIdentity,
        userAttributes: userAttributes,
        forceDepersonalize: forceDepersonalize,
        keepAsLead: keepAsLead,
      },
      personalizeContext => {
        Alert.alert(
          'Personalized',
          JSON.stringify(personalizeContext, null, 2),
        );
      },
      error => {
        Alert.alert('Error', error.code + ': ' + error.description);
      },
    );
  };

  const resetInputHandler = () => {
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setEmail('');
    setExternalUserId('');
    setForceDepersonalize(false);
    setKeepAsLead(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.instructionText}>Please enter your details:</Text>

        {/* First Name */}
        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.textInput}
          value={firstName}
          onChangeText={setFirstName}
        />

        {/* Last Name */}
        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.textInput}
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Phone Number */}
        <Text style={styles.label}>Phone Number:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* Email */}
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* External User ID */}
        <Text style={styles.label}>External User ID:</Text>
        <TextInput
          style={styles.textInput}
          value={externalUserId}
          onChangeText={setExternalUserId}
          autoCapitalize="none"
        />

        {/* Force Depersonalize */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Force Depersonalize</Text>
          <Switch
            value={forceDepersonalize}
            onValueChange={setForceDepersonalize}
          />
        </View>

        {/* Keep As Lead */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Keep As Lead</Text>
          <Switch value={keepAsLead} onValueChange={setKeepAsLead} />
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonContainer}>
            <PrimaryButton onPress={resetInputHandler}>Reset</PrimaryButton>
          </View>
          <View style={styles.buttonContainer}>
            <PrimaryButton onPress={confirmPersonalizeHandler}>
              Personalize
            </PrimaryButton>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PersonalizeScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  inputContainer: {
    marginHorizontal: 24,
    padding: 16,
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    elevation: 4,
    shadowColor: Colors.primaryGray,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    shadowOpacity: 0.25,
  },
  instructionText: {
    fontSize: 18,
    color: Colors.tintWhite,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: Colors.tintWhite,
    marginBottom: 4,
    marginLeft: 4,
  },
  textInput: {
    height: 40,
    width: '100%',
    borderColor: Colors.tintWhite,
    borderWidth: 1,
    borderRadius: 4,
    color: Colors.primaryGray,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: Colors.tintWhite,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.tintWhite,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
});
