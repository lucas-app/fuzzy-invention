/**
 * This script directly runs the geospatial task fix utility
 * to update the images in Label Studio with working URLs
 */

const { updateGeospatialTasks } = require('./services/LabelStudioService');

async function runFix() {
  console.log('Starting to fix geospatial tasks in Label Studio...');
  
  try {
    const result = await updateGeospatialTasks();
    
    if (result) {
      console.log('✅ Successfully updated all geospatial tasks in Label Studio!');
      console.log('The images should now be working properly.');
    } else {
      console.log('❌ Failed to update geospatial tasks.');
      console.log('Please check the error logs for details.');
    }
  } catch (error) {
    console.error('Error running fix:', error);
  }
}

// Run the fix
runFix();
