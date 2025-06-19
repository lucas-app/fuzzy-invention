import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LabelStudioService from '../../../services/LabelStudioService';
import { useWalletStore } from '../../../store/walletStore';
import { useAuthStore } from '../../../store/authStore';
import { taskValue } from '../../../constants/RewardValues';

const { width } = Dimensions.get('window');

interface RLHFTask {
  id: number;
  data: {
    prompt: string;
    answer1: string;
    answer2: string;
  };
  created_at: string;
  is_labeled?: boolean;
}

export default function RLHFTasksScreen() {
  const [tasks, setTasks] = useState<RLHFTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'answer1' | 'answer2' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  
  // Add wallet and auth stores
  const { user } = useAuthStore();
  const { addReward } = useWalletStore();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const fetchedTasks = await LabelStudioService.fetchTasks('RLHF');
      console.log('Fetched RLHF tasks:', fetchedTasks);
      // Transform the tasks to match RLHF format
      const transformedTasks: RLHFTask[] = fetchedTasks.map((task: any) => ({
        id: task.id,
        data: {
          prompt: task.data.prompt || '',
          answer1: task.data.answer1 || '',
          answer2: task.data.answer2 || ''
        },
        created_at: task.created_at,
        is_labeled: task.is_labeled
      }));
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching RLHF tasks:', error);
      Alert.alert('Error', 'Could not load RLHF tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: 'answer1' | 'answer2') => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      Alert.alert('Error', 'Please select an answer before submitting.');
      return;
    }

    const currentTask = tasks[currentTaskIndex];
    if (!currentTask) return;

    // Check if this task was already completed
    if (completedTasks.has(currentTask.id)) {
      Alert.alert('Task Already Completed', 'You have already completed this task and received your reward.', [
        {
          text: 'Next Task',
          onPress: () => {
            setSelectedAnswer(null);
            if (currentTaskIndex < tasks.length - 1) {
              setCurrentTaskIndex(currentTaskIndex + 1);
            } else {
              Alert.alert('Complete!', 'You have completed all RLHF tasks. Thank you!');
            }
          }
        }
      ]);
      return;
    }

    setIsSubmitting(true);
    try {
      const annotation = {
        result: [
          {
            from_name: 'comparison',
            to_name: 'answer1,answer2',
            type: 'pairwise',
            value: {
              selected: selectedAnswer === 'answer1' ? 'answer1' : 'answer2'
            }
          }
        ]
      };

      console.log('Submitting RLHF annotation:', annotation);
      await LabelStudioService.submitAnnotation(currentTask.id, annotation, 'RLHF');
      
      // Mark task as completed
      setCompletedTasks(prev => new Set([...prev, currentTask.id]));
      
      // Add reward to wallet after successful submission
      if (user?.id) {
        const rewardAmount = taskValue.rlhf; // Get reward amount from constants
        const description = 'RLHF: AI preference collection task';
        
        console.log(`Adding reward of $${rewardAmount} for RLHF task ${currentTask.id}`);
        console.log('User ID:', user.id);
        
        try {
          const success = await addReward(user.id, rewardAmount, description);
          
          if (success) {
            console.log(`Successfully added $${rewardAmount} reward to wallet`);
            Alert.alert(
              'Task Completed! 🎉', 
              `Your preference has been recorded and you've earned $${rewardAmount.toFixed(2)} USDC!`,
              [
                {
                  text: 'Next Task',
                  onPress: () => {
                    setSelectedAnswer(null);
                    if (currentTaskIndex < tasks.length - 1) {
                      setCurrentTaskIndex(currentTaskIndex + 1);
                    } else {
                      Alert.alert('Complete!', 'You have completed all RLHF tasks. Thank you!');
                    }
                  }
                }
              ]
            );
          } else {
            console.error('Failed to add reward to wallet');
            Alert.alert(
              'Task Completed! 🎉', 
              `Your preference has been recorded and you've earned $${rewardAmount.toFixed(2)} USDC! (Wallet update pending)`,
              [
                {
                  text: 'Next Task',
                  onPress: () => {
                    setSelectedAnswer(null);
                    if (currentTaskIndex < tasks.length - 1) {
                      setCurrentTaskIndex(currentTaskIndex + 1);
                    } else {
                      Alert.alert('Complete!', 'You have completed all RLHF tasks. Thank you!');
                    }
                  }
                }
              ]
            );
          }
        } catch (rewardError) {
          console.error('Error adding reward to wallet:', rewardError);
          Alert.alert(
            'Task Completed! 🎉', 
            `Your preference has been recorded and you've earned $${rewardAmount.toFixed(2)} USDC! (Wallet update pending)`,
            [
              {
                text: 'Next Task',
                onPress: () => {
                  setSelectedAnswer(null);
                  if (currentTaskIndex < tasks.length - 1) {
                    setCurrentTaskIndex(currentTaskIndex + 1);
                  } else {
                    Alert.alert('Complete!', 'You have completed all RLHF tasks. Thank you!');
                  }
                }
              }
            ]
          );
        }
      } else {
        console.warn('No user ID available for adding reward');
        console.log('User object:', user);
        Alert.alert(
          'Task Completed! 🎉', 
          `Your preference has been recorded! Please check your wallet for rewards.`,
          [
            {
              text: 'Next Task',
              onPress: () => {
                setSelectedAnswer(null);
                if (currentTaskIndex < tasks.length - 1) {
                  setCurrentTaskIndex(currentTaskIndex + 1);
                } else {
                  Alert.alert('Complete!', 'You have completed all RLHF tasks. Thank you!');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting RLHF annotation:', error);
      Alert.alert('Error', 'Failed to submit your preference. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      setSelectedAnswer(null);
    } else {
      Alert.alert('Complete!', 'You have completed all RLHF tasks.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading RLHF tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#999" />
          <Text style={styles.emptyTitle}>No RLHF Tasks Available</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new human preference collection tasks.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentTask = tasks[currentTaskIndex];
  if (!currentTask) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Task {currentTaskIndex + 1} of {tasks.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentTaskIndex + 1) / tasks.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Human Preference Collection</Text>
          <Text style={styles.instructionsText}>
            Read the prompt and compare the two AI responses. Select the response you think is better based on:
          </Text>
          <View style={styles.criteriaList}>
            <Text style={styles.criteriaItem}>• Clarity and helpfulness</Text>
            <Text style={styles.criteriaItem}>• Accuracy and relevance</Text>
            <Text style={styles.criteriaItem}>• Natural and engaging tone</Text>
          </View>
          
          {/* Reward Display */}
          <View style={styles.rewardContainer}>
            <Ionicons name="cash-outline" size={20} color="#10B981" />
            <Text style={styles.rewardText}>
              Earn ${taskValue.rlhf.toFixed(2)} USDC for this task
            </Text>
          </View>
          
          {/* Completion Status */}
          {completedTasks.has(currentTask.id) && (
            <View style={styles.completionContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.completionText}>
                Task completed - Reward earned!
              </Text>
            </View>
          )}
        </View>

        {/* Prompt */}
        <View style={styles.promptContainer}>
          <Text style={styles.promptLabel}>PROMPT:</Text>
          <Text style={styles.promptText}>{currentTask.data.prompt}</Text>
        </View>

        {/* Answer Options */}
        <View style={styles.answersContainer}>
          <Text style={styles.answersLabel}>AI RESPONSES:</Text>
          
          {/* Answer 1 */}
          <TouchableOpacity
            style={[
              styles.answerCard,
              selectedAnswer === 'answer1' && styles.selectedAnswer
            ]}
            onPress={() => handleAnswerSelect('answer1')}
            activeOpacity={0.8}
          >
            <View style={styles.answerHeader}>
              <Text style={styles.answerLabel}>Response A</Text>
              {selectedAnswer === 'answer1' && (
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
              )}
            </View>
            <Text style={styles.answerText}>{currentTask.data.answer1}</Text>
          </TouchableOpacity>

          {/* Answer 2 */}
          <TouchableOpacity
            style={[
              styles.answerCard,
              selectedAnswer === 'answer2' && styles.selectedAnswer
            ]}
            onPress={() => handleAnswerSelect('answer2')}
            activeOpacity={0.8}
          >
            <View style={styles.answerHeader}>
              <Text style={styles.answerLabel}>Response B</Text>
              {selectedAnswer === 'answer2' && (
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
              )}
            </View>
            <Text style={styles.answerText}>{currentTask.data.answer2}</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedAnswer || isSubmitting || completedTasks.has(currentTask.id)) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!selectedAnswer || isSubmitting || completedTasks.has(currentTask.id)}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : completedTasks.has(currentTask.id) ? (
              <Text style={styles.submitButtonText}>Completed ✓</Text>
            ) : (
              <Text style={styles.submitButtonText}>Submit Preference</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e1e5e9',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  instructionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
  },
  criteriaList: {
    marginLeft: 8,
  },
  criteriaItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  promptContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  answersContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  answersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  answerCard: {
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  selectedAnswer: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  answerText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  completionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  completionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
}); 