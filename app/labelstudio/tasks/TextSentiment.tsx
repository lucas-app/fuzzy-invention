import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import BaseTaskScreen from './BaseTaskScreen';

const { width } = Dimensions.get('window');

const TextSentimentScreen = () => {
  // Render text sentiment task content
  const renderTaskContent = (task) => {
    if (!task) return null;
    
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.question}>{task.data.question || 'What is the sentiment of this text?'}</Text>
        
        <View style={styles.textContainer}>
          <Text style={styles.textContent}>{task.data.text}</Text>
          {task.data.source && (
            <Text style={styles.textDetails}>Source: {task.data.source}</Text>
          )}
        </View>
      </View>
    );
  };

  // Render sentiment options
  const renderOptions = (task, selectedOption, onSelect) => {
    if (!task) return null;
    
    // Default options if not provided in task data
    const options = task.data.options || [
      { id: 'positive', text: 'Positive', value: 'positive' },
      { id: 'neutral', text: 'Neutral', value: 'neutral' },
      { id: 'negative', text: 'Negative', value: 'negative' }
    ];
    
    return (
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              option.id === 'positive' && styles.positiveButton,
              option.id === 'neutral' && styles.neutralButton,
              option.id === 'negative' && styles.negativeButton,
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
  const formatAnnotation = (task, selectedOption) => {
    return {
      result: [
        {
          from_name: 'sentiment',
          to_name: 'text',
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
      taskTitle="Text Sentiment"
      themeColor="#10b981"
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    marginBottom: 24,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 24,
  },
  textContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textContent: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
  },
  textDetails: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 8,
    minWidth: width * 0.25,
    alignItems: 'center',
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
  positiveButton: {
    backgroundColor: '#10b981',
  },
  neutralButton: {
    backgroundColor: '#6c757d',
  },
  negativeButton: {
    backgroundColor: '#ef4444',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TextSentimentScreen;
