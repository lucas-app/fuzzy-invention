/**
 * App.js
 * Main entry point for the Label Studio integration app
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import TaskScreen from './screens/TaskScreen';

export default function App() {
  // Clear AsyncStorage cache on app start to force fresh data fetch
  useEffect(() => {
    const clearCache = async () => {
      try {
        // Clear both text and image task caches
        await AsyncStorage.removeItem('label_studio_text_tasks');
        await AsyncStorage.removeItem('label_studio_image_tasks');
        console.log('App.js: Cleared task caches to force fresh data fetch');
      } catch (e) {
        console.error('App.js: Error clearing cache:', e);
      }
    };
    
    clearCache();
  }, []);
  
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <TaskScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});