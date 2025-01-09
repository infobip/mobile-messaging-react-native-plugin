import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Colors from '../constants/Colors';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({children, onPress}) => {
  return (
    <View style={styles.buttonOuterContainer}>
      <Pressable
        style={({pressed}) =>
          pressed
            ? [styles.buttonInnerContainer, styles.pressed]
            : styles.buttonInnerContainer
        }
        onPress={onPress}
        android_ripple={{color: Colors.primary600}}>
        <Text style={styles.buttonText}>{children}</Text>
      </Pressable>
    </View>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  buttonOuterContainer: {
    borderRadius: 28,
    margin: 4,
    overflow: 'hidden',
  } as ViewStyle,

  buttonInnerContainer: {
    backgroundColor: Colors.primary500,
    paddingVertical: 8,
    paddingHorizontal: 16,
  } as ViewStyle,

  buttonText: {
    color: Colors.tintWhite,
    textAlign: 'center',
  } as TextStyle,

  pressed: {
    opacity: 0.75,
  } as ViewStyle,
});
