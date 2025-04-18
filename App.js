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
import RevampedTaskScreen from './screens/RevampedTaskScreen';
import SimpleTaskScreen from './screens/SimpleTaskScreen';
import BasicRevampedTaskScreen from './screens/BasicRevampedTaskScreen';

export default function App() {
  // Clear AsyncStorage cache on app start to force fresh data fetch
  useEffect(() => {
    const clearCache = async () => {
      try {
        // Clear all task caches
        await AsyncStorage.removeItem('label_studio_text_tasks');
        await AsyncStorage.removeItem('label_studio_image_tasks');
        await AsyncStorage.removeItem('label_studio_audio_tasks');
        await AsyncStorage.removeItem('label_studio_survey_tasks');
        await AsyncStorage.removeItem('label_studio_geospatial_tasks');
        // Uncomment to clear completed tasks as well
        // await AsyncStorage.removeItem('COMPLETED_TASKS');
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
      <RevampedTaskScreen />
      {/* <BasicRevampedTaskScreen /> */}
      {/* <SimpleTaskScreen /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});