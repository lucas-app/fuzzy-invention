import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../store/authStore';
import { initializeAuthListener } from '../lib/supabase';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorScheme();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const { user, isLoading } = useAuthStore();
  
  useEffect(() => {
    // Required framework initialization
    window.frameworkReady?.();
    
    // Initialize auth listener
    const { data: authListener } = initializeAuthListener(
      (user) => {
        useAuthStore.setState({
          user: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name,
          },
        });
        setIsAuthInitialized(true);
      },
      () => {
        useAuthStore.setState({ user: null });
        setIsAuthInitialized(true);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <Slot 
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
            },
          }}
        />
        
        {(!isAuthInitialized && isLoading) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
        
        <StatusBar style="light" />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});