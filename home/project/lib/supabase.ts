import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Custom storage implementation for web platform
const webStorage = {
  getItem: (key: string) => {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch (error) {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  },
};

// Use SecureStore for native platforms and localStorage for web
const storage = Platform.OS === 'web' 
  ? webStorage
  : {
      getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
      },
      setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
      },
      removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
      },
    };

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize Supabase client with persistent storage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Initialize auth state with retry mechanism and better error handling
export const initializeAuth = async (retries = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // First check if we already have a valid session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession?.user) {
        console.log('Using existing session');
        return true;
      }

      // If no valid session, try to sign in
      await supabase.auth.signOut();
      await storage.removeItem('supabase.auth.token');
      
      // Add delay between attempts
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@lucas.com',
        password: 'demo123456',
      });

      if (error) {
        console.error(`Auth attempt ${attempt} failed:`, error.message);
        if (attempt === retries) {
          throw error;
        }
        continue;
      }

      if (!data.session) {
        throw new Error('No session after sign in');
      }

      console.log('Authentication successful');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Auth attempt ${attempt} failed with error:`, errorMessage);
      
      if (attempt === retries) {
        console.error('Auth initialization failed after all retries');
        return false;
      }
    }
  }
  return false;
};