import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform, TouchableOpacity, Alert } from 'react-native';
import { router, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

// Logo URL - using a compressed version for faster loading
const LOGO_URL = 'https://i.ibb.co/rnTcSMX/LUCAS-bluegreen-gradient-logo-and-white-text-on-dark-background-RGB-V-01.png';

export default function SplashScreen() {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only proceed with navigation after the component is mounted
    if (!isMounted) return;

    const handleInitialNavigation = async () => {
      try {
        // If user is already authenticated, redirect to tasks
        if (user) {
          setTimeout(() => {
            router.replace('/(tabs)/tasks');
          }, 0);
          return;
        }
        
        // Check for previous use
        const hasUsedBefore = await AsyncStorage.getItem('has_used_app');
        if (hasUsedBefore === 'true' && !user) {
          // If user has used the app before but is not logged in, go to login
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 0);
        }
      } catch (error) {
        console.error('Error during initial navigation:', error);
      }
    };

    handleInitialNavigation();
  }, [user, isMounted]);

  const handleGetStarted = async () => {
    try {
      // Mark that the user has used the app
      await AsyncStorage.setItem('has_used_app', 'true');
      router.replace('/(onboarding)');
    } catch (error) {
      console.error('Error saving app usage state:', error);
      // Navigate anyway even if storage fails
      router.replace('/(onboarding)');
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  // Debug environment variables
  useEffect(() => {
    console.log('ENV DEBUG - SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('ENV DEBUG - SUPABASE_ANON_KEY exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
    console.log('ENV DEBUG - SUPABASE_SERVICE_KEY exists:', !!process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY);

    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || 
        !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
        !process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY) {
      Alert.alert(
        'Configuration Error',
        'Supabase environment variables are missing. Please check your .env file.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000020', '#010128', '#1E3A8A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: LOGO_URL }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.tagline}>Earn Money, Build Wealth</Text>
        
        <View style={styles.buttonContainer}>
          <Pressable 
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <LinearGradient
              colors={['#22D3EE', '#2DD4BF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.getStartedText}>Get Started</Text>
          </Pressable>
          
          <Pressable 
            style={styles.signInButton}
            onPress={handleSignIn}
            android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
      
      <Text style={styles.versionText}>v1.0.0</Text>
      
      {/* Temporary admin button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 50,
          right: 20,
          backgroundColor: '#6200ee',
          padding: 10,
          borderRadius: 8,
          zIndex: 1000,
        }}
        onPress={() => {
          router.push('/labelstudio/admin/CreateAudioTasks');
        }}
      >
        <Text style={{ color: 'white' }}>Admin</Text>
      </TouchableOpacity>
      
      {/* Diagnostics button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 50,
          left: 20,
          backgroundColor: '#007AFF',
          padding: 10,
          borderRadius: 8,
          zIndex: 1000,
        }}
        onPress={() => {
          router.push('/labelstudio/admin/CheckAudioTasks');
        }}
      >
        <Text style={{ color: 'white' }}>Diagnostics</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  getStartedButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  getStartedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    position: 'absolute',
    bottom: 20,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});