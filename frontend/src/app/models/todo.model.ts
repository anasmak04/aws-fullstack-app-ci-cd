export interface Todo {
  id?: number;
  title: string;
  description?: string;
  completed?: boolean;
  status?: 'todo' | 'in-progress' | 'done' | 'pending';
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export type TodoStatus = 'todo' | 'in-progress' | 'done';

