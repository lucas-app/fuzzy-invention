export type TaskType = 'image' | 'text' | 'object' | 'airdrop' | 'community' | 'web3';
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

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  image?: string;
  text?: string;
  question: string;
  options: string[];
  guidelines: string[];
  difficulty: TaskDifficulty;
  reward: number;
  estimatedTime: string;
  category: string;
}

export interface TaskValidation {
  correctAnswer: string;
  explanation: string;
  keywords: string[];
}

export interface TaskAnswer {
  taskId: string;
  answer: string;
  isCorrect: boolean;
  reward: number;
  timestamp: Date;
}

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