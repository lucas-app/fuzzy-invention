import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../../store/authStore';
import { getConfig, updateConfig, resetConfig } from '../../../lib/config';

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [isEditingApiUrl, setIsEditingApiUrl] = useState(false);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const config = getConfig();
      setApiBaseUrl(config.apiBaseUrl);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleUpdateApiUrl = async () => {
    if (!apiBaseUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid API URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(apiBaseUrl);
    } catch {
      Alert.alert('Error', 'Please enter a valid URL (e.g., http://192.168.1.100:8080)');
      return;
    }

    Alert.alert(
      'Update API URL',
      `Are you sure you want to update the API URL to:\n${apiBaseUrl}`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await updateConfig({ apiBaseUrl: apiBaseUrl.trim() });
              setIsEditingApiUrl(false);
              Alert.alert('Success', 'API URL updated successfully. The app will use the new URL for future requests.');
            } catch (error) {
              console.error('Error updating API URL:', error);
              Alert.alert('Error', 'Failed to update API URL');
            }
          }
        }
      ]
    );
  };

  const handleResetConfig = async () => {
    Alert.alert(
      'Reset Configuration',
      'This will reset all configuration settings to their default values. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetConfig();
              await loadCurrentConfig();
              Alert.alert('Success', 'Configuration reset to defaults successfully.');
            } catch (error) {
              console.error('Error resetting config:', error);
              Alert.alert('Error', 'Failed to reset configuration');
            }
          }
        }
      ]
    );
  };

  const clearAppCache = async () => {
    Alert.alert(
      'Clear App Cache',
      'This will clear all stored data including tasks and progress. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Clearing app cache...');
              
              // Get all keys from AsyncStorage
              const keys = await AsyncStorage.getAllKeys();
              console.log('Keys to be cleared:', keys);
              
              // Remove all keys except auth-related ones and config
              const keysToRemove = keys.filter(
                key => !key.includes('auth') && !key.includes('user-profile') && !key.includes('LUCAS_RUNTIME_CONFIG')
              );
              
              if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
                console.log('Cache cleared successfully');
                Alert.alert('Success', 'App cache cleared successfully. Please restart the app.');
              } else {
                console.log('No cache to clear');
                Alert.alert('Info', 'No cache to clear');
              }
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          }
        }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Settings',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email || 'Not available'}</Text>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.label}>API Base URL</Text>
            {isEditingApiUrl ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.textInput}
                  value={apiBaseUrl}
                  onChangeText={setApiBaseUrl}
                  placeholder="http://192.168.1.100:8080"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity 
                    style={[styles.editButton, styles.saveButton]} 
                    onPress={handleUpdateApiUrl}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.editButton, styles.cancelButton]} 
                    onPress={() => {
                      setIsEditingApiUrl(false);
                      loadCurrentConfig();
                    }}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{apiBaseUrl}</Text>
                <TouchableOpacity 
                  style={styles.editIcon} 
                  onPress={() => setIsEditingApiUrl(true)}
                >
                  <Ionicons name="pencil" size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.warningButton} onPress={handleResetConfig}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={clearAppCache}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Clear App Cache</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  editButtons: {
    flexDirection: 'row',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  editIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 