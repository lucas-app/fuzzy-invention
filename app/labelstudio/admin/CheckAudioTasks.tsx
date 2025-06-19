import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckAudioTasksScreen(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [cachedTasks, setCachedTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    checkTasks();
  }, []);

  const checkTasks = async () => {
    try {
      setLoading(true);
      
      // Check cached tasks
      const audioTasksData = await AsyncStorage.getItem('label_studio_audio_tasks');
      let audioTasks = [];
      if (audioTasksData) {
        const parsed = JSON.parse(audioTasksData);
        audioTasks = parsed.tasks || [];
        setCachedTasks(audioTasks);
      } else {
        setCachedTasks([]);
      }
      
      // Check completed tasks
      const completedTasksData = await AsyncStorage.getItem('COMPLETED_TASKS');
      if (completedTasksData) {
        const parsed = JSON.parse(completedTasksData);
        setCompletedTasks(Object.keys(parsed));
      } else {
        setCompletedTasks([]);
      }
    } catch (error) {
      console.error('Error checking tasks:', error);
      Alert.alert('Error', 'Failed to check task data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setRefreshing(true);
      await AsyncStorage.removeItem('label_studio_audio_tasks');
      await AsyncStorage.removeItem('COMPLETED_TASKS');
      Alert.alert('Success', 'Cache cleared successfully!');
      await checkTasks();
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert('Error', 'Failed to clear cache');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Audio Tasks Diagnostics</Text>
          <Text style={styles.subtitle}>Checking why audio tasks might not be showing</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
        ) : (
          <>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Cached Audio Tasks</Text>
              {cachedTasks.length > 0 ? (
                cachedTasks.map((task, index) => (
                  <View key={index} style={styles.taskItem}>
                    <Text style={styles.taskTitle}>Task ID: {task.id}</Text>
                    <Text style={styles.taskDescription}>
                      {task.data?.question || 'No question found'}
                    </Text>
                    {task.data?.audio && (
                      <Text style={styles.audioUrl}>Audio: {task.data.audio}</Text>
                    )}
                    {completedTasks.includes(task.id?.toString()) && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noTasksText}>No cached audio tasks found</Text>
              )}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Completed Tasks</Text>
              {completedTasks.length > 0 ? (
                <Text style={styles.taskDescription}>
                  {completedTasks.join(', ')}
                </Text>
              ) : (
                <Text style={styles.noTasksText}>No completed tasks found</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.button, refreshing && styles.buttonDisabled]} 
              onPress={handleClearCache}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Clear All Cache</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, refreshing && styles.buttonDisabled, styles.refreshButton]} 
              onPress={checkTasks}
              disabled={refreshing || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Refresh Data</Text>
              )}
            </TouchableOpacity>
          </>
        )}
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
  loader: {
    marginTop: 50,
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
  taskItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
    marginBottom: 12,
    position: 'relative',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  audioUrl: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  noTasksText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
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