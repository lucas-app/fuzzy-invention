/**
 * LabelStudioService.js
 * Service to handle interactions with the Label Studio API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import tasksJson from '../assets/tasks.json';

// Constants
const API_URL = 'http://192.168.1.106:9090';
// Force token refresh by adding it as a function that's called each time
const getApiToken = () => '501c980772e98d56cab53109683af59c36ce5778';

// Project IDs
const PROJECTS = {
  TEXT_SENTIMENT: 1,       // Text sentiment project
  IMAGE_CLASSIFICATION: 2, // Image classification project
  AUDIO_CLASSIFICATION: 3, // Audio classification project
  SURVEY: 4,               // Survey project
  GEOSPATIAL_LABELING: 5,  // Geospatial labeling project
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

// Endpoints
const getTasksEndpoint = (projectId) => `/api/projects/${projectId}/tasks/`;
const ANNOTATIONS_ENDPOINT = (taskId) => `/api/tasks/${taskId}/annotations/`;
const TIMEOUT_MS = 5000; // 5 seconds timeout

/**
 * Fetch tasks from Label Studio API
 * @param {string} projectType - Type of project (TEXT_SENTIMENT or IMAGE_CLASSIFICATION)
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Array>} Array of tasks
 */
export const fetchTasks = async (projectType = 'TEXT_SENTIMENT', retries = 3) => {
  const projectId = PROJECTS[projectType];
  const TASKS_ENDPOINT = getTasksEndpoint(projectId);
  const STORAGE_KEY = STORAGE_KEYS[projectType];
  
  console.log(`LabelStudioService: Fetching ${projectType} tasks from API...`);
  console.log(`LabelStudioService: API URL: ${API_URL}${TASKS_ENDPOINT}`);
  console.log(`LabelStudioService: Project ID: ${projectId}`);
  const API_TOKEN = getApiToken(); // Get fresh token each time
  console.log(`LabelStudioService: API Token: ${API_TOKEN.substring(0, 5)}...${API_TOKEN.substring(API_TOKEN.length - 5)}`);
  let lastError = null;

  for (let i = 0; i < retries; i++) {
    try {
      // We'll check for cached tasks only after API fails
      // This ensures we always try to get fresh data first

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      
      console.log(`LabelStudioService: Attempt ${i + 1}/${retries} - Fetching from ${API_URL}${TASKS_ENDPOINT}`);

      // Fetch tasks from Label Studio API
      const response = await fetch(`${API_URL}${TASKS_ENDPOINT}`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`LabelStudioService: Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`LabelStudioService: API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('LabelStudioService: Fetched data:', data);

      // Handle pagination: Extract tasks array
      const tasksArray = Array.isArray(data) ? data : data.results || [];
      console.log('LabelStudioService: Extracted tasks:', tasksArray);

      // Optimize storage: Store only essential fields
      const slimTasks = tasksArray.map(task => ({
        id: task.id,
        created_at: task.created_at,
        data: {
          link: task.data?.link,
          str: task.data?.str,
          text: task.data?.text,
          title: task.data?.title,
          image: task.data?.image, // Add image field for image classification tasks
        },
      }));

      // Save to AsyncStorage
      await saveTasks(slimTasks);

      return tasksArray;
    } catch (error) {
      lastError = error;
      console.error(`LabelStudioService: Attempt ${i + 1} failed:`, error.message);

      // If AbortController error (timeout), provide specific message
      if (error.name === 'AbortError') {
        console.warn('LabelStudioService: Request timed out after 5 seconds');
      }

      if (i === retries - 1) {
        console.warn(`LabelStudioService: All retries failed, attempting to use cached ${projectType} tasks`);
        const cachedTasks = await getCachedTasks(projectType);
        if (cachedTasks && cachedTasks.length > 0) {
          console.log(`LabelStudioService: Using cached ${projectType} tasks`);
          return cachedTasks;
        }

        console.log(`LabelStudioService: Using local fallback ${projectType} tasks`);
        // Return appropriate fallback tasks based on project type
        if (projectType === 'IMAGE_CLASSIFICATION') {
          return require('../assets/image_classification_tasks.json');
        } else {
          return tasksJson; // Default to text sentiment tasks
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw lastError;
};

/**
 * Save tasks to AsyncStorage
 * @param {Array} tasks - Tasks to save
 * @param {string} projectType - Type of project (TEXT_SENTIMENT or IMAGE_CLASSIFICATION)
 */
export const saveTasks = async (tasks, projectType = 'TEXT_SENTIMENT') => {
  try {
    const STORAGE_KEY = STORAGE_KEYS[projectType];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    console.log(`LabelStudioService: Saved ${tasks.length} ${projectType} tasks to AsyncStorage`);
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
              choices: [value]
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
              choices: [value]
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
              choices: [value]
            }
          }
        ]
      };
    } else if (projectType === 'SURVEY') {
      annotation = {
        task: taskId,
        result: [
          {
            from_name: 'survey_choice',
            to_name: 'survey_text',
            type: 'choices',
            value: {
              choices: [value]
            }
          }
        ]
      };
    } else if (projectType === 'GEOSPATIAL_LABELING') {
      annotation = {
        task: taskId,
        result: [
          {
            from_name: 'geo_feature',
            to_name: 'geo_image',
            type: 'choices',
            value: {
              choices: [value]
            }
          }
        ]
      };
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