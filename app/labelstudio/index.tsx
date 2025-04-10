import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Import task-specific screens
import AudioClassificationScreen from './tasks/AudioClassification';
import ImageClassificationScreen from './tasks/ImageClassification';
import TextSentimentScreen from './tasks/TextSentiment';
import SurveyScreen from './tasks/Survey';
import GeospatialLabelingScreen from './tasks/GeospatialLabeling';
import FixGeospatialTasks from './tasks/FixGeospatialTasks';

export default function LabelStudioRouter() {
  const { projectType } = useLocalSearchParams();
  
  // Render the appropriate screen based on project type
  switch (projectType) {
    case 'AUDIO_CLASSIFICATION':
      return <AudioClassificationScreen />;
      
    case 'IMAGE_CLASSIFICATION':
      return <ImageClassificationScreen />;
      
    case 'TEXT_SENTIMENT':
      return <TextSentimentScreen />;
      
    case 'SURVEY':
      return <SurveyScreen />;
      
    case 'GEOSPATIAL_LABELING':
      return <GeospatialLabelingScreen />;
      
    case 'FIX_GEOSPATIAL':
      return <FixGeospatialTasks />;
      
    default:
      // Show loading or error state if project type is not recognized
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unknown project type: {projectType || 'Not specified'}
          </Text>
          <Text style={styles.errorSubtext}>
            Please go back and select a valid task type.
          </Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
