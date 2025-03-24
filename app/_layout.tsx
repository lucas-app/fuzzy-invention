import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, StyleSheet } from 'react-native';
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

  // Show nothing while auth is initializing
  if (!isAuthInitialized && isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
            },
            animation: 'fade',
            animationDuration: 300,
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
          <Stack.Screen 
            name="(auth)" 
            options={{ 
              animation: 'slide_from_right',
              animationDuration: 400,
            }} 
          />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen 
            name="(modals)" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }} 
          />
        </Stack>
        <StatusBar style="light" />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});