import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import LabelStudioService from '../../../services/LabelStudioService.service';

const API_URL = 'https://label-studio.lucas.homes';
const API_TOKEN = '501c980772e98d56cab53109683af59c36ce5778';

const AudioDebugger = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [statusMessage, setStatusMessage] = useState('Not tested yet');
  const [error, setError] = useState<string | null>(null);
  const [audioTasks, setAudioTasks] = useState<any[]>([]);
  const [cachedKeys, setCachedKeys] = useState<string[]>([]);
  const [customUrl, setCustomUrl] = useState(API_URL);
  const [customToken, setCustomToken] = useState(API_TOKEN);

  useEffect(() => {
    loadStorageKeys();
  }, []);

  const loadStorageKeys = async () => {
    try {
      // Get all AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      setCachedKeys(Array.from(keys));
    } catch (err) {
      console.error('Error getting AsyncStorage keys:', err);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('unknown');
      setStatusMessage('Testing connection to Label Studio...');

      // First test a basic connection to the server
      const response = await fetch(`${customUrl}/api/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${customToken}`,
          'Content-Type': 'application/json',
        },
        // Timeout after 10 seconds
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('success');
        setStatusMessage(`Connected to Label Studio API (version: ${data.version || 'unknown'})`);
      } else {
        const errorText = await response.text();
        setConnectionStatus('error');
        setStatusMessage(`Failed to connect: HTTP ${response.status} - ${errorText || 'No details'}`);
        setError(`Server responded with status ${response.status}`);
      }
    } catch (err) {
      setConnectionStatus('error');
      setStatusMessage('Connection failed');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchAudioTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      setAudioTasks([]);
      setStatusMessage('Fetching audio tasks from Label Studio...');

      // Directly fetch tasks from Label Studio using the API
      const projectId = 2; // Audio classification project ID
      const response = await fetch(`${customUrl}/api/projects/${projectId}/tasks/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${customToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000)
      });

      if (response.ok) {
        const tasks = await response.json();
        setAudioTasks(tasks);
        setStatusMessage(`Successfully fetched ${tasks.length} audio tasks`);
        
        // Save to AsyncStorage if successful
        if (tasks.length > 0) {
          await AsyncStorage.setItem('CACHED_AUDIO_TASKS', JSON.stringify(tasks));
          await loadStorageKeys(); // Refresh the storage keys
        }
      } else {
        const errorText = await response.text();
        setStatusMessage('Failed to fetch audio tasks');
        setError(`Server responded with status ${response.status}: ${errorText || 'No details'}`);
      }
    } catch (err) {
      setStatusMessage('Error fetching audio tasks');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setLoading(true);
      // Remove all task-related storage keys
      await Promise.all([
        AsyncStorage.removeItem('CACHED_AUDIO_TASKS'),
        AsyncStorage.removeItem('label_studio_audio_tasks'), 
        AsyncStorage.removeItem('COMPLETED_TASKS'),
        AsyncStorage.removeItem('TASK_PROGRESS')
      ]);
      
      setStatusMessage('Cache cleared successfully');
      await loadStorageKeys(); // Refresh the storage keys
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache');
    } finally {
      setLoading(false);
    }
  };

  const useServiceFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      setAudioTasks([]);
      setStatusMessage('Fetching via LabelStudioService...');

      // Use the actual service to fetch tasks
      const tasks = await LabelStudioService.fetchTasks('AUDIO_CLASSIFICATION', 3, true);
      setAudioTasks(tasks || []);
      setStatusMessage(`Successfully fetched ${tasks.length} audio tasks via service`);
    } catch (err) {
      setStatusMessage('Error fetching via service');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Label Studio Debugger',
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Settings</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>API URL:</Text>
            <TextInput 
              style={styles.input}
              value={customUrl}
              onChangeText={setCustomUrl}
              placeholder="https://label-studio.example.com"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>API Token:</Text>
            <TextInput 
              style={styles.input}
              value={customToken}
              onChangeText={setCustomToken}
              placeholder="Your API token"
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text 
            style={[
              styles.statusText, 
              connectionStatus === 'success' && styles.successText,
              connectionStatus === 'error' && styles.errorText
            ]}
          >
            {statusMessage}
          </Text>
          {error && <Text style={styles.errorDetails}>{error}</Text>}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={testConnection}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={fetchAudioTasks}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Fetch Tasks Directly</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={useServiceFetch}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Use Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]}
            onPress={clearCache}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Processing request...</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Audio Tasks ({audioTasks.length})
          </Text>
          {audioTasks.length === 0 ? (
            <Text style={styles.emptyText}>No audio tasks found</Text>
          ) : (
            audioTasks.map((task, index) => (
              <View key={task.id || index} style={styles.taskItem}>
                <Text style={styles.taskId}>ID: {task.id}</Text>
                <Text>Question: {task.data?.question || 'No question'}</Text>
                <Text>Audio URL: {task.data?.audio ? 'Present' : 'Missing'}</Text>
                {task.data?.audio && (
                  <Text style={styles.url}>URL: {task.data.audio}</Text>
                )}
                <Text>Options: {task.data?.options ? task.data.options.length : 0}</Text>
                {task.is_labeled && (
                  <Text style={styles.labeledText}>Already labeled</Text>
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AsyncStorage Keys ({cachedKeys.length})</Text>
          {cachedKeys.map((key, index) => (
            <Text key={index} style={styles.keyItem}>{key}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    marginLeft: 10,
    padding: 5,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  successText: {
    color: '#16a34a',
  },
  errorText: {
    color: '#dc2626',
  },
  errorDetails: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  taskItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    marginBottom: 8,
  },
  taskId: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
  labeledText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: 'bold',
    marginTop: 4,
  },
  keyItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 12,
  },
});

export default AudioDebugger;
