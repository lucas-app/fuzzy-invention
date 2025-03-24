import { Tabs } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import NavigationBar from '../../components/NavigationBar';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();

  // If no user is logged in, don't render the tabs at all
  if (!user) {
    return null;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBar: () => null, // Hide the default tab bar since we're using our custom NavigationBar
          contentStyle: {
            backgroundColor: isDark ? '#000' : '#fff',
          },
        }}
      >
        <Tabs.Screen 
          name="tasks" 
          options={{
            title: 'Tasks',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                name={focused ? 'list' : 'list-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen 
          name="learn" 
          options={{
            title: 'Learn',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                name={focused ? 'book' : 'book-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen 
          name="invest" 
          options={{
            title: 'Invest',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                name={focused ? 'trending-up' : 'trending-up-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen 
          name="earnings" 
          options={{
            title: 'Earnings',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                name={focused ? 'wallet' : 'wallet-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen 
          name="profile" 
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
      <NavigationBar />
    </>
  );
}