import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';
import type {UserData, MobileMessagingError, Gender} from 'infobip-mobile-messaging-react-native-plugin';
import {handleJWTError} from '../utils/JWTErrorHandler';

const UserDataScreen: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [birthday, setBirthday] = useState<string>('');

  const confirmSaveUserHandler = () => {
    const userData: UserData = {};

    if (firstName.trim() !== '') {
      userData.firstName = firstName.trim();
    }
    if (lastName.trim() !== '') {
      userData.lastName = lastName.trim();
    }
    if (middleName.trim() !== '') {
      userData.middleName = middleName.trim();
    }
    if (gender) {
      userData.gender = gender;
    }
    if (birthday.trim() !== '') {
      userData.birthday = birthday.trim();
    }

    if (Object.keys(userData).length === 0) {
      Alert.alert(
        'Validation Error',
        'Please provide at least one field to save.',
      );
      return;
    }

    mobileMessaging.saveUser(
      userData,
      updatedUserData => {
        Alert.alert(
          'User Data Saved',
          JSON.stringify(updatedUserData, null, 2),
        );
      },
      (error: MobileMessagingError) => {
        handleJWTError(error);
      },
    );
  };


  const resetInputHandler = () => {
    setFirstName('');
    setLastName('');
    setMiddleName('');
    setGender(undefined);
    setBirthday('');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.instructionText}>Edit your user data:</Text>

        {/* First Name */}
        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.textInput}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
          placeholderTextColor={Colors.primaryGray}
        />

        {/* Last Name */}
        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.textInput}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
          placeholderTextColor={Colors.primaryGray}
        />

        {/* Middle Name */}
        <Text style={styles.label}>Middle Name:</Text>
        <TextInput
          style={styles.textInput}
          value={middleName}
          onChangeText={setMiddleName}
          placeholder="Enter middle name"
          placeholderTextColor={Colors.primaryGray}
        />

        {/* Gender */}
        <Text style={styles.label}>Gender:</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'Male' && styles.genderButtonSelected,
            ]}
            onPress={() => setGender(gender === 'Male' ? undefined : 'Male')}
          >
            <Text
              style={[
                styles.genderButtonText,
                gender === 'Male' && styles.genderButtonTextSelected,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'Female' && styles.genderButtonSelected,
            ]}
            onPress={() => setGender(gender === 'Female' ? undefined : 'Female')}
          >
            <Text
              style={[
                styles.genderButtonText,
                gender === 'Female' && styles.genderButtonTextSelected,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>

        {/* Birthday */}
        <Text style={styles.label}>Birthday (YYYY-MM-DD):</Text>
        <TextInput
          style={styles.textInput}
          value={birthday}
          onChangeText={setBirthday}
          placeholder="1985-01-15"
          placeholderTextColor={Colors.primaryGray}
          autoCapitalize="none"
        />

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonContainer}>
            <PrimaryButton onPress={resetInputHandler}>Reset</PrimaryButton>
          </View>
          <View style={styles.buttonContainer}>
            <PrimaryButton onPress={confirmSaveUserHandler}>
              Save User Data
            </PrimaryButton>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default UserDataScreen;

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
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  genderButton: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.tintWhite,
    borderColor: Colors.tintWhite,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.tintWhite,
    borderWidth: 2,
  },
  genderButtonText: {
    color: Colors.primaryGray,
    fontSize: 16,
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: Colors.tintWhite,
    fontWeight: '600',
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
