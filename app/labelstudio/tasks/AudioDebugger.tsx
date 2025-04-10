import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { Stack } from 'expo-router';

// Test audio files from different sources
const TEST_AUDIO_FILES = [
  {
    name: 'FileSamples MP3 1',
    url: 'https://filesamples.com/samples/audio/mp3/sample1.mp3',
  },
  {
    name: 'FileSamples MP3 2',
    url: 'https://filesamples.com/samples/audio/mp3/sample2.mp3',
  },
  {
    name: 'FileSamples MP3 3',
    url: 'https://filesamples.com/samples/audio/mp3/sample3.mp3',
  },
  // Add more test files as needed
];

export default function AudioDebugger() {
  const [playbackStatus, setPlaybackStatus] = useState<Record<string, string>>({});
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Function to play audio
  const playAudio = async (url: string) => {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.unloadAsync();
      }

      setPlaybackStatus(prev => ({ ...prev, [url]: 'Loading...' }));
      console.log(`Attempting to play audio from: ${url}`);

      // Create and load the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            if (status.isPlaying) {
              setPlaybackStatus(prev => ({ ...prev, [url]: 'Playing' }));
            } else if (status.didJustFinish) {
              setPlaybackStatus(prev => ({ ...prev, [url]: 'Finished' }));
            } else {
              setPlaybackStatus(prev => ({ ...prev, [url]: 'Paused' }));
            }
          }
        }
      );

      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlaybackStatus(prev => ({ ...prev, [url]: `Error: ${error.message}` }));
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Audio Debugger' }} />
      
      <Text style={styles.title}>Audio File Tester</Text>
      <Text style={styles.subtitle}>Test different audio sources for compatibility</Text>
      
      <ScrollView style={styles.scrollView}>
        {TEST_AUDIO_FILES.map((file, index) => (
          <View key={index} style={styles.audioItem}>
            <Text style={styles.audioName}>{file.name}</Text>
            <Text style={styles.audioUrl}>{file.url}</Text>
            <View style={styles.controls}>
              <TouchableOpacity 
                style={styles.playButton} 
                onPress={() => playAudio(file.url)}
              >
                <Text style={styles.buttonText}>Play</Text>
              </TouchableOpacity>
              <Text style={styles.status}>
                Status: {playbackStatus[file.url] || 'Not played'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  audioItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  audioName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  audioUrl: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  status: {
    flex: 1,
    fontSize: 14,
  },
});
