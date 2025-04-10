import React from 'react';
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
  // Render image classification task content
  const renderTaskContent = (task: Task | null) => {
    if (!task) return null;
    
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.question}>{task.data.question || 'What animal is shown in this image?'}</Text>
        
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: task.data.image }}
            style={styles.imageMedia}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  };

  // Render image classification options
  const renderOptions = (task: Task | null, selectedOption: string, onSelect: (optionId: string) => void) => {
    if (!task) return null;
    
    // Default animal options if not provided in task data
    const options = task.data.options || [
      { id: 'cat', text: 'Cat', value: 'cat' },
      { id: 'dog', text: 'Dog', value: 'dog' },
      { id: 'bird', text: 'Bird', value: 'bird' },
      { id: 'rabbit', text: 'Rabbit', value: 'rabbit' },
      { id: 'hamster', text: 'Hamster', value: 'hamster' },
      { id: 'other', text: 'Other', value: 'other' }
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
          from_name: 'image_class',
          to_name: 'image',
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
    backgroundColor: '#3b82f6',
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

export default ImageClassificationScreen;
