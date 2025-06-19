declare module '../services/LabelStudioService' {
  interface Task {
    id: number;
    data: {
      audio?: string;
      text?: string;
      image?: string;
      question: string;
      options: Array<{
        id: string;
        text: string;
        value: string;
      }>;
    };
    created_at: string;
    is_labeled?: boolean;
  }

  interface Annotation {
    result: Array<{
      from_name: string;
      to_name: string;
      type: string;
      value: {
        choices: string[];
      };
    }>;
  }

  export function fetchTasks(
    projectType: string,
    retries?: number,
    forceRefresh?: boolean
  ): Promise<Task[]>;

  export function submitAnnotation(
    taskId: number,
    annotation: Annotation,
    projectType: string
  ): Promise<any>;

  export function saveTasks(
    tasks: Task[],
    projectType: string
  ): Promise<void>;

  export function getCachedTasks(
    projectType: string
  ): Promise<Task[] | null>;

  export function updateGeospatialTasks(): Promise<boolean>;

  export function createImageClassificationTasks(): Promise<boolean>;
  
  export function createAudioClassificationTasks(): Promise<boolean>;
  
  export function getApiUrl(): string;
  
  export function setApiUrl(url: string): void;
} 