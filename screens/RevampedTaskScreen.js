/**
 * RevampedTaskScreen.js
 * A simplified task screen for BoP users supporting multiple task types
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import Audio conditionally to avoid potential issues
let Audio;
try {
  Audio = require('expo-av').Audio;
} catch (error) {
  console.log('Error importing Audio:', error);
}
import { mockTasks } from '../assets/mock_tasks';
import { submitAnnotation } from '../services/LabelStudioService';

const { width, height } = Dimensions.get('window');

// Storage key for completed tasks
const COMPLETED_TASKS_KEY = 'COMPLETED_TASKS';

const RevampedTaskScreen = () => {
  // State variables
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [taskType, setTaskType] = useState('all'); // 'all' or specific type

  // Load completed tasks from AsyncStorage on mount
  useEffect(() => {
    loadCompletedTasks();
  }, []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Load completed tasks and filter available tasks
  const loadCompletedTasks = async () => {
    try {
      setLoading(true);
      // Just use the mock tasks directly first to test if it works
      setTasks(mockTasks);
      console.log(`Loaded ${mockTasks.length} mock tasks`);
      
      // Then try to load completed tasks
      try {
        const storedCompletedTasks = await AsyncStorage.getItem(COMPLETED_TASKS_KEY);
        let parsedCompletedTasks = {};
        
        if (storedCompletedTasks) {
          parsedCompletedTasks = JSON.parse(storedCompletedTasks);
          setCompletedTasks(parsedCompletedTasks);
          console.log('Loaded completed tasks:', parsedCompletedTasks);
          
          // Filter out completed tasks
          const availableTasks = mockTasks.filter(
            (task) => !parsedCompletedTasks[task.id]
          );
          
          setTasks(availableTasks);
          console.log(`Filtered to ${availableTasks.length} available tasks`);
        }
      } catch (innerError) {
        console.error('Error loading completed tasks:', innerError);
        // Continue with all tasks if there's an error loading completed tasks
      }
    } catch (error) {
      console.error('Error in loadCompletedTasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Play audio for audio classification tasks
  const playAudio = async (uri) => {
    try {
      if (!Audio) {
        Alert.alert('Error', 'Audio playback is not available.');
        return;
      }
      
      if (sound) {
        await sound.unloadAsync();
      }
      
      setIsPlaying(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      Alert.alert('Error', 'Unable to play audio. Please try again.');
    }
  };

  // Monitor audio playback status
  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // Handle task submission
  const handleSubmit = async () => {
    if (!selectedOption) {
      Alert.alert('Please select an option before submitting.');
      return;
    }

    const currentTask = tasks[currentTaskIndex];
    
    try {
      // In Phase 2, replace this with actual API call to Label Studio
      // await submitAnnotation(currentTask.id, selectedOption, mapTaskTypeToLabelStudio(currentTask.type));
      
      // For now, just log the submission
      console.log(`Task ${currentTask.id} submitted with response: ${selectedOption}`);
      
      // Add task to completed tasks
      const updatedCompletedTasks = {
        ...completedTasks,
        [currentTask.id]: true
      };
      
      setCompletedTasks(updatedCompletedTasks);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(updatedCompletedTasks));
      
      // Update earnings (mock reward)
      const taskReward = 0.05;
      setEarnings(prev => prev + taskReward);
      
      // Show confirmation
      Alert.alert('Success', `Task completed! You earned $${taskReward.toFixed(2)}`);
      
      // Move to the next task
      setSelectedOption(null);
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
      } else {
        Alert.alert('All tasks completed!', 'You have completed all available tasks.');
        // Clear tasks to show the "no tasks" view
        setTasks([]);
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      Alert.alert('Error', 'Failed to submit task. Please try again.');
    }
  };

  // Map task type to Label Studio project type (for future API integration)
  const mapTaskTypeToLabelStudio = (type) => {
    const mapping = {
      'image_classification': 'IMAGE_CLASSIFICATION',
      'text_sentiment': 'TEXT_SENTIMENT',
      'audio_classification': 'AUDIO_CLASSIFICATION',
      'survey': 'SURVEY',
      'geospatial_labeling': 'GEOSPATIAL_LABELING'
    };
    
    return mapping[type] || 'TEXT_SENTIMENT';
  };

  // Filter tasks by type
  const filterTasksByType = (type) => {
    setTaskType(type);
    if (type === 'all') {
      loadCompletedTasks(); // Reload all available tasks
    } else {
      const filteredTasks = mockTasks.filter(
        task => task.type === type && !completedTasks[task.id]
      );
      setTasks(filteredTasks);
      setCurrentTaskIndex(0);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks available.</Text>
          <Text style={styles.earningsText}>Total earnings: ${earnings.toFixed(2)}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadCompletedTasks}
          >
            <Text style={styles.refreshButtonText}>Check for New Tasks</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentTask = tasks[currentTaskIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with task count and earnings */}
        <View style={styles.header}>
          <Text style={styles.taskCount}>Task {currentTaskIndex + 1} of {tasks.length}</Text>
          <Text style={styles.earningsText}>Earnings: ${earnings.toFixed(2)}</Text>
        </View>
        
        {/* Task Type Filter (optional) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskTypeFilter}>
          <TouchableOpacity 
            style={[styles.taskTypeButton, taskType === 'all' && styles.activeTaskType]}
            onPress={() => filterTasksByType('all')}
          >
            <Text style={[styles.taskTypeText, taskType === 'all' && styles.activeTaskTypeText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.taskTypeButton, taskType === 'image_classification' && styles.activeTaskType]}
            onPress={() => filterTasksByType('image_classification')}
          >
            <Text style={[styles.taskTypeText, taskType === 'image_classification' && styles.activeTaskTypeText]}>Images</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.taskTypeButton, taskType === 'text_sentiment' && styles.activeTaskType]}
            onPress={() => filterTasksByType('text_sentiment')}
          >
            <Text style={[styles.taskTypeText, taskType === 'text_sentiment' && styles.activeTaskTypeText]}>Text</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.taskTypeButton, taskType === 'audio_classification' && styles.activeTaskType]}
            onPress={() => filterTasksByType('audio_classification')}
          >
            <Text style={[styles.taskTypeText, taskType === 'audio_classification' && styles.activeTaskTypeText]}>Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.taskTypeButton, taskType === 'survey' && styles.activeTaskType]}
            onPress={() => filterTasksByType('survey')}
          >
            <Text style={[styles.taskTypeText, taskType === 'survey' && styles.activeTaskTypeText]}>Surveys</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.taskTypeButton, taskType === 'geospatial_labeling' && styles.activeTaskType]}
            onPress={() => filterTasksByType('geospatial_labeling')}
          >
            <Text style={[styles.taskTypeText, taskType === 'geospatial_labeling' && styles.activeTaskTypeText]}>Maps</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Task Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>{currentTask.question}</Text>
        </View>

        {/* Task Media/Content */}
        <View style={styles.contentContainer}>
          {(currentTask.type === 'image_classification' || currentTask.type === 'geospatial_labeling') && (
            <View style={styles.mediaContainer}>
              <Image
                source={{ uri: currentTask.media }}
                style={styles.imageMedia}
                resizeMode="contain"
                onError={() => Alert.alert('Error', 'Unable to load image.')}
              />
            </View>
          )}
          
          {currentTask.type === 'audio_classification' && (
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playingButton]}
              onPress={() => playAudio(currentTask.media)}
              disabled={isPlaying}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? 'Playing...' : 'Play Audio'}
              </Text>
            </TouchableOpacity>
          )}
          
          {(currentTask.type === 'text_sentiment' || currentTask.type === 'survey') && (
            <View style={styles.textContainer}>
              <Text style={styles.textContent}>{currentTask.text}</Text>
              {currentTask.details && (
                <Text style={styles.textDetails}>{currentTask.details}</Text>
              )}
            </View>
          )}
        </View>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {currentTask.options.map((option, index) => {
            // Determine button color based on option type
            let buttonStyle = styles.neutralButton;
            if (option === 'Yes' || option === 'Positive' || option === 'Very Likely' || option === 'Product A') {
              buttonStyle = styles.greenButton;
            } else if (option === 'No' || option === 'Negative' || option === 'Not Likely' || option === 'Product B') {
              buttonStyle = styles.redButton;
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  buttonStyle,
                  selectedOption === option && styles.selectedOptionButton
                ]}
                onPress={() => handleOptionSelect(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, !selectedOption && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={!selectedOption}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
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
  taskTypeFilter: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  taskTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeTaskType: {
    backgroundColor: '#007bff',
  },
  taskTypeText: {
    color: '#333',
    fontWeight: '500',
  },
  activeTaskTypeText: {
    color: '#fff',
  },
  questionContainer: {
    marginBottom: 16,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  contentContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mediaContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  imageMedia: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  playButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginVertical: 16,
  },
  playingButton: {
    backgroundColor: '#6c757d',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  textContent: {
    fontSize: 18,
    lineHeight: 24,
    color: '#333',
  },
  textDetails: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 8,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOptionButton: {
    borderWidth: 3,
    borderColor: '#000',
  },
  greenButton: {
    backgroundColor: '#28a745',
  },
  redButton: {
    backgroundColor: '#dc3545',
  },
  neutralButton: {
    backgroundColor: '#6c757d',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RevampedTaskScreen;
