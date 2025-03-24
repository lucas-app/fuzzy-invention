/**
 * ImageClassificationScreen.js
 * Screen component to display image classification tasks from Label Studio
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
} from 'react-native';
import { fetchTasks, submitAnnotation } from '../services/LabelStudioService';

const { width, height } = Dimensions.get('window');

// Animal classification options
const ANIMAL_TYPES = [
  'Dog', 'Cat', 'Bird', 'Fish', 'Panda', 
  'Turtle', 'Lion', 'Wolf', 'Fox', 'Koala', 'Other'
];

const ImageClassificationScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Function to load tasks
  const loadTasks = useCallback(async () => {
    try {
      console.log('ImageClassificationScreen: Loading image classification tasks...');
      setError(null);

      const tasksData = await fetchTasks('IMAGE_CLASSIFICATION');
      console.log('ImageClassificationScreen: Fetched Tasks:', tasksData);

      if (!tasksData || tasksData.length === 0) {
        setError('No image classification tasks available');
      } else {
        setTasks(tasksData);
        setCurrentIndex(0); // Reset to first task
        console.log(`ImageClassificationScreen: ${tasksData.length} tasks loaded successfully`);
      }
    } catch (err) {
      console.error(`ImageClassificationScreen: Error loading tasks - ${err.message}`);
      setError(`Failed to load tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);
  
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
  
  // Handle animal type selection
  const handleAnimalSelect = (taskId, animalType) => {
    console.log(`Selected ${animalType} for task #${taskId}`);
    
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, selectedAnimal: animalType }
          : task
      )
    );
  };
  
  // Handle submit annotation
  const handleSubmit = async () => {
    const currentTask = tasks[currentIndex];
    if (!currentTask || !currentTask.selectedAnimal) {
      Alert.alert('Error', 'Please select an animal type before submitting');
      return;
    }
    
    setSubmitting(true);
    try {
      await submitAnnotation(currentTask.id, currentTask.selectedAnimal, 'IMAGE_CLASSIFICATION');
      Alert.alert('Success', 'Annotation submitted successfully');
      // Move to next task after successful submission
      if (currentIndex < tasks.length - 1) {
        goToNextTask();
      } else {
        Alert.alert('Complete', 'You have completed all tasks!');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to submit annotation: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Render current task
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
          <Text style={styles.taskProgress}>{currentIndex + 1} of {tasks.length}</Text>
        </View>
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.data?.image }} 
            style={styles.image}
            resizeMode="contain"
          />
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
      <Text style={styles.emptyText}>No image classification tasks available</Text>
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
        <Text style={styles.headerTitle}>Animal Classification</Text>
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
    maxHeight: height * 0.85,
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
  imageTitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  labelingContainer: {
    marginTop: 8,
  },
  labelingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
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
  selectedButton: {
    backgroundColor: '#e6f2ff',
    borderColor: '#0066cc',
    borderWidth: 2,
  },
  animalButtonText: {
    fontWeight: '500',
    color: '#333333',
  },
  selectedButtonText: {
    color: '#0066cc',
    fontWeight: 'bold',
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
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default ImageClassificationScreen;
