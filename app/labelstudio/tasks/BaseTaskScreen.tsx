import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTasks, submitAnnotation } from '../../../services/LabelStudioService';

// Storage key for completed tasks
const COMPLETED_TASKS_KEY = 'COMPLETED_TASKS';

const BaseTaskScreen = ({ 
  renderTaskContent, 
  renderOptions, 
  formatAnnotation,
  taskTitle = 'Task',
  themeColor = '#3b82f6'
}) => {
  const router = useRouter();
  const { projectType } = useLocalSearchParams();
  
  // State variables
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [earnings, setEarnings] = useState(0);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [projectType]);

  // Load tasks from Label Studio API
  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Load completed tasks first
      const storedCompletedTasks = await AsyncStorage.getItem(COMPLETED_TASKS_KEY);
      let parsedCompletedTasks = {};
      
      if (storedCompletedTasks) {
        parsedCompletedTasks = JSON.parse(storedCompletedTasks);
        setCompletedTasks(parsedCompletedTasks);
      }
      
      // Fetch tasks from Label Studio API
      if (projectType) {
        const fetchedTasks = await fetchTasks(projectType);
        
        if (fetchedTasks && fetchedTasks.length > 0) {
          // Filter out completed tasks
          const availableTasks = fetchedTasks.filter(
            (task) => !parsedCompletedTasks[task.id]
          );
          
          setTasks(availableTasks);
        } else {
          // No tasks available
          setTasks([]);
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // Handle task submission
  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    const currentTask = tasks[currentTaskIndex];
    if (!currentTask) return;
    
    try {
      setSubmitting(true);
      
      // Format annotation based on task type
      const annotation = formatAnnotation(currentTask, selectedOption);
      
      // Submit annotation to Label Studio
      await submitAnnotation(currentTask.id, annotation);
      
      // Update completed tasks
      const updatedCompletedTasks = {
        ...completedTasks,
        [currentTask.id]: true
      };
      
      await AsyncStorage.setItem(
        COMPLETED_TASKS_KEY,
        JSON.stringify(updatedCompletedTasks)
      );
      
      setCompletedTasks(updatedCompletedTasks);
      
      // Update earnings (random amount between $0.10 and $0.50)
      const taskEarnings = (Math.floor(Math.random() * 40) + 10) / 100;
      setEarnings(prev => prev + taskEarnings);
      
      // Move to next task or finish
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        Alert.alert(
          'All Tasks Completed',
          `You've completed all available tasks. Great job!`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      Alert.alert('Error', 'Failed to submit task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={themeColor} />
        <Stack.Screen
          options={{
            title: taskTitle,
            headerStyle: { backgroundColor: themeColor },
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={themeColor} />
        <Stack.Screen
          options={{
            title: taskTitle,
            headerStyle: { backgroundColor: themeColor },
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
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No tasks available at the moment.</Text>
          <Text style={styles.emptySubtext}>Check back later for new tasks!</Text>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: themeColor }]}
            onPress={loadTasks}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentTask = tasks[currentTaskIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={themeColor} />
      <Stack.Screen
        options={{
          title: taskTitle,
          headerStyle: { backgroundColor: themeColor },
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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Task Header */}
        <View style={styles.header}>
          <Text style={styles.taskCount}>
            Task {currentTaskIndex + 1} of {tasks.length}
          </Text>
          <Text style={styles.earningsText}>
            Earnings: ${earnings.toFixed(2)}
          </Text>
        </View>
        
        {/* Task Content - Rendered by child component */}
        {renderTaskContent(currentTask)}
        
        {/* Task Options - Rendered by child component */}
        {renderOptions(currentTask, selectedOption, handleOptionSelect)}
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { backgroundColor: themeColor },
            !selectedOption && styles.disabledButton,
            submitting && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!selectedOption || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskCount: {
    fontSize: 16,
    color: '#666',
  },
  earningsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BaseTaskScreen;
