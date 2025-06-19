// Task type enum corresponding to different Label Studio project types
export enum TaskType {
  GEOSPATIAL = 'GEOSPATIAL_LABELING',
  IMAGE = 'IMAGE_CLASSIFICATION',
  AUDIO = 'AUDIO_CLASSIFICATION',
  TEXT = 'TEXT_SENTIMENT',
  SURVEY = 'SURVEY',
  RLHF = 'RLHF'
}

export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export interface BoundingBox {
  x: number;      // Normalized x position (0-1)
  y: number;      // Normalized y position (0-1)
  width: number;  // Normalized width (0-1)
  height: number; // Normalized height (0-1)
}

export interface ObjectDetection {
  type: string;
  position: BoundingBox;
}

// Task interface based on Label Studio API
export interface Task {
  id: number;
  data: {
    audio?: string;
    text?: string;
    image?: string;
    question?: string;
    options?: Array<{
      id: string;
      text: string;
      value: string;
    }>;
    [key: string]: any;
  };
  created_at: string;
  is_labeled?: boolean;
  completed?: boolean;
}

export interface TaskValidation {
  correctAnswer: string;
  explanation: string;
  keywords: string[];
}

// Task answer submission interface
export interface TaskSubmission {
  taskId: number;
  projectId: number;
  answer: any;
  taskType: TaskType;
  completedAt: string;
}

// Task statistics interface
export interface TaskStats {
  totalCompleted: number;
  accuracy: number;
  totalEarnings: number;
  streak: number;
}

export interface Web3TaskStep {
  id: string;
  title: string;
  description: string;
  inputType: 'text' | 'url' | 'wallet' | 'multiple-choice' | 'slider' | 'info' | 'checklist' | 'textarea';
  placeholder?: string;
  validation?: RegExp;
  optional?: boolean;
  options?: {id: string; text: string}[];
  questionText?: string;
  correctAnswer?: string;
  imageUrl?: string;
  content?: string;
  min?: number;
  max?: number;
  items?: string[];
  minLength?: number;
}

export interface Web3Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  estimatedTime: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'advanced';
  steps: Web3TaskStep[];
}

export interface Web3TaskSubmission {
  taskId: string;
  userId: string;
  type: 'airdrop' | 'community' | 'defi' | 'nft' | 'dao' | 'education';
  steps: {
    id: string;
    input: string;
    timestamp: Date;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  reward: number;
  submittedAt: Date;
  reviewedAt?: Date;
}

// Transaction types that can occur in the wallet
export enum TransactionType {
  TASK_REWARD = 'TASK_REWARD',
  WITHDRAWAL = 'WITHDRAWAL',
  INVESTMENT = 'INVESTMENT'
}