import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

function TestDeeplinkingScreen2() {
  return (
    <View style={styles.infoView}>
      <Text style={styles.info}>
        This screen was opened by the second deeplink
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoText: {
    margin: 5,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },
  infoView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TestDeeplinkingScreen2;
