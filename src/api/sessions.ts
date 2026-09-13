import { http } from './http';
import type { Session } from '../types/sessions';

export async function listSessions(): Promise<Session[]> {
  const response = await http.get<{ data: Session[] }>('/auth/sessions');
  return response.data.data;
}

export async function revokeSession(id: number): Promise<{ message: string }> {
  const response = await http.delete<{ message: string }>(
    `/auth/sessions/${id}`,
  );

  return response.data;
}

export async function revokeOtherSessions(): Promise<{
  message: string;
  revoked_count: number;
}> {
  const response = await http.delete<{
    message: string;
    revoked_count: number;
  }>('/auth/sessions/others');

  return response.data;
}
