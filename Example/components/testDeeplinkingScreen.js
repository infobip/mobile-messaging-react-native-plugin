import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

class TestDeeplinkingScreen extends React.Component {
  render() {
    return (
      <View style={styles.infoView}>
        <Text style={styles.info}>This screen was opened by the deeplink</Text>
      </View>
    );
  }
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

export default TestDeeplinkingScreen;
