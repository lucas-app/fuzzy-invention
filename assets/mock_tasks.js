/**
 * Mock task data for different task types
 * This will be used until API fetch is confirmed
 */

export const mockTasks = [
  // Image Classification Tasks
  {
    id: '101',
    type: 'image_classification',
    question: 'Does this image contain a dog?',
    media: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    options: ['Yes', 'No'],
  },
  {
    id: '102',
    type: 'image_classification',
    question: 'Is this a cat?',
    media: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    options: ['Yes', 'No'],
  },
  
  // Text Sentiment Tasks
  {
    id: '201',
    type: 'text_sentiment',
    question: 'What is the sentiment of this review?',
    text: 'I love this product! It works exactly as described and the customer service was excellent.',
    options: ['Positive', 'Negative', 'Neutral'],
  },
  {
    id: '202',
    type: 'text_sentiment',
    question: 'What is the sentiment of this comment?',
    text: 'The service was terrible and the staff was rude. I would not recommend this place to anyone.',
    options: ['Positive', 'Negative', 'Neutral'],
  },
  
  // Audio Classification Tasks
  {
    id: '301',
    type: 'audio_classification',
    question: 'Is this the sound of a car horn?',
    media: 'https://assets.mixkit.co/sfx/preview/mixkit-car-horn-718.mp3',
    options: ['Yes', 'No'],
  },
  {
    id: '302',
    type: 'audio_classification',
    question: 'Is this the sound of rain?',
    media: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3',
    options: ['Yes', 'No'],
  },
  
  // Survey Tasks
  {
    id: '401',
    type: 'survey',
    question: 'Which product do you prefer?',
    text: 'Based on the descriptions, which product would you choose?',
    details: 'Product A: Affordable, basic features. Product B: More expensive, premium features.',
    options: ['Product A', 'Product B'],
  },
  {
    id: '402',
    type: 'survey',
    question: 'How likely are you to recommend our service?',
    text: 'Based on your experience, would you recommend our service to others?',
    options: ['Very Likely', 'Somewhat Likely', 'Not Likely'],
  },
  
  // Geospatial Labeling Tasks
  {
    id: '501',
    type: 'geospatial_labeling',
    question: 'Is there a road in this satellite image?',
    media: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/147000/147407/ISS066-E-94848_lrg.jpg',
    options: ['Yes', 'No'],
  },
  {
    id: '502',
    type: 'geospatial_labeling',
    question: 'Can you see a river in this image?',
    media: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/147000/147467/sediments_oli_2021109_lrg.jpg',
    options: ['Yes', 'No'],
  }
];
