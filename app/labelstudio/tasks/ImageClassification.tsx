import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import BaseTaskScreen from './BaseTaskScreen';

// Define types for task and option objects
interface TaskData {
  image?: string;
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

const ImageClassificationScreen = () => {
  // Debug on load
  useEffect(() => {
    console.log('ImageClassification screen loaded');
  }, []);

  // Render image classification task content
  const renderTaskContent = (task: Task | null) => {
    if (!task) {
      console.log('ImageClassification: task is null, cannot render content');
      return null;
    }
    
    console.log('ImageClassification: Rendering content for task:', task.id);
    console.log('ImageClassification: Task data:', JSON.stringify(task.data, null, 2));
    
    // Get image URL from task data
    const imageUrl = task.data.image;
    
    if (!imageUrl) {
      console.log('ImageClassification: No image URL found in task data');
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.question}>No image available for this task</Text>
        </View>
      );
    }
    
    // Get question from task data or use default
    const question = task.data.question || 'What animal is shown in this image?';
    
    console.log('ImageClassification: Using image URL:', imageUrl);
    
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.question}>{question}</Text>
        
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.imageMedia}
            resizeMode="cover"
            onLoad={() => console.log('ImageClassification: Image loaded successfully')}
            onError={(error) => console.log('ImageClassification: Image load error:', error.nativeEvent.error)}
          />
        </View>
      </View>
    );
  };

  // Render image classification options
  const renderOptions = (task: Task | null, selectedOption: string | null, onSelect: (optionId: string) => void) => {
    if (!task) {
      console.log('ImageClassification: task is null, cannot render options');
      return null;
    }
    
    console.log('ImageClassification: Rendering options for task:', task.id);
    
    // Hardcoded options to ensure we always have some options to show
    const defaultOptions = [
      { id: 'lion', text: 'Lion', value: 'lion' },
      { id: 'cat', text: 'Cat', value: 'cat' },
      { id: 'dog', text: 'Dog', value: 'dog' },
      { id: 'bird', text: 'Bird', value: 'bird' },
      { id: 'tiger', text: 'Tiger', value: 'tiger' },
      { id: 'other', text: 'Other', value: 'other' }
    ];
    
    // Use options from task data if available and non-empty
    const options = (task.data.options && task.data.options.length > 0) 
      ? task.data.options 
      : defaultOptions;
    
    console.log('ImageClassification: Using options:', JSON.stringify(options));
    console.log('ImageClassification: Number of options:', options.length);
    
    // Render the options
    return (
      <View style={styles.outerContainer}>
        <Text style={styles.optionsTitle}>Select an option:</Text>
        <View style={styles.optionsContainer}>
          {options.map((option: Option, index: number) => (
            <TouchableOpacity
              key={option.id || `option-${index}`}
              style={[
                styles.optionButton,
                selectedOption === option.id && styles.selectedOptionButton
              ]}
              onPress={() => {
                console.log('ImageClassification: Option selected:', option.id);
                onSelect(option.id);
              }}
            >
              <Text style={styles.optionText}>{option.text || `Option ${index+1}`}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Format annotation for submission
  const formatAnnotation = (task: Task | null, selectedOption: string | null) => {
    if (!selectedOption) {
      console.log('ImageClassification: No option selected, returning empty result');
      return { result: [] };
    }
    
    if (!task) {
      console.log('ImageClassification: Task is null, cannot format annotation');
      return { result: [] };
    }
    
    console.log('ImageClassification: Formatting annotation for task:', task.id);
    console.log('ImageClassification: Selected option:', selectedOption);
    
    // Create the annotation object with the correct field names
    const annotation = {
      result: [
        {
          from_name: 'animal_type',
          to_name: 'image',
          type: 'choices',
          value: {
            choices: [selectedOption]
          }
        }
      ]
    };
    
    console.log('ImageClassification: Annotation formatted:', JSON.stringify(annotation));
    return annotation;
  };

  return (
    <BaseTaskScreen
      renderTaskContent={renderTaskContent}
      renderOptions={renderOptions}
      formatAnnotation={formatAnnotation}
      taskTitle="Image Classification"
      themeColor="#3b82f6"
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
  },
  imageMedia: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  outerContainer: {
    width: '100%',
    marginBottom: 24,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  selectedOptionButton: {
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#2563eb',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ImageClassificationScreen;
