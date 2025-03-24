import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

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

// Initialize auth state listener
export const initializeAuthListener = (
  onSignIn: (user: any) => void,
  onSignOut: () => void
) => {
  // Check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      onSignIn(session.user);
    }
  });

  // Set up auth state change listener
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      onSignIn(session.user);
    } else if (event === 'SIGNED_OUT') {
      onSignOut();
    }
  });
};