import {Alert, StyleSheet, TextInput, View} from 'react-native';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import {useState} from 'react';
import {mobileMessaging} from 'infobip-mobile-messaging-react-native-plugin';

function PersonalizeScreen() {
  const [enteredNumber, setEnteredNumber] = useState('');

  function numberInputHandler(enteredText) {
    setEnteredNumber(enteredText);
  }

  function resetInputHandler() {
    setEnteredNumber('');
  }

  function confirmInputHandler() {
    const chosenNumber = parseInt(enteredNumber);

    if (isNaN(chosenNumber) || chosenNumber <= 0) {
      Alert.alert('Invalid number', 'Has to be more than zero.', [
        {text: 'Ok', style: 'destructive', onPress: resetInputHandler},
      ]);
      return;
    }

    let userIdentity = {
      phones: [enteredNumber],
    };

    mobileMessaging.personalize({userIdentity: userIdentity, keepAsLead: true}, () => {});
  }

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.numberInput}
        maxLength={15}
        keyboardType="number-pad"
        autoCorrect={false}
        onChangeText={numberInputHandler}
        value={enteredNumber}
      />
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonContainer}>
          <PrimaryButton onPress={resetInputHandler}>Reset</PrimaryButton>
        </View>
        <View style={styles.buttonContainer}>
          <PrimaryButton onPress={confirmInputHandler}>
            Personalize
          </PrimaryButton>
        </View>
      </View>
    </View>
  );
}

export default PersonalizeScreen;

const styles = StyleSheet.create({
  inputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
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
  buttonsContainer: {
    flexDirection: 'row',
  },
  buttonContainer: {
    flex: 1,
  },
  numberInput: {
    height: 50,
    width: 250,
    fontSize: 32,
    borderBottomColor: Colors.primaryGray,
    borderBottomWidth: 2,
    color: Colors.primaryGray,
    marginVertical: 8,
    fontWeight: 'bold',
  },
});
