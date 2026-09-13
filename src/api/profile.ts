import { http } from './http';
import type { AuthUser } from '../types/auth';

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface ProfileResponse {
  message?: string;
  user: AuthUser;
}

export async function getProfile(): Promise<AuthUser> {
  const response = await http.get<ProfileResponse>('/profile');
  return response.data.user;
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<ProfileResponse> {
  const response = await http.patch<ProfileResponse>('/profile', payload);
  return response.data;
}
