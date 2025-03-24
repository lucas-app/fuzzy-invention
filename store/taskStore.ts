import { create } from 'zustand';
import { TaskStats } from '../types/tasks';
import { mockTaskStats, mockSubmissions, MockSubmission } from './mockData';

interface TaskState {
  completedTasks: string[];
  earnings: number;
  stats: TaskStats;
  isLoading: boolean;
  error: string | null;
  submissions: MockSubmission[];
  submitTask: (taskId: string, answer: string, reward: number) => Promise<void>;
  fetchUserStats: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  completedTasks: [],
  earnings: 0,
  stats: { ...mockTaskStats },
  isLoading: false,
  error: null,
  submissions: [...mockSubmissions],

  submitTask: async (taskId: string, answer: string, reward: number) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newSubmission: MockSubmission = {
        id: Math.random().toString(36).substring(7),
        taskId,
        answer,
        reward,
        createdAt: new Date().toISOString(),
      };

      set(state => ({
        completedTasks: [...state.completedTasks, taskId],
        submissions: [newSubmission, ...state.submissions],
        stats: {
          ...state.stats,
          totalCompleted: state.stats.totalCompleted + 1,
          totalEarnings: state.stats.totalEarnings + reward,
          streak: state.stats.streak + 1,
        },
        earnings: state.earnings + reward,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserStats: async () => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { submissions } = get();
      const stats: TaskStats = {
        totalCompleted: submissions.length,
        accuracy: submissions.length ? 100 : 0,
        totalEarnings: submissions.reduce((sum, s) => sum + s.reward, 0),
        streak: calculateStreak(submissions),
      };

      set({ 
        stats,
        completedTasks: submissions.map(s => s.taskId),
        earnings: stats.totalEarnings
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

function calculateStreak(submissions: MockSubmission[]): number {
  if (!submissions.length) return 0;

  const sortedSubmissions = submissions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastSubmission = new Date(sortedSubmissions[0].createdAt);
  lastSubmission.setHours(0, 0, 0, 0);
  
  if (lastSubmission.getTime() !== today.getTime()) {
    return 0;
  }

  let streak = 1;
  let currentDate = today;

  for (let i = 1; i < sortedSubmissions.length; i++) {
    const submissionDate = new Date(sortedSubmissions[i].createdAt);
    submissionDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(currentDate);
    expectedDate.setDate(currentDate.getDate() - 1);

    if (submissionDate.getTime() === expectedDate.getTime()) {
      streak++;
      currentDate = submissionDate;
    } else {
      break;
    }
  }

  return streak;
}