// LabelStudioService.ts
// Service to interact with Label Studio API
// Provides functions for fetching tasks, submitting annotations, and handling offline fallbacks

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MockService from './MockLabelStudioService';
import { Database } from '@/types/supabase';
import { Alert } from 'react-native';

// Constants for API and projects
const API_URL = 'http://192.168.1.106:8080';
const API_TOKEN = 'ae7b71fb2f3603cf1ccf341ee9514ec935e5c961';
// Force use of Label Studio only - disable mock data
const USE_MOCK_DATA = false; 
const USE_MOCK_DATA_WHEN_OFFLINE = false;

// Project IDs in Label Studio
const PROJECTS = {
  IMAGE_CLASSIFICATION: 4,
  AUDIO_CLASSIFICATION: 2,
  TEXT_SENTIMENT: 2,
  GEOSPATIAL_LABELING: 7,
  SURVEY: 5,
};

// Storage keys for cached tasks
const STORAGE_KEYS = {
  IMAGE_CLASSIFICATION: 'CACHED_IMAGE_TASKS',
  AUDIO_CLASSIFICATION: 'CACHED_AUDIO_TASKS',
  TEXT_SENTIMENT: 'CACHED_TEXT_TASKS',
  GEOSPATIAL_LABELING: 'CACHED_GEOSPATIAL_TASKS',
  SURVEY: 'CACHED_SURVEY_TASKS'
};

// Helper function to get API token
const getApiToken = () => 'ae7b71fb2f3603cf1ccf341ee9514ec935e5c961';

// Task interface based on Label Studio API response
export interface Task {
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

// Endpoint helpers
const getTasksEndpoint = (projectId: number) => `/api/projects/${projectId}/tasks/`;
const ANNOTATIONS_ENDPOINT = (taskId: number) => `/api/tasks/${taskId}/annotations/`;

// Main functions for interacting with Label Studio

/**
 * Fetches tasks from Label Studio API
 * No longer falls back to mock data
 */
const fetchTasks = async (
  projectType: string = 'TEXT_SENTIMENT',
  retries: number = 3,
  forceRefresh: boolean = false
): Promise<Task[]> => {
  try {
    console.log(`LabelStudioService: Fetching ${projectType} tasks, retries=${retries}`);
    // Always force refresh for TEXT_SENTIMENT to avoid cache issues
    if (projectType === 'TEXT_SENTIMENT') {
      forceRefresh = true;
      console.log('LabelStudioService: Forcing refresh for TEXT_SENTIMENT to avoid cache issues');
    }
    
    // Force refresh for IMAGE_CLASSIFICATION until the new project ID is cached
    if (projectType === 'IMAGE_CLASSIFICATION') {
      forceRefresh = true;
      console.log('LabelStudioService: Forcing refresh for IMAGE_CLASSIFICATION to use updated project ID');
    }
    
    // Force refresh for GEOSPATIAL_LABELING to use updated project ID (7)
    if (projectType === 'GEOSPATIAL_LABELING') {
      forceRefresh = true;
      console.log('LabelStudioService: Forcing refresh for GEOSPATIAL_LABELING to use updated project ID (7)');
    }
    
    // Clear cache if forceRefresh is true
    if (forceRefresh) {
      try {
        const storageKey = STORAGE_KEYS[projectType as keyof typeof STORAGE_KEYS];
        if (storageKey) {
          await AsyncStorage.removeItem(storageKey);
          console.log(`LabelStudioService: Cleared cache for ${projectType}`);
        }
      } catch (e) {
        console.error("Error clearing cache:", e);
      }
    }
    // If not forcing refresh, try to get cached tasks first
    else {
      const cachedTasks = await getCachedTasks(projectType);
      if (cachedTasks && cachedTasks.length > 0) {
        console.log(`LabelStudioService: Using cached ${projectType} tasks, count=${cachedTasks.length}`);
        return cachedTasks;
      }
    }
    
    // Get project ID based on project type
    let projectId: number;
    switch (projectType) {
      case 'IMAGE_CLASSIFICATION':
        projectId = PROJECTS.IMAGE_CLASSIFICATION;
        break;
      case 'AUDIO_CLASSIFICATION':
        projectId = PROJECTS.AUDIO_CLASSIFICATION;
        break;
      case 'TEXT_SENTIMENT':
        projectId = PROJECTS.TEXT_SENTIMENT;
        break;
      case 'GEOSPATIAL_LABELING':
        projectId = PROJECTS.GEOSPATIAL_LABELING;
        break;
      case 'SURVEY':
        projectId = PROJECTS.SURVEY;
        break;
      default:
        projectId = PROJECTS.TEXT_SENTIMENT;
    }
    
    // Fetch tasks from Label Studio API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Longer timeout (15s instead of 10s)
    
    // Log the full URL being accessed for debugging
    const fullUrl = `${API_URL}${getTasksEndpoint(projectId)}`;
    console.log(`LabelStudioService: Fetching from URL: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${getApiToken()}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Handle API response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LabelStudioService: API error response: ${errorText}`);
      
      // Retry if there are retries left
      if (retries > 0) {
        console.log(`LabelStudioService: Retrying fetch (${retries} retries left)`);
        return fetchTasks(projectType, retries - 1, forceRefresh);
      }
      
      // If all retries failed, throw a clear error
      throw new Error(`Failed to fetch tasks from Label Studio (${response.status}): ${errorText}`);
    }
    
    // Parse and process the tasks
    const tasks = await response.json() as Task[];
    console.log(`LabelStudioService: Fetched ${tasks.length} tasks from API`);
    
    if (tasks.length === 0) {
      console.warn(`LabelStudioService: No tasks returned from Label Studio for ${projectType}`);
      // No need to save empty tasks or return mock data
      return [];
    }
    
    // Log tasks with their is_labeled status to debug
    tasks.forEach(task => {
      console.log(`Task ID ${task.id}: is_labeled=${!!task.is_labeled}`);
    });
    
    // TEMPORARY FIX: For debugging - return all tasks regardless of labeled status
    console.log(`LabelStudioService: Returning all ${tasks.length} tasks without filtering`);
    await saveTasks(tasks, projectType);
    return tasks;
    
    /* Original filtering logic - commented out for debugging
    // Filter out any tasks that have already been labeled
    const unlabeledTasks = tasks.filter(task => !task.is_labeled);
    console.log(`LabelStudioService: ${unlabeledTasks.length} unlabeled tasks available`);
    
    // Cache the unlabeled tasks
    if (unlabeledTasks.length > 0) {
      await saveTasks(unlabeledTasks, projectType);
    }
    
    return unlabeledTasks;
    */
  } catch (error: unknown) {
    console.error(`LabelStudioService: Error fetching tasks - ${error instanceof Error ? error.message : String(error)}`);
    
    // Check if we have cached tasks as a last resort
    try {
      const cachedTasks = await getCachedTasks(projectType);
      if (cachedTasks && cachedTasks.length > 0) {
        console.log(`LabelStudioService: Using cached tasks due to fetch error`);
        return cachedTasks;
      }
    } catch (cacheError) {
      console.error("Failed to retrieve cached tasks:", cacheError);
    }
    
    // Throw the error for the calling component to handle
    throw error;
  }
};

/**
 * Saves tasks to AsyncStorage for offline use
 */
const saveTasks = async (
  tasks: Task[],
  projectType: string = 'TEXT_SENTIMENT'
): Promise<void> => {
  try {
    const storageKey = STORAGE_KEYS[projectType as keyof typeof STORAGE_KEYS] || STORAGE_KEYS.TEXT_SENTIMENT;
    await AsyncStorage.setItem(storageKey, JSON.stringify(tasks));
    console.log(`LabelStudioService: Saved ${tasks.length} ${projectType} tasks to cache`);
  } catch (error: unknown) {
    console.error(`LabelStudioService: Error saving tasks to cache - ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Gets cached tasks from AsyncStorage
 */
const getCachedTasks = async (
  projectType: string = 'TEXT_SENTIMENT'
): Promise<Task[] | null> => {
  try {
    const storageKey = STORAGE_KEYS[projectType as keyof typeof STORAGE_KEYS] || STORAGE_KEYS.TEXT_SENTIMENT;
    const tasksJson = await AsyncStorage.getItem(storageKey);
    if (tasksJson) {
      const tasks = JSON.parse(tasksJson) as Task[];
      console.log(`LabelStudioService: Retrieved ${tasks.length} ${projectType} tasks from cache`);
      return tasks;
    }
    return null;
  } catch (error: unknown) {
    console.error(`LabelStudioService: Error getting cached tasks - ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

/**
 * Submits an annotation to Label Studio API
 * Falls back to mock submission if server is unavailable
 */
export const submitAnnotation = async (
  taskId: number,
  value: any,
  projectType: string = 'TEXT_SENTIMENT'
): Promise<any> => {
  try {
    console.log(`LabelStudioService: Submitting annotation for task ${taskId} (${projectType})`);
    // Always use the annotation payload as provided
    const formattedAnnotation = value;
    console.log(`LabelStudioService: Formatted annotation:`, JSON.stringify(formattedAnnotation));
    
    // Check if network is available
    let networkAvailable = true;
    try {
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error('Network request timeout')), 5000);
      });
      
      const fetchPromise = fetch(`${API_URL}/health-check`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const timeoutId = setTimeout(() => {
        console.log('Network request timed out');
        networkAvailable = false;
      }, 5000);
      
      const testResponse = await Promise.race([fetchPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      networkAvailable = testResponse.ok;
    } catch (e) {
      console.log('Network appears to be offline, using mock submission');
      networkAvailable = false;
    }
    
    // If network is unavailable and mocks are enabled, use mock submission
    if (!networkAvailable && USE_MOCK_DATA_WHEN_OFFLINE) {
      console.log('LabelStudioService: Using mock annotation submission');
      return MockService.submitMockAnnotation(taskId, projectType, formattedAnnotation);
    }
    
    // Construct the full API endpoint URL for better debugging
    const endpointUrl = `${API_URL}${ANNOTATIONS_ENDPOINT(taskId)}`;
    console.log(`LabelStudioService: Submitting to endpoint: ${endpointUrl}`);
    
    // Submit the annotation to Label Studio
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${getApiToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedAnnotation),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LabelStudioService: API error response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('LabelStudioService: Annotation submitted successfully:', data);
    return data;
  } catch (error: unknown) {
    console.error(`LabelStudioService: Error submitting annotation - ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

const updateGeospatialTasks = async (): Promise<boolean> => {
  try {
    console.log('Updating geospatial tasks...');
    // Implementation would go here in a real scenario
    // For now, just return success
    return true;
  } catch (error) {
    console.error('Error updating geospatial tasks:', error);
    return false;
  }
};

/**
 * Create audio classification tasks in Label Studio
 * @returns Promise<boolean> Success status
 */
const createAudioClassificationTasks = async (): Promise<boolean> => {
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
      } catch (taskError: any) {
        console.error(`LabelStudioService: Error creating audio task: ${taskError.message}`);
      }
    }
    
    console.log(`LabelStudioService: Created ${createdCount}/${audioTasks.length} audio classification tasks successfully`);
    
    // Force a refresh of the audio tasks in cache
    if (createdCount > 0) {
      await fetchTasks('AUDIO_CLASSIFICATION', 1, true);
    }
    
    return createdCount > 0;
  } catch (error: any) {
    console.error(`LabelStudioService: Error creating audio classification tasks - ${error.message}`);
    return false;
  }
};

/**
 * Saves a completed task to Label Studio
 * @param task The task that was completed
 * @param answers The user's answers for the task
 * @param projectId The Label Studio project ID
 */
const saveTaskCompletion = async (
  task: Task,
  answers: any,
  projectId: number
): Promise<any> => {
  try {
    console.log(`LabelStudioService: Saving task completion for task ${task.id} in project ${projectId}`);
    
    // Format the annotation based on the task type/project
    let formattedAnswers;
    
    // Different project types have different annotation formats
    switch (projectId) {
      case PROJECTS.IMAGE_CLASSIFICATION:
        formattedAnswers = {
          "result": [
            {
              "value": {
                "choices": Array.isArray(answers) ? answers : [answers]
              },
              "from_name": "choice",
              "to_name": "image",
              "type": "choices"
            }
          ]
        };
        break;
      
      case PROJECTS.AUDIO_CLASSIFICATION:
        formattedAnswers = {
          "result": [
            {
              "value": {
                "choices": Array.isArray(answers) ? answers : [answers]
              },
              "from_name": "sentiment",
              "to_name": "audio",
              "type": "choices"
            }
          ]
        };
        break;
      
      case PROJECTS.TEXT_SENTIMENT:
        formattedAnswers = {
          "result": [
            {
              "value": {
                "choices": Array.isArray(answers) ? answers : [answers]
              },
              "from_name": "sentiment",
              "to_name": "text",
              "type": "choices"
            }
          ]
        };
        break;
      
      case PROJECTS.GEOSPATIAL_LABELING:
        formattedAnswers = {
          "result": [
            {
              "value": {
                "choices": Array.isArray(answers) ? answers : [answers]
              },
              "from_name": "location",
              "to_name": "image",
              "type": "choices"
            }
          ]
        };
        break;
      
      case PROJECTS.SURVEY:
        formattedAnswers = {
          "result": [
            {
              "value": {
                "choices": Array.isArray(answers) ? answers : [answers]
              },
              "from_name": "survey",
              "to_name": "question",
              "type": "choices"
            }
          ]
        };
        break;
      
      default:
        formattedAnswers = {
          "result": [
            {
              "value": {
                "choices": Array.isArray(answers) ? answers : [answers]
              },
              "from_name": "choice",
              "to_name": "question",
              "type": "choices"
            }
          ]
        };
    }
    
    // Submit the annotation to Label Studio
    const response = await fetch(`${API_URL}${ANNOTATIONS_ENDPOINT(task.id)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${getApiToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedAnswers)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LabelStudioService: Failed to save task completion - ${response.status}: ${errorText}`);
      throw new Error(`Failed to save task completion (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`LabelStudioService: Successfully saved task completion for task ${task.id}`);
    
    return result;
  } catch (error) {
    console.error(`LabelStudioService: Error saving task completion - ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

// Export all functions as a service object
export default {
  fetchTasks,
  saveTasks,
  getCachedTasks,
  submitAnnotation,
  updateGeospatialTasks,
  createAudioClassificationTasks,
  getApiToken,
  API_URL,
  PROJECTS,
  saveTaskCompletion
};
