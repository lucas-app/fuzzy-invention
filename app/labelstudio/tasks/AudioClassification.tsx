import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import BaseTaskScreen from './BaseTaskScreen';

// Define types for task and option objects
interface TaskData {
  audio?: string;
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

// Audio playback methods will now work directly with remote URLs

const { width } = Dimensions.get('window');

const AudioClassificationScreen = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  
  // Clean up function when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        try {
          sound.unloadAsync();
        } catch (e) {
          console.log('Error unloading sound', e);
        }
      }
    };
  }, [sound]);

  // Simple stop audio function
  const stopAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
  };

  // Simplified play audio function for remote URLs
  const playAudio = async (audioSource) => {
    try {
      // First stop any playing audio
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      
      setIsPlaying(true);
      console.log('Playing audio from URL:', audioSource);
      
      // We've removed local audio files in favor of remote MP4 filesURL
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioSource },
        { shouldPlay: true, volume: 1.0, isMuted: false, isLooping: false, rate: 1.0, shouldCorrectPitch: true, downloadAsync: true },
        (status) => {
          if (status.isLoaded) {
            // When playback is complete
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          } else if (status.error) {
            console.error('Playback error:', status.error);
            setIsPlaying(false);
          }
        }
      );
      
      // Save reference to control playback
      setSound(newSound);
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
      Alert.alert('Error', 'Could not play this audio file');
    }
  };

  // Render the audio task content
  const renderTaskContent = (task) => {
    if (!task) return null;
    
    // If task ID changed, stop any playing audio
    if (task.id !== currentTaskId) {
      stopAudio();
      setCurrentTaskId(task.id);
    }
    
    const question = task.data.question || 'What type of sound is this?';
    const audioUrl = task.data.audio;
    
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.question}>{question}</Text>
        
        <View style={styles.mediaContainer}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playingButton]}
            onPress={() => audioUrl ? playAudio(audioUrl) : Alert.alert('Error', 'No audio available')}
            disabled={isPlaying}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={36} 
              color="white" 
              style={styles.playIcon}
            />
            <Text style={styles.playButtonText}>
              {isPlaying ? 'Playing...' : 'Play Audio'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render options for audio classification
  const renderOptions = (task, selectedOption, onSelect) => {
    if (!task) return null;
    
    // Use options from task data or default options
    const options = task.data.options || [
      { id: 'alarm', text: 'Alarm', value: 'alarm' },
      { id: 'doorbell', text: 'Doorbell', value: 'doorbell' },
      { id: 'phone', text: 'Phone Ringing', value: 'phone' },
      { id: 'other', text: 'Other', value: 'other' }
    ];
    
    return (
      <View style={styles.optionsContainer}>
        {options.map((option) => (
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
  const formatAnnotation = (task, selectedOption) => {
    // Stop any playing audio when submitting
    stopAudio();
    
    return {
      result: [
        {
          from_name: 'audio_choice',
          to_name: 'audio',
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
      taskTitle="Audio Classification"
      themeColor="#f59e0b"
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
  playButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginVertical: 16,
    minWidth: width * 0.6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playingButton: {
    backgroundColor: '#6c757d',
  },
  playIcon: {
    marginRight: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
    minWidth: 120,
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
  greenButton: {
    backgroundColor: '#28a745',
  },
  redButton: {
    backgroundColor: '#dc3545',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AudioClassificationScreen;
