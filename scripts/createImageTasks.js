import { createImageClassificationTasks } from '../services/LabelStudioService.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

console.log('Starting to create image classification tasks...');

createImageClassificationTasks()
  .then(success => {
    if (success) {
      console.log('Successfully created all image classification tasks!');
    } else {
      console.error('Failed to create some tasks.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  }); 