export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ReminderConfig {
  remind_at: string; // ISO string
  repeat_rule: 'none' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  due_at: string | null;
  created_at: string;
  completed_at: string | null;
  subtasks: Subtask[];
  reminder?: ReminderConfig;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  source_or_note: string;
  transaction_at: string; // ISO or YYYY-MM-DD
  created_at: string;
}

export interface FileItem {
  id: string;
  user_id: string;
  name: string;
  storage_path: string;
  mime_type: string;
  size: number; // in bytes
  folder: string;
  tags: string[];
  description: string;
  created_at: string;
  dataUrl?: string; // local blob data for preview & download
}

export interface WishlistItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_price: number;
  current_saved: number;
  link?: string;
  category: string;
  priority: Priority;
  target_date?: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currency: string;
  monthly_budget: number;
  created_at: string;
}

export type ActiveTab = 'dashboard' | 'tasks' | 'finance' | 'files' | 'wishlist' | 'settings';
