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
import LabelStudioService from '../../../services/LabelStudioService';
import { TaskValidationService } from '../../../services/TaskValidationService';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  withSpring 
} from 'react-native-reanimated';
import { useWalletStore } from '../../../store/walletStore';
import { supabase } from '../../../lib/supabase';

// Storage keys
const COMPLETED_TASKS_KEY = 'COMPLETED_TASKS';
const PROGRESS_STORAGE_KEY = 'TASK_PROGRESS';

interface Task {
  id: number;
  data: {
    audio?: string;
    text?: string;
    image?: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      value: string;
    }>;
  };
  created_at: string;
  is_labeled?: boolean;
}

interface TaskProgress {
  taskId: number;
  selectedOption: string | null;
  timestamp: number;
}

interface BaseTaskScreenProps {
  renderTaskContent: (task: Task) => React.ReactNode;
  renderOptions: (task: Task | null, selectedOption: string | null, onSelect: (option: string) => void) => React.ReactNode;
  formatAnnotation: (task: Task | null, option: string) => any;
  taskTitle?: string;
  themeColor?: string;
}

const BaseTaskScreen: React.FC<BaseTaskScreenProps> = ({ 
  renderTaskContent, 
  renderOptions, 
  formatAnnotation,
  taskTitle = 'Task',
  themeColor = '#3b82f6'
}) => {
  const router = useRouter();
  const { projectType } = useLocalSearchParams();
  
  // State variables
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
  const [taskStartTime, setTaskStartTime] = useState<number>(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  
  // Gesture animation values
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const swipeHintOpacity = useSharedValue(0);

  // Function to handle navigation back
  const handleGoBack = () => {
    router.back();
  };
  
  // Function to clear all cached data
  const clearAllCache = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Clear Cache',
        'This will clear all cached tasks and progress. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Clear Cache',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              console.log('Clearing all cached data...');
              
              // Clear all relevant AsyncStorage keys
              const keysToRemove = [
                COMPLETED_TASKS_KEY,
                PROGRESS_STORAGE_KEY,
                'CACHED_IMAGE_TASKS',
                'CACHED_AUDIO_TASKS',
                'CACHED_TEXT_TASKS',
                'CACHED_GEOSPATIAL_TASKS',
                'CACHED_SURVEY_TASKS',
                'EARNED_AMOUNT'
              ];
              
              try {
                await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
                console.log('Successfully cleared cache');
                
                // Reset state
                setCompletedTasks({});
                setSelectedOption(null);
                setTaskProgress(null);
                setEarnings(0);
                
                // Reload tasks with force refresh
                loadTasks(true);
              } catch (error) {
                console.error('Error clearing cache:', error);
                Alert.alert('Error', 'Failed to clear cache. Please try again.');
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in clearAllCache:', error);
    }
  };
  
  // Show swipe hint when component mounts
  useEffect(() => {
    // Show swipe hint after a delay
    setTimeout(() => {
      swipeHintOpacity.value = withTiming(1, { duration: 500 });
      setShowSwipeHint(true);
      
      // Hide swipe hint after a few seconds
      setTimeout(() => {
        swipeHintOpacity.value = withTiming(0, { duration: 500 });
        setTimeout(() => setShowSwipeHint(false), 500);
      }, 2500);
    }, 1000);
  }, []);
  
  // Swipe right gesture to go back
  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX > 0) { // Only handle right swipe
        translateX.value = e.translationX;
        // Calculate opacity based on swipe distance (max 100 points)
        opacity.value = Math.max(1 - (e.translationX / 250), 0.3);
      }
    })
    .onEnd((e) => {
      if (e.translationX > 120) { // If swipe is more than threshold
        // Complete the animation and go back
        translateX.value = withTiming(500, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(handleGoBack)();
        });
      } else {
        // Reset if swipe not far enough
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });
    
  // Animated styles for swipe effect
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));
  
  // Animated styles for swipe hint
  const swipeHintStyles = useAnimatedStyle(() => ({
    opacity: swipeHintOpacity.value,
  }));

  // Load tasks and progress on mount
  useEffect(() => {
    loadTasks();
  }, [projectType]);

  // Load task progress when tasks are loaded
  useEffect(() => {
    if (tasks.length > 0) {
      loadTaskProgress();
    }
  }, [tasks]);

  // Load tasks from Label Studio API
  const loadTasks = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Force refresh for IMAGE_CLASSIFICATION to get updated project ID
      if (projectType === 'IMAGE_CLASSIFICATION' && !forceRefresh) {
        console.log('BaseTaskScreen: Forcing refresh for IMAGE_CLASSIFICATION');
        forceRefresh = true;
      }
      
      // Load completed tasks first
      const storedCompletedTasks = await AsyncStorage.getItem(COMPLETED_TASKS_KEY);
      let parsedCompletedTasks: Record<number, boolean> = {};
      
      if (storedCompletedTasks) {
        parsedCompletedTasks = JSON.parse(storedCompletedTasks);
        setCompletedTasks(parsedCompletedTasks);
        console.log(`BaseTaskScreen: Loaded ${Object.keys(parsedCompletedTasks).length} completed tasks from storage`);
      }
      
      // Fetch tasks from Label Studio API with better logging
      if (projectType && typeof projectType === 'string') {
        console.log(`BaseTaskScreen: Fetching ${projectType} tasks, force refresh: ${forceRefresh}`);
        
        try {
          const fetchedTasks = await LabelStudioService.fetchTasks(projectType, 3, forceRefresh);
          
          console.log(`BaseTaskScreen: Received ${fetchedTasks?.length || 0} tasks`);
          
          if (fetchedTasks && fetchedTasks.length > 0) {
            // Log each task ID for debugging
            fetchedTasks.forEach((task: Task) => {
              console.log(`BaseTaskScreen: Task ID ${task.id}, labeled=${!!task.is_labeled}, completed=${!!parsedCompletedTasks[task.id]}`);
            });
            
            // TEMPORARY CHANGE: Only filter out tasks that WE marked as completed
            const availableTasks = fetchedTasks.filter(
              (task: Task) => !parsedCompletedTasks[task.id]
            );
            
            console.log(`BaseTaskScreen: ${availableTasks.length} available tasks after filtering completed tasks`);
            
            if (availableTasks.length === 0 && fetchedTasks.length > 0) {
              // All tasks are completed, show alert with option to reset
              Alert.alert(
                'All Tasks Completed',
                'You have completed all available tasks for this category. Would you like to reset and see them again?',
                [
                  {
                    text: 'No, keep completed',
                    style: 'cancel'
                  },
                  {
                    text: 'Reset Tasks',
                    onPress: async () => {
                      await AsyncStorage.removeItem(COMPLETED_TASKS_KEY);
                      setCompletedTasks({});
                      loadTasks(true);
                    }
                  }
                ]
              );
            }
            
            setTasks(availableTasks);
          } else {
            // No tasks available
            console.log(`BaseTaskScreen: No tasks available for ${projectType}`);
            setTasks([]);
          }
        } catch (fetchError) {
          console.error('Error fetching tasks:', fetchError);
          
          // Try to load from cache if available as a fallback
          try {
            const storageKey = projectType === 'IMAGE_CLASSIFICATION' ? 'CACHED_IMAGE_TASKS' : 
                              projectType === 'AUDIO_CLASSIFICATION' ? 'CACHED_AUDIO_TASKS' : 
                              projectType === 'TEXT_SENTIMENT' ? 'CACHED_TEXT_TASKS' : null;
                              
            if (storageKey) {
              const cachedTasksJson = await AsyncStorage.getItem(storageKey);
              if (cachedTasksJson) {
                const cachedTasks = JSON.parse(cachedTasksJson);
                console.log(`BaseTaskScreen: Using cached tasks from ${storageKey}, count: ${cachedTasks.length}`);
                
                // Filter out completed tasks
                const availableTasks = cachedTasks.filter(
                  (task: Task) => !parsedCompletedTasks[task.id]
                );
                
                if (availableTasks.length > 0) {
                  setTasks(availableTasks);
                  return; // Exit early if we have cached tasks
                }
              }
            }
            
            // If we get here, no cached tasks were available
            Alert.alert(
              'Connection Error', 
              'Failed to connect to Label Studio. Check your internet connection and try again.',
              [
                {
                  text: 'Go Back',
                  onPress: () => router.back(),
                  style: 'cancel'
                },
                {
                  text: 'Try Again',
                  onPress: () => loadTasks(true)
                }
              ]
            );
          } catch (cacheError) {
            console.error('Error loading from cache:', cacheError);
            Alert.alert('Error', 'Failed to load tasks. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load saved task progress
  const loadTaskProgress = async () => {
    try {
      const progressData = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      if (progressData) {
        const progress = JSON.parse(progressData);
        if (progress && progress.taskId) {
          setTaskProgress(progress);
          // Find the task index for the saved progress
          const taskIndex = tasks.findIndex(task => task.id === progress.taskId);
          if (taskIndex !== -1) {
            setCurrentTaskIndex(taskIndex);
            setSelectedOption(progress.selectedOption);
          }
        }
      }
    } catch (error) {
      console.error('Error loading task progress:', error);
    }
  };

  // Save task progress
  const saveTaskProgress = async () => {
    if (tasks[currentTaskIndex] && selectedOption) {
      const progress: TaskProgress = {
        taskId: tasks[currentTaskIndex].id,
        selectedOption,
        timestamp: Date.now()
      };
      try {
        await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
        setTaskProgress(progress);
      } catch (error) {
        console.error('Error saving task progress:', error);
      }
    }
  };

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    saveTaskProgress();
  };

  // Handle submission of task annotation
  const handleSubmit = async () => {
    if (!selectedOption || submitting || !tasks[currentTaskIndex]) return;
    
    try {
      console.log(`BaseTaskScreen: Submitting task ${tasks[currentTaskIndex].id} with option ${selectedOption}`);
      setSubmitting(true);
      
      // Format the annotation using the function provided by the child component
      const annotation = formatAnnotation(tasks[currentTaskIndex], selectedOption);
      console.log(`BaseTaskScreen: Formatted annotation:`, JSON.stringify(annotation));
      
      // Submit the annotation to Label Studio
      await LabelStudioService.submitAnnotation(tasks[currentTaskIndex].id, annotation, projectType as string);
      
      // Mark task as completed
      const updatedCompletedTasks = {
        ...completedTasks,
        [tasks[currentTaskIndex].id]: true
      };
      setCompletedTasks(updatedCompletedTasks);
      
      // Save completed tasks to AsyncStorage
      try {
        await AsyncStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(updatedCompletedTasks));
      } catch (storageError) {
        console.error('Error saving completed tasks:', storageError);
      }
      
      // Clear selected option
      setSelectedOption(null);
      
      // Update earnings (each task = $0.25)
      const newEarnings = earnings + 0.25;
      setEarnings(newEarnings);
      
      // Save earned amount to AsyncStorage
      try {
        await AsyncStorage.setItem('EARNED_AMOUNT', newEarnings.toString());
      } catch (storageError) {
        console.error('Error saving earnings:', storageError);
      }
      
      // Award the user with wallet credit
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          // Use the addReward function from the WalletStore to add funds to the user's wallet
          const walletStore = useWalletStore.getState();
          
          // Task type-specific reward description
          let description = 'Task completion reward';
          if (projectType === 'IMAGE_CLASSIFICATION') {
            description = 'Image Classification task';
          } else if (projectType === 'AUDIO_CLASSIFICATION') {
            description = 'Audio Classification task';
          } else if (projectType === 'TEXT_SENTIMENT') {
            description = 'Text Analysis task';
          } else if (projectType === 'GEOSPATIAL_LABELING') {
            description = 'Web3 task completion';
          } else if (projectType === 'SURVEY') {
            description = 'Survey completion';
          }
          
          // The reward amount (0.25 USDC per task)
          const rewardAmount = 0.25;
          
          console.log(`Adding reward of ${rewardAmount} USDC to wallet for user ${session.user.id}`);
          
          // Add reward directly using the new wallet implementation
          const success = await walletStore.addReward(session.user.id, rewardAmount, description);
          
          if (success) {
            console.log('Successfully added reward to wallet');
          } else {
            console.error('Failed to add reward to wallet');
          }
        } else {
          console.warn('No authenticated user, cannot add reward to wallet');
        }
      } catch (walletError) {
        console.error('Error adding to wallet:', walletError);
        // Continue with the task completion flow even if wallet update fails
      }
      
      // Show success message
      Alert.alert(
        'Task Completed!',
        'Your answer has been submitted successfully.',
        [{ text: 'OK' }]
      );
      
      // Move to next task or show completed message
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
      } else {
        Alert.alert(
          'All Tasks Completed!',
          'You have completed all available tasks in this category.',
          [
            {
              text: 'Go Back',
              onPress: () => router.back(),
              style: 'cancel'
            },
            {
              text: 'Reset Tasks',
              onPress: async () => {
                await AsyncStorage.removeItem(COMPLETED_TASKS_KEY);
                setCompletedTasks({});
                loadTasks(true);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting annotation:', error);
      Alert.alert(
        'Submission Error',
        'There was an error submitting your answer. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Set task start time when task changes
  useEffect(() => {
    setTaskStartTime(Date.now());
  }, [currentTaskIndex]);

  if (loading) {
    return (
      <GestureHandlerRootView style={styles.container}>
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
          <GestureDetector gesture={swipeGesture}>
            <Animated.View style={[styles.container, animatedStyles]}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColor} />
                <Text style={styles.loadingText}>Loading tasks...</Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (tasks.length === 0) {
    return (
      <GestureHandlerRootView style={styles.container}>
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
          <GestureDetector gesture={swipeGesture}>
            <Animated.View style={[styles.container, animatedStyles]}>
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-circle" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No tasks available at the moment.</Text>
                <Text style={styles.emptySubtext}>Check back later for new tasks!</Text>
                <TouchableOpacity 
                  style={[styles.refreshButton, { backgroundColor: themeColor }]}
                  onPress={() => loadTasks(true)}
                >
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </GestureDetector>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  const currentTask = tasks[currentTaskIndex];

  return (
    <GestureHandlerRootView style={styles.container}>
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
            headerRight: () => (
              <TouchableOpacity 
                onPress={clearAllCache}
                style={styles.debugButton}
              >
                <Ionicons name="refresh-circle" size={24} color="#fff" />
              </TouchableOpacity>
            ),
          }}
        />
        
        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={[styles.container, animatedStyles]}>
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
            
            {/* Swipe hint indicator */}
            <View style={styles.swipeHintContainer}>
              <View style={styles.swipeHintIndicator} />
            </View>
            
            {/* Swipe hint tooltip */}
            {showSwipeHint && (
              <Animated.View style={[styles.swipeHintTooltip, swipeHintStyles]}>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
                <Text style={styles.swipeHintText}>Swipe right to go back</Text>
              </Animated.View>
            )}
          </Animated.View>
        </GestureDetector>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  swipeHintContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  swipeHintIndicator: {
    width: 4,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
  },
  swipeHintTooltip: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  swipeHintText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  debugButton: {
    marginRight: 10,
    padding: 5,
  },
});

export default BaseTaskScreen;
