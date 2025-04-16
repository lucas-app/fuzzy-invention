/**
 * MockLabelStudioService.js
 * Provides offline mock data for development when Label Studio server is unavailable
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys (same as in LabelStudioService)
const STORAGE_KEYS = {
  TEXT_SENTIMENT: 'label_studio_text_tasks',
  IMAGE_CLASSIFICATION: 'label_studio_image_tasks',
  AUDIO_CLASSIFICATION: 'label_studio_audio_tasks',
  SURVEY: 'label_studio_survey_tasks',
  GEOSPATIAL_LABELING: 'label_studio_geospatial_tasks',
  COMPLETED_TASKS: 'COMPLETED_TASKS',
};

// Mock image classification tasks
const IMAGE_TASKS = [
  {
    id: 1001,
    data: {
      image: "https://placehold.co/600x400/6C5DD3/FFFFFF.png?text=Classification+Task+1",
      title: "Image Classification Demo",
      question: "What object is shown in this image?",
      options: [
        {id: "cat", text: "Cat", value: "cat"},
        {id: "dog", text: "Dog", value: "dog"},
        {id: "bird", text: "Bird", value: "bird"},
        {id: "other", text: "Other", value: "other"}
      ]
    },
    created_at: new Date().toISOString()
  },
  {
    id: 1002,
    data: {
      image: "https://placehold.co/600x400/FF6A3D/FFFFFF.png?text=Classification+Task+2",
      title: "Indoor or Outdoor?",
      question: "Is this scene indoors or outdoors?",
      options: [
        {id: "indoor", text: "Indoor", value: "indoor"},
        {id: "outdoor", text: "Outdoor", value: "outdoor"},
        {id: "unclear", text: "Unclear", value: "unclear"}
      ]
    },
    created_at: new Date().toISOString()
  },
  {
    id: 1003,
    data: {
      image: "https://placehold.co/600x400/00C4B4/FFFFFF.png?text=Classification+Task+3",
      title: "Color Identification",
      question: "What is the primary color in this image?",
      options: [
        {id: "red", text: "Red", value: "red"},
        {id: "blue", text: "Blue", value: "blue"},
        {id: "green", text: "Green", value: "green"},
        {id: "yellow", text: "Yellow", value: "yellow"},
        {id: "other", text: "Other", value: "other"}
      ]
    },
    created_at: new Date().toISOString()
  }
];

// Mock audio classification tasks
const AUDIO_TASKS = [
  {
    id: 2001,
    data: {
      audio: "https://storage.googleapis.com/videointelligence-public/google-assistant-sample-data/ding.mp4",
      title: "Bell Sound",
      question: "What type of sound is this?",
      options: [
        {id: "bell", text: "Bell/Chime", value: "bell"},
        {id: "musical", text: "Musical Instrument", value: "musical"},
        {id: "voice", text: "Human Voice", value: "voice"},
        {id: "other", text: "Other", value: "other"}
      ]
    },
    created_at: new Date().toISOString()
  },
  {
    id: 2002,
    data: {
      audio: "https://storage.googleapis.com/videointelligence-public/google-assistant-sample-data/animal.mp4",
      title: "Animal Sound",
      question: "What animal made this sound?",
      options: [
        {id: "dog", text: "Dog", value: "dog"},
        {id: "cat", text: "Cat", value: "cat"},
        {id: "bird", text: "Bird", value: "bird"},
        {id: "other", text: "Other", value: "other"}
      ]
    },
    created_at: new Date().toISOString()
  },
  {
    id: 2003,
    data: {
      audio: "https://storage.googleapis.com/videointelligence-public/google-assistant-sample-data/doorbell.mp4",
      title: "Home Sound",
      question: "What home-related sound is this?",
      options: [
        {id: "doorbell", text: "Doorbell", value: "doorbell"},
        {id: "alarm", text: "Alarm", value: "alarm"},
        {id: "appliance", text: "Appliance", value: "appliance"},
        {id: "other", text: "Other", value: "other"}
      ]
    },
    created_at: new Date().toISOString()
  }
];

// Mock text sentiment tasks
const TEXT_TASKS = [
  {
    id: 3001,
    data: {
      text: "I absolutely love this product! It has made my life so much easier.",
      title: "Product Review",
      question: "What is the sentiment of this review?",
      options: [
        {id: "positive", text: "Positive", value: "positive"},
        {id: "neutral", text: "Neutral", value: "neutral"},
        {id: "negative", text: "Negative", value: "negative"}
      ]
    },
    created_at: new Date().toISOString()
  },
  {
    id: 3002,
    data: {
      text: "The service was okay, nothing special but it did the job.",
      title: "Service Feedback",
      question: "What is the sentiment of this feedback?",
      options: [
        {id: "positive", text: "Positive", value: "positive"},
        {id: "neutral", text: "Neutral", value: "neutral"},
        {id: "negative", text: "Negative", value: "negative"}
      ]
    },
    created_at: new Date().toISOString()
  },
  {
    id: 3003,
    data: {
      text: "I'm very disappointed with the quality. Would not recommend.",
      title: "Customer Comment",
      question: "What is the sentiment of this comment?",
      options: [
        {id: "positive", text: "Positive", value: "positive"},
        {id: "neutral", text: "Neutral", value: "neutral"},
        {id: "negative", text: "Negative", value: "negative"}
      ]
    },
    created_at: new Date().toISOString()
  }
];

// Mock geospatial labeling tasks
const GEOSPATIAL_TASKS = [
  {
    id: 4001,
    data: {
      image: "https://placehold.co/800x600/5CDBF2/FFFFFF.png?text=Map+1",
      title: "Land Cover Classification",
      question: "What is the primary land cover type in this area?",
      options: [
        {id: "forest", text: "Forest", value: "forest"},
        {id: "urban", text: "Urban", value: "urban"},
        {id: "agriculture", text: "Agriculture", value: "agriculture"},
        {id: "water", text: "Water", value: "water"},
        {id: "other", text: "Other", value: "other"}
      ]
    },
    created_at: new Date().toISOString()
  },
  {
    id: 4002,
    data: {
      image: "https://placehold.co/800x600/F986E5/FFFFFF.png?text=Map+2",
      title: "Building Identification",
      question: "How many buildings can you identify in this image?",
      options: [
        {id: "none", text: "None", value: "none"},
        {id: "few", text: "1-5", value: "few"},
        {id: "many", text: "6-20", value: "many"},
        {id: "numerous", text: "More than 20", value: "numerous"}
      ]
    },
    created_at: new Date().toISOString()
  }
];

// Mock survey tasks
const SURVEY_TASKS = [
  {
    id: 5001,
    data: {
      title: "App Usage Survey",
      question: "How often do you use the LUCAS app?",
      options: [
        {id: "daily", text: "Daily", value: "daily"},
        {id: "weekly", text: "Weekly", value: "weekly"},
        {id: "monthly", text: "Monthly", value: "monthly"},
        {id: "rarely", text: "Rarely", value: "rarely"}
      ]
    },
    created_at: new Date().toISOString()
  },
  {
    id: 5002,
    data: {
      title: "Feature Feedback",
      question: "Which feature of the app do you find most useful?",
      options: [
        {id: "image_tasks", text: "Image Classification", value: "image_tasks"},
        {id: "audio_tasks", text: "Audio Classification", value: "audio_tasks"},
        {id: "text_tasks", text: "Text Sentiment", value: "text_tasks"},
        {id: "web3_tasks", text: "Web3 Tasks", value: "web3_tasks"}
      ]
    },
    created_at: new Date().toISOString()
  }
];

/**
 * Get tasks for a specific project type
 * @param {string} projectType - Type of project (TEXT_SENTIMENT, IMAGE_CLASSIFICATION, etc.)
 * @returns {Promise<Array>} - Promise resolving to array of tasks
 */
export const getMockTasks = async (projectType) => {
  console.log(`MockLabelStudioService: Getting ${projectType} tasks`);
  
  // Get from AsyncStorage first (if available)
  try {
    const STORAGE_KEY = STORAGE_KEYS[projectType];
    const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      if (parsedTasks && parsedTasks.length > 0) {
        console.log(`MockLabelStudioService: Using cached ${projectType} tasks`);
        return parsedTasks;
      }
    }
  } catch (error) {
    console.warn('MockLabelStudioService: Error fetching from AsyncStorage:', error);
  }
  
  // If nothing in AsyncStorage, return mock data
  switch (projectType) {
    case 'IMAGE_CLASSIFICATION':
      await saveMockTasks(IMAGE_TASKS, projectType);
      return IMAGE_TASKS;
    case 'AUDIO_CLASSIFICATION':
      await saveMockTasks(AUDIO_TASKS, projectType);
      return AUDIO_TASKS;
    case 'TEXT_SENTIMENT':
      await saveMockTasks(TEXT_TASKS, projectType);
      return TEXT_TASKS;
    case 'GEOSPATIAL_LABELING':
      await saveMockTasks(GEOSPATIAL_TASKS, projectType);
      return GEOSPATIAL_TASKS;
    case 'SURVEY':
      await saveMockTasks(SURVEY_TASKS, projectType);
      return SURVEY_TASKS;
    default:
      return [];
  }
};

/**
 * Save mock tasks to AsyncStorage
 * @param {Array} tasks - Tasks to save
 * @param {string} projectType - Type of project
 */
export const saveMockTasks = async (tasks, projectType) => {
  try {
    const STORAGE_KEY = STORAGE_KEYS[projectType];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    console.log(`MockLabelStudioService: Saved ${tasks.length} ${projectType} mock tasks to AsyncStorage`);
  } catch (error) {
    console.error('MockLabelStudioService: Error saving to AsyncStorage:', error);
  }
};

/**
 * Submit a task annotation
 * @param {number} taskId - ID of the task
 * @param {string} projectType - Type of project
 * @param {Object} annotation - Annotation data
 * @returns {Promise<Object>} - Promise resolving to submission result
 */
export const submitMockAnnotation = async (taskId, projectType, annotation) => {
  console.log(`MockLabelStudioService: Submitting annotation for task ${taskId}`);
  
  try {
    // Get completed tasks
    const completedTasksJson = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
    let completedTasks = completedTasksJson ? JSON.parse(completedTasksJson) : [];
    
    // Add current task to completed tasks if not already present
    if (!completedTasks.includes(taskId.toString())) {
      completedTasks.push(taskId.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(completedTasks));
    }
    
    // Simulate API response
    return {
      id: Date.now(),
      task_id: taskId,
      created_by: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      result: annotation,
      was_cancelled: false,
      completed_by: 1,
      unique_id: `mock-${Date.now()}`
    };
  } catch (error) {
    console.error('MockLabelStudioService: Error submitting annotation:', error);
    throw error;
  }
};

export default {
  getMockTasks,
  submitMockAnnotation,
  saveMockTasks
};
