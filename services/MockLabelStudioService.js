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
    "id": 22,
    "data": {
      "audio": "https://file-examples.com/storage/fe8c7eef0c6364f6c9d96b3/2017/11/file_example_MP3_700KB.mp3",
      "question": "What type of sound is this?",
      "options": [
        {
          "id": "alarm",
          "text": "Alarm",
          "value": "alarm"
        },
        {
          "id": "notification",
          "text": "Notification",
          "value": "notification"
        },
        {
          "id": "ringtone",
          "text": "Ringtone",
          "value": "ringtone"
        },
        {
          "id": "other",
          "text": "Other",
          "value": "other"
        }
      ]
    },
    "created_at": "2025-04-18T12:58:14.379Z"
  },
  {
    "id": 23,
    "data": {
      "audio": "https://file-examples.com/storage/fe8c7eef0c6364f6c9d96b3/2017/11/file_example_MP3_1MG.mp3",
      "question": "What environment does this sound represent?",
      "options": [
        {
          "id": "nature",
          "text": "Nature",
          "value": "nature"
        },
        {
          "id": "urban",
          "text": "Urban",
          "value": "urban"
        },
        {
          "id": "indoor",
          "text": "Indoor",
          "value": "indoor"
        },
        {
          "id": "other",
          "text": "Other",
          "value": "other"
        }
      ]
    },
    "created_at": "2025-04-18T12:58:14.387Z"
  },
  {
    "id": 24,
    "data": {
      "audio": "https://file-examples.com/storage/fe8c7eef0c6364f6c9d96b3/2017/11/file_example_MP3_2MG.mp3",
      "question": "What type of vehicle is making this sound?",
      "options": [
        {
          "id": "car",
          "text": "Car",
          "value": "car"
        },
        {
          "id": "motorcycle",
          "text": "Motorcycle",
          "value": "motorcycle"
        },
        {
          "id": "truck",
          "text": "Truck",
          "value": "truck"
        },
        {
          "id": "other",
          "text": "Other",
          "value": "other"
        }
      ]
    },
    "created_at": "2025-04-18T12:58:14.387Z"
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

// Define functions first
const getMockTasks = async (projectType) => {
  console.log(`MockLabelStudioService: Getting mock tasks for ${projectType}`);
  const STORAGE_KEY = STORAGE_KEYS[projectType];
  
  try {
    // First try to get from AsyncStorage
    const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (storedTasks) {
      console.log(`MockLabelStudioService: Using cached tasks for ${projectType}`);
      const parsed = JSON.parse(storedTasks);
      if (parsed && parsed.tasks && parsed.tasks.length > 0) {
        return parsed.tasks;
      }
    }
    
    // Return the appropriate mock data based on project type
    console.log(`MockLabelStudioService: Returning default mock tasks for ${projectType}`);
    let mockData;
    
    switch (projectType) {
      case 'TEXT_SENTIMENT':
        mockData = TEXT_TASKS;
        break;
      case 'IMAGE_CLASSIFICATION':
        mockData = IMAGE_TASKS;
        break;
      case 'AUDIO_CLASSIFICATION':
        mockData = AUDIO_TASKS;
        break;
      case 'SURVEY':
        mockData = SURVEY_TASKS;
        break;
      case 'GEOSPATIAL_LABELING':
        mockData = GEOSPATIAL_TASKS;
        break;
      default:
        mockData = [];
    }
    
    // Save the mock data to AsyncStorage for future use
    await saveMockTasks(mockData, projectType);
    
    return mockData;
  } catch (error) {
    console.error(`MockLabelStudioService: Error getting mock tasks - ${error.message}`);
    
    // Return a default set of tasks based on project type as a last resort
    switch (projectType) {
      case 'TEXT_SENTIMENT':
        return TEXT_TASKS;
      case 'IMAGE_CLASSIFICATION':
        return IMAGE_TASKS;
      case 'AUDIO_CLASSIFICATION':
        return AUDIO_TASKS;
      case 'SURVEY':
        return SURVEY_TASKS;
      case 'GEOSPATIAL_LABELING':
        return GEOSPATIAL_TASKS;
      default:
        return [];
    }
  }
};

const saveMockTasks = async (tasks, projectType) => {
  try {
    const STORAGE_KEY = STORAGE_KEYS[projectType];
    
    // Format the data in the same way as the LabelStudioService
    const cacheData = {
      tasks: tasks,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    console.log(`MockLabelStudioService: Saved ${tasks.length} mock ${projectType} tasks to AsyncStorage`);
  } catch (error) {
    console.error(`MockLabelStudioService: Error saving mock tasks - ${error.message}`);
  }
};

const submitMockAnnotation = async (taskId, projectType, annotation) => {
  try {
    // Get current completed tasks
    const completedTasks = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
    const parsedCompletedTasks = completedTasks ? JSON.parse(completedTasks) : [];
    
    // Add new task to completed tasks
    parsedCompletedTasks.push(taskId);
    
    // Save updated completed tasks
    await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(parsedCompletedTasks));
    
    console.log(`MockLabelStudioService: Submitted annotation for task ${taskId}`);
    return { success: true };
  } catch (error) {
    console.error('MockLabelStudioService: Error submitting annotation:', error);
    return { success: false, error };
  }
};

// Create a single MockLabelStudioService object
const MockService = {
  getMockTasks,
  saveMockTasks,
  submitMockAnnotation
};

// Export the service
export default MockService;
