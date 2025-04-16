/**
 * setup-label-studio.js
 * 
 * This script sets up Label Studio with all the projects needed for the LUCAS MVP.
 * It creates projects for different task types and imports sample tasks.
 * 
 * Usage:
 * node setup-label-studio.js
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration - same as in LabelStudioService.js
const API_URL = 'http://192.168.1.104:9090';
const API_TOKEN = '501c980772e98d56cab53109683af59c36ce5778';

// Project definitions with their labeling interfaces
const PROJECTS = [
  {
    title: 'Text Sentiment Analysis',
    description: 'Analyze the sentiment of text passages',
    label_config: `
<View>
  <Text name="text" value="$text"/>
  <Header value="What is the sentiment of this text?"/>
  <Choices name="sentiment" toName="text" choice="single" showInLine="true">
    <Choice value="Positive"/>
    <Choice value="Neutral"/>
    <Choice value="Negative"/>
  </Choices>
</View>
`
  },
  {
    title: 'Image Classification',
    description: 'Classify images into different categories',
    label_config: `
<View>
  <Image name="image" value="$image"/>
  <Header value="What type of animal is in this image?"/>
  <Choices name="animal_type" toName="image" choice="single">
    <Choice value="Dog"/>
    <Choice value="Cat"/>
    <Choice value="Bird"/>
    <Choice value="Fish"/>
    <Choice value="Other"/>
  </Choices>
</View>
`
  },
  {
    title: 'Audio Classification',
    description: 'Classify audio clips into different categories',
    label_config: `
<View>
  <Audio name="audio" value="$audio"/>
  <Header value="What type of sound is this?"/>
  <Choices name="audio_class" toName="audio" choice="single">
    <Choice value="Human Voice"/>
    <Choice value="Music"/>
    <Choice value="Nature"/>
    <Choice value="Machine"/>
    <Choice value="Other"/>
  </Choices>
</View>
`
  },
  {
    title: 'Survey Tasks',
    description: 'Answer survey questions',
    label_config: `
<View>
  <Text name="survey_text" value="$question"/>
  <Header value="Please select your answer:"/>
  <Choices name="survey_choice" toName="survey_text" choice="single">
    <Choice value="Strongly Agree"/>
    <Choice value="Agree"/>
    <Choice value="Neutral"/>
    <Choice value="Disagree"/>
    <Choice value="Strongly Disagree"/>
  </Choices>
</View>
`
  },
  {
    title: 'Geospatial Labeling',
    description: 'Identify features in satellite/map images',
    label_config: `
<View>
  <Image name="geo_image" value="$image"/>
  <Header value="What features can you identify in this image?"/>
  <Choices name="geo_feature" toName="geo_image" choice="multiple">
    <Choice value="Road"/>
    <Choice value="Building"/>
    <Choice value="Water"/>
    <Choice value="Vegetation"/>
    <Choice value="Other"/>
  </Choices>
</View>
`
  }
];

// Sample tasks for each project type
const SAMPLE_TASKS = {
  'Text Sentiment Analysis': [
    { data: { text: "I love this product! It works exactly as described and the customer service was excellent." } },
    { data: { text: "The service was terrible and the staff was rude. I would not recommend this place to anyone." } },
    { data: { text: "The item arrived on time and functions as expected. Nothing special but does the job." } }
  ],
  'Image Classification': [
    { data: { image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" } },
    { data: { image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" } },
    { data: { image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" } }
  ],
  'Audio Classification': [
    { data: { audio: "https://assets.mixkit.co/sfx/preview/mixkit-car-horn-718.mp3" } },
    { data: { audio: "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3" } },
    { data: { audio: "https://assets.mixkit.co/sfx/preview/mixkit-crowd-talking-loop-174.mp3" } }
  ],
  'Survey Tasks': [
    { data: { question: "How satisfied are you with our service?" } },
    { data: { question: "Would you recommend our product to others?" } },
    { data: { question: "The user interface is intuitive and easy to use." } }
  ],
  'Geospatial Labeling': [
    { data: { image: "https://eoimages.gsfc.nasa.gov/images/imagerecords/147000/147407/ISS066-E-94848_lrg.jpg" } },
    { data: { image: "https://eoimages.gsfc.nasa.gov/images/imagerecords/147000/147467/sediments_oli_2021109_lrg.jpg" } },
    { data: { image: "https://eoimages.gsfc.nasa.gov/images/imagerecords/150000/150012/iss068-e-41169_lrg.jpg" } }
  ]
};

// Helper function to create a project
async function createProject(project) {
  console.log(`Creating project: ${project.title}...`);
  
  try {
    const response = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`
      },
      body: JSON.stringify(project)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create project: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Project created: ${project.title} (ID: ${data.id})`);
    return data;
  } catch (error) {
    console.error(`❌ Error creating project ${project.title}:`, error.message);
    return null;
  }
}

// Helper function to import tasks into a project
async function importTasks(projectId, tasks) {
  console.log(`Importing ${tasks.length} tasks into project ${projectId}...`);
  
  try {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`
      },
      body: JSON.stringify(tasks)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to import tasks: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Imported ${tasks.length} tasks into project ${projectId}`);
    return data;
  } catch (error) {
    console.error(`❌ Error importing tasks into project ${projectId}:`, error.message);
    return null;
  }
}

// Main function to set up Label Studio
async function setupLabelStudio() {
  console.log('🚀 Starting Label Studio setup...');
  console.log(`API URL: ${API_URL}`);
  
  // Create projects and store their IDs
  const projectIds = {};
  
  for (const project of PROJECTS) {
    const createdProject = await createProject(project);
    if (createdProject) {
      projectIds[project.title] = createdProject.id;
      
      // Import sample tasks for this project
      if (SAMPLE_TASKS[project.title]) {
        await importTasks(createdProject.id, SAMPLE_TASKS[project.title]);
      }
    }
  }
  
  // Generate updated LabelStudioService.js constants
  if (Object.keys(projectIds).length > 0) {
    console.log('\n📝 Project IDs for LabelStudioService.js:');
    console.log('const PROJECTS = {');
    
    Object.entries(projectIds).forEach(([title, id]) => {
      const constName = title.replace(/\s+/g, '_').toUpperCase();
      console.log(`  ${constName}: ${id},`);
    });
    
    console.log('};');
    
    // Save project IDs to a JSON file for reference
    const outputPath = path.join(__dirname, 'label-studio-projects.json');
    fs.writeFileSync(outputPath, JSON.stringify(projectIds, null, 2));
    console.log(`\n💾 Project IDs saved to: ${outputPath}`);
  }
  
  console.log('\n✨ Label Studio setup complete!');
}

// Run the setup
setupLabelStudio().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
