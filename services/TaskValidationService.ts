import AsyncStorage from '@react-native-async-storage/async-storage';

interface TaskValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface TaskQualityMetrics {
  completionTime: number;
  accuracy: number;
  consistency: number;
}

const QUALITY_METRICS_KEY = 'TASK_QUALITY_METRICS';

export class TaskValidationService {
  static async validateTask(task: any, selectedOption: string): Promise<TaskValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!task) {
      errors.push('Task data is missing');
      return { isValid: false, errors, warnings };
    }

    if (!task.id) {
      errors.push('Task ID is missing');
    }

    if (!task.data) {
      errors.push('Task data is missing');
    }

    if (!selectedOption) {
      errors.push('No option selected');
    }

    // Content validation based on task type
    if (task.data) {
      if (task.data.audio && !task.data.audio.startsWith('http')) {
        warnings.push('Audio URL might be invalid');
      }

      if (task.data.image && !task.data.image.startsWith('http')) {
        warnings.push('Image URL might be invalid');
      }

      if (task.data.text && task.data.text.length < 10) {
        warnings.push('Text content seems too short');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static async trackQualityMetrics(taskId: number, startTime: number): Promise<void> {
    try {
      const endTime = Date.now();
      const completionTime = endTime - startTime;

      // Get existing metrics
      const existingMetrics = await AsyncStorage.getItem(QUALITY_METRICS_KEY);
      const metrics: Record<number, TaskQualityMetrics> = existingMetrics 
        ? JSON.parse(existingMetrics)
        : {};

      // Update metrics for this task
      metrics[taskId] = {
        completionTime,
        accuracy: 1, // This would be calculated based on validation results
        consistency: 1 // This would be calculated based on user's history
      };

      // Save updated metrics
      await AsyncStorage.setItem(QUALITY_METRICS_KEY, JSON.stringify(metrics));
    } catch (error) {
      console.error('Error tracking quality metrics:', error);
    }
  }

  static async getQualityMetrics(taskId: number): Promise<TaskQualityMetrics | null> {
    try {
      const metrics = await AsyncStorage.getItem(QUALITY_METRICS_KEY);
      if (metrics) {
        const parsedMetrics = JSON.parse(metrics);
        return parsedMetrics[taskId] || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting quality metrics:', error);
      return null;
    }
  }

  static async validateTaskSubmission(task: any, annotation: any): Promise<TaskValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate annotation structure
    if (!annotation || !annotation.result) {
      errors.push('Invalid annotation format');
      return { isValid: false, errors, warnings };
    }

    // Check for required fields
    if (!annotation.result[0]?.from_name) {
      errors.push('Missing from_name in annotation');
    }

    if (!annotation.result[0]?.to_name) {
      errors.push('Missing to_name in annotation');
    }

    if (!annotation.result[0]?.value?.choices) {
      errors.push('Missing choices in annotation value');
    }

    // Validate choice values
    const validOptions = task.data.options.map((opt: any) => opt.value);
    const selectedChoices = annotation.result[0].value.choices;

    if (!selectedChoices.every((choice: string) => validOptions.includes(choice))) {
      errors.push('Invalid choice selected');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 