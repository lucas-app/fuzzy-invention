import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, Platform, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { TASKS, TASK_ANSWERS, WEB3_TASKS } from '../../../data/tasks';
import TaskGuidelines from '../../../components/TaskGuidelines';
import TaskFeedback from '../../../components/TaskFeedback';
import { useTaskStore } from '../../../store/taskStore';
import RewardAnimation from '../../../components/RewardAnimation';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Web3 Task component
function Web3Task({
  task,
  onComplete
}: {
  task: any;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleNext = () => {
    if (task.steps[currentStep].validation) {
      if (!value) {
        setError('This field is required');
        return;
      }
      
      if (!task.steps[currentStep].validation(value)) {
        setError(task.steps[currentStep].errorMessage || 'Invalid input');
        return;
      }
    }
    
    if (currentStep < task.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setValue('');
      setError(null);
    } else {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        onComplete();
      }, 1500);
    }
  };
  
  const step = task.steps[currentStep];
  
  // Get task-specific colors based on task ID
  const getTaskColors = () => {
    // Default colors - teal like Image Classification card
    let startColor = '#37D2A0';
    let endColor = '#10B386';
    
    // Could add different color schemes based on task.id
    if (task.id === 'web3-bridge') {
      startColor = '#49A0FF';
      endColor = '#3B82F6';
    } else if (task.id === 'web3-swap') {
      startColor = '#FF7E58'; // Orange from Text Analysis
      endColor = '#FF5630';
    }
    
    return [startColor, endColor];
  };
  
  return (
    <View style={styles.web3Container}>
      <Animated.View entering={FadeInDown.duration(600)} style={{width: '100%'}}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentStep + 1) / task.steps.length * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.stepCount}>
          Step {currentStep + 1} of {task.steps.length}
        </Text>
        
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
          
          {step.inputType && (
            <Animated.View entering={FadeIn.delay(200)} style={styles.inputContainer}>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder={step.placeholder || 'Enter value...'}
                value={value}
                onChangeText={setValue}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </Animated.View>
          )}
          
          <LinearGradient
            colors={getTaskColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButton}
          >
            <Pressable
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
              onPress={handleNext}
            >
              <Animated.Text style={styles.nextButtonText}>
                {currentStep === task.steps.length - 1 ? 'Complete' : 'Next'}
              </Animated.Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Animated.View>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF7E58" />
          <Text style={{ marginTop: 12, color: '#555', fontWeight: '500' }}>Processing your request...</Text>
        </View>
      )}
    </View>
  );
}

export default function TaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<any>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    reward?: number;
  } | null>(null);
  const [showReward, setShowReward] = useState(false);
  const { submitTask, completedTasks, isLoading } = useTaskStore();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Find the task (web3 tasks only in this handler)
    const foundTask = WEB3_TASKS[id as keyof typeof WEB3_TASKS];

    if (!foundTask || completedTasks.includes(id as string)) {
      router.replace('/tasks');
      return;
    }

    setTask(foundTask);
  }, [id, completedTasks]);

  if (!task) return null;

  // Get task-specific colors based on task ID for the header
  const getTaskHeaderColors = () => {
    // Default colors - teal like Image Classification card
    let headerBgStart = 'rgba(55, 210, 160, 0.2)';
    let headerBgEnd = 'rgba(16, 179, 134, 0.1)';
    
    // Could add different color schemes based on task.id
    if (task.id === 'web3-bridge') {
      headerBgStart = 'rgba(73, 160, 255, 0.2)';
      headerBgEnd = 'rgba(59, 130, 246, 0.1)';
    } else if (task.id === 'web3-swap') {
      headerBgStart = 'rgba(255, 126, 88, 0.2)';
      headerBgEnd = 'rgba(255, 86, 48, 0.1)';
    }
    
    return [headerBgStart, headerBgEnd];
  };

  const handleWeb3Complete = async () => {
    try {
      const reward = parseFloat(task.reward || '10');
      await submitTask(id as string, 'completed', reward);
      
      setFeedback({
        isCorrect: true,
        explanation: 'Task completed successfully! Your reward will be processed shortly.',
        reward: reward
      });

      // Show success animation
      setShowReward(true);
      setTimeout(() => {
        router.replace('/tasks');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit web3 task:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getTaskHeaderColors()}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 180,
        }}
      />
      <Animated.View 
        entering={FadeInDown.duration(600)}
        style={styles.header}
      >
        <Pressable 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, {color: '#FF5252'}]}>📋 {task.title}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
            <Ionicons name="logo-usd" size={18} color="#FF7E58" style={{marginRight: 5}} />
            <Text style={styles.reward}>{task.reward} USDC</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Web3Task
          task={task}
          onComplete={handleWeb3Complete}
        />
        
        {/* Add bottom padding to ensure content is not hidden by tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {showReward && (
        <RewardAnimation
          amount={typeof task.reward === 'string' ? parseFloat(task.reward) : task.reward}
          x={SCREEN_WIDTH / 2}
          y={300}
          onComplete={() => setShowReward(false)}
        />
      )}

      {feedback && (
        <TaskFeedback
          isCorrect={feedback.isCorrect}
          explanation={feedback.explanation}
          reward={feedback.reward || 0}
          onClose={() => {
            setFeedback(null);
            if (!feedback.isCorrect) {
              router.back();
            }
          }}
        />
      )}
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF7E58" />
          <Text style={{ marginTop: 12, color: '#555', fontWeight: '500' }}>Processing your request...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffe8e4', // Light pink background like in the screenshot
  },
  header: {
    height: 120,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reward: {
    fontSize: 18,
    color: '#FF7E58', // Orange color from the Text Analysis card
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 0,
  },
  bottomPadding: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  web3Container: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7E58', // Orange color from the Text Analysis card
    borderRadius: 3,
  },
  stepCount: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
    fontWeight: '500',
  },
  stepContainer: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24, // More rounded corners like in screenshot
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 17,
    color: '#555',
    marginBottom: 24,
    lineHeight: 26,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    padding: 16,
    fontSize: 17,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  nextButton: {
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
