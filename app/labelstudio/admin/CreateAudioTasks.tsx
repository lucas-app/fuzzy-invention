import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LabelStudioService from '../../../services/LabelStudioService';
import { getConfig, updateConfig } from '../../../lib/config';

// Constants
const COMPLETED_TASKS_KEY = 'COMPLETED_TASKS';

// Updated to use TypeScript service
export default function CreateAudioTasksScreen(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [apiUrl, setApiUrlState] = useState<string>('');
  const [apiToken, setApiToken] = useState<string>('');

  // Load current configuration on component mount
  React.useEffect(() => {
    const loadConfig = () => {
      const config = getConfig();
      setApiUrlState(config.apiBaseUrl);
      setApiToken(config.apiToken);
    };
    loadConfig();
  }, []);

  const handleCreateTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      setResult('Creating audio classification tasks...');
      
      // Update configuration with new values
      await updateConfig({
        apiBaseUrl: apiUrl,
        apiToken: apiToken
      });
      
      // Clear local cache to force refresh
      try {
        await AsyncStorage.removeItem('CACHED_AUDIO_TASKS');
        console.log('Cleared audio tasks cache');
        
        // Also clear any completed tasks storage to make tasks visible
        await AsyncStorage.removeItem(COMPLETED_TASKS_KEY);
        console.log('Cleared completed tasks cache');
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
      
      // Use the service to create audio tasks
      try {
        const success = await LabelStudioService.createAudioClassificationTasks();
        
        if (success) {
          setResult('Successfully created audio classification tasks!');
          Alert.alert(
            'Success',
            'Audio classification tasks have been created in Label Studio.',
            [{ text: 'OK' }]
          );
        } else {
          setResult('Failed to create audio classification tasks.');
          Alert.alert(
            'Error',
            'Failed to create audio classification tasks. See logs for details.',
            [{ text: 'OK' }]
          );
        }
      } catch (error: any) {
        console.error('Error creating audio tasks:', error);
        setResult(`Error creating audio tasks: ${error.message}`);
        Alert.alert(
          'Error',
          `Failed to create audio tasks: ${error.message}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error in task creation process:', error);
      setResult(`Error: ${error.message || 'Unknown error'}`);
      Alert.alert(
        'Error',
        `Task creation failed: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Audio Classification Tasks</Text>
          <Text style={styles.subtitle}>
            This will create audio classification tasks in Label Studio
          </Text>
        </View>
        
        <View style={styles.apiUrlContainer}>
          <Text style={styles.label}>Label Studio API URL:</Text>
          <TextInput
            style={styles.input}
            value={apiUrl}
            onChangeText={setApiUrlState}
            placeholder="Enter Label Studio API URL"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.apiUrlContainer}>
          <Text style={styles.label}>API Token:</Text>
          <TextInput
            style={styles.input}
            value={apiToken}
            onChangeText={setApiToken}
            placeholder="Enter Label Studio API Token"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>New Audio Tasks</Text>
          <View style={styles.taskList}>
            <View style={styles.taskItem}>
              <Text style={styles.taskTitle}>Doorbell Sound</Text>
              <Text style={styles.taskDescription}>Classification of a sound</Text>
            </View>
            <View style={styles.taskItem}>
              <Text style={styles.taskTitle}>Animal Sound</Text>
              <Text style={styles.taskDescription}>Identify what animal is making the sound</Text>
            </View>
            <View style={styles.taskItem}>
              <Text style={styles.taskTitle}>Metal Sound</Text>
              <Text style={styles.taskDescription}>Identify the likely source of this sound</Text>
            </View>
            <View style={styles.taskItem}>
              <Text style={styles.taskTitle}>Game Sound Effect</Text>
              <Text style={styles.taskDescription}>Identify the type of sound effect</Text>
            </View>
            <View style={styles.taskItem}>
              <Text style={styles.taskTitle}>Weather Sound</Text>
              <Text style={styles.taskDescription}>Identify the weather phenomenon</Text>
            </View>
          </View>
        </View>

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleCreateTasks}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Create Audio Tasks</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  apiUrlContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  resultContainer: {
    backgroundColor: '#e8f4f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#b388ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 