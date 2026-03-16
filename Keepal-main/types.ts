
export enum TaskPriority {
  High = 'High',
  Low = 'Low',
}

export enum TaskUrgency {
  Urgent = 'Urgent',
  NotUrgent = 'NotUrgent',
}

export interface Subtask {
  id: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  estimatedMinutes: number;
  priority: TaskPriority;
  urgency: TaskUrgency;
  tag: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  deadline?: number; // The strict deadline
  reminderTime?: number; // The user-set reminder time (active trigger)
  subtasks?: Subtask[];
}

export enum TimerState {
  Idle = 'Idle',
  Running = 'Running',
  Paused = 'Paused',
  Break = 'Break',
}

export interface PomodoroRecord {
  id: string;
  taskId: string | null; // null if free focus
  startTime: number;
  endTime: number;
  durationSeconds: number;
  completed: boolean; // true if finished, false if abandoned
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  data?: any; // For structured data (proposals, splits)
  dataType?: 'task_proposal' | 'task_split' | null;
  relatedTaskId?: string;
}

export interface EmotionalState {
  trust: number;       // 0-100
  sarcasm: number;     // 0-10
  affinity: number;    // 0-100
}

export interface AppState {
  tasks: Task[];
  records: PomodoroRecord[];
  mood: 'neutral' | 'encouraging' | 'warning' | 'sarcastic';
  emotionalState: EmotionalState;
}

export interface MoodTheme {
  bgGradient: string;
  glowPrimary: string;
  glowSecondary: string;
}
