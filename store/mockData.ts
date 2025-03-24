import { TaskStats } from '../types/tasks';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export const mockUser: MockUser = {
  id: '1',
  email: 'demo@lucas.com',
  name: 'Demo User',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
};

export const mockTaskStats: TaskStats = {
  totalCompleted: 0,
  accuracy: 0,
  totalEarnings: 0,
  streak: 0,
};

export interface MockSubmission {
  id: string;
  taskId: string;
  answer: string;
  reward: number;
  createdAt: string;
}

export const mockSubmissions: MockSubmission[] = [];