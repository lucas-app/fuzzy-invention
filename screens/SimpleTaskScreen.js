/**
 * SimpleTaskScreen.js
 * A minimal test component to debug rendering issues
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SimpleTaskScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Simple Task Screen is working!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

export default SimpleTaskScreen;
