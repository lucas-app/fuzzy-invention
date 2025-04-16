/**
 * This script updates the audio tasks in Label Studio with working audio URLs
 * Using files from a reliable CDN with proper CORS headers and mobile compatibility
 */

// API configuration
const API_URL = 'http://192.168.1.104:9090';
const API_TOKEN = '501c980772e98d56cab53109683af59c36ce5778';

// Working audio URLs from reliable sources with explicit CORS support
const workingAudioUrls = [
  { 
    id: 22, 
    audio: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    question: 'What type of content is this?',
    options: [
      { id: 'music', text: 'Music', value: 'music' },
      { id: 'speech', text: 'Speech', value: 'speech' },
      { id: 'sound_effect', text: 'Sound Effect', value: 'sound_effect' },
      { id: 'other', text: 'Other', value: 'other' }
    ]
  },
  { 
    id: 23, 
    audio: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    question: 'What do you hear in this audio?',
    options: [
      { id: 'voices', text: 'Voices', value: 'voices' },
      { id: 'music', text: 'Music', value: 'music' },
      { id: 'both', text: 'Both voices and music', value: 'both' },
      { id: 'other', text: 'Other sounds', value: 'other' }
    ]
  },
  { 
    id: 24, 
    audio: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    question: 'What is the mood of this audio?',
    options: [
      { id: 'happy', text: 'Happy/Upbeat', value: 'happy' },
      { id: 'sad', text: 'Sad/Melancholy', value: 'sad' },
      { id: 'tense', text: 'Tense/Dramatic', value: 'tense' },
      { id: 'neutral', text: 'Neutral', value: 'neutral' }
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
