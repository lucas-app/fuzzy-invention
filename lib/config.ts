// lib/config.ts
// Centralized configuration for the LUCAS app
// Supports environment variables and runtime configuration

import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration interface
export interface AppConfig {
  // API Configuration
  apiBaseUrl: string;
  apiToken: string;
  
  // Feature flags
  useMockData: boolean;
  useMockDataWhenOffline: boolean;
  
  // Project IDs in Label Studio
  projects: {
    IMAGE_CLASSIFICATION: number;
    AUDIO_CLASSIFICATION: number;
    TEXT_SENTIMENT: number;
    GEOSPATIAL_LABELING: number;
    SURVEY: number;
    RLHF: number;
  };
  
  // Storage keys for cached tasks
  storageKeys: {
    IMAGE_CLASSIFICATION: string;
    AUDIO_CLASSIFICATION: string;
    TEXT_SENTIMENT: string;
    GEOSPATIAL_LABELING: string;
    SURVEY: string;
    RLHF: string;
  };
  
  // Timeouts and limits
  requestTimeout: number;
  maxRetries: number;
  taskExpiryTime: number;
}

// Default configuration
const DEFAULT_CONFIG: AppConfig = {
  // API Configuration - can be overridden by environment variables
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.101:8080',
  apiToken: process.env.EXPO_PUBLIC_API_TOKEN || '6dbe8bfb6904aee34b8ea19dece6a7e7267c838d',
  
  // Feature flags
  useMockData: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true' || false,
  useMockDataWhenOffline: process.env.EXPO_PUBLIC_USE_MOCK_DATA_WHEN_OFFLINE === 'true' || false,
  
  // Project IDs in Label Studio
  projects: {
    IMAGE_CLASSIFICATION: 4,
    AUDIO_CLASSIFICATION: 2,
    TEXT_SENTIMENT: 2,
    GEOSPATIAL_LABELING: 7,
    SURVEY: 5,
    RLHF: 2, // Using the same project as TEXT_SENTIMENT for now
  },
  
  // Storage keys for cached tasks
  storageKeys: {
    IMAGE_CLASSIFICATION: 'CACHED_IMAGE_TASKS',
    AUDIO_CLASSIFICATION: 'CACHED_AUDIO_TASKS',
    TEXT_SENTIMENT: 'CACHED_TEXT_TASKS',
    GEOSPATIAL_LABELING: 'CACHED_GEOSPATIAL_TASKS',
    SURVEY: 'CACHED_SURVEY_TASKS',
    RLHF: 'CACHED_RLHF_TASKS',
  },
  
  // Timeouts and limits
  requestTimeout: 15000, // 15 seconds
  maxRetries: 3,
  taskExpiryTime: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Runtime configuration storage key
const RUNTIME_CONFIG_KEY = 'LUCAS_RUNTIME_CONFIG';

// Current configuration instance
let currentConfig: AppConfig = { ...DEFAULT_CONFIG };

/**
 * Get the current configuration
 */
export const getConfig = (): AppConfig => {
  return { ...currentConfig };
};

/**
 * Update the configuration at runtime
 */
export const updateConfig = async (updates: Partial<AppConfig>): Promise<void> => {
  currentConfig = { ...currentConfig, ...updates };
  
  // Save to AsyncStorage for persistence
  try {
    await AsyncStorage.setItem(RUNTIME_CONFIG_KEY, JSON.stringify(currentConfig));
    console.log('Config updated and saved:', updates);
  } catch (error) {
    console.error('Failed to save config to AsyncStorage:', error);
  }
};

/**
 * Reset configuration to defaults
 */
export const resetConfig = async (): Promise<void> => {
  currentConfig = { ...DEFAULT_CONFIG };
  
  try {
    await AsyncStorage.removeItem(RUNTIME_CONFIG_KEY);
    console.log('Config reset to defaults');
  } catch (error) {
    console.error('Failed to remove config from AsyncStorage:', error);
  }
};

/**
 * Load configuration from AsyncStorage on app startup
 */
export const loadConfig = async (): Promise<void> => {
  try {
    const savedConfig = await AsyncStorage.getItem(RUNTIME_CONFIG_KEY);
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      currentConfig = { ...DEFAULT_CONFIG, ...parsedConfig };
      console.log('Loaded saved config from AsyncStorage');
    } else {
      console.log('No saved config found, using defaults');
    }
  } catch (error) {
    console.error('Failed to load config from AsyncStorage:', error);
    // Fall back to default config
    currentConfig = { ...DEFAULT_CONFIG };
  }
};

/**
 * Get specific configuration values
 */
export const getApiBaseUrl = (): string => currentConfig.apiBaseUrl;
export const getApiToken = (): string => currentConfig.apiToken;
export const getProjects = () => currentConfig.projects;
export const getStorageKeys = () => currentConfig.storageKeys;
export const getRequestTimeout = (): number => currentConfig.requestTimeout;
export const getMaxRetries = (): number => currentConfig.maxRetries;
export const getTaskExpiryTime = (): number => currentConfig.taskExpiryTime;
export const shouldUseMockData = (): boolean => currentConfig.useMockData;
export const shouldUseMockDataWhenOffline = (): boolean => currentConfig.useMockDataWhenOffline;

/**
 * Helper function to get project ID by type
 */
export const getProjectId = (projectType: string): number => {
  const projectId = currentConfig.projects[projectType as keyof typeof currentConfig.projects];
  if (projectId === undefined) {
    console.warn(`Unknown project type: ${projectType}, defaulting to TEXT_SENTIMENT`);
    return currentConfig.projects.TEXT_SENTIMENT;
  }
  return projectId;
};

/**
 * Helper function to get storage key by project type
 */
export const getStorageKey = (projectType: string): string => {
  const storageKey = currentConfig.storageKeys[projectType as keyof typeof currentConfig.storageKeys];
  if (storageKey === undefined) {
    console.warn(`Unknown project type: ${projectType}, defaulting to TEXT_SENTIMENT storage key`);
    return currentConfig.storageKeys.TEXT_SENTIMENT;
  }
  return storageKey;
};

// Initialize config on module load
loadConfig().catch(console.error);

export default {
  getConfig,
  updateConfig,
  resetConfig,
  loadConfig,
  getApiBaseUrl,
  getApiToken,
  getProjects,
  getStorageKeys,
  getRequestTimeout,
  getMaxRetries,
  getTaskExpiryTime,
  shouldUseMockData,
  shouldUseMockDataWhenOffline,
  getProjectId,
  getStorageKey,
}; 