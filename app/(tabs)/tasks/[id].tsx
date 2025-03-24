import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, Platform, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { TASKS, TASK_ANSWERS, WEB3_TASKS } from '../../../data/tasks';
import TaskGuidelines from '../../../components/TaskGuidelines';
import TaskFeedback from '../../../components/TaskFeedback';
import BoundingBoxEditor from '../../../components/BoundingBoxEditor';
import { useTaskStore } from '../../../store/taskStore';
import RewardAnimation from '../../../components/RewardAnimation';
import { ObjectDetection } from '../../../types/tasks';

const SCREEN_WIDTH = Dimensions.get('window').width;

function DataLabelingTask({
  task,
  onAnswer
}: {
  task: any;
  onAnswer: (answer: string) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleSelect = (answer: string) => {
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  return (
    <>
      {task.type === 'image' && task.image && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: task.image }}
            style={styles.taskImage}
            resizeMode="cover"
          />
        </View>
      )}

      {task.type === 'text' && task.text && (
        <View style={styles.textContainer}>
          <Text style={styles.taskText}>{task.text}</Text>
        </View>
      )}

      <TaskGuidelines
        guidelines={task.guidelines}
        difficulty={task.difficulty}
        estimatedTime={task.estimatedTime}
      />

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{task.question}</Text>
        <View style={styles.optionsContainer}>
          {task.options.map((option: string) => (
            <Pressable
              key={option}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.optionButtonSelected
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text style={[
                styles.optionText,
                selectedAnswer === option && styles.optionTextSelected
              ]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
}

function ObjectDetectionTask({
  task,
  onAnswer
}: {
  task: any;
  onAnswer: (answer: string) => void;
}) {
  const [drawnBoxes, setDrawnBoxes] = useState<ObjectDetection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to the BoundingBoxEditor when mounted
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 200, animated: true });
    }, 500);
  }, []);

  const handleBoxDrawn = (box: ObjectDetection) => {
    const newBoxes = task.options.length === 1 ? [box] : [...drawnBoxes, box];
    setDrawnBoxes(newBoxes);
    
    // Auto-submit when conditions are met
    if ((task.options.length === 1) || 
        (newBoxes.length >= 2)) {
      setIsSubmitting(true);
      onAnswer(JSON.stringify(task.options.length === 1 ? box : newBoxes));
    }
  };

  const handleReset = () => {
    setDrawnBoxes([]);
    setIsSubmitting(false);
  };

  const handleManualSubmit = () => {
    if (drawnBoxes.length > 0) {
      setIsSubmitting(true);
      onAnswer(JSON.stringify(drawnBoxes));
    }
  };

  return (
    <Animated.View 
      entering={FadeInDown.duration(500)}
      style={styles.objectDetectionContainer}
    >
      <TaskGuidelines
        guidelines={task.guidelines}
        difficulty={task.difficulty}
        estimatedTime={task.estimatedTime}
      />

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{task.question}</Text>
        
        <View style={styles.objectTypeContainer}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.objectTypeText}>
            Looking for: <Text style={styles.objectTypeBold}>{task.options.join(', ')}</Text>
            {task.options.length > 1 ? ` (${task.options.length} objects)` : ''}
          </Text>
        </View>

        <BoundingBoxEditor
          imageUrl={task.image}
          objectType={task.options[0]}
          onBoxDrawn={handleBoxDrawn}
          multipleBoxes={task.options.length > 1}
          existingBoxes={drawnBoxes}
          onReset={handleReset}
        />

        {drawnBoxes.length > 0 && !isSubmitting && (
          <Pressable 
            style={styles.submitButton}
            onPress={handleManualSubmit}
          >
            <LinearGradient
              colors={['#22D3EE', '#2DD4BF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Submit</Text>
          </Pressable>
        )}
        
        {isSubmitting && (
          <View style={styles.submittingContainer}>
            <ActivityIndicator size="small" color="#22D3EE" />
            <Text style={styles.submittingText}>Submitting your answer...</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function Web3Task({
  task,
  onComplete
}: {
  task: any;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentStepData = task.steps[currentStep];

  const handleNext = () => {
    if (!input) {
      setError('This field is required');
      return;
    }

    if (currentStepData.validation && !currentStepData.validation.test(input)) {
      setError('Invalid format');
      return;
    }

    if (currentStep < task.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setInput('');
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.web3Container}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${((currentStep + 1) / task.steps.length) * 100}%` }
          ]}
        />
      </View>
      
      <Text style={styles.stepCount}>
        Step {currentStep + 1} of {task.steps.length}
      </Text>

      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{currentStepData.title}</Text>
        <Text style={styles.stepDescription}>{currentStepData.description}</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={currentStepData.placeholder}
            value={input}
            onChangeText={(text) => {
              setInput(text);
              setError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        <Pressable onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={['#9333ea', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.nextButtonText}>
            {currentStep === task.steps.length - 1 ? 'Complete Task' : 'Next Step'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function TaskScreen() {
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState<any>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);
  const [showReward, setShowReward] = useState(false);
  const { submitTask, completedTasks, isLoading, fetchUserStats } = useTaskStore();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Find the task (either data labeling or web3)
    const foundTask = Object.values(TASKS)
      .flat()
      .find(t => t.id === id) || WEB3_TASKS[id as keyof typeof WEB3_TASKS];

    if (!foundTask || completedTasks.includes(id as string)) {
      router.replace('/tasks');
      return;
    }

    setTask(foundTask);
  }, [id, completedTasks]);

  if (!task) return null;

  const findNextTask = () => {
    const allTasks = Object.values(TASKS).flat();
    const currentIndex = allTasks.findIndex(t => t.id === id);
    return allTasks[currentIndex + 1]?.id;
  };

  const handleTaskCompletion = async (isCorrect: boolean) => {
    if (isCorrect) {
      setShowReward(true);
      await fetchUserStats(); // Refresh user stats to update earnings
      
      // Find and navigate to next task after a delay
      const nextTaskId = findNextTask();
      setTimeout(() => {
        if (nextTaskId) {
          router.replace(`/tasks/${nextTaskId}`);
        } else {
          router.replace('/tasks');
        }
      }, 2000);
    }
  };

  const compareBoxes = (box1: ObjectDetection, box2: ObjectDetection) => {
    const tolerance = 0.35; // Increased tolerance to 35% for more forgiving validation
    const pos1 = box1.position;
    const pos2 = box2.position;
    
    // Calculate centers of boxes
    const center1X = pos1.x + pos1.width / 2;
    const center1Y = pos1.y + pos1.height / 2;
    const center2X = pos2.x + pos2.width / 2;
    const center2Y = pos2.y + pos2.height / 2;
    
    // Calculate differences
    const centerDiffX = Math.abs(center1X - center2X);
    const centerDiffY = Math.abs(center1Y - center2Y);
    
    // Calculate size differences with more tolerance
    const sizeDiffWidth = Math.abs(pos1.width - pos2.width) / Math.max(pos1.width, pos2.width);
    const sizeDiffHeight = Math.abs(pos1.height - pos2.height) / Math.max(pos1.height, pos2.height);
    
    // More lenient validation
    return (
      centerDiffX < tolerance &&
      centerDiffY < tolerance &&
      sizeDiffWidth < tolerance &&
      sizeDiffHeight < tolerance
    );
  };

  const handleAnswer = async (answer: string) => {
    const validation = TASK_ANSWERS[id as string];
    if (validation) {
      let isCorrect = false;

      if (task.type === 'object') {
        try {
          const expectedBoxes = typeof validation.correctAnswer === 'string' 
            ? JSON.parse(validation.correctAnswer)
            : validation.correctAnswer;
            
          const submittedBoxes = JSON.parse(answer);
          
          if (Array.isArray(expectedBoxes)) {
            // For multiple boxes tasks
            const hasEnoughBoxes = Array.isArray(submittedBoxes) && 
              submittedBoxes.length >= expectedBoxes.length;
              
            // More forgiving validation for multiple boxes
            isCorrect = hasEnoughBoxes && expectedBoxes.some(expected =>
              submittedBoxes.some(submitted => compareBoxes(expected, submitted))
            );
          } else {
            // For single box tasks
            isCorrect = compareBoxes(expectedBoxes, submittedBoxes);
          }
        } catch (error) {
          console.error("Error comparing boxes:", error);
          isCorrect = false;
        }
      } else {
        isCorrect = answer === validation.correctAnswer;
      }
      
      if (isCorrect) {
        try {
          await submitTask(id as string, answer, task.reward as number);
          handleTaskCompletion(true);
        } catch (error) {
          console.error('Failed to submit task:', error);
        }
      }

      setFeedback({
        isCorrect,
        explanation: validation.explanation,
      });
    }
  };

  const handleWeb3Complete = async () => {
    try {
      await submitTask(id as string, 'completed', parseFloat(task.reward as string));
      handleTaskCompletion(true);
      setFeedback({
        isCorrect: true,
        explanation: 'Task completed successfully! Your reward will be processed shortly.',
      });
    } catch (error) {
      console.error('Failed to submit web3 task:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeIn}
        style={styles.header}
      >
        <Pressable 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#020733" />
        </Pressable>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.reward}>
            ${typeof task.reward === 'string' ? task.reward : task.reward.toFixed(2)} USDC
          </Text>
        </View>
      </Animated.View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {'steps' in task ? (
          <Web3Task
            task={task}
            onComplete={handleWeb3Complete}
          />
        ) : task.type === 'object' ? (
          <ObjectDetectionTask
            task={task}
            onAnswer={handleAnswer}
          />
        ) : (
          <DataLabelingTask
            task={task}
            onAnswer={handleAnswer}
          />
        )}
        
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
          reward={typeof task.reward === 'string' ? parseFloat(task.reward) : task.reward}
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
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#020733',
    marginBottom: 4,
  },
  reward: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 0, // Remove bottom padding as we'll use bottomPadding view
  },
  bottomPadding: {
    height: Platform.OS === 'ios' ? 120 : 100, // Adjust based on tab bar height
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  taskImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  taskText: {
    fontSize: 16,
    color: '#020733',
    lineHeight: 24,
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    minHeight: 56,
    justifyContent: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#2563eb',
  },
  optionText: {
    fontSize: 16,
    color: '#020733',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  web3Container: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9333ea',
    borderRadius: 2,
  },
  stepCount: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#020733',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#020733',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
  },
  nextButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  objectDetectionContainer: {
    width: '100%',
  },
  objectTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  objectTypeText: {
    fontSize: 15,
    color: '#3b82f6',
    flex: 1,
  },
  objectTypeBold: {
    fontWeight: 'bold',
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  submittingText: {
    color: '#64748b',
    fontSize: 14,
  },
});