import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import BaseTaskScreen from './BaseTaskScreen';

// Helper function to validate audio URLs
const isValidAudioUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if it's a valid URL
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  
  // Check if it has a valid audio extension
  const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
  const hasValidExtension = validExtensions.some(ext => url.toLowerCase().endsWith(ext));
  
  // Some services don't include file extensions in URLs but have audio in the path or use query parameters
  const containsAudioIndicator = url.includes('audio') || 
                                url.includes('sound') ||
                                url.includes('mp3') || 
                                url.includes('wav');
  
  return hasValidExtension || containsAudioIndicator;
};

// Helper function to extract audio URL or convert video URL to audio URL
const getAudioUrl = (url: string): string => {
  if (isVideoFile(url)) {
    // For Google Cloud Storage URLs, we can try to get the audio track
    // by appending an audio-only parameter
    if (url.includes('storage.googleapis.com')) {
      // Add audio-only parameter if supported by your backend
      return `${url}#audio`;
    }
    // If it's a video file and we can't extract audio, we'll need to show an error
    console.warn('Video file detected, audio extraction might not be supported:', url);
  }
  return url;
};

// Utility function to check if a file is a video instead of audio
const isVideoFile = (url: string): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

// Type for Audio Playback Status
interface AudioPlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  didJustFinish: boolean;
  error?: string;
}

// Type for Task
interface Task {
  id: number;
  data: {
    audio?: string;
    question?: string;
    options?: Option[];
  };
}

// Type for Option
interface Option {
  id: string;
  text: string;
  value: string;
}

// Audio Player Component
const AudioPlayer = ({ task, onTaskChanged }: { task: Task, onTaskChanged: (taskId: number) => void }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<AudioPlaybackStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastTaskIdRef = useRef<number | null>(null);

  // Check if task has changed
  useEffect(() => {
    if (task && task.id !== lastTaskIdRef.current) {
      stopAudio();
      lastTaskIdRef.current = task.id;
      setError(null);
      onTaskChanged(task.id);
    }
  }, [task?.id, onTaskChanged]);

  // Initialize audio session
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };
    initAudio();
  }, []);
  
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

  // Handle playback status updates
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPlaybackStatus({
        isLoaded: true,
        isPlaying: status.isPlaying,
        positionMillis: status.positionMillis || 0,
        durationMillis: status.durationMillis || 0,
        didJustFinish: status.didJustFinish || false,
      });
      
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    } else if (status.error) {
      console.error('Playback error:', status.error);
      setPlaybackStatus({
        isLoaded: false,
        isPlaying: false,
        positionMillis: 0,
        durationMillis: 0,
        didJustFinish: false,
        error: status.error.toString()
      });
      setIsPlaying(false);
    }
  };

  // Simple stop audio function
  const stopAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setPlaybackStatus(null);
      } catch (error) {
        console.error('Error stopping audio:', error);
        Alert.alert('Error', 'Failed to stop audio playback');
      }
    }
  };

  // Load and play audio function
  const loadAndPlayAudio = async (audioSource: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First stop any playing audio
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Validate the audio URL
      if (!audioSource) {
        setError('No audio source provided for this task.');
        setIsLoading(false);
        return;
      }
      
      console.log('Loading audio from:', audioSource);
      
      // Check if the URL is valid
      if (!isValidAudioUrl(audioSource)) {
        console.warn('Invalid audio URL, using fallback audio:', audioSource);
        
        // Use local fallback audio
        try {
          const { sound: localSound } = await Audio.Sound.createAsync(
            require('../../../assets/fallback-audio.mp3'),
            {
              shouldPlay: true,
              volume: 1.0,
              isLooping: false,
            },
            onPlaybackStatusUpdate
          );
          
          setSound(localSound);
          setError('Using local audio file - audio URL is invalid.');
          setIsLoading(false);
          return;
        } catch (localError) {
          console.error('Error playing local audio:', localError);
          setError('Could not play audio. Please check your device settings and try again.');
          setIsLoading(false);
          return;
        }
      }
      
      // Try to load the remote audio source
      try {
        console.log('Attempting to load remote audio:', audioSource);
        const { sound: remoteSound } = await Audio.Sound.createAsync(
          { uri: audioSource },
          {
            shouldPlay: true,
            volume: 1.0,
            isLooping: false,
          },
          onPlaybackStatusUpdate
        );
        
        setSound(remoteSound);
        setIsPlaying(true);
        setIsLoading(false);
      } catch (remoteError) {
        console.error('Failed to load remote audio, falling back to local:', remoteError);
        // If remote fails, fall back to local audio
        try {
          const { sound: localSound } = await Audio.Sound.createAsync(
            require('../../../assets/fallback-audio.mp3'),
            {
              shouldPlay: true,
              volume: 1.0,
              isLooping: false,
            },
            onPlaybackStatusUpdate
          );
          
          setSound(localSound);
          setError('Remote audio failed to load, using local audio file instead.');
          setIsLoading(false);
        } catch (localError) {
          console.error('Error playing local audio:', localError);
          setError('Could not play audio. Please check your device settings and try again.');
          setIsLoading(false);
        }
      }
    } catch (error: unknown) {
      console.error('Audio playback error:', error);
      setIsLoading(false);
      setIsPlaying(false);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          setError('Failed to load audio file. Please check your internet connection.');
        } else if (error.message.includes('format')) {
          setError('This audio format is not supported on your device.');
        } else if (error.message.includes('permission')) {
          setError('Audio permissions not granted. Please allow audio playback in settings.');
        } else {
          setError(`Could not play this audio file: ${error.message.slice(0, 100)}`);
        }
      } else {
        setError('An unexpected error occurred while playing the audio.');
      }
    }
  };

  // Toggle play/pause
  const togglePlayback = async (audioSource: string) => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      } else {
        await loadAndPlayAudio(audioSource);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Error', 'Failed to control audio playback');
    }
  };

  // Format duration in mm:ss
  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const question = task.data.question || 'What type of sound is this?';
  const audioUrl = task.data.audio;
  
  return (
    <View style={styles.contentContainer}>
      <Text style={styles.question}>{question}</Text>
      
      <View style={styles.mediaContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playingButton]}
              onPress={() => audioUrl ? togglePlayback(audioUrl) : Alert.alert('Error', 'No audio available')}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <>
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={36} 
                    color="white" 
                    style={styles.playIcon}
                  />
                  <Text style={styles.playButtonText}>
                    {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play Audio'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            {playbackStatus?.isLoaded && (
              <View style={styles.progressContainer}>
                <Text style={styles.durationText}>
                  {formatDuration(playbackStatus.positionMillis)} / {formatDuration(playbackStatus.durationMillis)}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${(playbackStatus.positionMillis / playbackStatus.durationMillis) * 100}%`
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const AudioClassificationScreen = () => {
  // Used to track when task changes and stop audio
  const handleTaskChanged = () => {
    // No need to do anything here - the AudioPlayer component handles task changes internally
  };

  // Render the audio task content - crucially, we DO NOT use hooks here
  const renderTaskContent = (task: Task) => {
    if (!task) return null;
    return <AudioPlayer task={task} onTaskChanged={handleTaskChanged} />;
  };

  // Render options for audio classification
  const renderOptions = (task: Task | null, selectedOption: string | null, onSelect: (id: string) => void) => {
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
  const formatAnnotation = (task: Task | null, selectedOption: string | null) => {
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
    padding: 16,
    alignItems: 'center',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  mediaContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  playButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  playingButton: {
    backgroundColor: '#d97706',
  },
  playIcon: {
    marginRight: 8,
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedOptionButton: {
    backgroundColor: '#FEF3C7',
    borderColor: '#f59e0b',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
  },
  durationText: {
    color: '#6B7280',
    fontSize: 12,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginVertical: 16,
    width: '90%',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AudioClassificationScreen;
