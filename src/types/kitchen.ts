export type KitchenTaskStatus =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | string;

export interface KitchenTask {
  id: number;
  meal_id: number;
  status: KitchenTaskStatus;
  assigned_to: number | null;
  started_at: string | null;
  completed_at: string | null;
  failure_reason: string | null;
  notes: string | null;
  created_at: string;
}

export interface KitchenTaskPage {
  data: KitchenTask[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface KitchenTaskResponse {
  kitchen_task: KitchenTask;
}
