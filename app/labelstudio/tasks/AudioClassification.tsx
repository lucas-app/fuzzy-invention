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
import { Audio, AVPlaybackStatus } from 'expo-av';
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

// We don't need a custom PlaybackStatus interface since we're using AVPlaybackStatus from expo-av

const { width } = Dimensions.get('window');

const AudioClassificationScreen = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);
  
  // Stop audio when task changes
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

  // Play audio for audio classification tasks
  const playAudio = async (uri: string) => {
    try {
      // First, ensure we have audio permissions
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (!permissionResponse.granted) {
        Alert.alert(
          'Permission Required',
          'Audio playback requires microphone permissions',
          [{ text: 'OK' }]
        );
        return;
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Unload any existing sound
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Show playing state immediately for better UX
      setIsPlaying(true);
      
      console.log('Attempting to play audio from:', uri);
      
      // Create and play the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      
      // Explicitly play the sound
      const playbackStatus = await newSound.playAsync();
      console.log('Playback status:', playbackStatus);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      
      // Show more detailed error message
      let errorMessage = 'Unable to play this audio file. Please try again later.';
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('NSURLErrorDomain')) {
          errorMessage = 'Network error: The audio file could not be loaded. Please check your internet connection and try again.';
        } else if (error.message.includes('AVFoundation')) {
          errorMessage = 'Audio format error: This audio file format is not supported.';
        }
      }
      
      Alert.alert(
        'Audio Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  // Monitor audio playback status
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  // Render audio task content
  const renderTaskContent = (task: Task | null) => {
    if (!task) return null;
    
    // If task ID has changed, stop any playing audio
    if (task.id !== currentTaskId) {
      stopAudio();
      setCurrentTaskId(task.id);
    }
    
    // Extract question from task data or use default
    const question = task.data.question || 'What type of sound is this?';
    
    // Check if audio URL exists
    const audioUrl = task.data.audio;
    if (!audioUrl) {
      console.error('No audio URL provided for task:', task.id);
    }
    
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.question}>{question}</Text>
        
        <View style={styles.mediaContainer}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playingButton]}
            onPress={() => audioUrl ? playAudio(audioUrl) : Alert.alert('Error', 'No audio available')}
            disabled={isPlaying || !audioUrl}
          >
            <Ionicons 
              name={isPlaying ? "pause-circle" : "play-circle"} 
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

  // Render audio classification options
  const renderOptions = (task: Task | null, selectedOption: string, onSelect: (optionId: string) => void) => {
    if (!task) return null;
    
    // Default options if not provided in task data
    const options = task.data.options || [
      { id: 'alarm', text: 'Alarm', value: 'alarm' },
      { id: 'doorbell', text: 'Doorbell', value: 'doorbell' },
      { id: 'phone', text: 'Phone Ringing', value: 'phone' },
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
    // Stop any playing audio when submitting a task
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
