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

export const fetchTasks = async (projectType = 'TEXT_SENTIMENT', retries = 3) => {
  const projectId = PROJECTS[projectType];
  const TASKS_ENDPOINT = getTasksEndpoint(projectId);
  const STORAGE_KEY = STORAGE_KEYS[projectType];
  
  console.log(`LabelStudioService: Fetching ${projectType} tasks from API...`);
  
  // For SURVEY project type, use the local tasks.json file directly
  if (projectType === 'SURVEY') {
    try {
      console.log('LabelStudioService: Using local survey tasks from tasks.json');
      const surveyTasks = tasksJson.filter(task => task.id >= 100 && task.id < 200);
      
      if (surveyTasks && surveyTasks.length > 0) {
        console.log(`LabelStudioService: Found ${surveyTasks.length} survey tasks`);
        return surveyTasks;
      } else {
        console.log('LabelStudioService: No survey tasks found in tasks.json');
        return [];
      }
    } catch (error) {
      console.error(`LabelStudioService: Error loading survey tasks - ${error.message}`);
      return [];
    }
  }
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
          // Include all possible data fields based on project type
          link: task.data?.link,
          str: task.data?.str,
          text: task.data?.text,
          title: task.data?.title,
          image: task.data?.image,
          audio: task.data?.audio,
          question: task.data?.question,
          description: task.data?.description,
          // For geospatial labeling, use map_image if available, otherwise use image
          map_image: task.data?.map_image || (projectType === 'GEOSPATIAL_LABELING' ? task.data?.image : undefined),
          location_name: task.data?.location_name,
          options: task.data?.options
        },
      }));

      // Save to AsyncStorage with the correct project type
      await saveTasks(slimTasks, projectType);

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
      // For surveys, the value parameter is expected to be the complete annotation object
      // with all questions and responses already formatted
      annotation = {
        task: taskId,
        result: value.result || []
      };
      
      // If the value doesn't have the expected format, create a fallback
      if (!value.result) {
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