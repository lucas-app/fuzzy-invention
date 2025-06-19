import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="CreateAudioTasks"
        options={{
          title: 'Create Audio Tasks',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="CheckAudioTasks"
        options={{
          title: 'Diagnose Audio Tasks',
          headerShown: true,
        }}
      />
    </Stack>
  );
} 