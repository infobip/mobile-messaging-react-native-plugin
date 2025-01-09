import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Colors from "../constants/Colors.ts";

const TestDeeplinkingScreen: React.FC = () => {
  return (
    <View style={styles.infoView}>
      <Text style={styles.infoText}>
        This screen was opened by the deeplink
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoText: {
    margin: 5,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    color: Colors.primaryGray,
  },
  infoView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TestDeeplinkingScreen;
