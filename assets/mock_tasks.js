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
  {
    id: '103',
    type: 'image_classification',
    question: 'Is this a bird?',
    media: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    options: ['Yes', 'No'],
  },
  {
    id: '104',
    type: 'image_classification',
    question: 'Is this a horse?',
    media: 'https://images.unsplash.com/photo-1553284965-e2815db2e5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    options: ['Yes', 'No'],
  },
  {
    id: '105',
    type: 'image_classification',
    question: 'Is this a fish?',
    media: 'https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    options: ['Yes', 'No'],
  },
  {
    id: '106',
    type: 'image_classification',
    question: 'Is this a rabbit?',
    media: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    options: ['Yes', 'No'],
  },
  {
    id: '107',
    type: 'image_classification',
    question: 'Is this a turtle?',
    media: 'https://images.unsplash.com/photo-1518546305927-5a28ddc2a8ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    options: ['Yes', 'No'],
  },
  {
    id: '108',
    type: 'image_classification',
    question: 'Is this a monkey?',
    media: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    options: ['Yes', 'No'],
  },
  {
    id: '109',
    type: 'image_classification',
    question: 'Is this a bear?',
    media: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    options: ['Yes', 'No'],
  },
  {
    id: '110',
    type: 'image_classification',
    question: 'Is this a lion?',
    media: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
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
