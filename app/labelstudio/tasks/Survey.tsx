import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import BaseTaskScreen from './BaseTaskScreen';

const { width } = Dimensions.get('window');

// Define types for survey questions and responses
interface SurveyQuestion {
  id: string;
  type: 'multiple_choice' | 'rating' | 'text' | 'slider' | 'boolean';
  question: string;
  required?: boolean;
  options?: Array<{id: string; text: string; value: string}>;
  min?: number;
  max?: number;
  step?: number;
}

interface SurveyResponse {
  questionId: string;
  type: string;
  value: string | number | boolean;
}

interface Task {
  id: number;
  data: {
    title?: string;
    description?: string;
    questions?: SurveyQuestion[];
    options?: Array<{id: string; text: string; value: string}>;
    question?: string;
    [key: string]: any;
  };
}

const SurveyScreen = () => {
  const [responses, setResponses] = useState<{[key: string]: SurveyResponse}>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [textInputValues, setTextInputValues] = useState<{[key: string]: string}>({});
  const [sliderValues, setSliderValues] = useState<{[key: string]: number}>({});
  const [switchValues, setSwitchValues] = useState<{[key: string]: boolean}>({});

  // Render survey task content
  const renderTaskContent = (task: Task | null) => {
    if (!task) return null;
    
    const title = task.data.title || 'Survey';
    const description = task.data.description || 'Please complete the following survey.';
    const questions = task.data.questions || [];
    
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.surveyTitle}>{title}</Text>
        <View style={styles.surveyContainer}>
          <Ionicons name="clipboard-outline" size={48} color="#6366f1" style={styles.surveyIcon} />
          <Text style={styles.surveyDescription}>{description}</Text>
          
          {questions.length > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    {width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`}
                  ]} 
                />
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render survey options based on the current question type
  const renderOptions = (task: Task | null, selectedOption: string, onSelect: (option: string) => void) => {
    if (!task || !task.data.questions) return null;
    
    const questions: SurveyQuestion[] = task.data.questions;
    if (questions.length === 0) return null;
    
    // Make sure currentQuestionIndex is within bounds
    const safeIndex = Math.min(currentQuestionIndex, questions.length - 1);
    const currentQuestion = questions[safeIndex];
    
    // Create a response object for the current question if it doesn't exist
    if (!responses[currentQuestion.id]) {
      setResponses(prev => ({
        ...prev,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          type: currentQuestion.type,
          value: getDefaultValueForType(currentQuestion)
        }
      }));
    }
    
    return (
      <ScrollView style={styles.optionsScrollContainer} contentContainerStyle={styles.optionsContainer}>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        
        {currentQuestion.required && (
          <Text style={styles.requiredText}>* Required</Text>
        )}
        
        {renderQuestionByType(currentQuestion, task, onSelect)}
        
        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {currentQuestionIndex < questions.length - 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={() => {
                // Only proceed if current question is answered or not required
                const currentResponse = responses[currentQuestion.id];
                if (!currentQuestion.required || 
                    (currentResponse && isValidResponse(currentResponse))) {
                  setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
                }
              }}
            >
              <Text style={styles.navButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  };
  
  // Helper function to check if a response is valid
  const isValidResponse = (response: SurveyResponse): boolean => {
    if (response.type === 'text') {
      return typeof response.value === 'string' && (response.value as string).trim().length > 0;
    }
    return response.value !== undefined && response.value !== null;
  };
  
  // Helper function to get default value based on question type
  const getDefaultValueForType = (question: SurveyQuestion) => {
    switch (question.type) {
      case 'multiple_choice':
        return '';
      case 'rating':
        return 0;
      case 'text':
        return '';
      case 'slider':
        return question.min || 0;
      case 'boolean':
        return false;
      default:
        return '';
    }
  };
  
  // Render different question types
  const renderQuestionByType = (question: SurveyQuestion, task: Task | null, onSelect: (option: string) => void) => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoice(question, task, onSelect);
      case 'rating':
        return renderRating(question);
      case 'text':
        return renderTextInput(question);
      case 'slider':
        return renderSlider(question);
      case 'boolean':
        return renderBoolean(question);
      default:
        return null;
    }
  };
  
  // Render multiple choice question
  const renderMultipleChoice = (question: SurveyQuestion, task: Task | null, onSelect: (option: string) => void) => {
    const options = question.options || [];
    const selectedValue = responses[question.id]?.value as string;
    
    return (
      <View style={styles.questionContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedValue === option.id && styles.selectedOptionButton
            ]}
            onPress={() => {
              // Update the responses state
              setResponses(prev => ({
                ...prev,
                [question.id]: {
                  ...prev[question.id],
                  value: option.id
                }
              }));
              
              // Call the onSelect function from BaseTaskScreen
              onSelect(option.id);
            }}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render rating question (1-5 stars)
  const renderRating = (question: SurveyQuestion) => {
    const rating = (responses[question.id]?.value as number) || 0;
    
    return (
      <View style={styles.questionContainer}>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => {
                setResponses(prev => ({
                  ...prev,
                  [question.id]: {
                    ...prev[question.id],
                    value: star
                  }
                }));
              }}
            >
              <Ionicons
                name={rating >= star ? 'star' : 'star-outline'}
                size={40}
                color={rating >= star ? '#FFD700' : '#CCCCCC'}
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>
          {rating === 0 ? 'Tap to rate' : `Rating: ${rating}/5`}
        </Text>
      </View>
    );
  };
  
  // Render text input question
  const renderTextInput = (question: SurveyQuestion) => {
    return (
      <View style={styles.questionContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type your answer here..."
          multiline
          value={textInputValues[question.id] || ''}
          onChangeText={(text) => {
            // Update both the text input values and responses
            setTextInputValues(prev => ({
              ...prev,
              [question.id]: text
            }));
            
            setResponses(prev => ({
              ...prev,
              [question.id]: {
                ...prev[question.id],
                value: text
              }
            }));
          }}
        />
      </View>
    );
  };
  
  // Render slider question
  const renderSlider = (question: SurveyQuestion) => {
    const min = question.min || 0;
    const max = question.max || 100;
    const step = question.step || 1;
    const value = sliderValues[question.id] !== undefined 
      ? sliderValues[question.id] 
      : min;
    
    return (
      <View style={styles.questionContainer}>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>{min}</Text>
          <Slider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            step={step}
            value={value}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#D1D5DB"
            thumbTintColor="#6366f1"
            onValueChange={(val: number) => {
              setSliderValues(prev => ({
                ...prev,
                [question.id]: val
              }));
              
              setResponses(prev => ({
                ...prev,
                [question.id]: {
                  ...prev[question.id],
                  value: val
                }
              }));
            }}
          />
          <Text style={styles.sliderLabel}>{max}</Text>
        </View>
        <Text style={styles.sliderValue}>Selected value: {value}</Text>
      </View>
    );
  };
  
  // Render boolean question (Yes/No)
  const renderBoolean = (question: SurveyQuestion) => {
    const value = switchValues[question.id] || false;
    
    return (
      <View style={styles.questionContainer}>
        <View style={styles.booleanContainer}>
          <Text style={styles.booleanLabel}>{value ? 'Yes' : 'No'}</Text>
          <Switch
            trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? '#4F46E5' : '#f4f3f4'}
            ios_backgroundColor="#D1D5DB"
            onValueChange={(val) => {
              setSwitchValues(prev => ({
                ...prev,
                [question.id]: val
              }));
              
              setResponses(prev => ({
                ...prev,
                [question.id]: {
                  ...prev[question.id],
                  value: val
                }
              }));
            }}
            value={value}
          />
        </View>
      </View>
    );
  };

  // Format annotation for submission
  const formatAnnotation = (task: Task | null, selectedOption: string) => {
    // For multi-question surveys, we ignore the selectedOption from BaseTaskScreen
    // and use our own responses state
    
    if (!task || !task.data.questions) {
      return {
        result: [
          {
            from_name: 'survey_response',
            to_name: 'survey',
            type: 'choices',
            value: {
              choices: [selectedOption]
            }
          }
        ]
      };
    }
    
    // Format all responses for submission
    const results = Object.values(responses).map((response: SurveyResponse) => {
      return {
        from_name: `question_${response.questionId}`,
        to_name: 'survey',
        type: getAnnotationType(response.type),
        value: formatResponseValue(response)
      };
    });
    
    return { result: results };
  };
  
  // Helper function to get annotation type based on question type
  const getAnnotationType = (questionType: string) => {
    switch (questionType) {
      case 'multiple_choice':
        return 'choices';
      case 'rating':
        return 'rating';
      case 'text':
        return 'text';
      case 'slider':
        return 'number';
      case 'boolean':
        return 'choices';
      default:
        return 'choices';
    }
  };
  
  // Helper function to format response value based on question type
  const formatResponseValue = (response: SurveyResponse) => {
    switch (response.type) {
      case 'multiple_choice':
        return { choices: [response.value] };
      case 'rating':
        return { rating: response.value };
      case 'text':
        return { text: [response.value] };
      case 'slider':
        return { number: response.value };
      case 'boolean':
        return { choices: [response.value ? 'yes' : 'no'] };
      default:
        return { choices: [response.value] };
    }
  };

  return (
    <BaseTaskScreen
      renderTaskContent={renderTaskContent}
      renderOptions={renderOptions}
      formatAnnotation={formatAnnotation}
      taskTitle="Survey"
      themeColor="#6366f1"
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    marginBottom: 16,
  },
  surveyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 16,
  },
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'left',
  },
  surveyContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  surveyIcon: {
    marginBottom: 16,
  },
  surveyDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  optionsScrollContainer: {
    width: '100%',
  },
  optionsContainer: {
    paddingBottom: 40,
  },
  questionContainer: {
    marginBottom: 24,
    width: '100%',
  },
  requiredText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#6366f1',
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
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starIcon: {
    marginHorizontal: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 16,
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  sliderValue: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  booleanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  booleanLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    width: '100%',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButton: {
    backgroundColor: '#6B7280',
  },
  nextButton: {
    backgroundColor: '#6366f1',
    marginLeft: 'auto',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
});

export default SurveyScreen;
