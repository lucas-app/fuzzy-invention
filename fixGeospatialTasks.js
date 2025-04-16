/**
 * This script directly updates the geospatial tasks in Label Studio with working image URLs
 */

// API configuration
const API_URL = 'http://192.168.1.104:9090';
const API_TOKEN = '501c980772e98d56cab53109683af59c36ce5778';

// Working image URLs from reliable sources (Unsplash)
const workingImageUrls = [
  { id: 28, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80', location_name: 'Agricultural Land' },
  { id: 29, image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80', location_name: 'Mountain Region' },
  { id: 30, image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80', location_name: 'Desert Region' }
];

async function updateTask(task) {
  console.log(`Updating task ${task.id} with image: ${task.image}`);
  
  try {
    const response = await fetch(`${API_URL}/api/tasks/${task.id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          image: task.image,
          location_name: task.location_name,
          question: 'What is the most prominent feature in this map?',
          options: [
            { id: 'building', text: 'Buildings', value: 'building' },
            { id: 'road', text: 'Roads', value: 'road' },
            { id: 'water', text: 'Water', value: 'water' },
            { id: 'vegetation', text: 'Vegetation', value: 'vegetation' }
          ]
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
  console.log('Starting to update all geospatial tasks...');
  
  let successCount = 0;
  
  for (const task of workingImageUrls) {
    const success = await updateTask(task);
    if (success) successCount++;
  }
  
  console.log(`Completed updating tasks. ${successCount}/${workingImageUrls.length} tasks updated successfully.`);
}

// Run the update
updateAllTasks();
