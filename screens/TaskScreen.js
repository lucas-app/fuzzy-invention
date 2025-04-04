/**
 * TaskScreen.js
 * Screen component to display tasks from Label Studio
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTasks, submitAnnotation } from '../services/LabelStudioService';

const { width, height } = Dimensions.get('window');

// Task types
const TASK_TYPES = {
  TEXT_SENTIMENT: 'TEXT_SENTIMENT',
  IMAGE_CLASSIFICATION: 'IMAGE_CLASSIFICATION'
};

// Animal classification options
const ANIMAL_TYPES = [
  'Dog', 'Cat', 'Bird', 'Fish', 'Panda', 
  'Turtle', 'Lion', 'Wolf', 'Fox', 'Koala', 'Other'
];

const TaskScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [taskType, setTaskType] = useState(TASK_TYPES.TEXT_SENTIMENT);
  const [completedTasks, setCompletedTasks] = useState({});
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Function to load tasks based on task type
  const loadTasks = useCallback(async () => {
    try {
      console.log(`TaskScreen: Loading ${taskType} tasks...`);
      setError(null);
      setLoading(true);

      const tasksData = await fetchTasks(taskType);
      console.log(`TaskScreen: Fetched ${taskType} Tasks:`, tasksData);
      
      // Debug: Log the first task's data structure
      if (tasksData && tasksData.length > 0) {
        console.log('TaskScreen: First task data:', JSON.stringify(tasksData[0], null, 2));
        console.log('TaskScreen: Image URL in first task:', tasksData[0]?.data?.image);
      }

      if (!tasksData || tasksData.length === 0) {
        setError(`No ${taskType === TASK_TYPES.TEXT_SENTIMENT ? 'text sentiment' : 'image classification'} tasks available`);
      } else {
        // Mark tasks as completed if they're in our completedTasks object
        const tasksWithCompletionStatus = tasksData.map(task => ({
          ...task,
          completed: completedTasks[`${taskType}_${task.id}`] || false
        }));
        
        setTasks(tasksWithCompletionStatus);
        
        // Find the first incomplete task to start with
        const firstIncompleteIndex = tasksWithCompletionStatus.findIndex(task => !task.completed);
        setCurrentIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
        
        console.log(`TaskScreen: ${tasksData.length} ${taskType} tasks loaded successfully`);
        console.log(`TaskScreen: ${tasksWithCompletionStatus.filter(t => t.completed).length} tasks already completed`);
      }
    } catch (err) {
      console.error(`TaskScreen: Error loading ${taskType} tasks - ${err.message}`);
      setError(`Failed to load tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks on component mount and when task type changes
  // Load completed tasks from AsyncStorage on mount
  useEffect(() => {
    const loadCompletedTasks = async () => {
      try {
        const savedCompletedTasks = await AsyncStorage.getItem('COMPLETED_TASKS');
        if (savedCompletedTasks) {
          setCompletedTasks(JSON.parse(savedCompletedTasks));
          console.log('TaskScreen: Loaded completed tasks from storage');
        }
      } catch (error) {
        console.error('TaskScreen: Error loading completed tasks', error);
      }
    };
    
    loadCompletedTasks();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, taskType]);
  
  // Handle task navigation
  const goToNextTask = useCallback(() => {
    if (currentIndex < tasks.length - 1) {
      // Animate out current task
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentIndex(prevIndex => prevIndex + 1);
        // Reset animations
        fadeAnim.setValue(0);
        slideAnim.setValue(width);
        // Animate in new task
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    }
  }, [currentIndex, tasks.length, fadeAnim, slideAnim, width]);
  
  const goToPrevTask = useCallback(() => {
    if (currentIndex > 0) {
      // Animate out current task
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentIndex(prevIndex => prevIndex - 1);
        // Reset animations
        fadeAnim.setValue(0);
        slideAnim.setValue(-width);
        // Animate in new task
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    }
  }, [currentIndex, fadeAnim, slideAnim, width]);
  
  // Reset animations when tasks change
  useEffect(() => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }, [tasks, fadeAnim, slideAnim]);
  
  // Handle sentiment selection for text tasks
  const handleSentimentSelect = (taskId, sentiment) => {
    console.log(`Selected ${sentiment} for text task #${taskId}`);
    
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, selectedSentiment: sentiment }
          : task
      )
    );
  };
  
  // Handle animal type selection for image tasks
  const handleAnimalSelect = (taskId, animalType) => {
    console.log(`Selected ${animalType} for image task #${taskId}`);
    
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, selectedAnimal: animalType }
          : task
      )
    );
  };
  
  // Save completed tasks to AsyncStorage
  const saveCompletedTasks = async (updatedCompletedTasks) => {
    try {
      await AsyncStorage.setItem('COMPLETED_TASKS', JSON.stringify(updatedCompletedTasks));
      console.log('TaskScreen: Saved completed tasks to storage');
    } catch (error) {
      console.error('TaskScreen: Error saving completed tasks', error);
    }
  };

  // Mark task as completed
  const markTaskAsCompleted = (taskId) => {
    const taskKey = `${taskType}_${taskId}`;
    const updatedCompletedTasks = { ...completedTasks, [taskKey]: true };
    setCompletedTasks(updatedCompletedTasks);
    saveCompletedTasks(updatedCompletedTasks);
    
    // Also update the tasks array to reflect completion
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: true }
          : task
      )
    );
  };

  // Handle submit annotation
  const handleSubmit = async () => {
    const currentTask = tasks[currentIndex];
    
    if (taskType === TASK_TYPES.TEXT_SENTIMENT) {
      if (!currentTask || !currentTask.selectedSentiment) {
        Alert.alert('Error', 'Please select a sentiment before submitting');
        return;
      }
      
      setSubmitting(true);
      try {
        await submitAnnotation(currentTask.id, currentTask.selectedSentiment, TASK_TYPES.TEXT_SENTIMENT);
        Alert.alert('Success', 'Sentiment annotation submitted successfully');
        
        // Mark task as completed
        markTaskAsCompleted(currentTask.id);
        
        // Move to next incomplete task after successful submission
        const nextIncompleteIndex = tasks.findIndex((task, index) => 
          index > currentIndex && !task.completed
        );
        
        if (nextIncompleteIndex >= 0) {
          setCurrentIndex(nextIncompleteIndex);
        } else if (currentIndex < tasks.length - 1) {
          goToNextTask(); // Just go to next task if no incomplete tasks found
        } else {
          Alert.alert('Complete', 'You have completed all text sentiment tasks!');
        }
      } catch (error) {
        Alert.alert('Error', `Failed to submit annotation: ${error.message}`);
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!currentTask || !currentTask.selectedAnimal) {
        Alert.alert('Error', 'Please select an animal type before submitting');
        return;
      }
      
      setSubmitting(true);
      try {
        await submitAnnotation(currentTask.id, currentTask.selectedAnimal, TASK_TYPES.IMAGE_CLASSIFICATION);
        Alert.alert('Success', 'Image classification submitted successfully');
        
        // Mark task as completed
        markTaskAsCompleted(currentTask.id);
        
        // Move to next incomplete task after successful submission
        const nextIncompleteIndex = tasks.findIndex((task, index) => 
          index > currentIndex && !task.completed
        );
        
        if (nextIncompleteIndex >= 0) {
          setCurrentIndex(nextIncompleteIndex);
        } else if (currentIndex < tasks.length - 1) {
          goToNextTask(); // Just go to next task if no incomplete tasks found
        } else {
          Alert.alert('Complete', 'You have completed all image classification tasks!');
        }
      } catch (error) {
        Alert.alert('Error', `Failed to submit annotation: ${error.message}`);
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Render current task based on task type
  const renderCurrentTask = () => {
    if (!tasks.length) return null;
    
    const item = tasks[currentIndex];
    
    return (
      <Animated.View 
        style={[
          styles.taskCard,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskId}>Task #{item.id}</Text>
          <View style={styles.taskStatusContainer}>
            {item.completed && (
              <Text style={styles.completedBadge}>✓ Completed</Text>
            )}
            <Text style={styles.taskProgress}>{currentIndex + 1} of {tasks.length}</Text>
          </View>
        </View>
        
        {taskType === TASK_TYPES.TEXT_SENTIMENT ? (
          // Text Sentiment Task
          <>
            <View style={styles.contentContainer}>
              <Text style={styles.textLabel}>Review:</Text>
              <Text style={styles.taskContent}>{item.data?.text || 'N/A'}</Text>
            </View>
            
            <View style={styles.labelingContainer}>
              <Text style={styles.labelingTitle}>Select Sentiment:</Text>
              
              <View style={styles.sentimentButtons}>
                <TouchableOpacity 
                  style={[styles.sentimentButton, 
                    styles.positiveButton, 
                    item.selectedSentiment === 'Positive' && styles.selectedButton]}
                  onPress={() => handleSentimentSelect(item.id, 'Positive')}
                >
                  <Text style={styles.sentimentButtonText}>Positive</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.sentimentButton, 
                    styles.neutralButton, 
                    item.selectedSentiment === 'Neutral' && styles.selectedButton]}
                  onPress={() => handleSentimentSelect(item.id, 'Neutral')}
                >
                  <Text style={styles.sentimentButtonText}>Neutral</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.sentimentButton, 
                    styles.negativeButton, 
                    item.selectedSentiment === 'Negative' && styles.selectedButton]}
                  onPress={() => handleSentimentSelect(item.id, 'Negative')}
                >
                  <Text style={styles.sentimentButtonText}>Negative</Text>
                </TouchableOpacity>
              </View>
              
              {item.selectedSentiment && (
                <Text style={styles.selectionConfirmation}>
                  Selected: <Text style={styles.selectedValue}>{item.selectedSentiment}</Text>
                </Text>
              )}
              
              <TouchableOpacity 
                style={[styles.submitButton, !item.selectedSentiment && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!item.selectedSentiment || submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Annotation'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Image Classification Task
          <>
            <View style={styles.imageContainer}>
              {/* Debug: Log image URL */}
              {console.log('TaskScreen: Rendering image with URL:', item.data?.image)}
              
              {item.data?.image ? (
                <>
                  <Image 
                    source={{ uri: item.data.image }} 
                    style={styles.image}
                    resizeMode="contain"
                    onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
                  />
                  <Text style={styles.imageDebug}>URL: {item.data.image}</Text>
                </>
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Text style={styles.imagePlaceholderText}>No image available</Text>
                </View>
              )}
              {item.data?.title && (
                <Text style={styles.imageTitle}>{item.data.title}</Text>
              )}
            </View>
            
            <View style={styles.labelingContainer}>
              <Text style={styles.labelingTitle}>Select Animal Type:</Text>
              
              <View style={styles.animalButtonsContainer}>
                {ANIMAL_TYPES.map((animal) => (
                  <TouchableOpacity 
                    key={animal}
                    style={[
                      styles.animalButton, 
                      item.selectedAnimal === animal && styles.selectedButton
                    ]}
                    onPress={() => handleAnimalSelect(item.id, animal)}
                  >
                    <Text style={[
                      styles.animalButtonText,
                      item.selectedAnimal === animal && styles.selectedButtonText
                    ]}>
                      {animal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {item.selectedAnimal && (
                <Text style={styles.selectionConfirmation}>
                  Selected: <Text style={styles.selectedValue}>{item.selectedAnimal}</Text>
                </Text>
              )}
              
              <TouchableOpacity 
                style={[styles.submitButton, !item.selectedAnimal && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!item.selectedAnimal || submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Annotation'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPrevTask}
            disabled={currentIndex === 0}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, currentIndex === tasks.length - 1 && styles.navButtonDisabled]}
            onPress={goToNextTask}
            disabled={currentIndex === tasks.length - 1}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No tasks available</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadTasks}>
        <Text style={styles.retryButtonText}>Reload Tasks</Text>
      </TouchableOpacity>
    </View>
  );

  // Render error component
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadTasks}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Label AI Tasks</Text>
        
        <View style={styles.taskTypeSelector}>
          <TouchableOpacity 
            style={[
              styles.taskTypeButton,
              taskType === TASK_TYPES.TEXT_SENTIMENT && styles.activeTaskTypeButton
            ]}
            onPress={() => setTaskType(TASK_TYPES.TEXT_SENTIMENT)}
          >
            <Text style={[
              styles.taskTypeButtonText,
              taskType === TASK_TYPES.TEXT_SENTIMENT && styles.activeTaskTypeButtonText
            ]}>Text Sentiment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.taskTypeButton,
              taskType === TASK_TYPES.IMAGE_CLASSIFICATION && styles.activeTaskTypeButton
            ]}
            onPress={() => setTaskType(TASK_TYPES.IMAGE_CLASSIFICATION)}
          >
            <Text style={[
              styles.taskTypeButtonText,
              taskType === TASK_TYPES.IMAGE_CLASSIFICATION && styles.activeTaskTypeButtonText
            ]}>Image Classification</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : tasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.taskContainer}>
          {renderCurrentTask()}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  taskTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  taskTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  activeTaskTypeButton: {
    backgroundColor: '#e6f2ff',
    borderColor: '#0066cc',
  },
  taskTypeButtonText: {
    fontWeight: '500',
    color: '#666666',
  },
  activeTaskTypeButtonText: {
    fontWeight: 'bold',
    color: '#0066cc',
  },
  taskContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: width - 32,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  taskProgress: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  contentContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 8,
  },
  taskContent: {
    fontSize: 18,
    color: '#333333',
    lineHeight: 26,
  },
  labelingContainer: {
    marginTop: 8,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#999999',
    fontSize: 16,
  },
  imageTitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  imageDebug: {
    marginTop: 4,
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
  },
  labelingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  sentimentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  animalButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  animalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 5,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  animalButtonText: {
    fontWeight: '500',
    color: '#333333',
  },
  selectedButtonText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  sentimentButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  positiveButton: {
    backgroundColor: '#e6f7e6',
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  neutralButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#d6d8db',
  },
  negativeButton: {
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: '#0066cc',
    transform: [{ scale: 1.05 }],
  },
  sentimentButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectionConfirmation: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    color: '#666666',
  },
  selectedValue: {
    fontWeight: 'bold',
    color: '#0066cc',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontWeight: '500',
    color: '#333333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default TaskScreen;
