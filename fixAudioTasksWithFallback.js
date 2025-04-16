/**
 * This script updates the audio tasks in Label Studio with working audio URLs
 * Using files from a reliable CDN with proper CORS headers and mobile compatibility
 */

// API configuration
const API_URL = 'http://192.168.1.104:9090';
const API_TOKEN = '501c980772e98d56cab53109683af59c36ce5778';

// Working audio URLs from reliable sources (short MP3 files with CORS enabled)
const workingAudioUrls = [
  { 
    id: 22, 
    audio: 'https://filesamples.com/samples/audio/mp3/sample3.mp3',
    question: 'What type of sound is this?',
    options: [
      { id: 'music', text: 'Music', value: 'music' },
      { id: 'speech', text: 'Speech', value: 'speech' },
      { id: 'sound_effect', text: 'Sound Effect', value: 'sound_effect' },
      { id: 'other', text: 'Other', value: 'other' }
    ]
  },
  { 
    id: 23, 
    audio: 'https://filesamples.com/samples/audio/mp3/sample1.mp3',
    question: 'What type of music is this?',
    options: [
      { id: 'classical', text: 'Classical', value: 'classical' },
      { id: 'jazz', text: 'Jazz', value: 'jazz' },
      { id: 'rock', text: 'Rock', value: 'rock' },
      { id: 'other', text: 'Other', value: 'other' }
    ]
  },
  { 
    id: 24, 
    audio: 'https://filesamples.com/samples/audio/mp3/sample2.mp3',
    question: 'What instrument is most prominent?',
    options: [
      { id: 'piano', text: 'Piano', value: 'piano' },
      { id: 'guitar', text: 'Guitar', value: 'guitar' },
      { id: 'drums', text: 'Drums', value: 'drums' },
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
