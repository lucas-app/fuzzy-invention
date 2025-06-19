import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name?: string;
}

// Mock user for development
const MOCK_USER: User = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User'
};

// Flag to use mock user for development
const USE_MOCK_USER = true; // Temporarily enabled to bypass auth issues

// Add a temporary debug function
const debugAuth = async () => {
  try {
    // Check if session exists
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('SESSION EXISTS:', !!sessionData.session);
    
    // Try to save something to AsyncStorage to check if it works
    await AsyncStorage.setItem('auth_test', 'test_value');
    const testValue = await AsyncStorage.getItem('auth_test');
    console.log('ASYNC STORAGE TEST:', testValue === 'test_value' ? 'PASSED' : 'FAILED');
    
    // Network check
    try {
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
      const fetchPromise = fetch('https://cljvcuqnkfoslltyzqb.supabase.co');
      await Promise.race([fetchPromise, timeout]);
      console.log('NETWORK CHECK: Connected to Supabase');
    } catch (e) {
      console.log('NETWORK CHECK: Failed - ', e);
    }
  } catch (e) {
    console.error('DEBUG ERROR:', e);
  }
};

// Run debug immediately
debugAuth();

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize with mock user if flag is enabled
  user: USE_MOCK_USER ? MOCK_USER : null,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    // Skip actual auth if using mock user
    if (USE_MOCK_USER) {
      console.log('Using mock user for sign in');
      set({ user: MOCK_USER });
      return;
    }

    set({ isLoading: true, error: null });
    console.log('Attempting to sign in with email:', email);

    try {
      // Add timeout to prevent hanging indefinitely
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timed out after 30 seconds')), 30000);
      });
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      if (data?.user) {
        console.log('Sign in successful, user ID:', data.user.id);
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name,
          },
        });
      } else {
        console.warn('No user data returned from signIn');
        throw new Error('No user data returned from authentication');
      }
    } catch (error) {
      console.error('Sign in exception:', error);
      
      // If this was a timeout error, provide a more helpful message
      const errorMessage = 
        error instanceof Error && error.message.includes('timed out') 
          ? 'Connection to authentication server timed out. Please check your internet connection and try again.'
          : error instanceof Error ? error.message : 'An error occurred during sign in';
      
      set({ error: errorMessage });
      throw error;
    } finally {
      console.log('Sign in process completed');
      set({ isLoading: false });
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    // Skip actual auth if using mock user
    if (USE_MOCK_USER) {
      console.log('Using mock user for sign up');
      set({ user: MOCK_USER });
      return;
    }

    set({ isLoading: true, error: null });
    console.log('Attempting to sign up with email:', email);

    try {
      // Add timeout to prevent hanging indefinitely
      const authPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        }
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timed out after 30 seconds')), 30000);
      });
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      if (data?.user) {
        console.log('Sign up successful, user ID:', data.user.id);
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name,
          },
        });
      } else {
        console.warn('No user data returned from signUp');
        throw new Error('No user data returned from authentication');
      }
    } catch (error) {
      console.error('Sign up exception:', error);
      
      // If this was a timeout error, provide a more helpful message
      const errorMessage = 
        error instanceof Error && error.message.includes('timed out') 
          ? 'Connection to authentication server timed out. Please check your internet connection and try again.'
          : error instanceof Error ? error.message : 'An error occurred during sign up';
      
      set({ error: errorMessage });
      throw error;
    } finally {
      console.log('Sign up process completed');
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    // Skip actual auth if using mock user
    if (USE_MOCK_USER) {
      // Keep the mock user even on sign out for development
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Clear any auth-related storage
      await AsyncStorage.removeItem('supabase.auth.token');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred during sign out' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    // Skip actual auth if using mock user
    if (USE_MOCK_USER) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred during password reset' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));