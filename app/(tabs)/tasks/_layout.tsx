import { Stack } from 'expo-router';

export default function TasksLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          animation: 'none',
        }}
      />
      <Stack.Screen 
        name="[id]"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}