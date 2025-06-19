# LUCAS App Configuration

This document explains how to configure the LUCAS app using the centralized configuration system.

## Overview

The app uses a centralized configuration system located in `lib/config.ts` that supports:
- Environment variables for build-time configuration
- Runtime configuration updates via the settings screen
- Persistent storage of configuration changes
- Fallback to default values

## Configuration Options

### API Configuration
- `apiBaseUrl`: The base URL for the Label Studio API
- `apiToken`: The authentication token for Label Studio API

### Feature Flags
- `useMockData`: Whether to use mock data instead of real API calls
- `useMockDataWhenOffline`: Whether to use mock data when offline

### Project IDs
- `IMAGE_CLASSIFICATION`: Label Studio project ID for image classification tasks
- `AUDIO_CLASSIFICATION`: Label Studio project ID for audio classification tasks
- `TEXT_SENTIMENT`: Label Studio project ID for text sentiment analysis tasks
- `GEOSPATIAL_LABELING`: Label Studio project ID for geospatial labeling tasks
- `SURVEY`: Label Studio project ID for survey tasks
- `RLHF`: Label Studio project ID for RLHF tasks

### Timeouts and Limits
- `requestTimeout`: API request timeout in milliseconds (default: 15000ms)
- `maxRetries`: Maximum number of retry attempts for failed requests (default: 3)
- `taskExpiryTime`: How long cached tasks are valid (default: 24 hours)

## Environment Variables

You can configure the app using environment variables by creating a `.env` file in the root directory:

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.101:8080
EXPO_PUBLIC_API_TOKEN=ae7b71fb2f3603cf1ccf341ee9514ec935e5c961

# Feature Flags
EXPO_PUBLIC_USE_MOCK_DATA=false
EXPO_PUBLIC_USE_MOCK_DATA_WHEN_OFFLINE=false
```

**Note**: All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the React Native app.

## Runtime Configuration

Users can update the API base URL at runtime through the Settings screen:

1. Navigate to the Settings tab
2. Find the "API Configuration" section
3. Tap the edit icon next to "API Base URL"
4. Enter the new URL and save

## Default Configuration

If no environment variables are set and no runtime configuration has been saved, the app uses these defaults:

```typescript
{
  apiBaseUrl: 'http://192.168.1.101:8080',
  apiToken: 'ae7b71fb2f3603cf1ccf341ee9514ec935e5c961',
  useMockData: false,
  useMockDataWhenOffline: false,
  projects: {
    IMAGE_CLASSIFICATION: 4,
    AUDIO_CLASSIFICATION: 2,
    TEXT_SENTIMENT: 2,
    GEOSPATIAL_LABELING: 7,
    SURVEY: 5,
    RLHF: 2,
  },
  requestTimeout: 15000,
  maxRetries: 3,
  taskExpiryTime: 24 * 60 * 60 * 1000, // 24 hours
}
```

## Using Configuration in Code

Import the configuration functions from `lib/config.ts`:

```typescript
import {
  getApiBaseUrl,
  getApiToken,
  getProjectId,
  getStorageKey,
  getRequestTimeout,
  getMaxRetries,
  shouldUseMockData,
  updateConfig,
  resetConfig,
} from '@/lib/config';

// Get configuration values
const apiUrl = getApiBaseUrl();
const projectId = getProjectId('TEXT_SENTIMENT');

// Update configuration at runtime
await updateConfig({ apiBaseUrl: 'http://new-url:8080' });

// Reset to defaults
await resetConfig();
```

## Troubleshooting

### API Connection Issues
1. Check that the API base URL is correct and accessible from your device
2. Ensure the device and server are on the same network
3. Verify that the API token is valid
4. Check firewall settings on the server

### Configuration Not Persisting
1. Ensure the app has proper permissions to write to AsyncStorage
2. Check that the configuration is being saved correctly in the settings screen
3. Restart the app after making configuration changes

### Environment Variables Not Working
1. Make sure all environment variables are prefixed with `EXPO_PUBLIC_`
2. Restart the development server after adding environment variables
3. Check that the `.env` file is in the root directory of the project 