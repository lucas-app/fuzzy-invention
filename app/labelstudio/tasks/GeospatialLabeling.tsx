import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseTaskScreen from './BaseTaskScreen';
import { getCachedTasks } from '../../../services/LabelStudioService';

// Define types for task and option objects
interface TaskData {
  map_image?: string;
  image?: string; // Also handle 'image' property from Label Studio API
  location_name?: string;
  question?: string;
  options?: Option[];
}

interface Task {
  id: number;
  data: TaskData;
}

interface Option {
  id: string;
  text: string;
  value: string;
}

const { width } = Dimensions.get('window');

const GeospatialLabelingScreen = () => {
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState(false);
  const [fallbackTasks, setFallbackTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [originalTaskId, setOriginalTaskId] = useState<number | null>(null);

  // Load fallback tasks from local storage if needed
  useEffect(() => {
    const loadFallbackTasks = async () => {
      try {
        const cachedTasks = await getCachedTasks('GEOSPATIAL_LABELING');
        if (cachedTasks && cachedTasks.length > 0) {
          // Filter tasks that have valid image URLs - use local tasks from tasks.json
          const validTasks = cachedTasks.filter(t => 
            t.data && (t.data.map_image || t.data.image) && 
            // Prefer tasks with map_image property (from local tasks.json)
            (t.data.map_image?.includes('imgur.com') || false)
          );
          setFallbackTasks(validTasks);
        }
      } catch (error) {
        console.error('Failed to load fallback tasks:', error);
      }
    };
    
    loadFallbackTasks();
  }, []);

  // Initialize task when it changes
  useEffect(() => {
    if (currentTask === null && fallbackTasks.length > 0) {
      // Start with a fallback task that has a working image
      setCurrentTask(fallbackTasks[0]);
    }
  }, [fallbackTasks, currentTask]);

  // Render geospatial labeling task content
  const renderTaskContent = (task: Task | null) => {
    if (!task) return null;
    
    // If we haven't stored the original task ID yet, store it
    if (originalTaskId === null && task) {
      setOriginalTaskId(task.id);
    }
    
    // Use current task (which might be a fallback) or the original task
    const displayTask = currentTask || task;
    const imageUrl = displayTask.data.map_image || displayTask.data.image;
    
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.question}>{displayTask.data.question || 'Identify the feature in this map:'}</Text>
        
        <View style={styles.mediaContainer}>
          {imageLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Loading map image...</Text>
            </View>
          )}
          {imageError && (
            <View style={styles.loadingContainer}>
              <Ionicons name="alert-circle" size={32} color="#ff0000" />
              <Text style={styles.errorText}>Failed to load image. Using fallback...</Text>
            </View>
          )}
          <Image
            source={{ uri: imageUrl }}
            style={[styles.mapImage, (imageLoading || imageError) && { opacity: 0.3 }]}
            resizeMode="cover"
            onLoadStart={() => {
              setImageLoading(true);
              setImageError(false);
            }}
            onLoad={() => {
              setImageLoading(false);
              setImageError(false);
            }}
            onError={() => {
              console.error('Error loading map image:', imageUrl);
              setImageLoading(false);
              setImageError(true);
              
              // Try to use a fallback image from our local tasks
              if (fallbackTasks.length > 0 && !currentTask) {
                const fallbackTask = fallbackTasks[0];
                console.log('Using fallback task:', fallbackTask.id);
                setCurrentTask(fallbackTask);
              }
            }}
          />
          <View style={styles.mapInfoContainer}>
            <Ionicons name="location" size={20} color="#ef4444" />
            <Text style={styles.mapInfo}>
              {displayTask.data.location_name || 'Location data'}
              {currentTask && originalTaskId !== currentTask.id ? ' (Fallback image)' : ''}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render geospatial labeling options
  const renderOptions = (task: Task | null, selectedOption: string, onSelect: (optionId: string) => void) => {
    if (!task) return null;
    
    // Default options if not provided in task data
    const options = task.data.options || [
      { id: 'building', text: 'Building', value: 'building' },
      { id: 'road', text: 'Road', value: 'road' },
      { id: 'water', text: 'Water', value: 'water' },
      { id: 'vegetation', text: 'Vegetation', value: 'vegetation' }
    ];
    
    return (
      <View style={styles.optionsContainer}>
        {options.map((option: Option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedOption === option.id && styles.selectedOptionButton
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Format annotation for submission
  const formatAnnotation = (task: Task | null, selectedOption: string) => {
    return {
      result: [
        {
          from_name: 'geo_feature',
          to_name: 'map',
          type: 'choices',
          value: {
            choices: [selectedOption]
          }
        }
      ]
    };
  };

  return (
    <BaseTaskScreen
      renderTaskContent={renderTaskContent}
      renderOptions={renderOptions}
      formatAnnotation={formatAnnotation}
      taskTitle="Geospatial Labeling"
      themeColor="#8b5cf6"
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 24,
  },
  mediaContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: width * 0.9,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ff0000',
    textAlign: 'center',
  },
  mapImage: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  mapInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  mapInfo: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
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
    textAlign: 'center',
  },
});

export default GeospatialLabelingScreen;
