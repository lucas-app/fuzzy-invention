/**
 * LabelStudioService.js
 * Service to handle interactions with the Label Studio API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import MockService from './MockLabelStudioService.js';
import NetInfo from '@react-native-community/netinfo';

// Constants
// Use a configurable API URL that can be updated at runtime
// Updated to use localhost for development to make it easier to test
let API_URL = 'http://localhost:9090';  // Changed from 192.168.1.107 to localhost

// Flag to control whether to use mock data when the server is unavailable
const USE_MOCK_DATA_WHEN_OFFLINE = true;

// Function to update API URL at runtime
export const setApiUrl = (url) => {
  if (url && url.trim() !== '') {
    API_URL = url.trim();
    console.log(`LabelStudioService: API URL updated to ${API_URL}`);
    return true;
  }
  return false;
};

// Function to get current API URL
export const getApiUrl = () => API_URL;

// Force token refresh by adding it as a function that's called each time
const getApiToken = () => '501c980772e98d56cab53109683af59c36ce5778';

// Project IDs
const PROJECTS = {
  TEXT_SENTIMENT: 3,       // Text sentiment project
  IMAGE_CLASSIFICATION: 4, // Image classification project
  AUDIO_CLASSIFICATION: 5, // Audio classification project
  SURVEY: 6,               // Survey project
  GEOSPATIAL_LABELING: 7,  // Geospatial labeling project
};

// Storage keys
const STORAGE_KEYS = {
  TEXT_SENTIMENT: 'label_studio_text_tasks',
  IMAGE_CLASSIFICATION: 'label_studio_image_tasks',
  AUDIO_CLASSIFICATION: 'label_studio_audio_tasks',
  SURVEY: 'label_studio_survey_tasks',
  GEOSPATIAL_LABELING: 'label_studio_geospatial_tasks',
  COMPLETED_TASKS: 'COMPLETED_TASKS',
};

// Mock tasks for offline/testing use
const mockTasks = {
  TEXT_SENTIMENT: [
    {
      id: 1,
      data: {
        text: 'I love this product! It works exactly as described.',
        options: [
          { id: 'positive', text: 'Positive', value: 'positive' },
          { id: 'neutral', text: 'Neutral', value: 'neutral' },
          { id: 'negative', text: 'Negative', value: 'negative' }
        ]
      }
    }
  ],
  IMAGE_CLASSIFICATION: [
    {
      id: 101,
      data: {
        image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a',
        question: 'Is this a dog?',
        options: [
          { id: 'yes', text: 'Yes', value: 'yes' },
          { id: 'no', text: 'No', value: 'no' }
        ]
      }
    }
  ]
};

// Endpoints
const getTasksEndpoint = (projectId) => `/api/projects/${projectId}/tasks/`;
const ANNOTATIONS_ENDPOINT = (taskId) => `/api/tasks/${taskId}/annotations/`;
const TIMEOUT_MS = 5000; // 5 seconds timeout

// Constants for task management
const TASK_BATCH_SIZE = 10;
const MAX_CACHED_TASKS = 50;
const TASK_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch tasks from Label Studio API
 * @param {string} projectType - Type of project (TEXT_SENTIMENT or IMAGE_CLASSIFICATION)
 * @param {number} retries - Number of retry attempts
 * @param {boolean} forceRefresh - Whether to force a fresh fetch from the server
 * @returns {Promise<Array>} Array of tasks
 */
export const fetchTasks = async (projectType, retries = 3, forceRefresh = false) => {
  const projectId = PROJECTS[projectType];
  const TASKS_ENDPOINT = getTasksEndpoint(projectId);
  const STORAGE_KEY = STORAGE_KEYS[projectType];
  const API_TOKEN = getApiToken();
  
  console.log(`LabelStudioService: Fetching ${projectType} tasks from API...`);
  
  // First try to get cached tasks if not forcing refresh
  if (!forceRefresh) {
    try {
      const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (cachedData) {
        const { tasks, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > TASK_EXPIRY_TIME;
        
        if (tasks && tasks.length > 0 && !isExpired) {
          console.log(`LabelStudioService: Using cached ${projectType} tasks`);
          return tasks;
        }
      }
    } catch (error) {
      console.warn('LabelStudioService: Error fetching from AsyncStorage:', error);
    }
  }

  // Check network connectivity
  const networkState = await NetInfo.fetch();
  const isConnected = networkState.isConnected && networkState.isInternetReachable;
  
  // If offline and configured to use mock data, use mock data immediately
  if (!isConnected && USE_MOCK_DATA_WHEN_OFFLINE) {
    console.log('LabelStudioService: Device is offline, using mock data');
    try {
      const mockTasks = await MockService.getMockTasks(projectType);
      
      // Save to cache for future use
      try {
        const cacheData = {
          tasks: mockTasks.slice(0, MAX_CACHED_TASKS),
          timestamp: Date.now()
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
        console.log(`LabelStudioService: Cached ${mockTasks.length} ${projectType} mock tasks`);
      } catch (cacheError) {
        console.warn('LabelStudioService: Error saving mock tasks to cache:', cacheError);
      }
      
      return mockTasks;
    } catch (mockError) {
      console.error('LabelStudioService: Error getting mock data:', mockError);
      return []; // Return empty array if even mock data fails
    }
  }

  // If this is audio classification or survey, try to use mock data first
  if ((projectType === 'AUDIO_CLASSIFICATION' || projectType === 'SURVEY') && USE_MOCK_DATA_WHEN_OFFLINE) {
    try {
      console.log(`LabelStudioService: Using mock data for ${projectType}`);
      const mockTasks = await MockService.getMockTasks(projectType);
      if (mockTasks && mockTasks.length > 0) {
        // Save to cache
        try {
          const cacheData = {
            tasks: mockTasks.slice(0, MAX_CACHED_TASKS),
            timestamp: Date.now()
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
          console.log(`LabelStudioService: Cached ${mockTasks.length} ${projectType} mock tasks`);
        } catch (cacheError) {
          console.warn('LabelStudioService: Error saving mock tasks to cache:', cacheError);
        }
        return mockTasks;
      }
    } catch (mockError) {
      console.warn('LabelStudioService: Error getting mock tasks:', mockError);
    }
  }

  // Fetch from server with retries only if we're connected
  if (isConnected) {
    let lastError = null;
    let tasks = [];

    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        
        console.log(`LabelStudioService: Attempt ${i + 1}/${retries} - Fetching from ${API_URL}${TASKS_ENDPOINT}`);

        const response = await fetch(`${API_URL}${TASKS_ENDPOINT}?page_size=${TASK_BATCH_SIZE}`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`LabelStudioService: API error response (${response.status}): ${errorText}`);
          
          if (response.status === 401) {
            throw new Error('Invalid API token. Please check your Label Studio configuration.');
          }
          
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        tasks = Array.isArray(data) ? data : data.results || [];

        // If we got tasks, break the retry loop
        if (tasks.length > 0) {
          break;
        }
      } catch (error) {
        console.error(`LabelStudioService: Attempt ${i + 1} failed:`, error);
        lastError = error;
        
        // Only retry if it's not the last attempt
        if (i < retries - 1) {
          continue;
        }
        
        // If all retries failed, try mock data
        if (USE_MOCK_DATA_WHEN_OFFLINE) {
          console.log('LabelStudioService: All retries failed, falling back to mock data');
          tasks = await MockService.getMockTasks(projectType);
        }
      }
    }

    // Save tasks to cache with timestamp
    if (tasks.length > 0) {
      try {
        const cacheData = {
          tasks: tasks.slice(0, MAX_CACHED_TASKS),
          timestamp: Date.now()
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
        console.log(`LabelStudioService: Cached ${tasks.length} ${projectType} tasks`);
      } catch (error) {
        console.warn('LabelStudioService: Error saving to cache:', error);
      }
    }

    return tasks;
  } else {
    // As a last resort for offline mode, return mock data
    console.log('LabelStudioService: Offline, falling back to mock data');
    return await MockService.getMockTasks(projectType);
  }
};

/**
 * Save tasks to AsyncStorage
 * @param {Array} tasks - Tasks to save
 * @param {string} projectType - Type of project (TEXT_SENTIMENT or IMAGE_CLASSIFICATION)
 */
export const saveTasks = async (tasks, projectType = 'TEXT_SENTIMENT') => {
  try {
    const STORAGE_KEY = STORAGE_KEYS[projectType];
    
    // Optimize for storage by keeping only essential fields
    const reducedTasks = tasks.map(task => ({
      id: task.id,
      data: task.data || {},
      created_at: task.created_at,
    }));
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reducedTasks));
    console.log(`LabelStudioService: Saved ${reducedTasks.length} ${projectType} tasks to AsyncStorage`);
  } catch (error) {
    console.error(`LabelStudioService: Error saving tasks - ${error.message}`);
    // If storage error occurs, try with fewer items
    if (error.message.includes('SecureStore')) {
      console.warn('LabelStudioService: Storage size issue detected, trying with fewer items');
      try {
        // Limit to 20 tasks to avoid storage issues
        const reducedTasks = tasks.slice(0, 20);
        const STORAGE_KEY = STORAGE_KEYS[projectType]; // Get the storage key again
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reducedTasks));
        console.log(`LabelStudioService: Saved ${reducedTasks.length} ${projectType} tasks after reduction`);
      } catch (retryError) {
        console.error(`LabelStudioService: Retry failed - ${retryError.message}`);
      }
    } else {
      throw error;
    }
  }
};

/**
 * Get cached tasks from AsyncStorage
 * @param {string} projectType - Type of project (TEXT_SENTIMENT or IMAGE_CLASSIFICATION)
 * @returns {Promise<Array>} Array of cached tasks
 */
export const getCachedTasks = async (projectType = 'TEXT_SENTIMENT') => {
  try {
    const STORAGE_KEY = STORAGE_KEYS[projectType];
    const tasksJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (!tasksJson) return null;

    return JSON.parse(tasksJson);
  } catch (error) {
    console.error(`LabelStudioService: Error retrieving cached tasks - ${error.message}`);
    return null;
  }
};

/**
 * Submit an annotation to Label Studio
 * @param {number} taskId - The task ID to annotate
 * @param {string} value - The annotation value (e.g., sentiment, yes/no, animal type)
 * @param {string} projectType - Type of project (TEXT_SENTIMENT, IMAGE_CLASSIFICATION, etc.)
 * @returns {Promise<Object>} The response from the API
 */
export const submitAnnotation = async (taskId, value, projectType = 'TEXT_SENTIMENT') => {
  console.log(`LabelStudioService: Submitting ${projectType} annotation for task ${taskId} with value ${value}`);
  const API_TOKEN = getApiToken();
  
  try {
    // Create the annotation payload based on project type
    let annotation;
    
    if (projectType === 'TEXT_SENTIMENT') {
      annotation = {
        task: taskId,
        result: [
          {
            from_name: 'sentiment',
            to_name: 'text',
            type: 'choices',
            value: {
              choices: [value].filter(Boolean)
            }
          }
        ]
      };
    } else if (projectType === 'IMAGE_CLASSIFICATION') {
      annotation = {
        task: taskId,
        result: [
          {
            from_name: 'animal_type',
            to_name: 'image',
            type: 'choices',
            value: {
              choices: [value].filter(Boolean)
            }
          }
        ]
      };
    } else if (projectType === 'AUDIO_CLASSIFICATION') {
      annotation = {
        task: taskId,
        result: [
          {
            from_name: 'audio_class',
            to_name: 'audio',
            type: 'choices',
            value: {
              choices: [value].filter(Boolean)
            }
          }
        ]
      };
    } else if (projectType === 'SURVEY') {
      // For surveys, the value parameter is expected to be the complete annotation object
      // with all questions and responses already formatted
      if (value && typeof value === 'object' && value.result) {
        annotation = {
          task: taskId,
          result: Array.isArray(value.result) ? value.result : []
        };
      } else {
        console.warn('LabelStudioService: Survey annotation format is incorrect, using fallback');
        annotation = {
          task: taskId,
          result: [
            {
              from_name: 'survey_choice',
              to_name: 'survey_text',
              type: 'choices',
              value: {
                choices: [typeof value === 'string' ? value : 'completed']
              }
            }
          ]
        };
      }
    } else if (projectType === 'GEOSPATIAL_LABELING') {
      annotation = {
        task: taskId,
        result: [
          {
            from_name: 'geo_feature',
            to_name: 'geo_image',
            type: 'choices',
            value: {
              choices: [value].filter(Boolean)
            }
          }
        ]
      };
    } else {
      // Default case for any other project type
      annotation = {
        task: taskId,
        result: [
          {
            from_name: 'default',
            to_name: 'task',
            type: 'choices',
            value: {
              choices: [typeof value === 'string' ? value : 'completed']
            }
          }
        ]
      };
    }
    
    // Ensure annotation has valid result
    if (!annotation || !annotation.result || !Array.isArray(annotation.result)) {
      console.warn('LabelStudioService: Invalid annotation format, creating default');
      annotation = {
        task: taskId,
        result: [
          {
            from_name: 'default',
            to_name: 'task',
            type: 'choices',
            value: {
              choices: ['completed']
            }
          }
        ]
      };
    }
    
    // Try to detect if network is available before attempting the request
    let networkAvailable = false;
    try {
      const testResponse = await fetch('https://www.google.com', { 
        method: 'HEAD',
        timeout: 3000
      });
      networkAvailable = testResponse.ok;
    } catch (e) {
      console.log('Network appears to be offline, using mock submission');
      networkAvailable = false;
    }
    
    // If network is unavailable and mocks are enabled, use mock submission
    if (!networkAvailable && USE_MOCK_DATA_WHEN_OFFLINE) {
      console.log('LabelStudioService: Using mock annotation submission');
      return MockService.submitMockAnnotation(taskId, projectType, annotation);
    }
    
    // Submit the annotation to Label Studio
    const response = await fetch(`${API_URL}${ANNOTATIONS_ENDPOINT(taskId)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(annotation),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LabelStudioService: API error response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('LabelStudioService: Annotation submitted successfully:', data);
    return data;
  } catch (error) {
    console.error(`LabelStudioService: Error submitting annotation - ${error.message}`);
    throw error;
  }
};

/**
 * Create image classification tasks in Label Studio
 * @returns {Promise<boolean>} Success status
 */
export const createImageClassificationTasks = async () => {
  const API_TOKEN = getApiToken();
  const projectId = PROJECTS.IMAGE_CLASSIFICATION;
  const TASKS_ENDPOINT = getTasksEndpoint(projectId);
  
  try {
    console.log('LabelStudioService: Creating image classification tasks...');
    
    // Image tasks to create
    const imageTasks = [
      {
        data: {
          image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          question: 'Does this image contain a dog?',
          options: [
            { id: 'yes', text: 'Yes', value: 'yes' },
            { id: 'no', text: 'No', value: 'no' }
          ]
        }
      },
      {
        data: {
          image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          question: 'Is this a cat?',
          options: [
            { id: 'yes', text: 'Yes', value: 'yes' },
            { id: 'no', text: 'No', value: 'no' }
          ]
        }
      },
      {
        data: {
          image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          question: 'Is this a bird?',
          options: [
            { id: 'yes', text: 'Yes', value: 'yes' },
            { id: 'no', text: 'No', value: 'no' }
          ]
        }
      },
      {
        data: {
          image: 'https://images.unsplash.com/photo-1553284965-e2815db2e5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          question: 'Is this a horse?',
          options: [
            { id: 'yes', text: 'Yes', value: 'yes' },
            { id: 'no', text: 'No', value: 'no' }
          ]
        }
      },
      {
        data: {
          image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          question: 'Is this a fish?',
          options: [
            { id: 'yes', text: 'Yes', value: 'yes' },
            { id: 'no', text: 'No', value: 'no' }
          ]
        }
      },
      {
        data: {
          image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          question: 'Is this a rabbit?',
          options: [
            { id: 'yes', text: 'Yes', value: 'yes' },
            { id: 'no', text: 'No', value: 'no' }
          ]
        }
      },
      {
        data: {
          image: 'https://images.unsplash.com/photo-1518546305927-5a28ddc2a8ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          question: 'Is this a turtle?',
          options: [
            { id: 'yes', text: 'Yes', value: 'yes' },
            { id: 'no', text: 'No', value: 'no' }
          ]
        }
      },
      {
        data: {
          image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          question: 'Is this a monkey?',
          options: [
            { id: 'yes', text: 'Yes', value: 'yes' },
            { id: 'no', text: 'No', value: 'no' }
          ]
        }
      },
      {
        data: {
          image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          question: 'Is this a bear?',
          options: [
            { id: 'yes', text: 'Yes', value: 'yes' },
            { id: 'no', text: 'No', value: 'no' }
          ]
        }
      },
      {
        data: {
          image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          question: 'Is this a lion?',
          options: [
            { id: 'yes', text: 'Yes', value: 'yes' },
            { id: 'no', text: 'No', value: 'no' }
          ]
        }
      }
    ];
    
    // Create each task in Label Studio
    for (const task of imageTasks) {
      const response = await fetch(`${API_URL}${TASKS_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`LabelStudioService: Error creating task: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const createdTask = await response.json();
      console.log(`LabelStudioService: Created task ${createdTask.id} successfully`);
    }
    
    console.log('LabelStudioService: All image classification tasks created successfully');
    return true;
  } catch (error) {
    console.error(`LabelStudioService: Error creating image classification tasks - ${error.message}`);
    return false;
  }
};

/**
 * Update geospatial tasks in Label Studio with working image URLs
 * @returns {Promise<boolean>} Success status
 */
export const updateGeospatialTasks = async () => {
  const API_TOKEN = getApiToken();
  const projectId = PROJECTS.GEOSPATIAL_LABELING;
  const TASKS_ENDPOINT = getTasksEndpoint(projectId);
  
  try {
    console.log('LabelStudioService: Updating geospatial tasks with working image URLs...');
    
    // Working image URLs from imgur
    const workingImageUrls = [
      { id: 28, image: 'https://i.imgur.com/pMZcCuH.jpg', location_name: 'Agricultural Land' },
      { id: 29, image: 'https://i.imgur.com/8kcsS6G.jpg', location_name: 'Mountain Region' },
      { id: 30, image: 'https://i.imgur.com/qYYEcnE.jpg', location_name: 'Desert Region' }
    ];
    
    // Update each task
    for (const task of workingImageUrls) {
      const response = await fetch(`${API_URL}/api/tasks/${task.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            image: task.image,
            location_name: task.location_name,
            question: 'What is the most prominent feature in this map?',
            options: [
              { id: 'building', text: 'Buildings', value: 'building' },
              { id: 'road', text: 'Roads', value: 'road' },
              { id: 'water', text: 'Water', value: 'water' },
              { id: 'vegetation', text: 'Vegetation', value: 'vegetation' }
            ]
          }
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`LabelStudioService: Error updating task ${task.id}: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      console.log(`LabelStudioService: Successfully updated task ${task.id} with working image URL`);
    }
    
    console.log('LabelStudioService: All geospatial tasks updated successfully');
    return true;
  } catch (error) {
    console.error(`LabelStudioService: Error updating geospatial tasks - ${error.message}`);
    return false;
  }
};

/**
 * Create audio classification tasks in Label Studio
 * @returns {Promise<boolean>} Success status
 */
export const createAudioClassificationTasks = async () => {
  const API_TOKEN = getApiToken();
  const projectId = PROJECTS.AUDIO_CLASSIFICATION;
  const TASKS_ENDPOINT = getTasksEndpoint(projectId);
  
  try {
    console.log('LabelStudioService: Creating audio classification tasks...');
    
    // Audio tasks to create - using reliable audio sources with CORS enabled
    const audioTasks = [
      {
        data: {
          audio: 'https://assets.mixkit.co/sfx/preview/mixkit-doorbell-single-press-333.mp3',
          question: 'What type of sound is this?',
          options: [
            { id: 'doorbell', text: 'Doorbell', value: 'doorbell' },
            { id: 'alarm', text: 'Alarm', value: 'alarm' },
            { id: 'notification', text: 'Notification', value: 'notification' },
            { id: 'other', text: 'Other', value: 'other' }
          ]
        }
      },
      {
        data: {
          audio: 'https://assets.mixkit.co/sfx/preview/mixkit-dog-barking-twice-1.mp3',
          question: 'Which animal is making this sound?',
          options: [
            { id: 'dog', text: 'Dog', value: 'dog' },
            { id: 'cat', text: 'Cat', value: 'cat' },
            { id: 'bird', text: 'Bird', value: 'bird' },
            { id: 'other', text: 'Other', value: 'other' }
          ]
        }
      },
      {
        data: {
          audio: 'https://assets.mixkit.co/sfx/preview/mixkit-metal-hammer-hit-833.mp3',
          question: 'What is the most likely source of this sound?',
          options: [
            { id: 'construction', text: 'Construction', value: 'construction' },
            { id: 'household', text: 'Household', value: 'household' },
            { id: 'industrial', text: 'Industrial', value: 'industrial' },
            { id: 'other', text: 'Other', value: 'other' }
          ]
        }
      },
      {
        data: {
          audio: 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3',
          question: 'What type of sound effect is this?',
          options: [
            { id: 'videogame', text: 'Video Game', value: 'videogame' },
            { id: 'movie', text: 'Movie', value: 'movie' },
            { id: 'music', text: 'Music', value: 'music' },
            { id: 'other', text: 'Other', value: 'other' }
          ]
        }
      },
      {
        data: {
          audio: 'https://assets.mixkit.co/sfx/preview/mixkit-thunder-rumble-1295.mp3',
          question: 'What weather phenomenon does this sound represent?',
          options: [
            { id: 'thunder', text: 'Thunder', value: 'thunder' },
            { id: 'rain', text: 'Rain', value: 'rain' },
            { id: 'wind', text: 'Wind', value: 'wind' },
            { id: 'other', text: 'Other', value: 'other' }
          ]
        }
      }
    ];
    
    // Create each task in Label Studio
    let createdCount = 0;
    for (const task of audioTasks) {
      try {
        const response = await fetch(`${API_URL}${TASKS_ENDPOINT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`LabelStudioService: Error creating audio task: ${errorText}`);
          continue;
        }
        
        const createdTask = await response.json();
        console.log(`LabelStudioService: Created audio task ${createdTask.id} successfully`);
        createdCount++;
      } catch (taskError) {
        console.error(`LabelStudioService: Error creating audio task: ${taskError.message}`);
      }
    }
    
    console.log(`LabelStudioService: Created ${createdCount}/${audioTasks.length} audio classification tasks successfully`);
    
    // Force a refresh of the audio tasks in cache
    if (createdCount > 0) {
      await fetchTasks('AUDIO_CLASSIFICATION', 1, true);
    }
    
    return createdCount > 0;
  } catch (error) {
    console.error(`LabelStudioService: Error creating audio classification tasks - ${error.message}`);
    return false;
  }
};

export function transformAnnotationForSubmission(result) {
  try {
    console.log('Transforming annotation for submission:', JSON.stringify(result, null, 2));
    
    const { questionResults, formData } = result;
    
    // Ensure questionResults is an array and not empty
    if (!Array.isArray(questionResults) || questionResults.length === 0) {
      console.error('Invalid questionResults format:', questionResults);
      return null;
    }
    
    const annotations = questionResults.map(qr => {
      // Ensure qr and qr.options are valid before accessing properties
      if (!qr || !Array.isArray(qr.options) || qr.options.length === 0) {
        console.error('Invalid question result format:', qr);
        return null;
      }
      
      const selectedOption = qr.options.find(opt => opt.selected);
      
      if (!selectedOption) {
        console.error('No selected option found in:', qr.options);
        return null;
      }
      
      return {
        id: qr.id,
        selectedAnswer: selectedOption.value,
        confidence: selectedOption.confidence || 1,
      };
    }).filter(annotation => annotation !== null); // Filter out any null annotations
    
    return {
      annotations,
      formData,
    };
  } catch (error) {
    console.error('Error transforming annotation:', error);
    return null;
  }
}

// Export all functions as a default object
export default {
  fetchTasks,
  saveTasks,
  getCachedTasks,
  submitAnnotation,
  createImageClassificationTasks,
  createAudioClassificationTasks,
  updateGeospatialTasks,
  getApiUrl,
  setApiUrl
};