/**
 * This script updates the audio tasks in Label Studio with working audio URLs
 * Using files from a reliable CDN with proper CORS headers
 */

// API configuration
const API_URL = 'http://192.168.1.104:9090';
const API_TOKEN = '501c980772e98d56cab53109683af59c36ce5778';

// Working audio URLs from reliable sources (short MP3 files from a CDN)
const workingAudioUrls = [
  { 
    id: 22, 
    audio: 'https://cdn.freesound.org/previews/243/243953_1565498-lq.mp3',
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
    audio: 'https://cdn.freesound.org/previews/169/169259_1407570-lq.mp3',
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
    audio: 'https://cdn.freesound.org/previews/277/277021_5324223-lq.mp3',
    question: 'What type of vehicle is making this sound?',
    options: [
      { id: 'car', text: 'Car', value: 'car' },
      { id: 'motorcycle', text: 'Motorcycle', value: 'motorcycle' },
      { id: 'truck', text: 'Truck', value: 'truck' },
      { id: 'other', text: 'Other', value: 'other' }
    ]
  }
];

async function updateTask(task) {
  console.log(`Updating task ${task.id} with audio: ${task.audio}`);
  
  try {
    const response = await fetch(`${API_URL}/api/tasks/${task.id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          audio: task.audio,
          question: task.question,
          options: task.options
        }
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error updating task ${task.id}: ${errorText}`);
      return false;
    }
    
    console.log(`Successfully updated task ${task.id}`);
    return true;
  } catch (error) {
    console.error(`Error updating task ${task.id}:`, error);
    return false;
  }
}

async function updateAllTasks() {
  console.log('Starting to update all audio tasks...');
  
  let successCount = 0;
  
  for (const task of workingAudioUrls) {
    const success = await updateTask(task);
    if (success) successCount++;
  }
  
  console.log(`Completed updating tasks. ${successCount}/${workingAudioUrls.length} tasks updated successfully.`);
}

// Run the update
updateAllTasks();
