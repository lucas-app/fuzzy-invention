/**
 * This script updates the audio tasks with proper audio files
 */

const workingAudioUrls = [
  { 
    id: 22, 
    audio: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3',
    question: 'What type of sound is this?',
    options: [
      { id: 'alarm', text: 'Alarm', value: 'alarm' },
      { id: 'notification', text: 'Notification', value: 'notification' },
      { id: 'ringtone', text: 'Ringtone', value: 'ringtone' },
      { id: 'other', text: 'Other', value: 'other' }
    ]
  },
  { 
    id: 23, 
    audio: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3',
    question: 'What environment does this sound represent?',
    options: [
      { id: 'nature', text: 'Nature', value: 'nature' },
      { id: 'urban', text: 'Urban', value: 'urban' },
      { id: 'indoor', text: 'Indoor', value: 'indoor' },
      { id: 'other', text: 'Other', value: 'other' }
    ]
  },
  { 
    id: 24, 
    audio: 'https://assets.mixkit.co/sfx/preview/mixkit-car-horn-718.mp3',
    question: 'What type of vehicle is making this sound?',
    options: [
      { id: 'car', text: 'Car', value: 'car' },
      { id: 'motorcycle', text: 'Motorcycle', value: 'motorcycle' },
      { id: 'truck', text: 'Truck', value: 'truck' },
      { id: 'other', text: 'Other', value: 'other' }
    ]
  }
];

// Update the tasks in the mock service
const updateMockTasks = () => {
  const fs = require('fs');
  const path = require('path');
  
  // Update the mock service tasks
  const mockServicePath = path.join(__dirname, '../services/MockLabelStudioService.js');
  let mockServiceContent = fs.readFileSync(mockServicePath, 'utf8');
  
  // Replace the AUDIO_TASKS array
  const audioTasksString = `const AUDIO_TASKS = ${JSON.stringify(workingAudioUrls.map(task => ({
    id: task.id,
    data: {
      audio: task.audio,
      question: task.question,
      options: task.options
    },
    created_at: new Date().toISOString()
  })), null, 2)};`;
  
  // Replace the existing AUDIO_TASKS definition
  mockServiceContent = mockServiceContent.replace(
    /const AUDIO_TASKS = \[[\s\S]*?\];/m,
    audioTasksString
  );
  
  fs.writeFileSync(mockServicePath, mockServiceContent);
  console.log('Updated MockLabelStudioService.js');
  
  // Update the tasks.json file
  const tasksPath = path.join(__dirname, '../assets/tasks.json');
  let tasksContent = fs.readFileSync(tasksPath, 'utf8');
  let tasks = JSON.parse(tasksContent);
  
  // Update audio tasks
  tasks = tasks.map(task => {
    if (task.data && task.data.audio) {
      const updatedTask = workingAudioUrls.find(u => u.id === task.id);
      if (updatedTask) {
        return {
          ...task,
          data: {
            audio: updatedTask.audio,
            question: updatedTask.question,
            options: updatedTask.options
          }
        };
      }
    }
    return task;
  });
  
  fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  console.log('Updated tasks.json');
};

// Run the update
try {
  updateMockTasks();
  console.log('Successfully updated all audio tasks');
} catch (error) {
  console.error('Error updating tasks:', error);
} 