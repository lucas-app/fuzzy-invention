import { TaskType, Task, TaskValidation, Web3Task } from '../types/tasks';

// Define validation answers for tasks
const TASK_ANSWERS: Record<string, TaskValidation> = {
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

// Define standard tasks by type
const TASKS: Record<TaskType, Task[]> = {
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

// Define Web3 tasks
const WEB3_TASKS: Record<string, Web3Task> = {
  'airdrop': {
    id: 'airdrop',
    title: 'Token Airdrop Task',
    description: 'Follow LUCAS on social media and engage with our community to earn tokens',
    reward: '5.00 LUCAS',
    estimatedTime: '2-3 minutes',
    category: 'Community',
    difficulty: 'easy',
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
  'defi-101': {
    id: 'defi-101',
    title: 'DeFi Knowledge Check',
    description: 'Test your knowledge of decentralized finance concepts and earn LUCAS tokens',
    reward: '10.00 LUCAS',
    estimatedTime: '5-8 minutes',
    category: 'DeFi',
    difficulty: 'medium',
    steps: [
      {
        id: 'quiz1',
        title: 'Basic DeFi Concepts',
        description: 'Answer a few questions about DeFi fundamentals',
        inputType: 'multiple-choice',
        options: [
          { id: 'a', text: 'Lending and borrowing without intermediaries' },
          { id: 'b', text: 'A type of cryptocurrency' },
          { id: 'c', text: 'Centralized financial instruments' },
          { id: 'd', text: 'Banking regulations' }
        ],
        correctAnswer: 'a',
        questionText: 'What is DeFi (Decentralized Finance)?'
      },
      {
        id: 'quiz2',
        title: 'Yield Farming',
        description: 'Explain yield farming in DeFi',
        inputType: 'multiple-choice',
        options: [
          { id: 'a', text: 'Mining cryptocurrencies' },
          { id: 'b', text: 'Staking tokens to earn rewards' },
          { id: 'c', text: 'Growing physical crops using blockchain' },
          { id: 'd', text: 'A type of NFT' }
        ],
        correctAnswer: 'b',
        questionText: 'What is yield farming in DeFi?'
      },
      {
        id: 'quiz3',
        title: 'Stablecoins',
        description: 'Identify the correct definition of stablecoins',
        inputType: 'multiple-choice',
        options: [
          { id: 'a', text: 'Cryptocurrencies with extremely high volatility' },
          { id: 'b', text: 'Digital assets designed to maintain a stable value' },
          { id: 'c', text: 'Government-issued digital currencies' },
          { id: 'd', text: 'Tokens that can only be used on one platform' }
        ],
        correctAnswer: 'b',
        questionText: 'What are stablecoins?'
      }
    ]
  },
  'nft-curation': {
    id: 'nft-curation',
    title: 'NFT Curation Task',
    description: 'Help curate and categorize NFT collections for our upcoming marketplace',
    reward: '15.00 LUCAS',
    estimatedTime: '10-15 minutes',
    category: 'NFTs',
    difficulty: 'medium',
    steps: [
      {
        id: 'categorize',
        title: 'Categorize NFT Collection',
        description: 'Review this collection and select the most appropriate category',
        inputType: 'multiple-choice',
        options: [
          { id: 'art', text: 'Digital Art' },
          { id: 'collectible', text: 'Collectibles' },
          { id: 'game', text: 'Gaming Assets' },
          { id: 'music', text: 'Music NFTs' },
          { id: 'pfp', text: 'Profile Pictures' }
        ],
        questionText: 'What category best describes the Bored Ape Yacht Club collection?',
        imageUrl: 'https://i.seadn.io/gae/i5dYZRkVCUK97bfprQ3WXyrT9BnLSZtVKGJlKQ919uaUB0sxbngVCioaiyu9r6snqfi2aaTyIvv6DHm4m2R3y4gWvdf5GjFWirH7ew?auto=format&dpr=1&w=512'
      },
      {
        id: 'rate',
        title: 'Rate NFT Quality',
        description: 'Rate the artistic quality and originality of this NFT',
        inputType: 'slider',
        min: 1,
        max: 10,
        questionText: 'Rate the artistic quality of this CryptoPunk NFT:',
        imageUrl: 'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4wJxh1KRvPliOdwWQX_IM7suD8X_vuDTU4YJBRWFHFgX9zh8Jis?auto=format&dpr=1&w=512'
      }
    ]
  },
  'dao-proposal': {
    id: 'dao-proposal',
    title: 'DAO Governance Task',
    description: 'Review and vote on a proposal for the LUCAS DAO',
    reward: '20.00 LUCAS',
    estimatedTime: '5-10 minutes',
    category: 'DAO',
    difficulty: 'medium',
    steps: [
      {
        id: 'read-proposal',
        title: 'Review Proposal',
        description: 'Read the following proposal for the LUCAS DAO treasury allocation',
        inputType: 'info',
        content: 'LUCAS DAO Proposal #42: Allocate 50,000 LUCAS tokens (5% of treasury) toward community education programs and hackathons to accelerate adoption of the platform. The funds will be distributed over 6 months with monthly reporting on outcomes.'
      },
      {
        id: 'vote',
        title: 'Cast Your Vote',
        description: 'Vote on the proposal based on your assessment',
        inputType: 'multiple-choice',
        options: [
          { id: 'for', text: 'For - I support this proposal' },
          { id: 'against', text: 'Against - I do not support this proposal' },
          { id: 'abstain', text: 'Abstain - I choose not to vote' }
        ],
        questionText: 'How do you vote on Proposal #42?'
      },
      {
        id: 'reasoning',
        title: 'Provide Reasoning',
        description: 'Share your reasoning for your vote (optional)',
        inputType: 'text',
        placeholder: 'I voted this way because...',
        optional: true
      }
    ]
  },
  'bridge-tutorial': {
    id: 'bridge-tutorial',
    title: 'Cross-Chain Bridge Tutorial',
    description: 'Learn how to use cross-chain bridges safely and earn LUCAS tokens',
    reward: '25.00 LUCAS',
    estimatedTime: '15-20 minutes',
    category: 'Education',
    difficulty: 'advanced',
    steps: [
      {
        id: 'intro',
        title: 'Introduction to Bridges',
        description: 'Learn what blockchain bridges are and why they are important',
        inputType: 'info',
        content: 'Blockchain bridges are protocols that connect different blockchains, allowing tokens and data to be transferred between them. They solve the interoperability problem in the fragmented blockchain ecosystem.'
      },
      {
        id: 'security',
        title: 'Bridge Security',
        description: 'Understand security considerations when using bridges',
        inputType: 'multiple-choice',
        options: [
          { id: 'a', text: 'All bridges are equally secure' },
          { id: 'b', text: 'Bridges with more TVL (Total Value Locked) are always safer' },
          { id: 'c', text: 'Different bridge architectures have different security trade-offs' },
          { id: 'd', text: 'Centralized bridges are always more secure' }
        ],
        correctAnswer: 'c',
        questionText: 'Which statement about bridge security is most accurate?'
      },
      {
        id: 'simulate',
        title: 'Bridge Simulation',
        description: 'Follow the steps to complete a simulated bridge transaction',
        inputType: 'checklist',
        items: [
          'Check the destination chain is supported',
          'Verify the token contract address',
          'Confirm gas fees on both chains',
          'Check estimated completion time',
          'Review final transaction details'
        ],
        questionText: 'Complete all steps in the correct order:'
      }
    ]
  },
  'community': {
    id: 'community',
    title: 'Community Engagement',
    description: 'Participate in our community activities and governance',
    reward: '8.00 LUCAS',
    estimatedTime: '5-10 minutes',
    category: 'Community',
    difficulty: 'easy',
    steps: [
      {
        id: 'discord',
        title: 'Join Discord',
        description: 'Join our Discord server and introduce yourself',
        inputType: 'text',
        placeholder: 'Enter your Discord username#0000',
        validation: /^.{3,32}#[0-9]{4}$/
      },
      {
        id: 'feedback',
        title: 'Provide Feedback',
        description: 'Share your thoughts on how we can improve the LUCAS platform',
        inputType: 'textarea',
        placeholder: 'I think LUCAS could improve by...',
        minLength: 50
      }
    ]
  }
};

// Add empty web3 array to fix TypeScript error
TASKS.web3 = [];

// Export all constants
export { TASKS, TASK_ANSWERS, WEB3_TASKS };