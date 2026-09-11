import { http } from './http';
import type {
  KitchenTask,
  KitchenTaskPage,
  KitchenTaskResponse,
} from '../types/kitchen';

export async function listKitchenTasks(page = 1): Promise<KitchenTaskPage> {
  const response = await http.get<KitchenTaskPage>(
    `/kitchen-tasks?page=${page}&per_page=25`,
  );

  return response.data;
}

export async function getKitchenTask(id: number): Promise<KitchenTask> {
  const response = await http.get<KitchenTaskResponse>(
    `/kitchen-tasks/${id}`,
  );

  return response.data.kitchen_task;
}

export async function startKitchenTask(id: number): Promise<KitchenTask> {
  const response = await http.post<KitchenTaskResponse>(
    `/kitchen-tasks/${id}/start`,
  );

  return response.data.kitchen_task;
}

export async function completeKitchenTask(id: number): Promise<KitchenTask> {
  const response = await http.post<KitchenTaskResponse>(
    `/kitchen-tasks/${id}/complete`,
  );

  return response.data.kitchen_task;
}

export async function failKitchenTask(
  id: number,
  failure_reason: string,
): Promise<KitchenTask> {
  const response = await http.post<KitchenTaskResponse>(
    `/kitchen-tasks/${id}/fail`,
    { failure_reason },
  );

  return response.data.kitchen_task;
}
