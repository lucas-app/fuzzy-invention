import { TaskType, Task, TaskValidation, Web3Task } from '../types/tasks';

export const TASK_ANSWERS: Record<string, TaskValidation> = {
  'image-1': {
    correctAnswer: 'Cat',
    explanation: 'The image shows a cat with distinctive feline features like pointed ears and a long tail.',
    keywords: ['feline', 'pet', 'domestic cat'],
  },
  'image-2': {
    correctAnswer: 'Dog',
    explanation: 'The image shows a Golden Retriever with typical canine features.',
    keywords: ['canine', 'pet', 'golden retriever'],
  },
  'image-3': {
    correctAnswer: 'Yes',
    explanation: 'The image clearly shows a red car in the frame.',
    keywords: ['vehicle', 'automobile', 'transportation'],
  },
  'text-1': {
    correctAnswer: 'Positive',
    explanation: 'The review contains strong positive words like "absolutely love", "excellent", and "friendly and helpful", indicating a clearly positive sentiment.',
    keywords: ['love', 'excellent', 'friendly'],
  },
  'text-2': {
    correctAnswer: 'Negative',
    explanation: 'The review uses negative terms like "very disappointed", "damaged", and "unhelpful", expressing clear dissatisfaction.',
    keywords: ['disappointed', 'damaged', 'unhelpful'],
  },
  'text-3': {
    correctAnswer: 'Neutral',
    explanation: 'The review states factual information without emotional language, describing standard service and delivery times.',
    keywords: ['works as described', 'standard', 'business days'],
  },
  'object-1': {
    correctAnswer: JSON.stringify({
      type: 'person',
      position: { x: 0.2, y: 0.1, width: 0.6, height: 0.8 }
    }),
    explanation: 'Great job! You correctly identified the person in the image.',
    keywords: ['human', 'individual', 'person'],
  },
  'object-2': {
    correctAnswer: JSON.stringify([
      { type: 'car', position: { x: 0.2, y: 0.3, width: 0.3, height: 0.25 } },
      { type: 'car', position: { x: 0.6, y: 0.3, width: 0.3, height: 0.25 } }
    ]),
    explanation: 'Great job! You successfully identified the cars in the image.',
    keywords: ['vehicle', 'automobile', 'car'],
  },
  'object-3': {
    correctAnswer: JSON.stringify([
      { type: 'face', position: { x: 0.3, y: 0.2, width: 0.2, height: 0.2 } },
      { type: 'face', position: { x: 0.6, y: 0.2, width: 0.2, height: 0.2 } }
    ]),
    explanation: 'Well done! You correctly marked the faces in the image.',
    keywords: ['face', 'person', 'human'],
  },
  'object-4': {
    correctAnswer: JSON.stringify({
      type: 'traffic-light',
      position: { x: 0.35, y: 0.2, width: 0.3, height: 0.5 }
    }),
    explanation: 'Perfect! You correctly identified the traffic light.',
    keywords: ['traffic signal', 'stop light', 'semaphore'],
  },
};

export const TASKS: Record<TaskType, Task[]> = {
  'image': [
    {
      id: 'image-1',
      type: 'image',
      title: 'Pet Classification',
      description: 'Help train our AI by identifying pets in images',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
      question: 'What animal is shown in this image?',
      options: ['Cat', 'Dog'],
      guidelines: [
        'Look at the animal\'s facial features',
        'Consider the body shape',
        'Note any distinctive characteristics',
      ],
      difficulty: 'easy',
      reward: 0.10,
      estimatedTime: '15 seconds',
      category: 'Pet Recognition',
    },
    {
      id: 'image-2',
      type: 'image',
      title: 'Pet Classification',
      description: 'Help train our AI by identifying pets in images',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
      question: 'What animal is shown in this image?',
      options: ['Cat', 'Dog'],
      guidelines: [
        'Look at the animal\'s facial features',
        'Consider the body shape',
        'Note any distinctive characteristics',
      ],
      difficulty: 'easy',
      reward: 0.10,
      estimatedTime: '15 seconds',
      category: 'Pet Recognition',
    },
    {
      id: 'image-3',
      type: 'image',
      title: 'Vehicle Detection',
      description: 'Help train autonomous vehicles by identifying cars',
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d',
      question: 'Is there a car in this image?',
      options: ['Yes', 'No'],
      guidelines: [
        'Look for any type of car or vehicle',
        'Check the entire image carefully',
        'Answer "Yes" if you can see any part of a car',
      ],
      difficulty: 'easy',
      reward: 0.10,
      estimatedTime: '15 seconds',
      category: 'Vehicle Recognition',
    },
  ],
  'text': [
    {
      id: 'text-1',
      type: 'text',
      title: 'Review Sentiment',
      description: 'Help improve customer service by analyzing reviews',
      text: 'I absolutely love this product! The quality is excellent and customer service was very friendly and helpful.',
      question: 'What is the sentiment of this review?',
      options: ['Positive', 'Neutral', 'Negative'],
      guidelines: [
        'Look for emotional words (love, hate, etc.)',
        'Consider the overall tone',
        'Check for exclamation marks and emphasis',
      ],
      difficulty: 'easy',
      reward: 0.08,
      estimatedTime: '20 seconds',
      category: 'Customer Feedback',
    },
    {
      id: 'text-2',
      type: 'text',
      title: 'Review Sentiment',
      description: 'Help improve customer service by analyzing reviews',
      text: 'Very disappointed with my purchase. The product arrived damaged and customer service was unhelpful.',
      question: 'What is the sentiment of this review?',
      options: ['Positive', 'Neutral', 'Negative'],
      guidelines: [
        'Look for negative words (disappointed, unhelpful)',
        'Consider complaints or issues mentioned',
        'Check the overall message',
      ],
      difficulty: 'easy',
      reward: 0.08,
      estimatedTime: '20 seconds',
      category: 'Customer Feedback',
    },
    {
      id: 'text-3',
      type: 'text',
      title: 'Review Sentiment',
      description: 'Help improve customer service by analyzing reviews',
      text: 'The product works as described. Delivery took the standard 3-5 business days.',
      question: 'What is the sentiment of this review?',
      options: ['Positive', 'Neutral', 'Negative'],
      guidelines: [
        'Check for factual statements',
        'Look for absence of emotional language',
        'Consider if the tone is matter-of-fact',
      ],
      difficulty: 'easy',
      reward: 0.08,
      estimatedTime: '20 seconds',
      category: 'Customer Feedback',
    },
  ],
  'object': [
    {
      id: 'object-1',
      type: 'object',
      title: 'Pedestrian Detection',
      description: 'Help train autonomous vehicles to identify pedestrians',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
      question: 'Draw a box around the person',
      options: ['person'],
      guidelines: [
        'Include the entire person from head to toe',
        'Make the box as tight as possible without cutting off any body parts',
        'Draw a single box around the subject',
        'Include accessories that are being worn/carried',
      ],
      difficulty: 'medium',
      reward: 0.15,
      estimatedTime: '30 seconds',
      category: 'Autonomous Vehicles',
    },
    {
      id: 'object-2',
      type: 'object',
      title: 'Vehicle Detection',
      description: 'Help train parking management systems',
      image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a',
      question: 'Draw boxes around both cars',
      options: ['car'],
      guidelines: [
        'Mark each vehicle with a separate box',
        'Include the entire vehicle in each box',
        'Draw boxes as precisely as possible',
        'Mark both cars in the image',
      ],
      difficulty: 'medium',
      reward: 0.20,
      estimatedTime: '45 seconds',
      category: 'Smart Cities',
    },
    {
      id: 'object-3',
      type: 'object',
      title: 'Face Detection',
      description: 'Help improve facial recognition systems',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
      question: 'Draw boxes around both faces',
      options: ['face'],
      guidelines: [
        'Include the entire face in each box',
        'Mark both visible faces',
        'Be as precise as possible',
        'Include from forehead to chin',
      ],
      difficulty: 'medium',
      reward: 0.25,
      estimatedTime: '45 seconds',
      category: 'Computer Vision',
    },
    {
      id: 'object-4',
      type: 'object',
      title: 'Traffic Light Detection',
      description: 'Help autonomous vehicles recognize traffic signals',
      image: 'https://unsplash.com/photos/brown-traffic-light-LwRUp8vJJI8',
      question: 'Draw a box around the traffic light',
      options: ['traffic-light'],
      guidelines: [
        'Include the entire traffic light unit',
        'Make sure all lights (red, yellow, green) are visible in the box',
        'Be precise with the boundaries',
        'Exclude the pole or support structure',
      ],
      difficulty: 'medium',
      reward: 0.18,
      estimatedTime: '30 seconds',
      category: 'Smart Cities',
    },
  ],
  'airdrop': [],
  'community': [],
};

export const WEB3_TASKS: Record<string, Web3Task> = {
  'airdrop': {
    id: 'airdrop',
    title: 'Token Airdrop Task',
    description: 'Follow LUCAS on social media and engage with our community to earn tokens',
    reward: '5.00',
    estimatedTime: '2-3 minutes',
    steps: [
      {
        id: 'twitter',
        title: 'Follow on X (Twitter)',
        description: 'Follow @LucasApp on X and like our pinned post',
        inputType: 'text',
        placeholder: 'Enter your X handle (e.g., @username)',
        validation: /^@[a-zA-Z0-9_]{4,15}$/
      },
      {
        id: 'telegram',
        title: 'Join Telegram Group',
        description: 'Join our Telegram community and say hello',
        inputType: 'text',
        placeholder: 'Enter your Telegram username',
        validation: /^[a-zA-Z0-9_]{5,32}$/
      },
    ]
  },
  'community': {
    id: 'community',
    title: 'Community Engagement',
    description: 'Participate in our community activities and governance',
    reward: '1.00',
    estimatedTime: '5-10 minutes',
    steps: [
      {
        id: 'discord',
        title: 'Join Discord',
        description: 'Join our Discord server and introduce yourself',
        inputType: 'text',
        placeholder: 'Enter your Discord username#0000',
        validation: /^.{3,32}#[0-9]{4}$/
      },
    ]
  }
};

export { TASKS, TASK_ANSWERS, WEB3_TASKS }