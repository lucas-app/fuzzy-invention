import { create } from 'zustand';
import { TaskStats } from '../types/tasks';
import { mockTaskStats, mockSubmissions, MockSubmission } from './mockData';
import { useWalletStore } from './walletStore';
import { useAuthStore } from './authStore';
import { taskCount, taskValue } from '../constants/RewardValues';
import LabelStudioService from '../services/LabelStudioService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TaskState {
  completedTasks: string[];
  earnings: number;
  stats: TaskStats;
  isLoading: boolean;
  error: string | null;
  submissions: MockSubmission[];
  submitTask: (task: any, answers: any, taskType: TaskType, projectId: number) => Promise<void>;
  fetchUserStats: () => Promise<void>;
  loadTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  completedTasks: [],
  earnings: 0,
  stats: { ...mockTaskStats },
  isLoading: false,
  error: null,
  submissions: [...mockSubmissions],

  submitTask: async (task, answers, taskType, projectId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Save task completion
      await LabelStudioService.saveTaskCompletion(task, answers, projectId);
      console.log(`Task ${task.id} completed and saved successfully`);
      
      // Update tasks list with completed task
      const { tasks } = get();
      const updatedTasks = tasks.map(t => {
        if (t.id === task.id) {
          return { ...t, completed: true };
        }
        return t;
      });
      
      // Calculate reward amount
      const taskRewardMap: Record<TaskType, number> = {
        [TaskType.GEOSPATIAL]: taskValue.geospatial,
        [TaskType.IMAGE]: taskValue.image,
        [TaskType.AUDIO]: taskValue.audio,
        [TaskType.TEXT]: taskValue.text,
        [TaskType.SURVEY]: taskValue.survey
      };
      
      const rewardAmount = taskRewardMap[taskType] || 2.0; // Default to $2 if not found
      
      // Add reward to wallet
      try {
        const { user } = await import('../store/authStore').then(mod => mod.useAuthStore.getState());
        
        if (user?.id) {
          console.log(`Adding reward of $${rewardAmount} for task ${task.id}`);
          
          // Generate a descriptive message based on task type
          let description = 'Task completion reward';
          switch (taskType) {
            case TaskType.GEOSPATIAL:
              description = 'Web3 task completion';
              break;
            case TaskType.IMAGE:
              description = 'Image classification task';
              break;
            case TaskType.AUDIO:
              description = 'Audio classification task';
              break;
            case TaskType.TEXT:
              description = 'Text analysis task';
              break;
            case TaskType.SURVEY:
              description = 'Survey completion';
              break;
          }
          
          // Add reward to wallet
          const walletStore = useWalletStore.getState();
          const success = await walletStore.addReward(user.id, rewardAmount, description);
          
          if (success) {
            console.log(`Successfully added $${rewardAmount} reward to wallet`);
          } else {
            console.error('Failed to add reward to wallet');
          }
        } else {
          console.warn('No user ID available for adding reward');
        }
      } catch (rewardError) {
        console.error('Error adding reward to wallet:', rewardError);
        // Continue with task submission even if reward fails
      }
      
      // Save completed task to AsyncStorage
      try {
        const completedTasksJson = await AsyncStorage.getItem('@completed_tasks');
        let completedTasks = completedTasksJson ? JSON.parse(completedTasksJson) : [];
        
        // Add the current task to completed tasks
        const completedTask = {
          id: task.id,
          taskType,
          projectId,
          completedAt: new Date().toISOString(),
          reward: rewardAmount
        };
        
        completedTasks.push(completedTask);
        
        // Save updated completed tasks list
        await AsyncStorage.setItem('@completed_tasks', JSON.stringify(completedTasks));
        console.log(`Added task ${task.id} to completed tasks list`);
      } catch (storageError) {
        console.error('Error saving completed task to storage:', storageError);
      }
      
      // Update state
      set({
        tasks: updatedTasks,
        isLoading: false
      });
      
    } catch (error) {
      console.error('Error submitting task:', error);
      set({
        error: 'Failed to submit task',
        isLoading: false
      });
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

  loadTasks: async () => {
    // Implementation of loadTasks method
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