import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import LabelStudioService from '../../../services/LabelStudioService';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Constants
const COMPLETED_TASKS_KEY = 'COMPLETED_TASKS';

const FixGeospatialTasks = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const fixTasks = async () => {
    try {
      setStatus('loading');
      setMessage('Updating tasks in Label Studio...');
      
      // Update tasks in Label Studio
      const success = await LabelStudioService.updateGeospatialTasks();
      
      if (success) {
        setMessage('Tasks updated successfully. Refreshing local cache...');
        
        // Clear the cached tasks
        await AsyncStorage.removeItem('CACHED_GEOSPATIAL_TASKS');
        
        // Also clear completed tasks to make all tasks visible
        await AsyncStorage.removeItem(COMPLETED_TASKS_KEY);
        
        // Fetch fresh tasks
        await LabelStudioService.fetchTasks('GEOSPATIAL_LABELING');
        
        setStatus('success');
        setMessage('All tasks updated successfully! You can now use geospatial labeling.');
      } else {
        setStatus('error');
        setMessage('Failed to update tasks. Please check the console for details.');
      }
    } catch (error: unknown) {
      console.error('Error fixing geospatial tasks:', error);
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Fix Geospatial Tasks</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          This utility will update the geospatial tasks in Label Studio with working image URLs.
          This fixes the "There was an issue loading URL from $image value" error.
        </Text>

        {status === 'idle' && (
          <TouchableOpacity style={styles.button} onPress={fixTasks}>
            <Text style={styles.buttonText}>Update Geospatial Tasks</Text>
          </TouchableOpacity>
        )}

        {status === 'loading' && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>{message}</Text>
          </View>
        )}

        {status === 'success' && (
          <View style={styles.statusContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.statusText}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={goBack}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.statusContainer}>
            <Ionicons name="alert-circle" size={60} color="#F44336" />
            <Text style={styles.statusText}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={fixTasks}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
    color: '#333',
  },
});

export default FixGeospatialTasks;
